---
name: pay-reconcile
description: Generate a reconciliation runbook for a payment operation — transaction matching, exceptions, ledger sync
allowed-tools: [Read, Write]
argument-hint: "<period: daily|weekly|monthly> [system-name]"
vertical: payment-intelligence
sub-system: treasury
tier: 2
---

# /pay-reconcile

Load `SOUL.md`, `SKILL.md`, `treasury/agent.md`, `treasury/skill.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Set period** — daily / weekly / monthly (daily is the minimum recommended cadence)
2. **Identify sources** — PSP webhook data, on-chain events, mandate authorization logs, internal order ledger
3. **Define matching logic** — how payment ID maps to order ID maps to mandate ID
4. **Exception taxonomy** — categorize exception types (amount mismatch / missing webhook / failed settlement / overpayment / underpayment)
5. **Exception workflow** — for each exception type, who does what in what order
6. **DPI feed** — what net P&L delta gets written to Wealth IS via `/pay-wealth-bridge`
7. **Retention** — how long records are kept

## Output

```markdown
# RECONCILIATION-RUNBOOK: <period>

> Non-advisory clause: [paste full clause]

## System: <system-name>
## Period: daily | weekly | monthly

## Data sources
| Source | Format | Pull method |
|--------|--------|------------|
| PSP | Webhook / CSV export | ... |
| On-chain | Event log | ... |
| Mandate system | Authorization log | ... |
| Internal ledger | Order DB | ... |

## Matching logic
```
payment_id → order_id → mandate_id → matched
```

## Exception taxonomy
| Type | Definition | Auto-flag? |
|------|-----------|----------|
| Amount mismatch | PSP amount ≠ order amount | Yes |
| Missing webhook | Order has no PSP confirmation | Yes |
| Failed settlement | PSP settlement failed | Yes |
| Overpayment | PSP amount > order amount | Yes |
| Duplicate payment | Same order_id paid twice | Yes |

## Exception workflow
1. Auto-flag lands in exceptions queue
2. Ops reviews: was this a PSP error, mandate error, or order error?
3. Resolve or escalate per exception type
4. Log resolution with root cause

## DPI feed
- Daily net P&L delta → `/pay-wealth-bridge` → `/wealth-dpi`
- Rail cost breakdown included
- Exception reserve impact included

## Retention
- Transaction logs: 7 years
- Exception logs: 7 years
- Reconciliation reports: 7 years

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] All 4 data sources listed
- [ ] Exception taxonomy has at least 5 types
- [ ] Exception workflow includes human review step
- [ ] DPI feed to Wealth IS defined
- [ ] 7-year retention stated

## Rules

- Never present reconciliation as fully automated — exception handling requires operator review
- Daily cadence is minimum — flag if operator requests weekly-only

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
