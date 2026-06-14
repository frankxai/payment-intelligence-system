# Payment Intelligence System

> The **L5 Payments** vertical of the agentic-income ecosystem: a SIP-style payments-governance vertical plus a fail-closed TypeScript MCP server that authorizes — but never moves — money.

[![Built on SIP](https://img.shields.io/badge/Built%20on-SIP-blue.svg)](https://github.com/frankxai/Starlight-Intelligence-System)

**Status:** v0.1 — scaffold.

> [!CAUTION]
> **⚠️ UNAUDITED. NOT FOR LIVE FUNDS.**
> This is a v0.1 scaffold. The MCP server verifies mandates and enforces spend caps in-memory with a placeholder signature check. It has **not** been security-audited, it does **not** integrate a real cryptographic library or a real settlement rail, and it must **never** be wired to a production payment system or live funds. There is no tool that moves money — and there never will be. Use it to model the control surface, not to settle payments.

---

## Where this sits

This repo is **L5 — Payments** in the agentic-income layer model (`agentic-ops-hub/ECOSYSTEM.md`). It is the control surface that makes money safe: it answers *"was this authorized, and is it within cap?"* **before** any settlement rail runs. Capability lives below it; the swarm runtime runs above it; assurance wraps the whole stack.

```
L7 ASSURANCE      starlight-evals (red/blue)
L6 SWARM RUNTIME  starlight-swarm (queens + workers)
L5 PAYMENTS       payment-intelligence-system  ← YOU ARE HERE
L4 INCOME ENGINE  agentic-income-skills → agenticincome
L3 OS FAMILY      agentic-business-os / agentic-creator-os
L2 CONFIG         agentic-ops-hub
L1 CAPABILITY     agentic-creator-os (skills, agents, safety)
L0 SUBSTRATE      Starlight-Intelligence-System (SIP)
```

The defining invariant, inherited from the ecosystem doctrine: **no autonomous money movement, ever.** Agents draft, verify, and gate; humans approve capital and irreversible actions.

---

## Quick map

| File / dir | What |
|---|---|
| `README.md` | This file — purpose, placement, status, the warning banner |
| `CLAUDE.md` | Operating doctrine: fail-closed, human gate on money |
| `AGENTS.md` | Cross-tool agent card (Claude / Codex / Cursor / Gemini) |
| `SKILL.md` | The payments operating skill — when to verify, when to refuse |
| `CANON.md` | Term definitions: mandate, spend-cap, rail, settlement, SPT |
| `MEMORY.md` | Durable state, commitments, open forks — and what to record |
| `agents/` | The Payments Queen + 4 workers (markdown agent definitions) |
| `docs/PAYMENT-PROTOCOLS.md` | June 2026 state of AP2 / x402 / ACP / Visa IC / agentic-payments |
| `mcp/` | The fail-closed TypeScript MCP server (4 verify-only tools + tests) |
| `.github/workflows/ci.yml` | Build + test the MCP on Node 24 |

---

## The control surface

Money is made safe by composition, not by trust:

1. **AP2 mandate** answers *"was this authorized?"* — a cryptographically signed proof the human approved *this* purchase for *this* amount.
2. **x402 or ACP** answers *"how does money move?"* — the settlement rail (onchain USDC, or a Shared Payment Token).

This MCP verifies the AP2 mandate **and** enforces spend caps **before** any rail settles. The four tools are all verify-only:

| Tool | Job | Fail mode |
|---|---|---|
| `verify_mandate` | Reject unsigned / expired / amount-mismatched mandates | **Fail closed** — reject on any doubt |
| `check_spend_cap` | Per-tx / per-day / per-stream caps; single-use mandate replay guard | Over cap or replay → **escalate**, never auto-approve |
| `record_audit_entry` | Append-only audit log | If the log write fails, the action fails |
| `require_human_approval` | Return a pending-approval object | **Never** auto-approves |

There is no `transfer`, `pay`, `settle`, or `move_funds` tool. None exists, by design.

---

## Run the MCP

```bash
cd mcp
npm install
npm run build      # tsc → dist/
npm test           # vitest — proves a forged mandate and an over-cap spend are REJECTED
```

The server speaks stdio. Wire it (verify-only) to the Payments Queen — never to a worker.

---

## The Payments swarm

A **Payments Queen** (`agents/payments-queen.md`) coordinates four workers and escalates capital + irreversible actions to the founder + human gate:

- `mandate-verifier` — proves the human authorized this charge (AP2)
- `spend-cap-enforcer` — enforces per-tx / day / stream caps
- `settlement-auditor` — writes the append-only audit entry; reconciles
- `fraud-sentinel` — anomaly + replay + injection detection

See `agents/` and `docs/PAYMENT-PROTOCOLS.md`.

---

## Built on SIP

Composes the Starlight Intelligence Protocol. Declines vertical canon (see `CANON.md`). Per SIP § Sovereignty clause.

---

Built by [Frank Riemer](https://frankx.ai). For builders, not consumers.
