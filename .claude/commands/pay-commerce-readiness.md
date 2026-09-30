---
name: pay-commerce-readiness
description: Assess a shop’s readiness for agentic commerce — catalog, checkout, authorization, and dispute path
allowed-tools: [Read, Write]
argument-hint: "<shop-name or URL> [PSP] [target-agent-protocol]"
vertical: payment-intelligence
sub-system: commerce
tier: 1
---

# /pay-commerce-readiness

Load `SOUL.md`, `SKILL.md`, `commerce/agent.md`, `commerce/skill.md`, `research/commerce/acp.md`, `research/commerce/ucp.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse shop profile** — shop name/URL, current PSP, target agent protocol (ACP / UCP / custom)
2. **Assess 5 dimensions:**
   - Protocol fit: which commerce protocol matches the shop’s PSP?
   - Agent-accessible catalog: can agents discover and parse the product catalog?
   - Authorization integration: is mandate/KYA checked at checkout?
   - Payment confirmation: how does the shop verify payment before fulfillment?
   - Refund/dispute path: what’s the chargeback process for agent purchases?
3. **Score each dimension** — ready / needs-work / blocked
4. **Generate action plan** — ordered by priority (blockers first)

## Output

```markdown
# COMMERCE-READINESS: <shop-name>

> Non-advisory clause: [paste full clause]

## Shop profile
- PSP: ...
- Target protocol: ACP | UCP | custom

## Readiness assessment

| Dimension | Status | Finding |
|-----------|--------|--------|
| Protocol fit | ready/needs-work/blocked | ... |
| Agent-accessible catalog | ready/needs-work/blocked | ... |
| Authorization integration | ready/needs-work/blocked | ... |
| Payment confirmation | ready/needs-work/blocked | ... |
| Refund/dispute path | ready/needs-work/blocked | ... |

## Action plan (priority order)

### P0: Blockers
- [ ] ...

### P1: Needs work
- [ ] ...

### P2: Nice to have
- [ ] ...

## Estimated readiness timeline
<rough estimate based on action plan>

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] All 5 dimensions assessed
- [ ] Blockers distinguished from P1/P2
- [ ] Action plan is ordered by priority
- [ ] Refund/dispute path addressed (never omit)

## Rules

- ACP assessment must note Stripe PSP dependency
- Never declare "ready" without verifying authorization integration

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
