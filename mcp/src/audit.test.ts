/**
 * Audit-log tests — the load-bearing proof that the log is append-only, durable
 * (JSONL), and FAILS CLOSED on a missing action (an unloggable decision must not
 * proceed). Durability: entries survive a restart.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { AuditLog } from "./audit.js";

function tmpDataDir(): string {
  return mkdtempSync(join(tmpdir(), "payments-audit-"));
}

test("append stores an entry and stamps a ts", () => {
  const dir = tmpDataDir();
  const log = new AuditLog(dir);
  const e = log.append({ action: "verify_mandate", verdict: "verified" });
  assert.equal(e.action, "verify_mandate");
  assert.equal(typeof e.ts, "number");
  assert.equal(log.size(), 1);
  rmSync(dir, { recursive: true, force: true });
});

test("a missing action FAILS CLOSED (throws)", () => {
  const dir = tmpDataDir();
  const log = new AuditLog(dir);
  // @ts-expect-error deliberately malformed to prove the guard throws
  assert.throws(() => log.append({ verdict: "verified" }), /missing action/);
  rmSync(dir, { recursive: true, force: true });
});

test("stored entries are frozen (append-only — cannot be edited in place)", () => {
  const dir = tmpDataDir();
  const log = new AuditLog(dir);
  const e = log.append({ action: "x" });
  assert.equal(Object.isFrozen(e), true);
  rmSync(dir, { recursive: true, force: true });
});

test("DURABILITY: each entry is written as a JSONL line", () => {
  const dir = tmpDataDir();
  const log = new AuditLog(dir);
  log.append({ action: "verify_mandate", mandateId: "m1" });
  log.append({ action: "check_spend_cap", mandateId: "m1" });
  const lines = readFileSync(log.filePath(), "utf8").trim().split("\n");
  assert.equal(lines.length, 2);
  assert.equal((JSON.parse(lines[0]!) as { action: string }).action, "verify_mandate");
  rmSync(dir, { recursive: true, force: true });
});

test("DURABILITY: entries survive a restart (new instance, same dir)", () => {
  const dir = tmpDataDir();
  const first = new AuditLog(dir);
  first.append({ action: "a" });
  first.append({ action: "b" });

  const restarted = new AuditLog(dir);
  assert.equal(restarted.size(), 2);
  // A new append continues the same durable log.
  restarted.append({ action: "c" });
  assert.equal(restarted.size(), 3);
  rmSync(dir, { recursive: true, force: true });
});
