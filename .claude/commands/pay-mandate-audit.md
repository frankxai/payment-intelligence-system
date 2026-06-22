---
name: pay-mandate-audit
description: Audit an existing mandate design against the 10-section checklist — gap identification and remediation
allowed-tools: [Read, Write]
argument-hint: "<mandate-spec or mandate-id>"
vertical: payment-intelligence
sub-system: mandates
tier: 2
---

# /pay-mandate-audit

Load `SOUL.md`, `SKILL.md`, `mandates/agent.md`, `mandates/skill.md`, `frameworks/mandate-design-checklist.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse mandate** — read the provided mandate spec or parameters
2. **Score against checklist** — evaluate each of the 10 sections: pass / warn / fail
3. **Identify critical gaps** — any fail in sections 2 (spend caps), 7 (revocation), or 5 (cryptographic signing) is a blocker
4. **Identify warnings** — gaps that increase risk but don’t block operation
5. **Generate remediations** — for each gap, concrete fix with the corrected parameter
6. **Verdict** — production-ready / needs-remediation / blocked

## Output

```markdown
# MANDATE-AUDIT: <mandate-id or context>

> Non-advisory clause: [paste full clause]

## Audit results

| Section | Status | Finding |
|---------|--------|--------|
| 1. Scope definition | PASS/WARN/FAIL | ... |
| 2. Spend caps | PASS/WARN/FAIL | ... |
| 3. Time windows | PASS/WARN/FAIL | ... |
| 4. Merchant restrictions | PASS/WARN/FAIL | ... |
| 5. Cryptographic signing | PASS/WARN/FAIL | ... |
| 6. Byzantine consensus | PASS/WARN/FAIL | ... |
| 7. Revocation path | PASS/WARN/FAIL | ... |
| 8. KYA/KYC | PASS/WARN/FAIL | ... |
| 9. Rail compatibility | PASS/WARN/FAIL | ... |
| 10. Compliance | PASS/WARN/FAIL | ... |

## Critical gaps (blockers)
- <Section N>: <what's missing> → <remediation>

## Warnings
- <Section N>: <risk> → <recommended fix>

## Verdict
production-ready | needs-remediation | blocked

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] All 10 sections evaluated
- [ ] Blockers clearly distinguished from warnings
- [ ] Each gap has a concrete remediation
- [ ] Verdict stated

## Rules

- Fail on missing spend cap: never pass a mandate without explicit amount_cents and period
- Fail on missing revocation path: never pass a mandate with no revocation endpoint
- Warn (not fail) on empty merchant restrictions, with note that open-merchant intent requires explicit confirmation

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
