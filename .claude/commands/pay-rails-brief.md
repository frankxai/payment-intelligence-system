---
name: pay-rails-brief
description: Deep-dive brief on a specific payment protocol — mechanism, SDK surface, limitations, when-to-choose
allowed-tools: [Read, Write]
argument-hint: "<protocol-name>"
vertical: payment-intelligence
sub-system: rails
tier: 2
---

# /pay-rails-brief

Load `SOUL.md`, `SKILL.md`, `rails/agent.md`, `rails/skill.md`, `rails/knowledge.md`, and the matching `research/rails/<protocol>.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Identify protocol** — map argument to one of: x402, L402, H402, stripe-mpp, mastercard-agent-pay, visa-ic, ap2, acp, ucp
2. **Load research doc** — read `research/rails/<protocol>.md` for verified facts and sources
3. **Compile mechanism** — step-by-step how the protocol works (3-8 steps)
4. **Map who's involved** — which parties, standards bodies, and PSPs govern it
5. **SDK surface** — what's available for implementation (packages, MCP servers, APIs)
6. **When to choose** — the 2-3 specific contexts where this rail is optimal
7. **When not to choose** — concrete failure modes and mismatches
8. **Date all claims** — every adoption figure, partner count, or version number gets "as of YYYY-MM"

## Output

```markdown
# RAIL-BRIEF: <protocol-name>

> Non-advisory clause: [paste full clause]

## What it is
<2-3 sentence synthesis>

## Who governs it
- Spec owner: ...
- Key participants (as of YYYY-MM): ...

## Mechanism
1. ...
2. ...

## SDK surface
- <package>: <purpose>

## When to choose
- <context 1>: why this rail fits
- <context 2>: ...

## When not to choose
- <anti-pattern 1>: why it breaks down here

## Verified facts (as of YYYY-MM)
- ...

## Sources
- ...

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] Every number carries "as of YYYY-MM" date
- [ ] Mechanism is numbered steps, not prose description
- [ ] "When not to choose" section present (minimum 1 entry)
- [ ] Sources section present

## Rules

- No undated adoption statistics
- No "emerging" or "revolutionary" language
- If protocol is in draft/pre-release, state status clearly

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
