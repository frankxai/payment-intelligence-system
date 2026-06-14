/**
 * Append-only audit log — durable in v0.2.
 *
 * ⚠️ v0.2 scaffold. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * Invariant (PROTECTION-LAYERS L1): no money action exists without a prior audit
 * entry, and if the log write fails the action fails. The log is append-only —
 * never edited, never deleted, never reordered.
 *
 * v0.2 persists each entry to a JSONL file under a data dir (default
 * `./.payments-data/audit.jsonl`, override via `PAYMENTS_DATA_DIR` or constructor)
 * IN ADDITION to the in-memory mirror. A failed disk write throws, so the action
 * fails closed exactly as an in-memory failure would. The on-disk JSONL is the
 * durable record; the in-memory array is a fast read mirror loaded at construction.
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type { AuditEntry } from "./types.js";

const DEFAULT_DIR = ".payments-data";
const AUDIT_FILE = "audit.jsonl";

/** Resolve the data dir: explicit arg → env → default. */
export function resolveDataDir(dataDir?: string): string {
  return dataDir ?? process.env.PAYMENTS_DATA_DIR ?? DEFAULT_DIR;
}

export class AuditLog {
  private readonly entries: AuditEntry[] = [];
  private readonly path: string;

  /**
   * @param dataDir directory for the JSONL file. Defaults to PAYMENTS_DATA_DIR or
   * `./.payments-data`. Tests pass a temp dir. The dir is created on construction.
   */
  constructor(dataDir?: string) {
    this.path = join(resolveDataDir(dataDir), AUDIT_FILE);
    mkdirSync(dirname(this.path), { recursive: true });
    this.load();
  }

  /** Load any prior entries from the JSONL file into the in-memory mirror. */
  private load(): void {
    if (!existsSync(this.path)) return;
    const raw = readFileSync(this.path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed) as AuditEntry;
        // Re-freeze on load: the append-only log stays immutable in memory too.
        this.entries.push(Object.freeze(parsed));
      } catch {
        // A corrupt line is skipped on read but never rewritten — the file is
        // append-only and we do not edit history. (Surfaced via size mismatch.)
      }
    }
  }

  /**
   * Append an entry. Persists to JSONL FIRST (durable record), then mirrors it in
   * memory. Returns the stored entry. Throws on a malformed entry OR a failed disk
   * write so the caller can fail the action closed (an unloggable decision must not
   * proceed). Append-first ordering means: if the write throws, nothing is mirrored.
   */
  append(entry: Omit<AuditEntry, "ts"> & { ts?: number }): AuditEntry {
    if (!entry.action || typeof entry.action !== "string") {
      throw new Error("audit append failed: missing action — failing closed");
    }
    // Freeze the entry so the append-only log is immutable: a stored decision
    // can never be edited in place after the fact.
    const stored: AuditEntry = Object.freeze({ ...entry, ts: entry.ts ?? Date.now() });
    // Durable write FIRST. If this throws, the action fails closed and the entry
    // is never mirrored — no in-memory record exists for an unpersisted decision.
    appendFileSync(this.path, JSON.stringify(stored) + "\n", "utf8");
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

  /** The JSONL file backing this log. */
  filePath(): string {
    return this.path;
  }
}
