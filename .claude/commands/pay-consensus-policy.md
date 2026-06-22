---
name: pay-consensus-policy
description: Design a multi-agent Byzantine consensus policy for high-value payment authorization
allowed-tools: [Read, Write]
argument-hint: "<system-name> [threshold-amount] [agent-count]"
vertical: payment-intelligence
sub-system: mandates
tier: 2
---

# /pay-consensus-policy

Load `SOUL.md`, `SKILL.md`, `mandates/agent.md`, `mandates/skill.md`, `research/mandates/ap2.md`, `research/mandates/active-mandates.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse system** — extract system name, transaction volume profile, and available agents
2. **Define threshold tiers** — recommend threshold amounts for each consensus tier (no consensus / 2-of-3 / 3-of-5 / human-in-loop)
3. **Assign agent roles** — which agents in the quorum handle which concern (purchasing / finance / compliance / audit)
4. **Configure timeout and failure mode** — what happens if consensus is not reached in time
5. **Audit log spec** — what must be logged for each consensus event
6. **Test scenario** — walk through a sample high-value transaction through the consensus flow

## Output

```markdown
# CONSENSUS-POLICY: <system-name>

> Non-advisory clause: [paste full clause]

## Threshold tiers

| Amount | Consensus required |
|--------|-------------------|
| <$X | None (mandate spend cap sufficient) |
| $X–$Y | 2-of-3 (purchasing + finance) |
| $Y–$Z | 3-of-5 (purchasing + finance + compliance + audit + legal) |
| >$Z | Human-in-loop override required |

## Agent quorum configuration
```javascript
mcp__agentic-payments__request_consensus({
  payment_id: "pay_example",
  required_agents: ["purchasing", "finance", "compliance"],
  threshold: 2,
  timeout_seconds: 300
})
```

## Agent role assignments
| Agent | Concern |
|-------|---------|
| purchasing | Order validity, vendor relationship |
| finance | Budget compliance, period cap |
| compliance | Merchant restrictions, KYA |

## Failure mode
- Timeout behavior: ...
- Partial consensus (below threshold): ...
- Emergency bypass: ...

## Audit log requirements
- Event types to log: consensus_requested, signature_received, consensus_reached, consensus_failed
- Retention: 7 years
- Format: append-only JSONL

## Test scenario
<Walk a $Y transaction through the full consensus flow>

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] All 4 threshold tiers addressed
- [ ] Timeout and failure mode specified
- [ ] Emergency bypass path documented
- [ ] Audit log requirements present
- [ ] Test scenario included

## Rules

- Never define a consensus policy without a human-in-loop tier at the top
- Never present consensus bypass as an acceptable configuration
- Failure mode (timeout) must always result in a logged, non-approved state — never auto-approve on timeout

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
