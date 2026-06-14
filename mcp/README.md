# @frankx-ai/payments-mcp

> Fail-closed, **verify-only** MCP server for the L5 Payments vertical. It authorizes money (AP2 mandate + spend caps) — it never moves money.

**Status:** v0.2 — hardened scaffold. ⚠️ **UNAUDITED. NOT FOR LIVE FUNDS.**

This server verifies mandates and enforces spend caps with **real Ed25519 public-key
verification** (`src/signature.ts`) and **durable JSONL state** for the audit log and
the spend/replay ledger (state survives a restart). It is exercised by an
**end-to-end MCP integration test** (`src/e2e.test.ts`) that drives a real SDK client
over an in-process transport.

It is still **unaudited** and is **not** a full AP2 deployment: there is no issuer-key
distribution, no revocation, no certificate chain, and no settlement rail. It must never
be wired to a production payment system or live funds. Use it to model the control surface.

### What changed in v0.2

- **Real Ed25519 verification.** The v0.1 placeholder HMAC is gone. An issuer signs the
  canonical mandate payload with an Ed25519 private key; this server verifies against the
  issuer's **public** key, resolved from a keyring (`issuerKeyId → public key`). A
  clearly-labeled dev/test keypair (`k_dev`) lets tests mint genuine mandates; additional
  issuer public keys load from env (`PAYMENTS_ISSUER_PUBKEY_<issuerKeyId>` = PEM or
  base64-DER SPKI). A forged or tampered mandate fails real asymmetric verification; an
  unknown `issuerKeyId` fails closed. The `verifySignature` / `canonicalPayload` /
  `signMandate` interface is unchanged.
- **Durable audit log.** Each entry is appended to JSONL (`<dataDir>/audit.jsonl`) before
  being mirrored in memory; a failed write throws (fail closed). `Object.freeze` + the
  missing-action guard are kept.
- **Durable replay + spend ledger.** Consumed mandates and spend records persist to
  `<dataDir>/ledger.jsonl` and reload on construction, so single-use replay protection and
  per-stream lifetime totals survive a restart. The 24h prune + `streamTotals` optimization
  are kept.
- **Data dir** defaults to `./.payments-data` (override via `PAYMENTS_DATA_DIR` or the
  `buildServer({ dataDir })` / `new AuditLog(dir)` / `new SpendLedger(dir)` argument). The
  dir is gitignored.

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
npm test            # typecheck + node:test (unit + e2e) — proves forged mandate → reject,
                    # over-cap → escalate, replay → reject, and durability across a restart
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
    ├── index.ts           # MCP server: buildServer() registers the 4 verify-only tools
    ├── types.ts           # shared types (no money-movement type exists)
    ├── signature.ts       # real Ed25519 verify + keyring (dev/test keypair + env issuers)
    ├── mandate.ts         # verify_mandate logic — fail closed
    ├── spend-cap.ts       # SpendLedger: caps + single-use replay guard (durable JSONL)
    ├── audit.ts           # append-only AuditLog (durable JSONL)
    ├── approval.ts        # requireHumanApproval — pending object only
    ├── signature.test.ts  # Ed25519 valid / forged / tampered / unknown-issuer → fail closed
    ├── mandate.test.ts    # forged / expired / mismatched → REJECT
    ├── spend-cap.test.ts  # over-cap → ESCALATE; replay → REJECT; durability across restart
    ├── audit.test.ts      # append-only + durable + missing-action fails closed
    └── e2e.test.ts        # in-process MCP client: 4 tools (none moves money), each verdict path
```

## Built on SIP

Composes the Starlight Intelligence Protocol. Per SIP § Sovereignty clause.
