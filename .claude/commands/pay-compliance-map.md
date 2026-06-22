---
name: pay-compliance-map
description: Map applicable regulations for a payment operation by jurisdiction and use case
allowed-tools: [Read, Write]
argument-hint: "<jurisdiction: EU|US|global> [use-case] [volume-tier]"
vertical: payment-intelligence
sub-system: compliance
tier: 1
---

# /pay-compliance-map

Load `SOUL.md`, `SKILL.md`, `compliance/agent.md`, `compliance/skill.md`, `research/compliance/eu-2026.md`, `research/compliance/us-2026.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse context** — jurisdiction (EU / US / both / global), use case (agentic retail / API monetization / M2M / stablecoin), volume tier (<$100K / $100K-$1M / >$1M)
2. **Map EU obligations** (if applicable) — PSD3 (SCA, Know-Your-Payer), MiCA (CASP if stablecoin), AI Act (high-risk classification if >10K single txn), VAT/OSS
3. **Map US obligations** (if applicable) — FinCEN/BSA (MSB threshold), state MTLs (49 states), CFPB (EFTA/Reg E if ACH), tax reporting (1099-K/$600)
4. **Map KYA obligations** — which KYA implementation is required for this jurisdiction + use case
5. **Identify counsel routing triggers** — which items require licensed counsel before operating
6. **Generate action checklist** — ordered: counsel-required items first, then self-implementable

## Output

```markdown
# COMPLIANCE-MAP: <jurisdiction>

> Non-advisory clause: [paste full clause]

## Context
- Jurisdiction: ...
- Use case: ...
- Volume tier: ...

## EU obligations (as of 2026-06)
| Regulation | Applies? | Requirement | Status |
|-----------|----------|-------------|--------|
| PSD3 — SCA | yes/no | Agent SCA for transactions >30€ | check |
| PSD3 — KYP | yes/no | Know-Your-Payer mandate documentation | check |
| MiCA — CASP | yes/no | License if >1M stablecoin volume | check |
| EU AI Act | yes/no | High-risk if single txn >€10K | check |
| EU VAT/OSS | yes/no | VAT collection + OSS remittance | check |

## US obligations (as of 2026-06)
| Regulation | Applies? | Requirement | Status |
|-----------|----------|-------------|--------|
| FinCEN MSB | yes/no | Register if transmitting $1K+/day | check |
| State MTLs | yes/no | 49-state licensure | counsel |
| CFPB/Reg E | yes/no | ACH error resolution | check |
| 1099-K | yes/no | $600 threshold reporting | check |

## KYA requirements
| Jurisdiction | Requirement | Implementation |
|-------------|-------------|----------------|

## Counsel routing triggers
- [ ] State MTL licensing (mandatory — do not operate without counsel)
- [ ] MiCA CASP assessment (if stablecoin volume approaches threshold)
- [ ] EU AI Act conformity assessment (if high-risk classification)
- [ ] <other triggers based on context>

## Action checklist

### Requires counsel first
- [ ] ...

### Self-implementable
- [ ] ...

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present and verbatim
- [ ] Both EU and US tables present (or clearly marked N/A)
- [ ] KYA requirements addressed
- [ ] Counsel routing triggers present (non-empty)
- [ ] Action checklist distinguishes counsel-required from self-implementable

## Rules

- Never state a regulation doesn’t apply without documenting the basis
- Never omit counsel routing triggers — they are the most important output of this command
- State the as-of date for each regulatory reference

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
