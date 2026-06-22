---
name: pay-incident
description: Generate a response runbook for a specific payment incident type
allowed-tools: [Read, Write]
argument-hint: "<incident-type: psp-outage|settlement-delay|fraud-spike|key-compromise|deplatform|mandate-cascade>"
vertical: payment-intelligence
sub-system: ops
tier: 2
---

# /pay-incident

Load `SOUL.md`, `SKILL.md`, `ops/agent.md`, `ops/skill.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Identify incident type** — map argument to one of: psp-outage / settlement-delay / fraud-spike / key-compromise / deplatform / mandate-cascade
2. **Declaration criteria** — specific, numeric criteria that confirm this incident is active
3. **Immediate actions (0-15 min)** — what to do right now before any investigation
4. **Investigation steps (15-60 min)** — how to understand the root cause
5. **Containment (concurrent)** — how to limit blast radius while investigating
6. **Recovery steps** — ordered sequence to restore normal operations
7. **Verification** — how to confirm recovery is complete
8. **Post-incident deliverables** — what must be documented within 24h

## Output

```markdown
# INCIDENT-RESPONSE: <incident-type>

> Non-advisory clause: [paste full clause]

## Declaration criteria
<Specific, numeric criteria>

## Immediate actions (0-15 min)
1. [who] <action> — <why>
2. ...

## Investigation (15-60 min)
1. <where to look>
2. <what to check>

## Containment
- <limit blast radius steps>

## Recovery sequence
1. ...
2. ...

## Verification
- Test: <specific check>
- Pass criteria: <numeric threshold held for X min>

## Post-incident deliverables (within 24h)
- [ ] Root cause documented
- [ ] Timeline reconstructed
- [ ] Contributing factors identified
- [ ] Prevention steps proposed
- [ ] Runbook updated
- [ ] Shared with ops team

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] Declaration criteria are numeric
- [ ] Immediate actions are time-bound (0-15 min)
- [ ] Recovery sequence is ordered
- [ ] Verification has a numeric pass criterion
- [ ] Post-incident deliverables checklist present

## Rules

- Deplatform incident: always includes legal review as an immediate step
- Key-compromise incident: mandate revocation is step 1, not step 3
- Never present "monitor the situation" as an action — monitoring is background; every step must have a concrete action

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
