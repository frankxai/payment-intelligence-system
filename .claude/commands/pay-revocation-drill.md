---
name: pay-revocation-drill
description: Walk through a mandate revocation scenario — test the revocation path end-to-end
allowed-tools: [Read, Write]
argument-hint: "<agent-name or mandate-id> [scenario: user-request | fraud | key-compromise | expiry]"
vertical: payment-intelligence
sub-system: mandates
tier: 2
---

# /pay-revocation-drill

Load `SOUL.md`, `SKILL.md`, `mandates/agent.md`, `mandates/skill.md`, `research/mandates/active-mandates.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Select scenario** — user-request / fraud / key-compromise / expiry (default: user-request)
2. **Map trigger** — what event initiates revocation in this scenario
3. **Walk revocation steps** — step-by-step: who calls what, in what order, with what parameters
4. **Propagation check** — how long until all downstream systems see the revocation
5. **Post-revocation state** — what happens to in-flight transactions, pending authorizations, accumulated balance
6. **Verification check** — how the operator confirms the revocation was successful
7. **Remediation** — what additional steps are needed for fraud / key-compromise scenarios

## Output

```markdown
# REVOCATION-DRILL: <agent-name>

> Non-advisory clause: [paste full clause]

## Scenario: <scenario-name>

## Trigger event
<What initiates this revocation>

## Revocation steps
1. <who> calls `mcp__agentic-payments__revoke_mandate({ mandate_id: "...", reason: "..." })`
2. <confirmation response>
3. <downstream notification>
...

## Propagation
- Expected propagation time: <1s
- Systems notified: ...

## Post-revocation state
- In-flight transactions: <blocked / completed if already authorized>
- Pending authorizations: <rejected>
- Balance status: <frozen>

## Verification
```javascript
mcp__agentic-payments__list_mandates({
  agent_id: "...",
  status: "revoked"
})
// Expected: mandate_id appears with status: revoked
```

## Additional remediation (fraud / key-compromise)
- <additional steps specific to the scenario>

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] Scenario clearly stated
- [ ] Revocation steps are numbered and concrete
- [ ] Post-revocation state addresses in-flight transactions
- [ ] Verification check included (not just "it should work")
- [ ] Fraud/key-compromise scenarios include additional remediation

## Rules

- Never describe revocation as "instant" without also specifying the propagation verification method
- Key-compromise scenario must always include key rotation as a follow-up step

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
