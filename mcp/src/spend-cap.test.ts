/**
 * Spend-cap + replay tests — the load-bearing proof that an OVER-CAP spend is
 * ESCALATED (never auto-approved) and a REPLAYED mandate is REJECTED.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import type { Charge, SpendCaps } from "./types.js";
import { SpendLedger } from "./spend-cap.js";

const NOW = 1_750_000_000_000;

const caps: SpendCaps = {
  perTransaction: 500,
  perDay: 1000,
  perStream: 2000,
};

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
  const ledger = new SpendLedger();
  const r = ledger.check(charge({ amount: 100 }), caps, NOW);
  assert.equal(r.verdict, "within-cap");
});

test("an OVER per-transaction cap spend is ESCALATED (not auto-approved)", () => {
  const ledger = new SpendLedger();
  const r = ledger.check(charge({ amount: 1200 }), caps, NOW);
  assert.equal(r.verdict, "escalate");
  assert.notEqual(r.verdict, "within-cap"); // explicitly: NOT silently passed
  assert.match(r.reason, /over per-transaction cap/);
});

test("an OVER per-day cap spend is ESCALATED", () => {
  const ledger = new SpendLedger();
  // Three 400s = 1200 on the day; first two pass, third breaks the 1000 daily cap.
  assert.equal(ledger.check(charge({ amount: 400 }), caps, NOW).verdict, "within-cap");
  ledger.commit(charge({ mandateId: "d1", amount: 400, stream: "payments" }), NOW);
  ledger.commit(charge({ mandateId: "d2", amount: 400, stream: "payments" }), NOW);
  const r = ledger.check(charge({ amount: 400 }), caps, NOW);
  assert.equal(r.verdict, "escalate");
  assert.match(r.reason, /over per-day cap/);
});

test("an OVER per-stream cap spend is ESCALATED", () => {
  const ledger = new SpendLedger();
  // Pile up 1800 across days (no daily breach), then a 300 breaks the 2000 stream cap.
  for (let i = 0; i < 6; i++) {
    // spread across distinct days so per-day never trips
    const dayTs = NOW + i * 24 * 60 * 60 * 1000;
    ledger.commit(charge({ mandateId: `s${i}`, amount: 300, stream: "payments" }), dayTs);
  }
  const r = ledger.check(charge({ amount: 300 }), caps, NOW + 6 * 24 * 60 * 60 * 1000);
  assert.equal(r.verdict, "escalate");
  assert.match(r.reason, /over per-stream cap/);
});

test("a REPLAYED (consumed) mandate is REJECTED", () => {
  const ledger = new SpendLedger();
  const c = charge({ mandateId: "m_replay", amount: 100 });
  const first = ledger.check(c, caps, NOW);
  assert.equal(first.verdict, "within-cap");
  ledger.commit(c, NOW); // consume it

  const replay = ledger.check(c, caps, NOW); // same mandateId again
  assert.equal(replay.verdict, "reject");
  assert.match(replay.reason, /replay/);
});

test("commit refuses to re-consume a mandate (single-use is absolute)", () => {
  const ledger = new SpendLedger();
  const c = charge({ mandateId: "m_once" });
  ledger.commit(c, NOW);
  assert.throws(() => ledger.commit(c, NOW), /refusing to re-consume/);
});

test("a non-positive charge amount is REJECTED", () => {
  const ledger = new SpendLedger();
  const r = ledger.check(charge({ amount: 0 }), caps, NOW);
  assert.equal(r.verdict, "reject");
});
