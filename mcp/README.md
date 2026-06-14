# @frankx-ai/payments-mcp

> Fail-closed, **verify-only** MCP server for the L5 Payments vertical. It authorizes money (AP2 mandate + spend caps) — it never moves money.

**Status:** v0.1 — scaffold. ⚠️ **UNAUDITED. NOT FOR LIVE FUNDS.**

This server verifies mandates and enforces spend caps **in-memory** with a **placeholder** HMAC signature check (`src/signature.ts`). It has not been security-audited, integrates no real cryptographic verification and no settlement rail, and must never be wired to a production payment system or live funds. Use it to model the control surface.

## Tools (all verify-only)

| Tool | Job | Fail mode |
|---|---|---|
| `verify_mandate` | Reject unsigned / expired / amount-mismatched / malformed mandates | **Fail closed** — reject on any doubt |
| `check_spend_cap` | Per-tx / day / stream caps + single-use replay guard | Over cap → **escalate**; replay → **reject** |
| `record_audit_entry` | Append-only audit log | Failed write → action fails |
| `require_human_approval` | Return a pending-approval object | **Never** auto-approves |

There is no `transfer` / `pay` / `settle` / `move_funds` tool. None exists, by design.

## Run

```bash
cd mcp
npm install
npm run build       # tsc → dist/
npm test            # typecheck + node:test — proves forged mandate + over-cap spend are rejected/escalated
npm start           # serve on stdio
```

Wire it (verify-only) to the **Payments Queen** — never to a worker:

```json
{
  "mcpServers": {
    "payments": {
      "command": "node",
      "args": ["path/to/payment-intelligence-system/mcp/dist/index.js"]
    }
  }
}
```

## Layout

```
mcp/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          # MCP server: registers the 4 verify-only tools
    ├── types.ts          # shared types (no money-movement type exists)
    ├── signature.ts      # PLACEHOLDER HMAC verify (swap for AP2 reference verifier)
    ├── mandate.ts        # verify_mandate logic — fail closed
    ├── spend-cap.ts      # SpendLedger: caps + single-use replay guard
    ├── audit.ts          # append-only AuditLog
    ├── approval.ts       # requireHumanApproval — pending object only
    ├── mandate.test.ts   # forged / expired / mismatched → REJECT
    └── spend-cap.test.ts # over-cap → ESCALATE; replay → REJECT
```

## Built on SIP

Composes the Starlight Intelligence Protocol. Per SIP § Sovereignty clause.
