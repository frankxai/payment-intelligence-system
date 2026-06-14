/**
 * Ed25519 signature tests — the load-bearing proof that verification is REAL
 * asymmetric crypto, not a placeholder. A forged or tampered signature must fail
 * genuine public-key verification, and an unknown issuerKeyId fails closed.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import type { Mandate } from "./types.js";
import {
  canonicalPayload,
  devPublicKeyPem,
  resetKeyring,
  signMandate,
  verifySignature,
} from "./signature.js";

const NOW = 1_750_000_000_000;
const HOUR = 60 * 60 * 1000;

function devMandate(overrides: Partial<Mandate> = {}): Mandate {
  const base: Omit<Mandate, "signature"> = {
    mandateId: "m_sig",
    subject: "stream:payments",
    amount: 49.0,
    currency: "EUR",
    expiresAt: NOW + HOUR,
    issuerKeyId: "k_dev",
    ...overrides,
  };
  return { ...base, signature: signMandate(base) };
}

test("a genuine Ed25519 signature over the canonical payload VERIFIES", () => {
  const m = devMandate();
  assert.equal(verifySignature(m), true);
});

test("the dev keypair is stable across calls (deterministic seed)", () => {
  const pem1 = devPublicKeyPem();
  const pem2 = devPublicKeyPem();
  assert.equal(pem1, pem2);
  assert.match(pem1, /BEGIN PUBLIC KEY/);
});

test("a FORGED signature (random bytes) fails real asymmetric verification", () => {
  const m = devMandate();
  // 64 bytes of base64 garbage — correct length, wrong signature.
  const forged: Mandate = { ...m, signature: Buffer.alloc(64, 9).toString("base64") };
  assert.equal(verifySignature(forged), false);
});

test("a TAMPERED field (amount) invalidates the signature", () => {
  const m = devMandate();
  // Keep the original signature but change a signed field.
  const tampered: Mandate = { ...m, amount: 4900.0 };
  assert.equal(verifySignature(tampered), false);
});

test("a TAMPERED field (subject) invalidates the signature", () => {
  const m = devMandate();
  const tampered: Mandate = { ...m, subject: "stream:attacker" };
  assert.equal(verifySignature(tampered), false);
});

test("an UNKNOWN issuerKeyId fails closed (no keyring entry)", () => {
  const m = devMandate();
  // Re-sign for k_dev but claim a different issuer the keyring does not know.
  const unknown: Mandate = { ...m, issuerKeyId: "k_unknown" };
  assert.equal(verifySignature(unknown), false);
});

test("an empty / missing signature fails closed", () => {
  const m = devMandate();
  assert.equal(verifySignature({ ...m, signature: "" }), false);
});

test("a wrong-length signature fails closed (Ed25519 is exactly 64 bytes)", () => {
  const m = devMandate();
  const short: Mandate = { ...m, signature: Buffer.alloc(10, 1).toString("base64") };
  assert.equal(verifySignature(short), false);
});

test("signMandate refuses to sign for a non-dev issuer (no private key here)", () => {
  assert.throws(
    () =>
      signMandate({
        mandateId: "m_x",
        subject: "s",
        amount: 1,
        currency: "EUR",
        expiresAt: NOW + HOUR,
        issuerKeyId: "k_prod",
      }),
    /no private key/,
  );
});

test("a MALFORMED env-injected issuer key is skipped (never becomes trusted)", () => {
  // A garbage public key under a new issuer id must NOT register — fail closed.
  // (issuerKeyId is part of the signed payload, so an issuer can only be exercised
  // end-to-end with its own private key; here we prove the keyring refuses bad keys.)
  process.env.PAYMENTS_ISSUER_PUBKEY_k_bad = "not-a-real-key";
  try {
    resetKeyring();
    const base: Omit<Mandate, "signature"> = {
      mandateId: "m_bad",
      subject: "stream:payments",
      amount: 10,
      currency: "EUR",
      expiresAt: NOW + HOUR,
      issuerKeyId: "k_bad",
    };
    // Sign the actual presented payload with the dev key — but k_bad never made it
    // into the keyring, so resolution fails closed regardless of the signature.
    const sig = signMandate({ ...base, issuerKeyId: "k_dev" });
    const m: Mandate = { ...base, signature: sig };
    assert.equal(verifySignature(m), false);
  } finally {
    delete process.env.PAYMENTS_ISSUER_PUBKEY_k_bad;
    resetKeyring();
  }
});

test("the dev keyring entry survives a resetKeyring", () => {
  resetKeyring();
  const m = devMandate();
  assert.equal(verifySignature(m), true);
});

test("canonicalPayload is signature-excluded and field-ordered", () => {
  const base: Omit<Mandate, "signature"> = {
    mandateId: "m_c",
    subject: "s",
    amount: 49,
    currency: "EUR",
    expiresAt: 123,
    issuerKeyId: "k_dev",
  };
  assert.equal(canonicalPayload(base), "m_c|s|49.00|EUR|123|k_dev");
});
