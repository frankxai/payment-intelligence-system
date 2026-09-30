---
name: commerce-skill
vertical: payment-intelligence
sub-system: commerce
version: 1.0
---

# Commerce Skill

Auto-activates when commerce readiness, checkout, API monetization, or agent-facing shop questions are detected.

## Activation triggers

- Keywords: ACP, UCP, checkout, commerce, monetize, shop, storefront, pay-per-call, MCP monetization, agent checkout, Delegate Payment, Agentic Checkout, API gating
- Commands: `/pay-commerce-readiness`, `/pay-commerce-protocol-fit`, `/pay-monetize-endpoint`, `/pay-checkout-trace`
- Context: making a shop agent-accessible, monetizing an API or MCP server, tracing an agent checkout flow

## Loading sequence

```
Load SOUL.md → SKILL.md → commerce/agent.md → commerce/skill.md → [command]
```

## Invariants

1. Protocol fit before implementation — identify correct commerce protocol first
2. PSP dependency declared — ACP is Stripe-bound, UCP is PSP-agnostic
3. Authorization path required — every checkout design includes mandate/KYA
4. Refund/dispute path required — never omit from commerce design
5. Non-advisory clause opens every artifact

## Knowledge sources

- `research/commerce/acp.md` — Agentic Commerce Protocol
- `research/commerce/ucp.md` — Universal Commerce Protocol
- `research/toolkits/landscape.md` — Stripe AI, PayPal, Coinbase AgentKit, GOAT
- `research/identity/kya-and-trust.md` — KYA at checkout

## Output artifacts

| Command | Artifact |
|---------|----------|
| `/pay-commerce-readiness` | COMMERCE-READINESS: \<shop-name\> |
| `/pay-commerce-protocol-fit` | PROTOCOL-FIT: \<shop-name\> |
| `/pay-monetize-endpoint` | ENDPOINT-MONETIZATION: \<endpoint\> |
| `/pay-checkout-trace` | CHECKOUT-TRACE: \<flow-name\> |

---

*Built on SIP — Payment Intelligence commerce/skill.md · v1.0 · vertical: payment-intelligence*
