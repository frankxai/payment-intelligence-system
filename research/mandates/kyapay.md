# Research — KYAPay (Know-Your-Agent + Pay)

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

---

## What

KYAPay is Skyfire's protocol combining Know-Your-Agent (KYA) identity verification with JWT token-based payments. It allows AI agents to transact without wallets, gas fees, or blockchain infrastructure by using verified agent identity + JWT payment tokens. KYAPay is designed for agents that need to be identifiable to merchants, regulators, and counterparties.

## Who

Developer: **Skyfire** (skyfire-xyz). Also ships KYAPay for A2A agents and Skyfire agent skills for Claude Code.

## Mechanism

1. Operator registers an agent with Skyfire KYA: submits agent identity, purpose, and operator accountability chain
2. Skyfire issues a KYA-verified JWT to the agent upon identity verification
3. At payment time, agent presents JWT to merchant/service
4. Merchant verifies JWT signature against Skyfire's public key (online or cached)
5. Payment is charged against the operator's Skyfire account
6. No wallet, no gas, no blockchain required

**A2A extension:** `kyapay_a2a` extends the protocol to agent-to-agent transactions where both buyer and seller are KYA-verified agents.

## Know-Your-Agent (KYA)

KYA is the agent identity standard embedded in KYAPay. A KYA-verified agent has:
- Registered identity (agent ID, operator, purpose)
- JWT credential with expiry and scope claims
- Operator accountability documented in the Skyfire registry

KYA aligns with the emerging requirements of EU AI Act (operator accountability) and PSD3 (payment service provider responsibility for agent-initiated transactions) as of 2026-06.

## When to choose

- Agent needs to be identifiable to merchants and regulators (regulated industries, EU, high-value)
- You want payment without crypto wallet infrastructure
- Counterparty is Skyfire-integrated or accepts KYAPay JWTs
- You need a combined identity + payment solution without separate authorization stack

**Not for:** Anonymous/pseudonymous transactions, non-Skyfire counterparties without JWT support.

## Verified facts as of 2026-06

- **Developer:** Skyfire (skyfire-xyz on GitHub)
- **KYAPay repo:** https://github.com/skyfire-xyz/kyapay
- **KYAPay A2A:** https://github.com/skyfire-xyz/kyapay_a2a
- **Skyfire Skills:** https://github.com/skyfire-xyz/skills (Claude Code installable skills)
- **Skyfire Solutions Demo:** https://github.com/skyfire-xyz/skyfire-solutions-demo
- **Payment mechanism:** JWT bearer tokens (no wallets or gas)

## Sources

- KYAPay: https://github.com/skyfire-xyz/kyapay
- KYAPay A2A extension: https://github.com/skyfire-xyz/kyapay_a2a

---

**Built on SIP** — Payment Intelligence / research/mandates/kyapay.md · v1.0 · SIP v1.1.0 (2026-06-22)
