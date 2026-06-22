---
name: pay-rails-watch
description: Payment rail landscape watch — protocol updates, new entrants, x402 Foundation activity, deprecations
allowed-tools: [Read, Write]
argument-hint: "[date-range or focus-area]"
vertical: payment-intelligence
sub-system: rails
tier: 3
---

# /pay-rails-watch

Load `SOUL.md`, `SKILL.md`, `rails/agent.md`, `rails/skill.md`, `rails/knowledge.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Set scope** — parse date range or focus area from arguments; default to last 90 days if not specified
2. **Review known landscape** — summarize current state of each rail category: HTTP-native, card-network, mandate/API, commerce protocols
3. **Flag developments** — for each known development, state: what changed, source, date, operator impact
4. **Identify gaps** — areas where the research KB may be stale (operator should verify with primary sources)
5. **Action items** — what the operator should review or update in their stack based on this watch

## Output

```markdown
# RAIL-WATCH: <date or scope>

> Non-advisory clause: [paste full clause]

## Landscape summary (as of YYYY-MM)

### HTTP-native
- x402: ...
- L402/H402: ...
- Stripe MPP: ...

### Card-network
- Mastercard Agent Pay / Agent Pay for Machines: ...
- Visa Intelligent Commerce: ...

### Mandate/API
- Google AP2: ...

### Commerce protocols
- ACP, UCP: ...

## Developments in scope
| Date | Protocol | Change | Operator impact |
|------|----------|--------|----------------|

## Knowledge gaps (verify with primary sources)
- ...

## Recommended actions
- [ ] ...

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] Every development entry dated
- [ ] Knowledge gaps section present (honesty about what may be stale)
- [ ] Recommended actions are concrete

## Rules

- No undated claims about protocol status
- If a development cannot be verified from research KB, flag as "unverified — check primary source" rather than omitting

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
