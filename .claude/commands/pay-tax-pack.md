---
name: pay-tax-pack
description: Generate a tax obligations pack for a payment operation — VAT, sales tax, income tax, 1099 reporting
allowed-tools: [Read, Write]
argument-hint: "<operator-name> [jurisdiction: EU|US|global] [business-type]"
vertical: payment-intelligence
sub-system: compliance
tier: 2
---

# /pay-tax-pack

Load `SOUL.md`, `SKILL.md`, `compliance/agent.md`, `compliance/skill.md`, `research/compliance/eu-2026.md`, `research/compliance/us-2026.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse operator** — name, jurisdiction, business type (individual / entity / EU VAT-registered)
2. **Map tax obligations:**
   - EU: VAT (standard/reduced rate), OSS registration, digital services rule
   - US: 1099-K ($600 threshold), 1099-MISC, state sales tax nexus
3. **Bookkeeping requirements** — what transaction data must be recorded for each tax type
4. **Reporting schedule** — when each tax type is due
5. **Escrow recommendation** — what percentage of gross revenue to hold in tax escrow
6. **Counsel routing** — multi-state US sales tax and EU VAT registration require counsel

## Output

```markdown
# TAX-PACK: <operator-name>

> Non-advisory clause: [paste full clause]

## Tax obligations summary

### EU (as of 2026-06)
| Tax | Obligation | Rate | Due |
|-----|-----------|------|-----|
| VAT (standard) | Collect + remit on B2C sales | 20-25% (varies) | Quarterly (OSS) |
| OSS registration | Required if EU cross-border sales | N/A | One-time |
| Digital services VAT | Applies to API/MCP revenue | Country of buyer | Same as OSS |

### US (as of 2026-06)
| Tax | Obligation | Threshold | Due |
|-----|-----------|-----------|-----|
| 1099-K | Issue to payment processors | $600+ in year | Jan 31 |
| 1099-MISC | Issue to service providers | $600+ in year | Jan 31 |
| State sales tax | Nexus-based | Varies by state | Monthly/quarterly |

## Bookkeeping requirements
| Tax type | Required records | Retention |
|----------|-----------------|----------|
| VAT | Invoice per transaction, buyer location | 10 years (EU) |
| 1099-K | Annual aggregate per processor | 7 years (IRS) |
| Sales tax | Transaction location, product category | 7 years |

## Reporting schedule
- EU VAT/OSS: quarterly (due 20th of month after quarter)
- US 1099s: January 31 annual
- State sales tax: monthly or quarterly (varies by state nexus)

## Tax escrow recommendation
- EU operations: hold 20-25% of gross B2C revenue for VAT
- US operations: hold 8-12% of gross for sales tax + income tax buffer
- Route to accountant for exact jurisdiction-specific rates

## Counsel routing triggers
- [ ] EU OSS registration (one-time, requires fiscal representative in some countries)
- [ ] US multi-state sales tax nexus determination
- [ ] Digital services VAT for non-EU sellers selling to EU customers

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present and verbatim
- [ ] Both EU and US obligations addressed
- [ ] Bookkeeping requirements specify retention periods
- [ ] Tax escrow recommendation present
- [ ] Counsel routing triggers present

## Rules

- Never provide specific tax rates as definitive — rates vary by country/state and change; always say "route to accountant"
- Counsel routing triggers are mandatory output — never omit

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
