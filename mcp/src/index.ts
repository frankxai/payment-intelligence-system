#!/usr/bin/env node
/**
 * Payments MCP — fail-closed, verify-only control surface for the L5 Payments vertical.
 *
 * ⚠️ v0.2 scaffold. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * Four tools, all verify-only:
 *   - verify_mandate          "was this authorized?"  (fail closed, real Ed25519)
 *   - check_spend_cap         per-tx/day/stream caps + single-use replay guard (over cap → escalate)
 *   - record_audit_entry      append-only audit log (audit-first; failed write fails the action)
 *   - require_human_approval  returns a pending-approval object (never auto-approves)
 *
 * There is NO transfer/pay/settle/move_funds tool. None exists, by design.
 * Wire this server (verify-only) to the Payments Queen — never to a worker.
 *
 * v0.2: real Ed25519 verification + durable audit/ledger (JSONL). `buildServer`
 * is exported so tests can connect an in-process SDK client and point state at a
 * temp dir; `main` wires the stdio transport for production-style use.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import type { Charge, Mandate, SpendCaps } from "./types.js";
import { verifyMandate } from "./mandate.js";
import { SpendLedger } from "./spend-cap.js";
import { AuditLog } from "./audit.js";
import { requireHumanApproval } from "./approval.js";

// ---- Zod schemas (input validation is itself a fail-closed gate) ----
const mandateSchema = z.object({
  mandateId: z.string().min(1).max(100),
  subject: z.string().min(1).max(256),
  amount: z.number().positive(),
  currency: z.string().min(1).max(10),
  expiresAt: z.number().int(),
  issuerKeyId: z.string().min(1).max(100),
  signature: z.string().min(1).max(256),
});

const chargeSchema = z.object({
  mandateId: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: z.string().min(1).max(10),
  stream: z.string().min(1).max(100),
});

const capsSchema = z.object({
  perTransaction: z.number().positive(),
  perDay: z.number().positive(),
  perStream: z.number().positive(),
});

function textResult(text: string, structured: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text }],
    structuredContent: structured,
  };
}

/**
 * Build the verify-only Payments MCP server with its own durable state. Exported
 * so tests can run the server in-process (InMemoryTransport) against a temp data
 * dir, and so `main` can wire it to stdio. Each call gets a fresh ledger + audit
 * log bound to `opts.dataDir` (defaults to PAYMENTS_DATA_DIR or ./.payments-data).
 */
export function buildServer(opts: { dataDir?: string } = {}): McpServer {
  const ledger = new SpendLedger(opts.dataDir);
  const audit = new AuditLog(opts.dataDir);

  const server = new McpServer({
    name: "payments-mcp",
    version: "0.2.0",
  });

  server.registerTool(
  "verify_mandate",
  {
    title: "Verify AP2 Mandate",
    description:
      "Verify a signed AP2 mandate against a proposed charge. FAILS CLOSED: rejects " +
      "unsigned, expired, amount-mismatched, or malformed mandates. Does not move money.",
    inputSchema: { mandate: mandateSchema, charge: chargeSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  async ({ mandate, charge }) => {
    const result = verifyMandate(mandate as Mandate, charge as Charge);
    return textResult(`${result.verdict.toUpperCase()}: ${result.reason}`, { ...result });
  },
);

server.registerTool(
  "check_spend_cap",
  {
    title: "Check Spend Cap",
    description:
      "Check a charge against per-transaction / per-day / per-stream caps and the " +
      "single-use replay guard. Over any cap → 'escalate' (NEVER auto-approve). " +
      "Replayed mandate → 'reject'. Does not move money.",
    inputSchema: { charge: chargeSchema, caps: capsSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  async ({ charge, caps }) => {
    const result = ledger.check(charge as Charge, caps as SpendCaps);
    // Consume the mandate only on a clean within-cap verdict (single-use).
    if (result.verdict === "within-cap") {
      ledger.commit(charge as Charge);
    }
    return textResult(`${result.verdict.toUpperCase()}: ${result.reason}`, { ...result });
  },
);

server.registerTool(
  "record_audit_entry",
  {
    title: "Record Audit Entry",
    description:
      "Append an entry to the append-only audit log. Audit-first: no money action " +
      "exists without a prior entry. A failed write fails the action. Append-only — " +
      "entries are never edited or deleted.",
    inputSchema: {
      action: z.string().min(1).describe("What happened, e.g. 'verify_mandate'"),
      mandateId: z.string().optional(),
      amount: z.number().optional(),
      currency: z.string().optional(),
      verdict: z.enum(["verified", "reject", "within-cap", "escalate"]).optional(),
      reason: z.string().optional(),
      actor: z.string().optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  },
  async (args) => {
    try {
      const entry = audit.append(args);
      return textResult(`recorded audit entry #${audit.size()} (${entry.action})`, {
        recorded: true,
        entry,
      });
    } catch (err) {
      // Fail closed: surface the failure so the caller does NOT proceed.
      return {
        content: [
          {
            type: "text" as const,
            text: `AUDIT WRITE FAILED — action must not proceed: ${(err as Error).message}`,
          },
        ],
        structuredContent: { recorded: false, error: (err as Error).message },
        isError: true,
      };
    }
  },
);

server.registerTool(
  "require_human_approval",
  {
    title: "Require Human Approval",
    description:
      "Escalate a charge to the human gate. Returns a PENDING-approval object. " +
      "NEVER auto-approves — a human resolves it out of band. Used for over-cap " +
      "spend, new rail, new vendor, or any irreversible action.",
    inputSchema: { charge: chargeSchema, reason: z.string().min(1) },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  },
  async ({ charge, reason }) => {
    const pending = requireHumanApproval(charge as Charge, reason);
    return textResult(
      `ESCALATED to human gate: ${pending.pendingApprovalId} (${reason})`,
      { ...pending },
    );
  },
);

  return server;
}

async function main() {
  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr only — stdout is the MCP stdio channel.
  console.error("payments-mcp v0.2.0 (verify-only, fail-closed, Ed25519 + durable) on stdio — NOT FOR LIVE FUNDS");
}

// Only auto-start the stdio server when run as the entrypoint, not when imported
// by a test that calls buildServer() against an in-process transport.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("payments-mcp fatal:", err);
    process.exit(1);
  });
}
