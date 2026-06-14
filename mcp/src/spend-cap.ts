/**
 * Spend-cap enforcement + single-use replay guard — durable in v0.2.
 *
 * ⚠️ v0.2 scaffold. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * Over ANY cap → ESCALATE (never auto-approve). A consumed mandate replayed → REJECT.
 *
 * v0.2 persists the consumed-mandate set and the spend ledger to a JSONL file so
 * single-use replay protection and per-stream lifetime totals SURVIVE A RESTART.
 * Each `commit` appends one event line; the file is replayed on construction to
 * rebuild in-memory state. The 24h prune + `streamTotals` optimization are kept:
 * pruning bounds the in-memory window only — the durable lifetime per-stream total
 * is reconstructed from the full event log, and the replay set is never pruned.
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type { CapResult, Charge, SpendCaps } from "./types.js";
import { resolveDataDir } from "./audit.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const LEDGER_FILE = "ledger.jsonl";

interface SpendRecord {
  ts: number;
  amount: number;
  stream: string;
}

/** One durable commit event line in the JSONL ledger. */
interface LedgerEvent {
  mandateId: string;
  ts: number;
  amount: number;
  stream: string;
}

/**
 * Holds the consumed-mandate set and the approved-spend ledger. One instance per
 * server process. Deterministic, injectable clock for tests. State is persisted to
 * JSONL and reloaded on construction so replay protection + per-stream totals
 * survive a restart.
 */
export class SpendLedger {
  private readonly consumed = new Set<string>();
  /**
   * Time-windowed records for the per-day cap only. Pruned to the last DAY_MS on
   * every check so this array cannot grow unbounded (a DoS vector). Records older
   * than the daily window carry no per-day signal and are dropped.
   */
  private records: SpendRecord[] = [];
  /**
   * Running per-stream total. Lives outside `records` precisely so it survives
   * record pruning — the per-stream cap is a lifetime total, not a windowed one.
   * Rebuilt from the full durable event log on construction; updated on commit.
   */
  private readonly streamTotals = new Map<string, number>();
  private readonly path: string;

  /**
   * @param dataDir directory for the JSONL ledger. Defaults to PAYMENTS_DATA_DIR or
   * `./.payments-data`. Tests pass a temp dir. The dir is created on construction.
   */
  constructor(dataDir?: string) {
    this.path = join(resolveDataDir(dataDir), LEDGER_FILE);
    mkdirSync(dirname(this.path), { recursive: true });
    this.load();
  }

  /**
   * Replay the durable event log to rebuild in-memory state. Every committed
   * mandate id is re-added to the consumed set (replay protection survives restart)
   * and the lifetime per-stream total is reconstructed from ALL events. Recent
   * events also seed `records` so the per-day window is correct after a restart.
   */
  private load(): void {
    if (!existsSync(this.path)) return;
    const raw = readFileSync(this.path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let ev: LedgerEvent;
      try {
        ev = JSON.parse(trimmed) as LedgerEvent;
      } catch {
        continue; // skip a corrupt line; durable history is never rewritten
      }
      if (!ev.mandateId || typeof ev.amount !== "number") continue;
      this.consumed.add(ev.mandateId);
      this.records.push({ ts: ev.ts, amount: ev.amount, stream: ev.stream });
      this.streamTotals.set(
        ev.stream,
        (this.streamTotals.get(ev.stream) ?? 0) + ev.amount,
      );
    }
  }

  /** True if this mandate id has already been consumed (i.e. a replay). */
  isConsumed(mandateId: string): boolean {
    return this.consumed.has(mandateId);
  }

  /**
   * Drop records older than the daily window. Bounds `records` growth: only
   * spend from the last DAY_MS is retained (the per-day cap needs nothing older).
   * The per-stream lifetime total is held separately in `streamTotals`.
   */
  private prune(now: number): void {
    const cutoff = now - DAY_MS;
    this.records = this.records.filter((r) => r.ts > cutoff);
  }

  private spentTodayOnStream(stream: string, now: number): number {
    const cutoff = now - DAY_MS;
    return this.records
      .filter((r) => r.stream === stream && r.ts > cutoff)
      .reduce((sum, r) => sum + r.amount, 0);
  }

  private spentTotalOnStream(stream: string): number {
    return this.streamTotals.get(stream) ?? 0;
  }

  /**
   * Evaluate a charge against the caps. Does NOT mutate state — call `commit`
   * separately only after the queen has decided to proceed (audit-first).
   *
   * @param now injectable clock (ms) for deterministic tests.
   */
  check(charge: Charge, caps: SpendCaps, now: number = Date.now()): CapResult {
    // Bound the in-memory record set: prune anything outside the daily window.
    this.prune(now);

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
   *
   * Durability: the event is appended to the JSONL ledger FIRST. If that write
   * throws, no in-memory state is mutated — there is no consumed mandate without a
   * durable record of it, so replay protection cannot be lost to a crash.
   */
  commit(charge: Charge, now: number = Date.now()): void {
    if (this.consumed.has(charge.mandateId)) {
      throw new Error(`refusing to re-consume mandate ${charge.mandateId}`);
    }
    const ev: LedgerEvent = {
      mandateId: charge.mandateId,
      ts: now,
      amount: charge.amount,
      stream: charge.stream,
    };
    // Durable write FIRST: persist the consume event before mutating memory.
    appendFileSync(this.path, JSON.stringify(ev) + "\n", "utf8");
    this.consumed.add(charge.mandateId);
    this.records.push({ ts: now, amount: charge.amount, stream: charge.stream });
    // Maintain the lifetime per-stream total separately so it survives pruning.
    this.streamTotals.set(
      charge.stream,
      (this.streamTotals.get(charge.stream) ?? 0) + charge.amount,
    );
  }

  /** The JSONL file backing this ledger. */
  filePath(): string {
    return this.path;
  }
}
