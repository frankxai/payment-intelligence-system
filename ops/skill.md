---
name: ops-skill
vertical: payment-intelligence
sub-system: ops
version: 1.0
---

# Ops Skill

Auto-activates when payment operations, incident response, dispute management, or continuity planning questions are detected.

## Activation triggers

- Keywords: runbook, incident, chargeback, dispute, PSP outage, deplatform, backup, continuity, provider redundancy, settlement delay, payment ops, fraud spike, SLA
- Commands: `/pay-ops-runbook`, `/pay-incident`, `/pay-continuity-audit`, `/pay-dispute-flow`
- Context: setting up production payment operations, responding to a payment incident, planning for PSP deplatform

## Loading sequence

```
Load SOUL.md → SKILL.md → ops/agent.md → ops/skill.md → [command]
```

## Invariants

1. Provider redundancy is mandatory — single-PSP architecture refused
2. Deplatform plan required in every ops design — plan it as inevitable
3. Post-incident review is mandatory in every runbook
4. Data retention enforced — 7 years minimum for transaction logs
5. Non-advisory clause opens every artifact

## Knowledge sources

- `research/compliance/eu-2026.md` — data retention, PSD3 ops requirements
- `research/compliance/us-2026.md` — IRS record keeping requirements
- `ops/agent.md` — runbook structure, incident taxonomy, dispute workflow

## Output artifacts

| Command | Artifact |
|---------|----------|
| `/pay-ops-runbook` | OPS-RUNBOOK: \<system-name\> |
| `/pay-incident` | INCIDENT-RESPONSE: \<incident-type\> |
| `/pay-continuity-audit` | CONTINUITY-AUDIT: \<operator-name\> |
| `/pay-dispute-flow` | DISPUTE-FLOW: \<context\> |

---

*Built on SIP — Payment Intelligence ops/skill.md · v1.0 · vertical: payment-intelligence*
