# Research — Mastercard Agent Pay + Agent Pay for Machines

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

---

## What

**Mastercard Agent Pay** (Apr 2025) is Mastercard's agentic payments program that enables AI agents to make purchases on behalf of human cardholders using verifiable SD-JWT intent credentials. **Agent Pay for Machines** (Jun 2026) extends the architecture to machine-to-machine (M2M) payments where both buyer and seller are automated systems with no human in the checkout loop.

## Who

Developer: **Mastercard**. Part of Mastercard's Intelligent Commerce initiative. The program has engaged card issuers and payment processors to issue and verify SD-JWT agent credentials.

## Mechanism — Agent Pay (human cardholder)

1. Human cardholder grants their agent an **intent mandate** (general authorization for a category of purchases) or **cart mandate** (specific item list authorization) via their bank/issuer's app
2. Issuer issues a **SD-JWT verifiable credential** encoding: agent identity, spend cap, merchant restrictions, expiry, and mandate type
3. Agent presents the SD-JWT credential at checkout alongside standard payment data
4. Merchant/acquirer verifies the SD-JWT credential against the issuer's public key
5. Mastercard network processes the authorization with the credential attached
6. Settlement: standard Mastercard T+1/T+2 card settlement

**SD-JWT:** Selective Disclosure JWT. Allows the agent to present only the credential fields relevant to the transaction without revealing the full mandate (e.g., can present spend cap without revealing cardholder name).

## Mechanism — Agent Pay for Machines (M2M)

Launched Jun 2026. Extends the credential architecture to machine-initiated payments:

1. Machine (agent A) holds a **machine mandate** credential (no human cardholder; credential issued to the operator entity)
2. Counterparty (agent B or automated merchant) accepts machine mandate credential
3. Network validates machine identity + mandate scope via SD-JWT verification
4. Settlement: Mastercard standard rails

**Key difference from Agent Pay:** No human cardholder in the authorization chain. The "cardholder" is an operator entity; the agent acting on its behalf is machine-to-machine.

## When to choose

**Agent Pay (human cardholder):**
- Agent shopping on behalf of a human at standard merchants
- Need Mastercard consumer protection and chargeback rights
- Merchant is a card-accepting business (Mastercard supported)
- Cardholder wants verifiable proof that the agent was explicitly authorized

**Agent Pay for Machines:**
- Both buyer and seller are agents or automated systems
- Need Mastercard network settlement (fraud protection, dispute resolution)
- No human-in-the-loop checkout is acceptable
- Operator has a Mastercard account to hold the machine mandate

## Verified facts as of 2026-06

- **Agent Pay launch:** April 2025
- **Agent Pay for Machines launch:** June 2026
- **Credential format:** SD-JWT (Selective Disclosure JWT, IETF draft)
- **Mandate types:** intent, cart (Agent Pay); machine mandate (AP for Machines)
- **Settlement:** Mastercard standard card rails (T+1/T+2)
- **Program page:** https://www.mastercard.com/global/en/business/issuers/agent-pay.html

## Sources

- Mastercard Agent Pay: https://www.mastercard.com/global/en/business/issuers/agent-pay.html
- SD-JWT specification: IETF draft-ietf-oauth-selective-disclosure-jwt

---

**Built on SIP** — Payment Intelligence / research/rails/mastercard-agent-pay.md · v1.0 · SIP v1.1.0 (2026-06-22)
