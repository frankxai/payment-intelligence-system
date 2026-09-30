---
name: compliance-skill
vertical: payment-intelligence
sub-system: compliance
version: 1.0
---

# Compliance Skill

Auto-activates when regulatory mapping, KYC/AML, KYA, tax, or compliance architecture questions are detected.

## Activation triggers

- Keywords: PSD3, MiCA, AI Act, FinCEN, MTL, KYC, AML, KYA, VAT, sales tax, 1099, compliance, regulation, MSB, CASP, CFPB, PCI, bookkeeping
- Commands: `/pay-compliance-map`, `/pay-kya-check`, `/pay-tax-pack`, `/pay-aml-screen`
- Context: operating in EU or US, handling stablecoin payments, designing AML program, preparing tax records

## Loading sequence

```
Load SOUL.md → SKILL.md → compliance/agent.md → compliance/skill.md → [command]
```

## Invariants

1. Non-advisory clause opens every artifact — compliance outputs are architecture, not legal advice
2. Counsel routing is mandatory for licensing questions — never say "you don't need a license"
3. KYA is non-optional in 2026 — EU AI Act agent identity requirements are law
4. Stablecoin payments → MiCA CASP analysis flag always present
5. Every compliance map identifies jurisdiction-specific counsel routing triggers

## Knowledge sources

- `research/compliance/eu-2026.md` — PSD3, MiCA, AI Act, EU VAT
- `research/compliance/us-2026.md` — FinCEN, MTLs, CFPB, US tax
- `research/identity/kya-and-trust.md` — KYA implementation patterns

## Output artifacts

| Command | Artifact |
|---------|----------|
| `/pay-compliance-map` | COMPLIANCE-MAP: \<jurisdiction\> |
| `/pay-kya-check` | KYA-CHECK: \<system-name\> |
| `/pay-tax-pack` | TAX-PACK: \<operator-name\> |
| `/pay-aml-screen` | AML-SCREEN: \<transaction-context\> |

---

*Built on SIP — Payment Intelligence compliance/skill.md · v1.0 · vertical: payment-intelligence*
