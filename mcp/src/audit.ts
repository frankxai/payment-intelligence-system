/**
 * Append-only audit log.
 *
 * ⚠️ v0.1 scaffold. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * Invariant (PROTECTION-LAYERS L1): no money action exists without a prior audit
 * entry, and if the log write fails the action fails. The log is append-only —
 * never edited, never deleted, never reordered. v0.1 stores entries in-memory;
 * a real release persists them as JSONL.
 */

import type { AuditEntry } from "./types.js";

export class AuditLog {
  private readonly entries: AuditEntry[] = [];

  /**
   * Append an entry. Returns the stored entry. Throws on a malformed entry so the
   * caller can fail the action closed (an unloggable decision must not proceed).
   */
  append(entry: Omit<AuditEntry, "ts"> & { ts?: number }): AuditEntry {
    if (!entry.action || typeof entry.action !== "string") {
      throw new Error("audit append failed: missing action — failing closed");
    }
    const stored: AuditEntry = { ...entry, ts: entry.ts ?? Date.now() };
    this.entries.push(stored);
    return stored;
  }

  /** Read-only snapshot. Returns a copy so callers cannot mutate the log. */
  all(): readonly AuditEntry[] {
    return [...this.entries];
  }

  size(): number {
    return this.entries.length;
  }
}
