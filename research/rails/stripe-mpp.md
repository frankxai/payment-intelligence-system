# Research — Stripe Machine Payments Protocol (MPP)

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

---

## What

Stripe MPP (Machine Payments Protocol) is Stripe's agent-native payment protocol launched in March 2026. It uses a pre-authorized session envelope to allow AI agents to make metered payments within a session without per-transaction user confirmation. Settlement occurs at session end or on a threshold trigger.

## Who

Developer: **Stripe**. Part of the Stripe AI monorepo (`github.com/stripe/ai`). Pairs with `@stripe/agent-toolkit` (function calling SDK) and the Stripe MCP server (`mcp.stripe.com`).

## Mechanism

1. Operator (human) pre-authorizes a session envelope at session start: `stripe.mpp.sessions.create({amount_limit, currency, agent_id, ttl})`
2. Agent receives session token
3. Each agent action (tool call, API use, service purchase) draws a metered charge from the session envelope: `stripe.mpp.charges.create({session_token, amount, description})`
4. At session end or threshold breach, session settles: Stripe charges the underlying payment method for the total session usage
5. Unused session balance is released

**Settlement:** Stripe standard settlement (T+2 in most markets, T+1 in some). Payment method: any Stripe-supported method (card, bank transfer, etc.).

**Authorization vs. settlement:** The session envelope is pre-authorized at creation. Individual charges within the session are instant (no user prompt). Settlement occurs in batch at session close.

## When to choose

- Your PSP is Stripe and you want agent-native payment handling without per-action user confirmation
- AI agent makes many small purchases within a bounded session (e.g., research agent buying multiple reports, coding agent using multiple APIs)
- You need metered billing (pay for what was used) rather than pre-purchased credits
- You want Stripe's fraud protection, dispute handling, and receipt infrastructure

**Not for:** Non-Stripe PSPs, trustless/on-chain settlement, sub-cent micropayments (Stripe fees apply), cross-currency settlement requiring crypto rails.

## Verified facts as of 2026-06

- **Launch:** March 2026
- **Repo:** https://github.com/stripe/ai (Stripe AI monorepo)
- **`@stripe/agent-toolkit`:** Function calling SDK for LangChain, Vercel AI SDK, OpenAI Agents SDK
- **Stripe MCP server:** Available at `mcp.stripe.com` (remote) or `npx @stripe/mcp` (local)
- **Pairs with:** Claude skills (`stripe-best-practices`, `stripe-directory`, etc.) and Stripe AI Agent Toolkit
- **Settlement:** Stripe standard (T+2 most markets)

## Sources

- Stripe AI monorepo: https://github.com/stripe/ai
- Stripe MCP documentation: https://docs.stripe.com/mcp
- MPP product page: https://stripe.com/docs/machine-payments

---

**Built on SIP** — Payment Intelligence / research/rails/stripe-mpp.md · v1.0 · SIP v1.1.0 (2026-06-22)
