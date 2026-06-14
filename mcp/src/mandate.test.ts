/**
 * Mandate verification tests — the load-bearing proof that a FORGED, EXPIRED, or
 * AMOUNT-MISMATCHED mandate is REJECTED (not silently passed). FAIL CLOSED.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import type { Charge, Mandate } from "./types.js";
import { verifyMandate } from "./mandate.js";
import { signMandate } from "./signature.js";

const NOW = 1_750_000_000_000; // fixed clock for determinism
const HOUR = 60 * 60 * 1000;

function goodMandate(overrides: Partial<Mandate> = {}): Mandate {
  const base: Omit<Mandate, "signature"> = {
    mandateId: "m_001",
    subject: "stream:payments",
    amount: 49.0,
    currency: "EUR",
    expiresAt: NOW + HOUR,
    issuerKeyId: "k_dev",
    ...overrides,
  };
  return { ...base, signature: signMandate(base) };
}

function chargeFor(m: Mandate, overrides: Partial<Charge> = {}): Charge {
  return {
    mandateId: m.mandateId,
    amount: m.amount,
    currency: m.currency,
    stream: "payments",
    ...overrides,
  };
}

test("a genuine, signed, unexpired, amount-matched mandate VERIFIES", () => {
  const m = goodMandate();
  const r = verifyMandate(m, chargeFor(m), NOW);
  assert.equal(r.verdict, "verified");
});

test("a FORGED signature is REJECTED (not passed)", () => {
  const m = goodMandate();
  const forged: Mandate = { ...m, signature: "deadbeef".repeat(8) };
  const r = verifyMandate(forged, chargeFor(forged), NOW);
  assert.equal(r.verdict, "reject");
  assert.match(r.reason, /signature invalid/);
});

test("a TAMPERED amount (signature no longer matches) is REJECTED", () => {
  const m = goodMandate();
  // Attacker bumps the amount but keeps the original signature.
  const tampered: Mandate = { ...m, amount: 4900.0 };
  const r = verifyMandate(tampered, chargeFor(tampered), NOW);
  assert.equal(r.verdict, "reject");
  assert.match(r.reason, /signature invalid/);
});

test("an EXPIRED mandate is REJECTED", () => {
  const m = goodMandate({ expiresAt: NOW - HOUR });
  const r = verifyMandate(m, chargeFor(m), NOW);
  assert.equal(r.verdict, "reject");
  assert.match(r.reason, /expired/);
});

test("an AMOUNT-MISMATCHED charge is REJECTED", () => {
  const m = goodMandate(); // mandate authorizes 49.00 EUR
  const r = verifyMandate(m, chargeFor(m, { amount: 490.0 }), NOW);
  assert.equal(r.verdict, "reject");
  assert.match(r.reason, /amount mismatch/);
});

test("a CURRENCY-MISMATCHED charge is REJECTED", () => {
  const m = goodMandate();
  const r = verifyMandate(m, chargeFor(m, { currency: "USD" }), NOW);
  assert.equal(r.verdict, "reject");
  assert.match(r.reason, /currency mismatch/);
});

test("an UNSIGNED mandate is REJECTED (missing signature is never a pass)", () => {
  const m = goodMandate();
  const unsigned = { ...m, signature: "" } as Mandate;
  const r = verifyMandate(unsigned, chargeFor(unsigned), NOW);
  assert.equal(r.verdict, "reject");
});

test("a MALFORMED mandate (missing subject) is REJECTED", () => {
  const m = goodMandate();
  const malformed = { ...m, subject: "" } as Mandate;
  const r = verifyMandate(malformed, chargeFor(malformed), NOW);
  assert.equal(r.verdict, "reject");
  assert.match(r.reason, /malformed/);
});

test("a mandate/charge id mismatch is REJECTED", () => {
  const m = goodMandate();
  const r = verifyMandate(m, chargeFor(m, { mandateId: "m_other" }), NOW);
  assert.equal(r.verdict, "reject");
  assert.match(r.reason, /id mismatch/);
});
