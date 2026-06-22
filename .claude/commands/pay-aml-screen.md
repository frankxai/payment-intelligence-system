---
name: pay-aml-screen
description: Design an AML screening workflow for an agentic payment operation
allowed-tools: [Read, Write]
argument-hint: "<transaction-context> [volume-tier] [jurisdiction]"
vertical: payment-intelligence
sub-system: compliance
tier: 2
---

# /pay-aml-screen

Load `SOUL.md`, `SKILL.md`, `compliance/agent.md`, `compliance/skill.md`, `research/compliance/eu-2026.md`, `research/compliance/us-2026.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse context** — transaction type, volume tier, jurisdiction, counterparty profile
2. **Determine AML program requirement** — MSB threshold ($1K/day US) or PSD3 enhanced AML (>€1M)
3. **Design 4-element program** (if required):
   - Written policies and procedures
   - Designated compliance officer
   - Independent testing cadence
   - Training schedule
4. **Transaction monitoring thresholds** — SAR ($5K suspicious), CTR ($10K currency), EU large-transaction thresholds
5. **Screening workflow** — OFAC / EU consolidated list screening steps
6. **Agent-specific AML considerations** — who is the customer when an agent makes a payment?

## Output

```markdown
# AML-SCREEN: <transaction-context>

> Non-advisory clause: [paste full clause]

## Context
- Transaction type: ...
- Volume tier: ...
- Jurisdiction: ...

## AML program requirement
- US MSB threshold: transmitting $1K+/day → full BSA program required
- EU PSD3 enhanced AML: processing >€1M → enhanced CDD required
- Current status: required | not yet required | counsel to determine

## 4-element AML program (if required)
1. **Written policies:** Document AML procedures, risk appetite, escalation paths
2. **Compliance officer:** Designate named individual with AML responsibility
3. **Independent testing:** Annual third-party audit of AML program
4. **Training:** Annual AML training for all staff handling payments

## Transaction monitoring thresholds
| Event | Threshold | Action |
|-------|-----------|--------|
| SAR (suspicious activity) | ≥$5,000 | File SAR within 30 days |
| CTR (currency transaction) | ≥$10,000 cash | File CTR within 15 days |
| EU large transaction | >€10,000 cash | Enhanced CDD required |

## Screening workflow
1. At account creation: screen agent identity against OFAC SDN + EU consolidated list
2. At each high-value transaction (>$3,000): re-screen counterparty
3. Daily: automated watchlist monitoring for ongoing relationships
4. On hit: freeze transaction, notify compliance officer, assess within 24h

## Agent-specific AML considerations
- Who is the "customer"? The operator (human/entity behind the agent), not the agent itself
- CDD applies to the operator, not the agent runtime
- Agent transactions on behalf of operator: operator KYC must be completed before agent operates

## Counsel routing triggers
- [ ] MSB registration (required if program is needed)
- [ ] SAR filing procedures (legal review required)
- [ ] EU AML officer designation (local law may specify requirements)

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] AML program requirement determination stated
- [ ] All 4 program elements addressed if program is required
- [ ] Transaction monitoring thresholds stated with dollar amounts
- [ ] Agent-specific AML section present
- [ ] Counsel routing triggers present

## Rules

- Never design AML without routing to counsel for MSB registration
- Never conflate the agent identity with the customer identity for AML purposes
- State thresholds with specific dollar amounts, not "high-value"

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
