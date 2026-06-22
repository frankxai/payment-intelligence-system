---
name: pay-continuity-audit
description: Audit payment operation continuity and redundancy posture — PSP redundancy, deplatform readiness, data backup
allowed-tools: [Read, Write]
argument-hint: "<operator-name> [PSPs-in-use]"
vertical: payment-intelligence
sub-system: ops
tier: 2
---

# /pay-continuity-audit

Load `SOUL.md`, `SKILL.md`, `ops/agent.md`, `ops/skill.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse operator** — name, PSPs in use, rails in use, data storage approach
2. **Assess PSP redundancy** — is there a tested fallback? Different acquiring banks?
3. **Assess deplatform readiness:**
   - Is transaction history exported monthly (not just accessible)?
   - Are mandate records stored independently of PSP?
   - Is MCC/risk profile documented for new PSP onboarding?
   - Is PSP ToS termination clause reviewed?
4. **Assess data backup:**
   - Transaction logs: off-site? <24h RPO? 7-year retention?
   - Mandate records: independent storage? Ed25519 key history retained?
   - Audit trail: append-only JSONL? Off-site copy?
5. **Score each area** — ready / needs-work / blocked
6. **Action plan** — priority-ordered remediation

## Output

```markdown
# CONTINUITY-AUDIT: <operator-name>

> Non-advisory clause: [paste full clause]

## PSP redundancy
| Check | Status | Finding |
|-------|--------|--------|
| Fallback PSP configured | ready/needs-work/blocked | ... |
| Fallback PSP tested (last 30 days) | ready/needs-work/blocked | ... |
| Different acquiring banks | ready/needs-work/blocked | ... |

## Deplatform readiness
| Check | Status | Finding |
|-------|--------|--------|
| Monthly transaction export | ready/needs-work/blocked | ... |
| Independent mandate storage | ready/needs-work/blocked | ... |
| MCC/risk profile documented | ready/needs-work/blocked | ... |
| PSP ToS termination clause reviewed | ready/needs-work/blocked | ... |

## Data backup
| Check | Status | Finding |
|-------|--------|--------|
| Transaction logs off-site | ready/needs-work/blocked | ... |
| RPO <24h | ready/needs-work/blocked | ... |
| 7-year retention enforced | ready/needs-work/blocked | ... |
| Mandate records independent | ready/needs-work/blocked | ... |
| Ed25519 key history retained | ready/needs-work/blocked | ... |

## Overall verdict
production-ready | needs-work | critical-gaps

## Action plan (priority order)

### Critical (address before next payment run)
- [ ] ...

### Important (address this week)
- [ ] ...

### Maintenance (schedule quarterly)
- [ ] ...

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] All 3 areas assessed (PSP redundancy / deplatform / data backup)
- [ ] Each check is pass/needs-work/blocked with a finding
- [ ] Overall verdict stated
- [ ] Action plan is priority-ordered

## Rules

- Single-PSP architecture is always a "critical gap" — never pass it
- Untested fallback is "needs-work" not "ready" — testing is part of readiness

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
