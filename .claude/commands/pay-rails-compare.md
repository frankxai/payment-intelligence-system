---
name: pay-rails-compare
description: Head-to-head comparison of two or more payment rails for a stated use case
allowed-tools: [Read, Write]
argument-hint: "<rail-A> vs <rail-B> [for <use-case>]"
vertical: payment-intelligence
sub-system: rails
tier: 2
---

# /pay-rails-compare

Load `SOUL.md`, `SKILL.md`, `rails/agent.md`, `rails/skill.md`, `rails/knowledge.md`, `frameworks/rail-selection-matrix.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse rails** — identify 2-4 rails to compare from arguments
2. **Parse context** — extract use case if provided; if not, note comparison is context-free (and therefore limited)
3. **Build comparison matrix** — score each rail across: transaction size fit, counterparty fit, settlement speed, trust model, jurisdiction coverage, PSP dependency, crypto dependency, SDK maturity
4. **Mechanism delta** — for each pair, one key mechanism difference that determines the winner in specific contexts
5. **Verdict** — if use case was provided, state which rail wins and why; if no use case, state it depends on axis X
6. **Stack compatibility** — note if the rails are composable (e.g., mandate layer + settlement rail)

## Output

```markdown
# RAIL-COMPARE: <A> vs <B> [for <use-case>]

> Non-advisory clause: [paste full clause]

## Comparison matrix

| Dimension | <Rail A> | <Rail B> |
|-----------|----------|----------|
| Txn size fit | | |
| Counterparty fit | | |
| Authorization speed | | |
| Settlement speed | | |
| Trust model | | |
| PSP dependency | | |
| Crypto dependency | | |
| SDK maturity (as of YYYY-MM) | | |

## Key mechanism delta
<Rail A> differs from <Rail B> in one decisive way: ...

## Verdict
<If use case provided>: Use <rail> because ...
<If no use case>: Selection depends on <axis>. Choose <A> if ..., choose <B> if ...

## Stack compatibility
<Note if these rails compose with each other or with a mandate layer>

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] All 8 comparison dimensions addressed
- [ ] Mechanism delta stated (not just summary differences)
- [ ] Verdict present (context-bound or axis-conditional)
- [ ] SDK maturity dated "as of YYYY-MM"

## Rules

- No "winner" declared without context or without stating the determining axis
- Never present rails as interchangeable if they serve different settlement layers

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
