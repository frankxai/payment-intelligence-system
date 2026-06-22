---
name: pay-float-plan
description: Design a float and liquidity plan for an agentic payment operation
allowed-tools: [Read, Write]
argument-hint: "<context> [peak-daily-volume] [period]"
vertical: payment-intelligence
sub-system: treasury
tier: 2
---

# /pay-float-plan

Load `SOUL.md`, `SKILL.md`, `treasury/agent.md`, `treasury/skill.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse volume profile** — peak daily volume, average daily volume, volatility (stable / seasonal / unpredictable)
2. **Calculate minimum float** — 3× peak daily volume across operating accounts
3. **Set top-up trigger** — 1.5× average daily volume threshold for auto-funding
4. **Reserve ratio** — 10% of 90-day rolling volume for chargeback reserve
5. **Float sources** — where float comes from (PSP settlement cycle, on-chain, bank line of credit)
6. **Liquidity risk** — identify the highest-risk float drain scenario
7. **Monitoring cadence** — how often to review float levels

## Output

```markdown
# FLOAT-PLAN: <context>

> Non-advisory clause: [paste full clause]

## Volume profile
- Peak daily: $...
- Average daily: $...
- Pattern: stable | seasonal | unpredictable

## Float targets
| Account | Formula | Target |
|---------|---------|--------|
| Operating | 3× peak daily | $... |
| Reserve | 10% × 90-day rolling | $... |
| Top-up trigger | 1.5× avg daily | $... |

## Float sources
- Primary: ...
- Secondary (backup): ...
- Emergency: ...

## Top-up automation
```javascript
// Pseudocode: check operating balance daily
if (operatingBalance < TOP_UP_TRIGGER) {
  await fundFromSource(primarySource, TOP_UP_TARGET - operatingBalance);
  await logEvent('float_top_up', { amount, source, timestamp });
}
```

## Liquidity risk
- Highest risk scenario: ...
- Mitigation: ...

## Monitoring cadence
- Daily: automated balance check + alert if below top-up trigger
- Weekly: review reserve vs. 90-day rolling volume
- Monthly: reconcile float plan against actual volume

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] Float targets calculated (not just ratios)
- [ ] Top-up trigger specified
- [ ] Liquidity risk scenario identified
- [ ] Monitoring cadence defined

## Rules

- Never recommend holding all float at a single PSP
- Always include an emergency float source

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
