---
name: pay-dispute-flow
description: Map the dispute and chargeback resolution flow for a payment operation
allowed-tools: [Read, Write]
argument-hint: "<context: agentic-retail|API|subscription> [card-brand]"
vertical: payment-intelligence
sub-system: ops
tier: 2
---

# /pay-dispute-flow

Load `SOUL.md`, `SKILL.md`, `ops/agent.md`, `ops/skill.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse context** — transaction type (agentic retail / API / subscription), card brand (Visa / Mastercard / Amex), PSP
2. **Map dispute timeline** — day 0 through resolution, with deadlines
3. **Evidence requirements** — what evidence is needed by category (unauthorized / not received / defective / subscription cancellation)
4. **Agent-specific factors** — how agent-initiated purchases affect dispute dynamics (authorization record, mandate, KYA trail)
5. **Winnable vs. not winnable** — evidence quality scoring framework
6. **Reserve impact** — how this dispute affects the chargeback reserve
7. **Prevention** — upstream changes to reduce this class of dispute

## Output

```markdown
# DISPUTE-FLOW: <context>

> Non-advisory clause: [paste full clause]

## Dispute context
- Type: agentic retail | API | subscription
- Card brand: ...
- PSP: ...

## Dispute timeline
| Day | Event | Deadline |
|-----|-------|----------|
| 0 | Chargeback received | — |
| 0-1 | Log and triage | PSP notification window |
| 1-3 | Gather evidence | Evidence submission deadline: Day X |
| X | Submit rebuttal (if winnable) | Hard deadline |
| X+30 | Card brand decision | — |
| X+60 | Pre-arbitration (if applicable) | — |

## Evidence requirements by reason code
| Reason | Required evidence | Agent-specific evidence |
|--------|------------------|-----------------------|
| Unauthorized | Authorization record, mandate log | Ed25519 signed mandate, KYA trail |
| Not received | Delivery confirmation | API response log, x402 receipt |
| Subscription cancelled | Cancellation policy | Mandate revocation timestamp |
| Defective | Quality policy | Transaction context log |

## Evidence quality scoring
| Score | Meaning | Action |
|-------|---------|--------|
| 5 | Cryptographic proof (Ed25519 + x402 receipt) | Fight |
| 4 | Mandate + KYA log | Fight |
| 3 | Order log + delivery confirmation | Assess |
| 2 | Partial records | Likely accept |
| 1 | No records | Accept |

## Agent-specific advantage
Agent-initiated payments with Ed25519-signed mandates + x402 on-chain receipts provide cryptographic evidence that is extremely difficult for cardholders to dispute successfully. The mandate record shows: authorized agent, authorized amount, authorized merchant, timestamp. Combined with the on-chain transaction hash, this is near-definitive authorization evidence.

## Reserve impact
- This dispute: $X against chargeback reserve
- Reserve status after: $Y (target: ≥3× 30-day volume)
- Reserve top-up needed: yes | no

## Prevention
- <What upstream change would reduce this class of dispute>
- <Example: mandate with merchant restriction would have prevented unauthorized dispute>

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] Dispute timeline with specific deadlines (not just day numbers)
- [ ] Evidence requirements by reason code
- [ ] Agent-specific evidence column present
- [ ] Evidence quality scoring framework
- [ ] Reserve impact addressed
- [ ] Prevention section present

## Rules

- Never recommend auto-accepting disputes without evidence quality assessment
- Agent-specific evidence section is mandatory — it’s the key differentiator for agentic payment disputes

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
