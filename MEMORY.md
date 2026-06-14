# Payment Intelligence System — Durable Memory

> Per SIP Layer 1. Durable state, commitments, open forks — and what every payments session must record.

**Status:** v0.1 — scaffold. ⚠️ UNAUDITED. NOT FOR LIVE FUNDS.

---

## Version

`v0.1.0` — scaffold. Not yet tagged. SIP-composing.

## Commitments (non-waivable)

- **No money-movement tool.** There is no `transfer` / `pay` / `settle` / `move_funds` tool, and there never will be one in this repo. The MCP authorizes; it does not settle.
- **Fail-closed.** On any doubt, reject. A failed audit write fails the action. Reject-on-doubt is permanent doctrine, not a v0.1 limitation.
- **Human gate on capital + irreversibility.** Over-cap spend, new rail, new vendor, and any irreversible action are always human-decided (PROTECTION-LAYERS L7). Agents draft and gate; humans approve.
- **Single-use mandates.** A mandate is consumed on approval. Replay is always a reject.
- **Audit-first.** No money-relevant decision exists without a prior append-only audit entry.
- **Queen-only MCP access.** Only the Payments Queen calls the MCP. Workers report; they never call.

## What to record (every session)

Write to the audit log (`record_audit_entry`) and, on significant decisions, here:

- **Every verify/cap/escalation verdict** — mandateId, charge amount/currency, verdict, one-line reason, timestamp.
- **Every escalation** — what exceeded autonomy (which cap / boundary), the pending-approval id, who must resolve it.
- **Every refusal** — what was refused and why (out-of-scope money-movement ask, cap-raise request, worker MCP attempt).
- **Config changes** — any change to caps or issuer keys (these are founder-gated; record the approver).
- **Never record** — raw card data, full wealth figures, or anything Tier 1/2 confidential. Those do not belong in this surface. If one appears, escalate; do not log it.

## What this is NOT (anti-scope)

This repo does not, and will not:
- Implement a settlement rail (x402 / ACP / card processing live here — they compose downstream).
- Hold or custody funds, keys to funds, or live card credentials.
- Auto-approve any over-cap spend or auto-raise a cap.
- Serve a `private/` wealth path or read Tier 1/2 financial data.

## Open forks

- **Real crypto verification.** v0.1 uses a placeholder HMAC signature check. A real release swaps in production AP2 mandate verification (e.g. the `google-agentic-commerce/AP2` reference verifier) behind the same `verify_mandate` interface. Until then: NOT FOR LIVE FUNDS.
- **Persistent audit store.** v0.1 keeps the audit log + consumed-mandate set + spend ledger **in-memory**. A real release persists them (append-only file / DB) so replay protection and daily caps survive a restart.
- **Byzantine consensus seam.** PROTECTION-LAYERS L5 calls for multi-agent consensus on high-value / cross-stream payments (`agentic-payments` pattern). The seam is the `require_human_approval` boundary; consensus verification lands here in a later phase.
- **Rail adapters.** When downstream settlement is wired, rail adapters (x402, ACP) read our verdict as a precondition — they never bypass `verify_mandate` + `check_spend_cap`.

## Composes from

- **SIS (Starlight Intelligence System)** — substrate canon source; Wealth IS sets the income thesis + gate ladder.
- **agentic-ops-hub** — `ECOSYSTEM.md` (layer map), `AGENT-STACK.md` (escalation contract), `PROTECTION-LAYERS.md` (L1–L7 defense).
- **agentic-creator-os** — MCP server style, audit-trail + circuit-breaker + IAM safety patterns.
- **second-brain-os** — the 5-file SIP contract shape (README / CLAUDE / AGENTS / SKILL / CANON + MEMORY).

## Built on SIP

This memory file is the durable layer for the payments vertical. Updated on every significant decision. Per SIP Layer 1.
