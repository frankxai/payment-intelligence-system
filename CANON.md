# Payment Intelligence System — Canon Declaration

> Per SIP Layer 1. Declares this vertical's canon posture and defines the load-bearing payments terms.

**Status:** v0.1 — scaffold. ⚠️ UNAUDITED. NOT FOR LIVE FUNDS.

---

## Decision

**The Payment Intelligence System declines canon at the substrate layer.**

It is a vertical that composes SIP. It defines a payments-governance architecture (mandate verification, spend caps, audit, escalation) — it does not define archetypes, world rules, or domain constants. Per SIP § Sovereignty clause: substrate declines vertical canon, and a vertical that serves as substrate for adopters declines to impose canon downstream.

If you adopt Arcanea canon, do so via `/luminor-board` (not `/starlight-board`) and accept the CC-BY-NC attribution that comes with it.

---

## Terms (the vocabulary every payments agent shares)

### Mandate
A cryptographically signed proof that a human authorized **this specific purchase for this specific amount**. The AP2 (Agent Payments Protocol) primitive. A mandate answers *"was this authorized?"* — it does **not** move money. Required fields in this system: `mandateId`, `subject`, `amount`, `currency`, `expiresAt`, `signature`. A mandate is **single-use** — consumed on approval, never replayable.

### Spend-cap
A ceiling on autonomous spend, enforced at three scopes:
- **per-transaction** — the most a single charge may be without escalation.
- **per-day** — the most that may be spent on a stream in a rolling 24h window.
- **per-stream** — the most a stream may spend in total before founder review.
Over any cap → **escalate** to the human gate. Caps are the mechanism that keeps a drifting agent from compounding spend. Caps are never raised by an agent.

### Rail
The mechanism that **actually moves money** — the settlement layer. This system does **not** implement a rail. Two June-2026 rails compose with our verification:
- **x402** — agent signs a USDC stablecoin transaction onchain (Base / Solana) in response to HTTP 402.
- **ACP** — Agentic Commerce Protocol; an agent pays via a Shared Payment Token without seeing card details.
AP2 says *whether* money may move; the rail says *how* it moves. We gate the former and never operate the latter.

### Settlement
The act of money actually changing hands on a rail. **Settlement happens elsewhere, never in this repo.** Our role ends at the verified-and-within-cap verdict. Every settlement that downstream systems perform must be preceded by our verification + an audit entry.

### SPT (Shared Payment Token)
The ACP primitive (OpenAI + Stripe). A token that lets an agent complete a purchase **without ever seeing the buyer's card details**, scoped by OAuth 2.0 delegated authorization. The card data stays with the payment provider; the agent holds only a delegated, scoped token. Powers ChatGPT Instant Checkout. Like a mandate, an SPT is an authorization artifact — holding one is not permission to exceed a cap.

### Escalation
The structural move when an action crosses a cap, a stream boundary, or into irreversibility: control passes **queen → founder → human**. Not discretionary. Returns a pending-approval object; a human resolves it. Distinct from rejection (an invalid request) — escalation is a *valid* request that exceeds autonomy.

### Fail-closed
The default posture: on any doubt, error, or ambiguity, **reject / fail the action** rather than pass it. A failed audit write fails the whole action. "Reject on doubt" is canon, not preference.

---

## Built on SIP

This declaration is the payments-vertical canon posture. Per SIP § Sovereignty clause.
