/**
 * Shared types for the Payments MCP control surface.
 *
 * ⚠️ v0.1 scaffold. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * The defining invariant: this surface AUTHORIZES money, it never MOVES money.
 * There is no `transfer`/`pay`/`settle` type here, by design.
 */

/** ISO-4217-ish currency code. We do not validate the set; mismatch alone is a reject. */
export type Currency = string;

/**
 * An AP2-style mandate: cryptographically signed proof a human authorized THIS
 * purchase for THIS amount. In v0.1 the signature is a placeholder HMAC over a
 * shared dev secret — NOT production crypto.
 */
export interface Mandate {
  /** Unique, single-use identifier. Replay of a consumed id is always a reject. */
  mandateId: string;
  /** Who/what the mandate authorizes (e.g. a stream or agent id). */
  subject: string;
  /** The authorized amount, as a decimal number in `currency`. */
  amount: number;
  currency: Currency;
  /** Unix epoch milliseconds. Missing or past = expired = reject. */
  expiresAt: number;
  /** Issuer key id the signature must verify against. */
  issuerKeyId: string;
  /** The signature over the canonical mandate payload. */
  signature: string;
}

/** A proposed charge the agent wants to make against a mandate. */
export interface Charge {
  mandateId: string;
  amount: number;
  currency: Currency;
  /** The income stream this charge belongs to (used for per-stream caps). */
  stream: string;
}

/** Spend ceilings. Over ANY of these → escalate, never auto-approve. */
export interface SpendCaps {
  perTransaction: number;
  perDay: number;
  perStream: number;
}

export type Verdict = "verified" | "reject" | "within-cap" | "escalate";

export interface VerifyResult {
  verdict: Extract<Verdict, "verified" | "reject">;
  reason: string;
}

export interface CapResult {
  verdict: Extract<Verdict, "within-cap" | "reject" | "escalate">;
  reason: string;
}

/** An append-only audit record. The log is never edited or deleted. */
export interface AuditEntry {
  ts: number;
  action: string;
  mandateId?: string;
  amount?: number;
  currency?: Currency;
  verdict?: Verdict;
  reason?: string;
  actor?: string;
}

/** A pending-approval object. NEVER carries an "approved: true" — humans resolve it. */
export interface PendingApproval {
  pendingApprovalId: string;
  status: "pending-human-approval";
  reason: string;
  charge: Charge;
  createdAt: number;
}
