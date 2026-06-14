/**
 * Ed25519 mandate signature verification.
 *
 * ⚠️ v0.2 scaffold. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * v0.2 replaces the v0.1 placeholder HMAC with real asymmetric (public-key)
 * verification: an issuer signs the canonical mandate payload with an Ed25519
 * private key; this module verifies it against the issuer's PUBLIC key, resolved
 * from a keyring (issuerKeyId → public key). The private key never lives here.
 *
 * This is still NOT a full AP2 deployment — there is no key distribution, no
 * revocation, no certificate chain. A real release wires the keyring to the
 * issuer's published keys and adds revocation, behind the SAME `verifySignature`
 * interface. The control flow (forged/tampered → real cryptographic fail; unknown
 * issuer → fail closed) is now backed by genuine asymmetric crypto.
 */

import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign,
  verify,
  type KeyObject,
} from "node:crypto";
import type { Mandate } from "./types.js";

/**
 * A clearly-labeled, deterministic DEV/TEST Ed25519 keypair. It is generated from
 * a fixed 32-byte seed so the public key is stable across processes — tests can
 * mint genuine Ed25519 mandates against `k_dev` without any external key material.
 *
 * THIS IS A PUBLICLY-KNOWN DEV KEY. It MUST NOT be used to authorize live funds.
 * In production the keyring is populated from issuer-published public keys via env;
 * the dev key is only present so the scaffold is self-contained and testable.
 */
const DEV_KEY_ID = "k_dev";

// RFC 8032 Ed25519 private key from a fixed seed, wrapped as a PKCS#8 DER. The
// 16-byte prefix is the standard PKCS#8 header for an Ed25519 OneAsymmetricKey:
//   30 2e 02 01 00 30 05 06 03 2b 65 70 04 22 04 20  || <32-byte seed>
const DEV_SEED = Buffer.alloc(32, 7); // fixed, obviously-non-secret seed (all 0x07)
const PKCS8_ED25519_PREFIX = Buffer.from(
  "302e020100300506032b657004220420",
  "hex",
);

function devKeyPair(): { privateKey: KeyObject; publicKey: KeyObject } {
  const der = Buffer.concat([PKCS8_ED25519_PREFIX, DEV_SEED]);
  const privateKey = createPrivateKey({ key: der, format: "der", type: "pkcs8" });
  const publicKey = createPublicKey(privateKey);
  return { privateKey, publicKey };
}

const DEV = devKeyPair();

/**
 * The keyring: issuerKeyId → public key (PEM/raw, as a KeyObject). Verification
 * fails closed on an unknown issuerKeyId. The dev key is always present so the
 * scaffold is self-contained; additional issuer public keys are loaded from env.
 */
function buildKeyring(): Map<string, KeyObject> {
  const ring = new Map<string, KeyObject>();
  ring.set(DEV_KEY_ID, DEV.publicKey);

  // Load additional issuer public keys from env. Format:
  //   PAYMENTS_ISSUER_PUBKEY_<issuerKeyId> = <PEM or base64-DER spki public key>
  // e.g. PAYMENTS_ISSUER_PUBKEY_k_prod="-----BEGIN PUBLIC KEY-----\n...".
  // A malformed key is skipped (never registered) — fail closed on use.
  for (const [name, value] of Object.entries(process.env)) {
    if (!name.startsWith("PAYMENTS_ISSUER_PUBKEY_") || !value) continue;
    const issuerKeyId = name.slice("PAYMENTS_ISSUER_PUBKEY_".length);
    if (!issuerKeyId) continue;
    try {
      const key = loadPublicKey(value);
      ring.set(issuerKeyId, key);
    } catch {
      // Skip — an unparseable key must never silently become a trusted issuer.
    }
  }
  return ring;
}

/** Parse a public key supplied as PEM or base64-encoded DER (spki). */
function loadPublicKey(raw: string): KeyObject {
  const trimmed = raw.trim();
  if (trimmed.includes("BEGIN PUBLIC KEY")) {
    return createPublicKey({ key: trimmed, format: "pem" });
  }
  // Assume base64-encoded SPKI DER.
  return createPublicKey({
    key: Buffer.from(trimmed, "base64"),
    format: "der",
    type: "spki",
  });
}

// The keyring is resolved once per process. Tests that need fresh env can call
// `resetKeyring()`.
let keyring: Map<string, KeyObject> = buildKeyring();

/** Rebuild the keyring from the current env. For tests that inject issuer keys. */
export function resetKeyring(): void {
  keyring = buildKeyring();
}

/** Resolve an issuer's public key, or undefined if the issuerKeyId is unknown. */
function publicKeyFor(issuerKeyId: string): KeyObject | undefined {
  return keyring.get(issuerKeyId);
}

/** The canonical payload that gets signed. Order is fixed and signature-excluded. */
export function canonicalPayload(m: Omit<Mandate, "signature">): string {
  return [
    m.mandateId,
    m.subject,
    m.amount.toFixed(2),
    m.currency,
    String(m.expiresAt),
    m.issuerKeyId,
  ].join("|");
}

/**
 * Produce a genuine Ed25519 signature over the canonical payload, signed by the
 * DEV/TEST private key. Used by tests to mint real `k_dev` mandates. Throws if
 * asked to sign for any issuer other than the dev key — there is no private key
 * for production issuers in this repo, by design.
 */
export function signMandate(m: Omit<Mandate, "signature">): string {
  if (m.issuerKeyId !== DEV_KEY_ID) {
    throw new Error(
      `signMandate is a test helper for '${DEV_KEY_ID}' only; no private key for '${m.issuerKeyId}'`,
    );
  }
  const data = Buffer.from(canonicalPayload(m), "utf8");
  return sign(null, data, DEV.privateKey).toString("base64");
}

/**
 * Verify a mandate signature with real Ed25519 public-key verification.
 * Fail-closed: unknown issuer, missing/malformed signature, any error, or a
 * cryptographic mismatch all return false. Never throws.
 */
export function verifySignature(m: Mandate): boolean {
  try {
    if (!m.signature || typeof m.signature !== "string") return false;
    const pub = publicKeyFor(m.issuerKeyId);
    if (!pub) return false; // unknown issuerKeyId → fail closed
    const data = Buffer.from(
      canonicalPayload({
        mandateId: m.mandateId,
        subject: m.subject,
        amount: m.amount,
        currency: m.currency,
        expiresAt: m.expiresAt,
        issuerKeyId: m.issuerKeyId,
      }),
      "utf8",
    );
    const sig = Buffer.from(m.signature, "base64");
    if (sig.length !== 64) return false; // Ed25519 signatures are exactly 64 bytes
    return verify(null, data, pub, sig);
  } catch {
    return false;
  }
}

/**
 * Export the dev public key (SPKI PEM). Useful for tests/docs that want to show a
 * keyring entry, and to prove the public key is stable across processes.
 */
export function devPublicKeyPem(): string {
  return DEV.publicKey.export({ type: "spki", format: "pem" }).toString();
}
