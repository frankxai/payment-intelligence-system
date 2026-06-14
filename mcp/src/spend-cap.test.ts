/**
 * Spend-cap + replay tests — the load-bearing proof that an OVER-CAP spend is
 * ESCALATED (never auto-approved) and a REPLAYED mandate is REJECTED.
 *
 * v0.2 also proves DURABILITY: a fresh SpendLedger pointed at the same data dir
 * still rejects a replay and still enforces the per-stream lifetime total — replay
 * protection survives a restart.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { Charge, SpendCaps } from "./types.js";
import { SpendLedger } from "./spend-cap.js";

const NOW = 1_750_000_000_000;

const caps: SpendCaps = {
  perTransaction: 500,
  perDay: 1000,
  perStream: 2000,
};

/** A fresh temp data dir per ledger so tests never share durable state. */
function tmpDataDir(): string {
  return mkdtempSync(join(tmpdir(), "payments-test-"));
}

function newLedger(): { ledger: SpendLedger; dir: string } {
  const dir = tmpDataDir();
  return { ledger: new SpendLedger(dir), dir };
}

function charge(overrides: Partial<Charge> = {}): Charge {
  return {
    mandateId: `m_${Math.random().toString(36).slice(2)}`,
    amount: 100,
    currency: "EUR",
    stream: "payments",
    ...overrides,
  };
}

test("a within-cap charge passes", () => {
  const { ledger, dir } = newLedger();
  const r = ledger.check(charge({ amount: 100 }), caps, NOW);
  assert.equal(r.verdict, "within-cap");
  rmSync(dir, { recursive: true, force: true });
});

test("an OVER per-transaction cap spend is ESCALATED (not auto-approved)", () => {
  const { ledger, dir } = newLedger();
  const r = ledger.check(charge({ amount: 1200 }), caps, NOW);
  assert.equal(r.verdict, "escalate");
  assert.notEqual(r.verdict, "within-cap"); // explicitly: NOT silently passed
  assert.match(r.reason, /over per-transaction cap/);
  rmSync(dir, { recursive: true, force: true });
});

test("an OVER per-day cap spend is ESCALATED", () => {
  const { ledger, dir } = newLedger();
  // Three 400s = 1200 on the day; first two pass, third breaks the 1000 daily cap.
  assert.equal(ledger.check(charge({ amount: 400 }), caps, NOW).verdict, "within-cap");
  ledger.commit(charge({ mandateId: "d1", amount: 400, stream: "payments" }), NOW);
  ledger.commit(charge({ mandateId: "d2", amount: 400, stream: "payments" }), NOW);
  const r = ledger.check(charge({ amount: 400 }), caps, NOW);
  assert.equal(r.verdict, "escalate");
  assert.match(r.reason, /over per-day cap/);
  rmSync(dir, { recursive: true, force: true });
});

test("an OVER per-stream cap spend is ESCALATED", () => {
  const { ledger, dir } = newLedger();
  // Pile up 1800 across days (no daily breach), then a 300 breaks the 2000 stream cap.
  for (let i = 0; i < 6; i++) {
    // spread across distinct days so per-day never trips
    const dayTs = NOW + i * 24 * 60 * 60 * 1000;
    ledger.commit(charge({ mandateId: `s${i}`, amount: 300, stream: "payments" }), dayTs);
  }
  const r = ledger.check(charge({ amount: 300 }), caps, NOW + 6 * 24 * 60 * 60 * 1000);
  assert.equal(r.verdict, "escalate");
  assert.match(r.reason, /over per-stream cap/);
  rmSync(dir, { recursive: true, force: true });
});

test("a REPLAYED (consumed) mandate is REJECTED", () => {
  const { ledger, dir } = newLedger();
  const c = charge({ mandateId: "m_replay", amount: 100 });
  const first = ledger.check(c, caps, NOW);
  assert.equal(first.verdict, "within-cap");
  ledger.commit(c, NOW); // consume it

  const replay = ledger.check(c, caps, NOW); // same mandateId again
  assert.equal(replay.verdict, "reject");
  assert.match(replay.reason, /replay/);
  rmSync(dir, { recursive: true, force: true });
});

test("commit refuses to re-consume a mandate (single-use is absolute)", () => {
  const { ledger, dir } = newLedger();
  const c = charge({ mandateId: "m_once" });
  ledger.commit(c, NOW);
  assert.throws(() => ledger.commit(c, NOW), /refusing to re-consume/);
  rmSync(dir, { recursive: true, force: true });
});

test("a non-positive charge amount is REJECTED", () => {
  const { ledger, dir } = newLedger();
  const r = ledger.check(charge({ amount: 0 }), caps, NOW);
  assert.equal(r.verdict, "reject");
  rmSync(dir, { recursive: true, force: true });
});

test("DURABILITY: replay protection survives a restart (new ledger, same dir)", () => {
  const dir = tmpDataDir();
  const c = charge({ mandateId: "m_persist", amount: 100 });

  const first = new SpendLedger(dir);
  assert.equal(first.check(c, caps, NOW).verdict, "within-cap");
  first.commit(c, NOW); // durable consume

  // Simulate a restart: a brand-new instance loads the JSONL ledger from disk.
  const restarted = new SpendLedger(dir);
  assert.equal(restarted.isConsumed("m_persist"), true);
  const replay = restarted.check(c, caps, NOW);
  assert.equal(replay.verdict, "reject");
  assert.match(replay.reason, /replay/);
  rmSync(dir, { recursive: true, force: true });
});

test("DURABILITY: per-stream lifetime total survives a restart", () => {
  const dir = tmpDataDir();
  const first = new SpendLedger(dir);
  // 1800 committed across distinct days; under the 2000 stream cap so far.
  for (let i = 0; i < 6; i++) {
    const dayTs = NOW + i * 24 * 60 * 60 * 1000;
    first.commit(charge({ mandateId: `p${i}`, amount: 300, stream: "payments" }), dayTs);
  }

  // Restart: a new instance reconstructs the 1800 lifetime total from the log.
  const restarted = new SpendLedger(dir);
  const r = restarted.check(
    charge({ amount: 300, stream: "payments" }),
    caps,
    NOW + 6 * 24 * 60 * 60 * 1000,
  );
  // 1800 + 300 = 2100 > 2000 → must escalate after restart.
  assert.equal(r.verdict, "escalate");
  assert.match(r.reason, /over per-stream cap/);
  rmSync(dir, { recursive: true, force: true });
});
