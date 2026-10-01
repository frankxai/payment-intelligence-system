/**
 * Mandate verification tests — the load-bearing proof that a FORGED, EXPIRED, or
 * AMOUNT-MISMATCHED mandate is REJECTED (not silently passed). FAIL CLOSED.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";

import type { Charge, Mandate } from "./types.js";
import { verifyMandate } from "./mandate.js";
import { resetKeyring, signMandate } from "./signature.js";

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

/**
 * Register a throwaway issuer key and return a signer over a RAW payload string. The
 * boundary and precision forgeries below need signatures over payloads that
 * `signMandate` (correctly) refuses to build.
 */
function withTestIssuer<T>(run: (signRaw: (payload: string) => string) => T): T {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  process.env.PAYMENTS_ISSUER_PUBKEY_k_test = publicKey
    .export({ type: "spki", format: "der" })
    .toString("base64");
  resetKeyring();
  try {
    return run((payload) => sign(null, Buffer.from(payload, "utf8"), privateKey).toString("base64"));
  } finally {
    delete process.env.PAYMENTS_ISSUER_PUBKEY_k_test;
    resetKeyring();
  }
}

test("a field-boundary-shifted twin of a signed mandate is REJECTED (reserved '|')", () => {
  withTestIssuer((signRaw) => {
    const expiresAt = NOW + HOUR;
    // The issuer signed subject "x|y", so the payload reads m1|x|y|10.00|EUR|<exp>|k_test.
    const signature = signRaw(`m1|x|y|10.00|EUR|${expiresAt}|k_test`);
    const base = { amount: 10, currency: "EUR", expiresAt, issuerKeyId: "k_test", signature };

    // The original carries the separator inside a field: not bindable, so malformed.
    const original: Mandate = { ...base, mandateId: "m1", subject: "x|y" };
    const r1 = verifyMandate(original, chargeFor(original), NOW);
    assert.equal(r1.verdict, "reject");
    assert.match(r1.reason, /malformed/);

    // The twin has the same payload and a fresh mandateId, so replay protection would miss it.
    const twin: Mandate = { ...base, mandateId: "m1|x", subject: "y" };
    const r2 = verifyMandate(twin, chargeFor(twin), NOW);
    assert.equal(r2.verdict, "reject");
    assert.match(r2.reason, /malformed/);
  });
});

test("an amount beyond 2 decimals is REJECTED (the signature only binds toFixed(2))", () => {
  withTestIssuer((signRaw) => {
    const expiresAt = NOW + HOUR;
    const signature = signRaw(`m2|s|10.00|EUR|${expiresAt}|k_test`);
    const base = { mandateId: "m2", subject: "s", currency: "EUR", expiresAt, issuerKeyId: "k_test", signature };

    const genuine: Mandate = { ...base, amount: 10 };
    assert.equal(verifyMandate(genuine, chargeFor(genuine), NOW).verdict, "verified");

    const bumped: Mandate = { ...base, amount: 10.004 };
    const r = verifyMandate(bumped, chargeFor(bumped), NOW);
    assert.equal(r.verdict, "reject");
    assert.match(r.reason, /decimal places/);
  });
});
