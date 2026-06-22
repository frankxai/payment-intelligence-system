# Rail Selection Matrix

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

The decision framework for choosing which payment rail moves the value. Use before `/pay-rails-select` to understand the axes; reference during the command to apply them to a specific context.

---

## Decision axes

Every rail selection requires four inputs:

| Axis | What to specify | Example values |
|---|---|---|
| **Transaction size** | Expected per-transaction amount | micro (<$0.01), small ($0.01–$10), medium ($10–$1,000), large (>$1,000) |
| **Counterparty type** | Who is paying whom | M2M API call, agent-to-shop checkout, subscription/mandate, B2B enterprise |
| **Settlement model** | When and how finality occurs | Instant on-chain, streaming (per-use), batch T+1, batch T+2, end-of-session |
| **Trust model** | How authorization is established | Trustless (on-chain verification), PSP-mediated, network-mediated, mandate/bilateral |

A fifth axis applies when regulatory requirements constrain rail choices:

| Axis | What to specify | Example values |
|---|---|---|
| **Jurisdiction** | Where operator and counterparty are located | EU-only, US-only, global/cross-border |

---

## Rail matrix

### x402 (HTTP-native, Coinbase-facilitated)

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Micro to small ($0.001–$50) | Large (>$1,000 — settlement overhead) |
| Counterparty | M2M API call, agent-to-API-service | Retail consumer checkout |
| Settlement | Instant on-chain (via facilitator) | Batch/T+2 requirements |
| Trust | Trustless (on-chain verification) | Mandate-required (use AP2 instead) |
| Jurisdiction | Global | Jurisdictions blocking stablecoin settlement |

**Mechanism:** HTTP 402 response header contains a signed payment payload. Payer (agent) submits to facilitator; facilitator verifies and pre-authorizes; settlement occurs on-chain (Base or other L2). As of 2026-06: ~165M agent transactions processed; x402 Foundation includes Visa, Mastercard, Stripe, Google, Cloudflare, Coinbase.

**Choose x402 when:** You're monetizing an API endpoint for AI agent callers, amount is sub-$50 per call, you want trustless settlement without a mandate architecture, and you can accept on-chain finality.

---

### L402 (Lightning Network, macaroon credentials)

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Micro ($0.0001–$5) | Medium+ (Lightning liquidity constraints) |
| Counterparty | M2M API, Lightning node operators | Retail checkout without Lightning wallet |
| Settlement | Near-instant (Lightning channel) | On-chain settlement required |
| Trust | Trustless + macaroon credential bearer | Mandate-required contexts |
| Jurisdiction | Global (BTC-friendly) | BTC-restricted jurisdictions |

**Mechanism:** HTTP 402 response with a Lightning invoice + macaroon bearer credential. Agent pays the invoice; macaroon credential gates API access. Originated by Lightning Labs as the first `402 Payment Required` revival.

**Choose L402 when:** You need sub-cent micropayments, counterparty already runs Lightning infrastructure, and you want credential-gated API access with payment proof.

---

### H402 (Independent HTTP 402 M2M)

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Small to medium | Micro (overhead per transaction) |
| Counterparty | Machine-to-machine, compute APIs | Consumer retail |
| Settlement | Configurable | Instant on-chain required |
| Trust | PSP-mediated | Trustless required |
| Jurisdiction | Global | Highly regulated (limited PSP coverage) |

**Mechanism:** Independent implementation of HTTP 402 for M2M payments by bit-gpt. Not part of the x402 Foundation; uses its own payment flow with configurable backends.

**Choose H402 when:** You need HTTP 402 semantics without x402 Foundation dependency, and your backend can integrate any payment processor.

---

### Stripe MPP (Machine Payments Protocol)

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Small to large (any Stripe-supported amount) | Sub-cent micropayments |
| Counterparty | Agent-to-Stripe-merchant, API-to-API with Stripe | Non-Stripe merchants |
| Settlement | Per-use metered within session | Instant on-chain |
| Trust | Stripe-mediated session envelope | Trustless/on-chain |
| Jurisdiction | Global (Stripe-supported countries) | Countries where Stripe doesn't operate |

**Mechanism (as of Mar 2026):** Pre-authorized session envelope issued to agent at session start; each tool call or API use draws metered charges from the envelope; settlement occurs at session end or on threshold. Pairs with `@stripe/agent-toolkit` and Stripe AI MCP server.

**Choose Stripe MPP when:** You're using Stripe as your PSP, you want metered per-use billing for an AI agent session, and you need a session-scoped authorization rather than a per-transaction mandate.

---

### Mastercard Agent Pay (Card network, SD-JWT mandates)

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Small to large (standard card limits) | Sub-cent micropayments |
| Counterparty | Agent-to-merchant (retail, e-commerce) | M2M API monetization |
| Settlement | T+1 or T+2 (card network standard) | Instant settlement required |
| Trust | Network-mediated + SD-JWT credential | Trustless/on-chain |
| Jurisdiction | Global (Mastercard acceptance) | Non-Mastercard markets |

**Mechanism (Apr 2025):** Agent presents an SD-JWT verifiable intent credential (intent mandate or cart mandate) signed by the cardholder's issuer. Mastercard network validates the mandate before authorization. Two mandate types: `intent` (general spend authorization) and `cart` (specific item authorization).

**Choose Agent Pay when:** Your agent is making retail or e-commerce purchases on behalf of a human cardholder, the merchant is a standard card-accepting business, and you need the consumer protection guarantees of the Mastercard network.

---

### Mastercard Agent Pay for Machines (M2M mandate, Jun 2026)

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Small to large | Sub-cent micropayments |
| Counterparty | Machine-to-machine (no human cardholder in loop) | Consumer retail requiring chargeback protection |
| Settlement | T+1 or T+2 | Instant on-chain |
| Trust | Network-mediated + SD-JWT + machine identity | Consumer-trust contexts |
| Jurisdiction | Global (Mastercard) | Non-Mastercard markets |

**Mechanism (Jun 2026):** Extends Agent Pay mandate architecture to M2M payments where both buyer and seller are agents or automated systems. SD-JWT machine identity replaces human cardholder credential. Purpose-built for autonomous agent commerce without a human-in-the-loop checkout step.

**Choose AP for Machines when:** Both buyer and seller are agents or automated systems, you need Mastercard network settlement and consumer-grade fraud protection, but there is no human cardholder in the purchase flow.

---

### Visa Intelligent Commerce + Trusted Agent Protocol

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Small to large (Visa card limits) | Sub-cent micropayments |
| Counterparty | Agent-to-merchant (Visa-accepting) | M2M API calls |
| Settlement | T+1 or T+2 | Instant settlement |
| Trust | RFC 9421 HTTP Message Signatures + Visa TAP | Trustless/on-chain |
| Jurisdiction | Global (Visa acceptance) | Non-Visa markets |

**Mechanism:** Visa Trusted Agent Protocol uses RFC 9421 (HTTP Message Signatures) to bind agent identity and purchase intent to each transaction. Merchant verifies the HTTP message signature against the agent's public key before authorization. Forter TACP sits on top for additional merchant-side fraud prevention.

**Choose Visa IC when:** Your agent is shopping at Visa-accepting merchants, you need W3C/IETF-standard identity verification (RFC 9421) at the network level, and the counterparty supports Visa TAP verification.

---

### Google AP2 (Signed mandate framework)

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Any | Not a settlement rail — mandate layer only |
| Counterparty | Any where AP2 is the mandate framework | Merchants not in the AP2 network |
| Settlement | Depends on underlying settlement rail | N/A (AP2 is authorization, not settlement) |
| Trust | Ed25519-signed mandate, 60+ partners | Single-party authorization context |
| Jurisdiction | Global | N/A |

**Mechanism:** AP2 is a mandate framework, not a payment rail. Signed Ed25519 mandates authorize agent payments; the underlying settlement can use cards, ACH, stablecoin, or other rails. 60+ partners as of 2026-06.

**Choose AP2 when:** You need a standardized mandate framework that works across multiple settlement rails, you're integrating with AP2 partner merchants, and you want cryptographic authorization with Byzantine consensus for high-value transactions.

---

### ACP (Agentic Commerce Protocol, OpenAI + Stripe)

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Any (Stripe-supported) | M2M API calls without catalog/cart |
| Counterparty | Agent-to-shop (catalog/cart/checkout) | API monetization without product catalog |
| Settlement | Stripe settlement (T+2) | Non-Stripe settlement |
| Trust | ACP mandate + Stripe Delegate Payment | Trustless/on-chain |
| Jurisdiction | Global (Stripe-supported) | Non-Stripe markets |

**Mechanism:** Agent discovers catalog via ACP GET endpoints, builds a cart, and authorizes checkout via the ACP Delegate Payment spec (agent carries a delegated Stripe payment method). Used for ChatGPT Instant Checkout.

**Choose ACP when:** You're building or integrating with an ACP-compatible merchant storefront, the agent needs to discover, negotiate, and check out from a product catalog, and Stripe is the PSP.

---

### UCP (Universal Commerce Protocol, Google + Shopify)

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Any | API micropayments |
| Counterparty | Agent-to-merchant (UCP-enabled catalog) | Non-UCP merchants |
| Settlement | Merchant's PSP (flexible) | Fixed-PSP requirements |
| Trust | UCP session + merchant credentials | Trustless/on-chain |
| Jurisdiction | Global | Markets without UCP merchant support |

**Mechanism:** Open protocol for agent catalog discovery, cart negotiation, and purchase. Unlike ACP (Stripe-bound), UCP is PSP-agnostic. Shopify UCP CLI provides installable shopping skill.

**Choose UCP when:** You need PSP flexibility (not locked to Stripe), your target merchants use Shopify or other UCP-enabled platforms, and you need the full catalog-to-checkout flow.

---

### Stablecoin direct (on-chain, USDC/USDT)

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Small to large | Sub-cent (gas costs) |
| Counterparty | Crypto-native merchants, DeFi protocols, other agents | Traditional fiat merchants |
| Settlement | Instant on-chain (seconds to minutes depending on chain) | Batch/T+2 |
| Trust | Trustless (on-chain verification) | PSP-mediated consumer protection |
| Jurisdiction | Global (subject to stablecoin regulation) | EU (MiCA compliance required), OFAC-restricted |

**Use when:** Both parties are crypto-native, instant settlement is required, and there is no need for consumer chargeback protection. Coinbase AgentKit and GOAT SDK handle the wallet operations.

---

### SEPA / ACH (Traditional bank rails)

| Axis | Best fit | Poor fit |
|---|---|---|
| Transaction size | Medium to large (low per-transaction cost at scale) | Micro/small (fees per transaction) |
| Counterparty | B2B with bank accounts, subscription billing | M2M API monetization |
| Settlement | T+1 (SEPA Instant) to T+3 (standard) | Instant settlement |
| Trust | Bank-mediated, KYC/AML required | Anonymous or pseudonymous transactions |
| Jurisdiction | EU (SEPA), US (ACH) | Global without correspondent bank |

**Use when:** Moving larger amounts between known business counterparties, settlement speed of 1-3 days is acceptable, and you have fully KYC'd accounts on both sides.

---

## Decision flow

```
1. Counterparty is an API endpoint needing per-call payment?
   → x402 (trustless) or L402 (Lightning) or H402 (PSP-mediated)

2. Counterparty is a retail merchant with a product catalog?
   → ACP (Stripe) or UCP (any PSP) or Agent Pay (Mastercard) or Visa IC

3. Both sides are agents/machines with no human in the loop?
   → Agent Pay for Machines (Mastercard) or x402 or stablecoin direct

4. Need card-network consumer protection + chargeback rights?
   → Agent Pay (Mastercard) or Visa IC

5. Using Stripe as primary PSP?
   → Stripe MPP (agent sessions) or ACP (checkout)

6. Need instant crypto settlement?
   → x402 (on-chain via facilitator) or stablecoin direct

7. Need a mandate framework that works across multiple rails?
   → AP2 (Ed25519 signed mandates, 60+ partners as of 2026-06)

8. B2B with bank accounts, amount > $1,000?
   → SEPA (EU) or ACH (US)
```

---

**Built on SIP** — Payment Intelligence / frameworks/rail-selection-matrix.md · v1.0 · SIP v1.1.0 (2026-06-22)
