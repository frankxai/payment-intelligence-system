# Research — Universal Commerce Protocol (UCP)

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

---

## What

UCP (Universal Commerce Protocol) is an open protocol by Google, Shopify, and partners for AI agent catalog discovery, cart negotiation, and purchase. Unlike ACP (which is Stripe-bound), UCP is PSP-agnostic — any payment processor can be used for settlement. UCP is designed to be the interoperability layer across merchant platforms.

## Who

Maintainers: **Google**, **Shopify**, and partners. Hosted at `Universal-Commerce-Protocol` GitHub organization. Shopify ships a UCP CLI installable shopping skill and a UCP proxy.

## Mechanism

1. Agent queries UCP catalog endpoint: `GET /ucp/catalog?query=...`
2. Server returns structured product catalog with availability and pricing
3. Agent negotiates cart: `POST /ucp/cart` with items
4. Server returns cart with line items, totals, available payment methods, and UCP session ID
5. Agent confirms purchase: `POST /ucp/purchase` with UCP session ID and payment credentials
6. Merchant's PSP processes payment (PSP-agnostic; could be Stripe, Adyen, Braintree, etc.)
7. Server returns purchase receipt

**UCP SDKs:** JavaScript (`js-sdk`) and Python (`python-sdk`) official SDKs. Samples at `Universal-Commerce-Protocol/samples`.

**Shopify UCP CLI:** Installable Claude Code shopping skill. Run `ucp install shopify` to add UCP shopping skill to an agent.

## When to choose

- You need PSP flexibility (not locked to Stripe)
- Target merchants use Shopify or other UCP-enabled platforms
- You want the full catalog-to-checkout agent flow with maximum merchant compatibility
- You're building a shopping agent that needs to work across many merchant platforms

**Not for:** Stripe-specific workflows (use ACP for tighter Stripe integration), API monetization without product catalogs (use x402/MPP).

## Verified facts as of 2026-06

- **Maintainers:** Google + Shopify + partners
- **Repo:** https://github.com/Universal-Commerce-Protocol/ucp
- **JS SDK:** https://github.com/Universal-Commerce-Protocol/js-sdk
- **Python SDK:** https://github.com/Universal-Commerce-Protocol/python-sdk
- **Shopify UCP CLI:** https://github.com/Shopify/ucp-cli (installable shopping skill)
- **UCP Proxy:** https://github.com/Shopify/ucp-proxy (Shopify proxy for UCP traffic)
- **PSP:** Agnostic

## Sources

- UCP specification: https://github.com/Universal-Commerce-Protocol/ucp
- Shopify UCP tools: https://github.com/Shopify/ucp-cli

---

**Built on SIP** — Payment Intelligence / research/commerce/ucp.md · v1.0 · SIP v1.1.0 (2026-06-22)
