/**
 * Spend-cap enforcement + single-use replay guard.
 *
 * ⚠️ v0.1 scaffold. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * Over ANY cap → ESCALATE (never auto-approve). A consumed mandate replayed → REJECT.
 * State (consumed mandates + running spend) is IN-MEMORY in v0.1; a real release
 * persists it so replay protection + daily caps survive a restart.
 */

import type { CapResult, Charge, SpendCaps } from "./types.js";

const DAY_MS = 24 * 60 * 60 * 1000;

interface SpendRecord {
  ts: number;
  amount: number;
  stream: string;
}

/**
 * Holds the consumed-mandate set and the approved-spend ledger. One instance per
 * server process. Pure, deterministic, injectable clock for tests.
 */
export class SpendLedger {
  private readonly consumed = new Set<string>();
  private readonly records: SpendRecord[] = [];

  /** True if this mandate id has already been consumed (i.e. a replay). */
  isConsumed(mandateId: string): boolean {
    return this.consumed.has(mandateId);
  }

  private spentTodayOnStream(stream: string, now: number): number {
    const cutoff = now - DAY_MS;
    return this.records
      .filter((r) => r.stream === stream && r.ts > cutoff)
      .reduce((sum, r) => sum + r.amount, 0);
  }

  private spentTotalOnStream(stream: string): number {
    return this.records
      .filter((r) => r.stream === stream)
      .reduce((sum, r) => sum + r.amount, 0);
  }

  /**
   * Evaluate a charge against the caps. Does NOT mutate state — call `commit`
   * separately only after the queen has decided to proceed (audit-first).
   *
   * @param now injectable clock (ms) for deterministic tests.
   */
  check(charge: Charge, caps: SpendCaps, now: number = Date.now()): CapResult {
    // Replay guard first: a consumed mandate is never re-spendable.
    if (this.consumed.has(charge.mandateId)) {
      return {
        verdict: "reject",
        reason: `replay: mandate ${charge.mandateId} already consumed`,
      };
    }

    if (!Number.isFinite(charge.amount) || charge.amount <= 0) {
      return { verdict: "reject", reason: `invalid charge amount '${String(charge.amount)}'` };
    }

    // Per-transaction cap.
    if (charge.amount > caps.perTransaction) {
      return {
        verdict: "escalate",
        reason:
          `over per-transaction cap: ${charge.amount.toFixed(2)} ${charge.currency} ` +
          `> ${caps.perTransaction.toFixed(2)}`,
      };
    }

    // Per-day cap (this charge + today's approved spend on the stream).
    const day = this.spentTodayOnStream(charge.stream, now) + charge.amount;
    if (day > caps.perDay) {
      return {
        verdict: "escalate",
        reason:
          `over per-day cap on stream '${charge.stream}': ` +
          `${day.toFixed(2)} ${charge.currency} > ${caps.perDay.toFixed(2)}`,
      };
    }

    // Per-stream cap (this charge + the stream's running total).
    const total = this.spentTotalOnStream(charge.stream) + charge.amount;
    if (total > caps.perStream) {
      return {
        verdict: "escalate",
        reason:
          `over per-stream cap on stream '${charge.stream}': ` +
          `${total.toFixed(2)} ${charge.currency} > ${caps.perStream.toFixed(2)}`,
      };
    }

    return {
      verdict: "within-cap",
      reason:
        `within all caps (tx ${charge.amount.toFixed(2)} / day ${day.toFixed(2)} / ` +
        `stream ${total.toFixed(2)} ${charge.currency})`,
    };
  }

  /**
   * Consume the mandate and record the spend. Idempotency: throws if the mandate
   * was already consumed — the caller must `check` first. Single-use is absolute.
   */
  commit(charge: Charge, now: number = Date.now()): void {
    if (this.consumed.has(charge.mandateId)) {
      throw new Error(`refusing to re-consume mandate ${charge.mandateId}`);
    }
    this.consumed.add(charge.mandateId);
    this.records.push({ ts: now, amount: charge.amount, stream: charge.stream });
  }
}
