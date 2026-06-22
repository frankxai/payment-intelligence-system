# Research — Agentic Commerce Protocol (ACP)

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

---

## What

ACP (Agentic Commerce Protocol) is an open standard maintained by OpenAI and Stripe for connecting buyers and their AI agents to businesses. It defines the full agent-driven commerce flow: catalog discovery, cart management, checkout, and payment authorization via delegated payment methods. ACP is the basis for ChatGPT Instant Checkout.

## Who

Maintainers: **OpenAI** and **Stripe**. Open standard hosted at `agentic-commerce-protocol` GitHub organization. ACP Delegate Payment spec uses Stripe as the payment processor.

## Mechanism

### Discovery
Agent calls `GET /products` (or ACP catalog endpoint) to discover available items, pricing, and availability.

### Cart
Agent calls `POST /cart` with selected items. Server returns cart object with totals and available payment methods.

### Authorization
Agent calls `POST /checkout/authorize` with:
- `mandate_id` (Active Mandate or delegated Stripe payment method)
- `cart_id`
- `agent_identity` (KYA or session token)

Server validates mandate, verifies agent identity, and returns authorization.

### Payment
Stripe processes the payment via the **Delegate Payment** spec: the agent carries a Stripe PaymentMethod delegated from the human user (not the raw card number). The human authorized the delegation at session start; the agent uses it at checkout.

### Receipt
Server returns receipt with transaction ID, items, totals, and settlement reference.

## Key specs

- **Agentic Checkout:** Defines the catalog/cart/authorize/complete flow
- **Delegate Payment:** Defines how a human delegates a Stripe payment method to an agent without sharing raw credentials

## When to choose

- You're building a merchant storefront that should be accessible to AI agents
- Your agent needs to browse, cart, and checkout from product catalogs
- Stripe is your PSP (ACP Delegate Payment is Stripe-specific)
- You want compatibility with ChatGPT Instant Checkout and OpenAI agent ecosystem

**Not for:** Non-Stripe PSPs (use UCP), API monetization without product catalog (use x402/MPP), B2B without product catalog.

## Verified facts as of 2026-06

- **Maintainers:** OpenAI + Stripe
- **Repo:** https://github.com/agentic-commerce-protocol/agentic-commerce-protocol
- **Use in production:** ChatGPT Instant Checkout (OpenAI)
- **PSP:** Stripe (Delegate Payment spec)
- **ACP Demo:** https://github.com/locus-technologies/agentic-commerce-protocol-demo

## Sources

- ACP specification: https://github.com/agentic-commerce-protocol/agentic-commerce-protocol
- ACP demo: https://github.com/locus-technologies/agentic-commerce-protocol-demo

---

**Built on SIP** — Payment Intelligence / research/commerce/acp.md · v1.0 · SIP v1.1.0 (2026-06-22)
