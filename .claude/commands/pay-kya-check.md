---
name: pay-kya-check
description: Check Know-Your-Agent requirements for an agentic payment system and identify implementation gaps
allowed-tools: [Read, Write]
argument-hint: "<system-name> [jurisdiction: EU|US|global]"
vertical: payment-intelligence
sub-system: compliance
tier: 2
---

# /pay-kya-check

Load `SOUL.md`, `SKILL.md`, `compliance/agent.md`, `compliance/skill.md`, `research/identity/kya-and-trust.md`, `research/mandates/kyapay.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse system** — system name, what agents are doing (buying / selling / M2M), jurisdiction
2. **Map KYA requirements** — what each jurisdiction requires for agent identity
3. **Assess current state** — what KYA mechanisms are currently implemented (from arguments or ask)
4. **Score against 4 KYA principles:**
   - Identity: is the agent uniquely identifiable?
   - Authorization: is the agent’s payment authority cryptographically verified?
   - Auditability: are all agent actions logged for inspection?
   - Revocability: can the agent’s authorization be revoked instantly?
5. **Implementation options** — for each gap, show the implementation path (KYAPay / Visa TAP / SD-JWT / AP2)

## Output

```markdown
# KYA-CHECK: <system-name>

> Non-advisory clause: [paste full clause]

## System profile
- Agent role: buying | selling | M2M | mixed
- Jurisdiction: ...

## KYA requirements by jurisdiction
| Jurisdiction | Requirement | Source |
|-------------|-------------|--------|
| EU (AI Act) | Agent identity assertion | Art. 52 EU AI Act |
| EU (PSD3) | Know-Your-Payer mandate | PSD3 Art. 41 |
| US (FinCEN) | Beneficial owner CDD | 31 CFR 1010.230 |
| Visa TAP | Public key registry | RFC 9421 |

## Current KYA posture
| Principle | Status | Evidence |
|-----------|--------|----------|
| Identity | pass/fail/unknown | ... |
| Authorization | pass/fail/unknown | ... |
| Auditability | pass/fail/unknown | ... |
| Revocability | pass/fail/unknown | ... |

## Gaps and implementation options
| Gap | Option A | Option B |
|-----|----------|----------|
| Identity | KYAPay (Skyfire JWT) | Visa TAP (Ed25519 key registry) |
| Authorization | AP2 mandate + Ed25519 | SD-JWT (Agent Pay) |
| Auditability | Append-only mandate log | On-chain audit trail (x402) |
| Revocability | Active Mandate revocation | KYAPay credential revocation |

## Recommended KYA stack
<Jurisdiction-appropriate recommendation>

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] KYA requirements cited with regulatory sources
- [ ] All 4 principles assessed
- [ ] Implementation options provided for each gap
- [ ] Recommended KYA stack stated

## Rules

- Never state KYA is optional in 2026 for EU deployments — it is law
- Always cite the specific regulatory article, not just the regulation name

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
