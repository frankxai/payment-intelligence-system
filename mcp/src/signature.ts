/**
 * Placeholder signature verification.
 *
 * ⚠️ v0.1 scaffold. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * This is an HMAC-SHA256 over the canonical mandate payload using a shared dev
 * secret. It is enough to model the fail-closed control flow (a forged or
 * tampered mandate fails verification) but it is NOT production AP2 cryptographic
 * verification. A real release swaps this module for the AP2 reference verifier
 * (google-agentic-commerce/AP2) behind the same `verifySignature` interface.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { Mandate } from "./types.js";

/**
 * Dev-only signing secret per issuer key. In a real system this is replaced by
 * public-key verification against the issuer's published key. Overridable via env
 * for tests; defaults keep the placeholder self-contained.
 */
function devSecretForKey(issuerKeyId: string): string {
  const fromEnv = process.env[`PAYMENTS_DEV_SECRET_${issuerKeyId}`];
  return fromEnv ?? `dev-secret::${issuerKeyId}`;
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

/** Produce a valid placeholder signature. Used by tests to mint genuine mandates. */
export function signMandate(m: Omit<Mandate, "signature">): string {
  return createHmac("sha256", devSecretForKey(m.issuerKeyId))
    .update(canonicalPayload(m))
    .digest("hex");
}

/**
 * Verify a mandate signature. Fail-closed: any error, mismatch, or missing
 * signature returns false. Never throws.
 */
export function verifySignature(m: Mandate): boolean {
  try {
    if (!m.signature || typeof m.signature !== "string") return false;
    const expected = signMandate({
      mandateId: m.mandateId,
      subject: m.subject,
      amount: m.amount,
      currency: m.currency,
      expiresAt: m.expiresAt,
      issuerKeyId: m.issuerKeyId,
    });
    const a = Buffer.from(m.signature, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
