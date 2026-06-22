# Research — Google AP2 (Agent Payments Protocol)

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

---

## What

AP2 (Agent Payments Protocol) is Google's open mandate framework for authorizing AI agent-initiated payments. It uses Ed25519-signed payment mandates that authorize agents to transact across card rails, account-to-account rails, and digital assets. AP2 is a mandate framework, not a settlement rail — the underlying settlement can use any AP2-compatible rail.

## Who

Developer: **Google** (google-agentic-commerce organization on GitHub). Open specification with 60+ partner organizations as of 2026-06 across issuers, processors, merchants, and agent frameworks.

## Mechanism

1. Operator creates a **signed mandate** via AP2: `{agent_id, scope, amount_cap, time_window, merchant_restrictions, nonce}`
2. Mandate is signed with operator's Ed25519 private key
3. Agent carries the signed mandate as authorization credentials
4. At payment time, agent presents mandate to merchant/processor
5. Merchant/processor verifies Ed25519 signature offline (<1ms verification time)
6. If valid and within scope: payment is authorized
7. AP2 supports **Byzantine consensus** for high-value transactions: N-of-M agents must co-sign before authorization
8. Settlement occurs via the underlying rail (card, ACH, stablecoin, depending on merchant and mandate configuration)

**Mandate types:**
- **Intent mandate:** General authorization for a category ("purchase office supplies up to $500/week")
- **Cart mandate:** Authorization for a specific item list ("purchase item A, B, C from merchant X")

## When to choose

- You need a standardized mandate framework that works across multiple settlement rails
- You're integrating with AP2 partner merchants (60+ as of 2026-06)
- You need Byzantine consensus for high-value multi-agent authorization
- You want cryptographically verifiable spend authorization with offline verification

**Not for:** Direct API monetization (use x402 instead), mandates requiring no operator-to-agent explicit grant.

## Verified facts as of 2026-06

- **Partner count:** 60+ organizations as of 2026-06 (Google AP2 program)
- **Signature scheme:** Ed25519 (offline verification, <1ms)
- **Mandate types:** intent, cart
- **Byzantine consensus:** Built in for configurable high-value thresholds
- **Repo:** https://github.com/google-agentic-commerce/AP2
- **A2A extension:** https://github.com/google-agentic-commerce/a2a-x402 (x402 on-chain settlement via A2A)

## Sources

- AP2 repository: https://github.com/google-agentic-commerce/AP2
- A2A x402 extension: https://github.com/google-agentic-commerce/a2a-x402

---

**Built on SIP** — Payment Intelligence / research/mandates/ap2.md · v1.0 · SIP v1.1.0 (2026-06-22)
