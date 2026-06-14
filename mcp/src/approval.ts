/**
 * Human-approval escalation.
 *
 * ⚠️ v0.1 scaffold. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * `requireHumanApproval` returns a PENDING object and NOTHING ELSE. There is no
 * code path here that resolves an approval to "approved" — a human does that out
 * of band. Producing a pending object is never the same as granting approval.
 */

import { randomUUID } from "node:crypto";
import type { Charge, PendingApproval } from "./types.js";

export function requireHumanApproval(charge: Charge, reason: string): PendingApproval {
  return {
    pendingApprovalId: `pa_${randomUUID()}`,
    status: "pending-human-approval",
    reason,
    charge,
    createdAt: Date.now(),
  };
}
