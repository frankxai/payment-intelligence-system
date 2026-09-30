# QUICK-START — Payment Intelligence System

> Where you are, what's ready, and how to get started in 30-60 minutes.

---

## Where you are

| Sub-system | Status | First command |
|---|---|---|
| Rails | Ready | `/pay-rails-select` |
| Mandates & Authorization | Ready | `/pay-mandate-design` |
| Commerce & Checkout | Ready | `/pay-commerce-readiness` |
| Treasury & Wallets | Ready | `/pay-treasury-design` |
| Compliance & Tax | Ready | `/pay-compliance-map` |
| Ops & Continuity | Ready | `/pay-ops-runbook` |

---

## Today (30-60 min) — pick your entry

| Who you are | Start here | Then |
|---|---|---|
| **Shop owner adding agent checkout** | `/pay-commerce-readiness` | `/pay-rails-select` → `/pay-mandate-design` |
| **API builder monetizing endpoints** | `/pay-rails-select` (x402/L402 path) | `/pay-monetize-endpoint` → `/pay-mandate-design` |
| **Trader with agent buying for you** | `/pay-mandate-design` | `/pay-compliance-map` → `/pay-ops-runbook` |
| **Developer building payment agents** | `/pay-rails-compare` | `/pay-mandate-design` → `/pay-checkout-trace` |
| **Operator doing compliance prep** | `/pay-compliance-map` | `/pay-kya-check` → `/pay-tax-pack` |
| **Anyone going to production** | `/pay-ops-runbook` | `/pay-continuity-audit` → `/pay-dispute-flow` |

---

## Key concepts in 2 minutes

**Rails** = the protocol that moves value (x402, Stripe MPP, AP2, Visa IC). Choose based on transaction size, counterparty type, settlement model, and jurisdiction.

**Mandates** = how an agent is *allowed* to pay. Every agent payment requires a mandate with spend cap, time window, merchant rules, and revocation path. No mandate = no payment.

**ACP / UCP** = commerce protocols for agent-driven checkout. ACP (OpenAI + Stripe) for ChatGPT-style agents; UCP (Google + Shopify) for product discovery + cart flows.

**KYA** = Know-Your-Agent. The 2026 standard for verifying who an agent is and what it's authorized to spend. Required in regulated jurisdictions.

**x402** = HTTP-native payment protocol using the `402 Payment Required` status code. ~165M agent txns as of 2026-06. Best for sub-$10 M2M API monetization.

---

## Non-advisory reminder

This system is architecture, not advice. Every command output opens with the non-advisory clause. For real payment infrastructure, PSP ToS and jurisdiction-specific counsel govern all instruments.

---

**Built on SIP** — Payment Intelligence QUICK-START.md · v1.0 · SIP v1.1.0 (2026-06-22)
