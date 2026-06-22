---
name: pay-rails-select
description: Select the right payment rail for a specific transaction context — mechanism-first, axis-bound
allowed-tools: [Read, Write]
argument-hint: "<use-case> [txn-size] [counterparty-type] [settlement-model] [jurisdiction]"
vertical: payment-intelligence
sub-system: rails
tier: 1
---

# /pay-rails-select

Load `SOUL.md`, `SKILL.md`, `rails/agent.md`, `rails/skill.md`, `frameworks/rail-selection-matrix.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse context** — extract from arguments or ask: use case, transaction size tier (micropayment <$1 / standard $1-$10K / high-value >$10K), counterparty type (M2M API / shop checkout / subscription / subscription agent), settlement model (instant / streaming / batch), trust model (cryptographic / card-network / relationship), jurisdiction (EU / US / global)
2. **Run matrix** — score candidate rails from `frameworks/rail-selection-matrix.md` against each axis
3. **Select primary** — highest-scoring rail for this specific context; explain the mechanism in 3-5 steps
4. **Flag eliminations** — for each eliminated rail, one sentence on why it doesn’t fit
5. **Identify downstream deps** — what else the operator needs (PSP account, facilitator, mandate system, wallet)
6. **Compliance flag** — if stablecoin rail selected, flag MiCA/MSB requirement; if EU context, flag PSD3 SCA

## Output

```markdown
# RAIL-SELECT: <use-case>

> Non-advisory clause: [paste full clause]

## Context
- Transaction size: <tier>
- Counterparty: <type>
- Settlement model: <model>
- Trust model: <model>
- Jurisdiction: <scope>

## Selected rail: <name>

### Mechanism
1. ...
2. ...
3. ...

### Fit rationale
| Axis | Score | Reasoning |
|------|-------|----------|

### Downstream dependencies
- ...

## Eliminated alternatives
- **<rail>:** <one sentence why it doesn't fit>

## Compliance flags
- <flag if any>

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present and verbatim
- [ ] Mechanism explained in numbered steps (not just "use x402")
- [ ] All 5 decision axes addressed
- [ ] Each eliminated alternative has a reason
- [ ] Stablecoin rails: MiCA/MSB flag present
- [ ] Downstream dependencies listed

## Rules

- Never recommend a rail without stating the mechanism
- Never use "best" without stating the axes that make it best for this context
- Adoption stats only with "as of YYYY-MM" date
- If context is insufficient to make a selection, ask for missing axes before proceeding

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
