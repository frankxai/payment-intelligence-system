# Payment Protocols — June 2026 State

> What the agentic-payments protocol landscape looks like as of June 2026, how the pieces compose, and where each fits the L5 Payments stack. The defining split: **authorization** ("was this allowed?") is separate from **settlement** ("how does money move?"). Our MCP owns authorization gating; it never settles.

**Status:** v0.1 — scaffold. ⚠️ UNAUDITED. NOT FOR LIVE FUNDS.
Last reviewed: 2026-06-14.

---

## The composition in one line

```
AP2 mandate  ──"was this authorized?"──►  [ verify_mandate + check_spend_cap ]  ──►  rail settles
(authorization)                            (this MCP — fail-closed)                   x402 (onchain USDC)
                                                                                      ACP  (Shared Payment Token)
                                                                                      Visa Intelligent Commerce
```

AP2 proves a human authorized **this** purchase for **this** amount. It does **not** move money. x402 and ACP are the rails that move money. Visa Intelligent Commerce is the card-network trust layer. Our control surface verifies the AP2 mandate **and** enforces spend caps **before** any rail runs.

---

## AP2 — Agent Payments Protocol (Google)

- **What it is:** An open protocol for cryptographically signed **mandates** that prove a user authorized a specific agent purchase for a specific amount. AP2 is the *authorization* primitive — it answers "was this authorized?" and explicitly **does not move money**.
- **License / governance:** Apache 2.0, Google-led, open.
- **Version:** v0.2.0 (April 2026).
- **Spec / repo:** [ap2-protocol.org](https://ap2-protocol.org) · [github.com/google-agentic-commerce/AP2](https://github.com/google-agentic-commerce/AP2)
- **Partners (verified):** Mastercard, American Express, PayPal, Adyen, Coinbase.
- **Where it fits our stack:** This is the input to `verify_mandate`. Every charge must carry a valid AP2 mandate (signed, unexpired, amount-matched) before anything downstream runs. AP2 is rail-agnostic by design — the same mandate can front an x402 or an ACP settlement.

## x402 — HTTP 402 settlement (Coinbase + Cloudflare Foundation)

- **What it is:** Revives the dormant HTTP `402 Payment Required` status code. A server responds `402`; the agent signs a **USDC stablecoin transaction onchain** to pay and retries. A *settlement rail* — it answers "how does money move?".
- **Chains:** Base and Solana.
- **Governance:** Coinbase + the Cloudflare-backed x402 Foundation; core members include Google, Visa, AWS, Circle, Anthropic, and Vercel.
- **Where it fits our stack:** A **downstream rail**, not implemented here. Once `verify_mandate` + `check_spend_cap` return "verified and within cap", an x402 settlement could run elsewhere. Our MCP is the precondition; it never signs the onchain transaction.

## ACP — Agentic Commerce Protocol (OpenAI + Stripe)

- **What it is:** Lets an agent complete a purchase using a **Shared Payment Token (SPT)** — the agent never sees the buyer's card details. Delegated authorization is scoped via **OAuth 2.0**. Powers ChatGPT **Instant Checkout**.
- **Status:** beta.
- **Repo:** [github.com/agentic-commerce-protocol](https://github.com/agentic-commerce-protocol)
- **Where it fits our stack:** The other **downstream rail**. ACP's SPT is an authorization artifact like an AP2 mandate, but card-scoped via the merchant/processor. In our model, an AP2 mandate gates *whether* the purchase is allowed; ACP carries *how* it settles without exposing card data. Holding an SPT is never permission to exceed a cap — our `check_spend_cap` still applies.

## Visa Intelligent Commerce

- **What it is:** Visa's program enabling AI agents to transact on the card network with tokenized credentials and agent-scoped controls. The **card-network trust layer** for agentic payments.
- **Where it fits our stack:** A trust/identity layer that rides the card rails alongside ACP-style flows. Out of scope for this repo to implement; relevant as context for how card settlement is governed once our authorization gate passes. Visa is also an x402 Foundation core member, so it spans both the onchain and card worlds.

## agentic-payments (multi-agent authorization pattern)

- **What it is:** The pattern (referenced in `agentic-ops-hub/docs/PROTECTION-LAYERS.md` L5) where high-value or cross-stream payments require **agreement from independent verifier agents** (Byzantine consensus) — no single agent authorizes large money.
- **Where it fits our stack:** The seam for L5's multi-agent-consensus requirement. In v0.1 the boundary is `require_human_approval` (escalate over-cap / high-value to a human). A later phase can insert independent-verifier consensus before that boundary. The `agentic-payments` subagent (available in this environment) models this pattern.

---

## How they compose into our control surface

| Question | Answered by | Our role |
|---|---|---|
| Was this purchase authorized for this amount? | **AP2 mandate** | `verify_mandate` — fail-closed |
| Is it within the agent's autonomous spend ceiling? | **spend caps** (our policy) | `check_spend_cap` — over-cap → escalate |
| Is there a prior record of the decision? | **audit log** | `record_audit_entry` — append-only, audit-first |
| Does a human need to decide? | **escalation** | `require_human_approval` — never auto-approve |
| How does money actually move? | **x402 / ACP / Visa IC** | **not here** — downstream rails, gated by the above |

The invariant across all of it: **no autonomous money movement, ever.** We authorize and gate; rails settle elsewhere; humans approve capital and irreversible actions.

---

## What this repo deliberately does not do

- Does not implement x402, ACP, or Visa IC settlement.
- Does not custody funds, hold keys to funds, or touch live card credentials.
- Does not perform production AP2 cryptographic verification (v0.1 uses a placeholder HMAC check — see the README banner).

## Built on SIP

This document composes the SIP substrate. Per SIP § Sovereignty clause.
