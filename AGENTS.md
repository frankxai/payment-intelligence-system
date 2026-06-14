# Payment Intelligence System — Agents (cross-tool card)

> The portable agent card. Same contract whether you run in Claude Code, Codex, Cursor, or Gemini CLI. This file mirrors `CLAUDE.md`; if they disagree, `CLAUDE.md` wins.

**Status:** v0.1 — scaffold. ⚠️ UNAUDITED. NOT FOR LIVE FUNDS.

---

## What this repo is

The **L5 Payments** vertical of the agentic-income ecosystem (`agentic-ops-hub/ECOSYSTEM.md`). A SIP-style payments-governance vertical plus a fail-closed TypeScript MCP server that **authorizes but never moves** money.

## The one rule

**No autonomous money movement, ever.** Verify the AP2 mandate + enforce spend caps **before** any rail settles. There is no tool that moves money — and there never will be.

---

## The swarm

A **Payments Queen** (`queen-coordinator` pattern, scoped to payments) coordinates four workers and escalates capital + irreversible actions to the founder + human gate.

| Agent | Role | Calls the MCP? |
|---|---|---|
| `payments-queen` | Coordinates the stream, runs the MCP tools, owns escalation | Yes — all 4 verify-only tools |
| `mandate-verifier` | Proves the human authorized this charge (AP2) | No — reports to queen |
| `spend-cap-enforcer` | Enforces per-tx / day / stream caps + replay guard | No — reports to queen |
| `settlement-auditor` | Writes append-only audit; reconciles | No — reports to queen |
| `fraud-sentinel` | Anomaly + replay + injection detection | No — reports to queen |

Definitions: `agents/`.

## The MCP (verify-only)

`mcp/` — TypeScript, `@modelcontextprotocol/sdk`, stdio. Four tools, all fail-closed:

| Tool | Job |
|---|---|
| `verify_mandate` | Reject unsigned / expired / amount-mismatched mandates |
| `check_spend_cap` | Per-tx / day / stream caps; single-use replay guard; over-cap → escalate |
| `record_audit_entry` | Append-only audit log |
| `require_human_approval` | Return a pending-approval object (never auto-approves) |

Wire it **only** to the Payments Queen. Never to a worker. See `mcp/README.md`.

---

## Escalation contract (load-bearing)

| Action class | Who decides | Gate |
|---|---|---|
| Worker task within stream | Worker → Queen | Queen review |
| Any payment / settlement | Payments Queen | AP2 mandate verified + spend-cap check + audit entry (MCP, fail-closed) |
| Spend above cap / new rail / new vendor | Founder | `/starlight-board` + **human approval** |
| Irreversible (move funds, rotate key, delete) | Founder | **human approval, always** |

Full contract: `agentic-ops-hub/docs/AGENT-STACK.md`.

## Built on SIP

All agents emit SIP attestation on artifact creation. The fail-closed and human-gate invariants are non-waivable. Per SIP § Sovereignty clause.
