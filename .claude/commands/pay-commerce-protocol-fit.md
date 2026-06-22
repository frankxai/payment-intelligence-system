---
name: pay-commerce-protocol-fit
description: Determine which commerce protocol (ACP / UCP / custom) fits a shop’s stack
allowed-tools: [Read, Write]
argument-hint: "<shop-name> [PSP] [platform]"
vertical: payment-intelligence
sub-system: commerce
tier: 2
---

# /pay-commerce-protocol-fit

Load `SOUL.md`, `SKILL.md`, `commerce/agent.md`, `commerce/skill.md`, `research/commerce/acp.md`, `research/commerce/ucp.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse shop stack** — PSP, platform (Shopify / WooCommerce / custom), agent target (ChatGPT / Google / custom agent)
2. **Score ACP fit** — check: Stripe PSP? ChatGPT agent target? Delegate Payment needed?
3. **Score UCP fit** — check: Shopify store? PSP-agnostic needed? Google agent target?
4. **Score custom fit** — check: non-standard stack? proprietary checkout? API monetization not retail?
5. **State PSP dependency** — clearly note which options require Stripe vs are PSP-agnostic
6. **Implementation path** — for the recommended protocol, state the first 3 implementation steps

## Output

```markdown
# PROTOCOL-FIT: <shop-name>

> Non-advisory clause: [paste full clause]

## Shop stack
- PSP: ...
- Platform: ...
- Agent target: ...

## Protocol scores

| Protocol | Fit | Reason |
|----------|-----|--------|
| ACP | high/medium/low | ... |
| UCP | high/medium/low | ... |
| Custom (x402/MPP) | high/medium/low | ... |

## Recommendation: <protocol>

### Why
<2-3 specific reasons tied to the shop's stack>

### PSP dependency note
<ACP requires Stripe. UCP is PSP-agnostic. Custom x402 requires facilitator.>

### Implementation path
1. ...
2. ...
3. ...

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] All 3 protocols scored
- [ ] PSP dependency explicitly noted
- [ ] Implementation path has at least 3 concrete steps

## Rules

- Never recommend ACP without noting Stripe PSP dependency
- Never present UCP as "better" in general — it’s better for PSP-agnostic requirements specifically

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
