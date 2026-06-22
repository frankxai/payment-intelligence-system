---
name: pay-checkout-trace
description: Trace an agentic checkout flow step-by-step — from intent to settlement confirmation
allowed-tools: [Read, Write]
argument-hint: "<flow-name> [protocol: ACP|UCP|x402] [merchant]"
vertical: payment-intelligence
sub-system: commerce
tier: 2
---

# /pay-checkout-trace

Load `SOUL.md`, `SKILL.md`, `commerce/agent.md`, `commerce/skill.md`, `research/commerce/acp.md`, `research/commerce/ucp.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse flow** — protocol (ACP/UCP/x402), merchant type, agent runtime
2. **Map actors** — identify all parties in the flow (agent, operator, PSP, merchant, mandate system, KYA provider)
3. **Trace steps** — walk the full flow from intent to settlement confirmation, numbered, with actor labels
4. **Identify decision points** — where the flow can branch (mandate check / KYA gate / payment failure)
5. **Settlement confirmation** — how the merchant knows the payment is settled
6. **Failure paths** — what happens at each decision point if it fails

## Output

```markdown
# CHECKOUT-TRACE: <flow-name>

> Non-advisory clause: [paste full clause]

## Flow: <protocol> checkout — <merchant-type>

## Actors
- Agent: ...
- Operator (mandate holder): ...
- PSP/Rail: ...
- Merchant: ...
- KYA provider: ...

## Happy path
1. [Agent] <action>
2. [Merchant] <response>
3. [Agent] <mandate check>
4. [Mandate system] <authorization>
5. [PSP/Rail] <payment execution>
6. [Merchant] <settlement confirmation>
7. [Agent] <order confirmation to operator>

## Decision points
| Step | Decision | Pass | Fail |
|------|----------|------|------|

## Settlement confirmation
<How merchant verifies settlement>

## Failure paths
- KYA gate fails: ...
- Mandate insufficient: ...
- PSP/rail error: ...
- Merchant fulfillment timeout: ...

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] All actors identified
- [ ] Happy path is numbered with actor labels on every step
- [ ] Decision points table present
- [ ] Settlement confirmation method stated
- [ ] At least 3 failure paths addressed

## Rules

- Never present the happy path without failure paths
- Never omit the KYA gate step for EU deployments

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
