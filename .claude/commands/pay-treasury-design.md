---
name: pay-treasury-design
description: Design wallet and account architecture for a payment operation — hot/warm/cold topology, PSP accounts, tax escrow
allowed-tools: [Read, Write]
argument-hint: "<operator-name> [rails: fiat|crypto|both] [volume-tier]"
vertical: payment-intelligence
sub-system: treasury
tier: 2
---

# /pay-treasury-design

Load `SOUL.md`, `SKILL.md`, `treasury/agent.md`, `treasury/skill.md`, `research/compliance/eu-2026.md`, `research/compliance/us-2026.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse operator profile** — operator name, rails in use (fiat/crypto/both), estimated monthly volume, jurisdiction
2. **Design account structure:**
   - Fiat: Operating / Reserve / Payout / Tax Escrow accounts with PSP configuration
   - Crypto: Hot / Warm / Cold wallet topology with custody model
3. **Set float parameters** — minimum float (3× peak daily), reserve ratio (10% of 90-day rolling), top-up trigger
4. **Tax escrow calculation** — estimate required tax escrow percentage by jurisdiction
5. **Multi-currency** — if cross-border, flag FX exposure and route to Wealth IS
6. **Wealth IS bridge** — define what feeds into `/pay-wealth-bridge` → `/wealth-dpi`

## Output

```markdown
# TREASURY-DESIGN: <operator-name>

> Non-advisory clause: [paste full clause]

## Operator profile
- Rails: fiat | crypto | both
- Volume tier: ...
- Jurisdiction: ...

## Fiat account structure
| Account | Purpose | Target balance |
|---------|---------|----------------|
| Operating | Day-to-day | 3× peak daily |
| Reserve | Chargeback buffer | 10% of 90-day rolling |
| Payout | Scheduled disbursements | Per payout schedule |
| Tax Escrow | VAT + income tax | X% of gross revenue |

## Crypto wallet topology (if applicable)
| Tier | Custody | Max balance |
|------|---------|------------|
| Hot | Online (MPC) | 7-day float |
| Warm | HSM-backed | 30-day reserve |
| Cold | Offline | Long-term |

## Float parameters
- Minimum float: 3× $X (peak daily volume)
- Reserve ratio: 10% of 90-day rolling = $Y
- Top-up trigger: operating balance < 1.5× daily float

## Tax escrow estimate
- Jurisdiction: ...
- Rate: X% of gross revenue
- Remittance schedule: ...

## Multi-currency / FX flag
<Flag if applicable, route to Wealth IS>

## Wealth IS DPI inputs
- Feeds: `/pay-wealth-bridge` → `/wealth-dpi`
- Daily inputs: net payment P&L, rail costs, exception reserve delta

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] Tax escrow account included (mandatory)
- [ ] Hot wallet 7-day limit enforced
- [ ] Chargeback reserve present
- [ ] Wealth IS DPI bridge inputs defined

## Rules

- Tax escrow is mandatory — never emit a treasury design without it
- Hot wallet must have explicit max balance (7-day rule)
- FX exposure flagged — never claim FX management is in scope

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
