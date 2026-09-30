---
name: pay-ops-runbook
description: Generate a complete payment ops runbook for a system — daily monitoring, thresholds, incident declaration, response, recovery
allowed-tools: [Read, Write]
argument-hint: "<system-name> [rails-in-use]"
vertical: payment-intelligence
sub-system: ops
tier: 1
---

# /pay-ops-runbook

Load `SOUL.md`, `SKILL.md`, `ops/agent.md`, `ops/skill.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse system** — system name, rails in use, PSP(s), approximate daily transaction volume
2. **Normal ops section** — daily monitoring checklist with specific metrics and thresholds
3. **Alert thresholds** — when each metric triggers an alert vs. an incident
4. **Incident declaration** — criteria for P0, P1, P2
5. **Per-incident runbooks** — step-by-step for: PSP outage, settlement delay, fraud spike, key compromise
6. **Recovery verification** — how to confirm resolution for each incident type
7. **Post-incident review** — what gets documented within 24h of resolution

## Output

```markdown
# OPS-RUNBOOK: <system-name>

> Non-advisory clause: [paste full clause]

## System
- Rails: ...
- PSP(s): ...
- Daily volume: ...

## Daily monitoring checklist
- [ ] Payment success rate: target >99%, alert at <97%, incident at <95%
- [ ] Settlement latency: target within SLA, alert at +50%, incident at +100%
- [ ] Chargeback rate: alert at >0.5%, incident (P0) at >1%
- [ ] Mandate health: check for revoked mandates in last 24h
- [ ] Exception queue: clear all exceptions from prior day
- [ ] Float level: confirm operating balance above top-up trigger

## Alert thresholds
| Metric | Alert | Incident |
|--------|-------|----------|
| Payment success rate | <97% | <95% |
| Settlement delay | >SLA +50% | >SLA +100% |
| Chargeback rate | >0.5%/24h | >1%/24h |
| Exception volume | >10/day | >50/day |

## Incident declaration
| Priority | Criteria |
|----------|----------|
| P0 | Payment success <95% OR chargeback >1% OR key compromise OR deplatform notice |
| P1 | Settlement delay >SLA+100% OR mandate cascade (>10 revocations/1h) |
| P2 | Exception volume >50/day OR float below trigger |

## Incident runbooks

### PSP Outage (P0)
1. Confirm: >3 consecutive payment failures on primary PSP
2. Activate fallback PSP/rail
3. Alert ops team: #payments-incidents
4. Log incident start time
5. Monitor fallback success rate
6. Root cause from PSP status page
7. Cutback to primary when PSP confirms resolution

### Settlement Delay (P1)
1. Confirm: settlement >SLA+100%
2. Pull PSP settlement report
3. Identify affected transactions
4. Contact PSP support with transaction IDs
5. Update float plan if delay >48h
6. Log incident

### Fraud Spike (P0)
1. Confirm: chargeback rate >1% in 24h
2. Freeze new mandate authorizations above $X
3. Pull fraud pattern analysis
4. Notify compliance officer
5. Review dispute queue
6. File SARs if applicable

### Key Compromise (P0)
1. Immediately revoke all mandates signed with compromised key
2. Rotate Ed25519 signing key
3. Re-sign all active mandates with new key
4. Audit transaction log for unauthorized payments
5. Notify compliance officer
6. File incident report

## Recovery verification
| Incident | Verification method |
|----------|-------------------|
| PSP Outage | Payment success rate back >99% for 30 min |
| Settlement Delay | All pending settlements cleared |
| Fraud Spike | Chargeback rate <0.5% for 24h |
| Key Compromise | All mandates re-signed, no unauthorized payments confirmed |

## Post-incident review (within 24h)
- Root cause documented
- Contributing factors identified
- Prevention steps proposed
- Runbook updated if needed
- Shared with ops team

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] Daily monitoring checklist has specific numeric thresholds
- [ ] All 4 incident types have runbooks
- [ ] Recovery verification is specific (not "monitor until resolved")
- [ ] Post-incident review template present

## Rules

- Never omit post-incident review — it is what prevents recurrence
- Thresholds must be numeric, not qualitative

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
