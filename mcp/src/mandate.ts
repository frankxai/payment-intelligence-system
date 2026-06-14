/**
 * Mandate verification — the "was this authorized?" gate.
 *
 * ⚠️ v0.1 scaffold. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * FAIL CLOSED. The first failing gate rejects. A mandate is `verified` only if it
 * is signed, unexpired, amount-matched, and well-formed.
 */

import type { Charge, Mandate, VerifyResult } from "./types.js";
import { verifySignature } from "./signature.js";

const REQUIRED_FIELDS: (keyof Mandate)[] = [
  "mandateId",
  "subject",
  "amount",
  "currency",
  "expiresAt",
  "issuerKeyId",
  "signature",
];

function reject(reason: string): VerifyResult {
  return { verdict: "reject", reason };
}

/**
 * Verify a mandate against a proposed charge.
 *
 * @param now injectable clock (ms) for deterministic tests; defaults to Date.now().
 */
export function verifyMandate(
  mandate: Mandate,
  charge: Charge,
  now: number = Date.now(),
): VerifyResult {
  // Gate 0: well-formed. Missing/blank fields are a reject, never a pass.
  for (const f of REQUIRED_FIELDS) {
    const v = mandate[f];
    if (v === undefined || v === null || v === "") {
      return reject(`malformed mandate: missing field '${String(f)}'`);
    }
  }
  if (typeof mandate.amount !== "number" || !Number.isFinite(mandate.amount) || mandate.amount <= 0) {
    return reject(`malformed mandate: invalid amount '${String(mandate.amount)}'`);
  }
  if (typeof mandate.expiresAt !== "number" || !Number.isFinite(mandate.expiresAt)) {
    return reject(`malformed mandate: invalid expiresAt '${String(mandate.expiresAt)}'`);
  }

  // The mandate must be the one this charge references.
  if (mandate.mandateId !== charge.mandateId) {
    return reject(
      `mandate/charge id mismatch: mandate=${mandate.mandateId} charge=${charge.mandateId}`,
    );
  }

  // Gate 1: signed. Placeholder HMAC in v0.1 — see signature.ts.
  if (!verifySignature(mandate)) {
    return reject(`signature invalid for issuer key '${mandate.issuerKeyId}'`);
  }

  // Gate 2: unexpired. A past (or now) expiry is a reject.
  if (mandate.expiresAt <= now) {
    return reject(
      `mandate expired: expiresAt=${mandate.expiresAt} <= now=${now}`,
    );
  }

  // Gate 3: amount + currency match exactly.
  if (charge.currency !== mandate.currency) {
    return reject(
      `currency mismatch: mandate=${mandate.currency} charge=${charge.currency}`,
    );
  }
  if (charge.amount !== mandate.amount) {
    return reject(
      `amount mismatch: mandate=${mandate.amount.toFixed(2)} ${mandate.currency} ` +
        `charge=${charge.amount.toFixed(2)} ${charge.currency}`,
    );
  }

  return {
    verdict: "verified",
    reason:
      `mandate ${mandate.mandateId} signed, unexpired (expires ${mandate.expiresAt}), ` +
      `amount matches ${mandate.amount.toFixed(2)} ${mandate.currency}`,
  };
}
