---
name: treasury-skill
vertical: payment-intelligence
sub-system: treasury
version: 1.0
---

# Treasury Skill

Auto-activates when wallet design, float management, reconciliation, or Wealth IS bridge questions are detected.

## Activation triggers

- Keywords: treasury, wallet, float, reconciliation, ledger, hot wallet, cold wallet, reserve, payout, tax escrow, DPI, wealth bridge, account structure, liquidity
- Commands: `/pay-treasury-design`, `/pay-float-plan`, `/pay-reconcile`, `/pay-wealth-bridge`
- Context: designing payment account architecture, managing agent payment float, connecting payment P&L to wealth intelligence

## Loading sequence

```
Load SOUL.md → SKILL.md → treasury/agent.md → treasury/skill.md → [command]
```

## Invariants

1. Tax escrow account is mandatory in every treasury design
2. Hot wallet limit — never more than 7-day operating float in hot/online accounts
3. Reconciliation includes exception handling — never just happy-path
4. DPI bridge — treasury outputs feed Wealth IS via `/pay-wealth-bridge` → `/wealth-dpi`
5. Non-advisory clause opens every artifact

## Knowledge sources

- `research/compliance/eu-2026.md` — EU VAT, tax escrow requirements
- `research/compliance/us-2026.md` — US tax reporting, 1099, state requirements
- `STACK.md` — Wealth IS composition relationship

## Output artifacts

| Command | Artifact |
|---------|----------|
| `/pay-treasury-design` | TREASURY-DESIGN: \<operator-name\> |
| `/pay-float-plan` | FLOAT-PLAN: \<context\> |
| `/pay-reconcile` | RECONCILIATION-RUNBOOK: \<period\> |
| `/pay-wealth-bridge` | WEALTH-BRIDGE-REPORT: \<date\> |

---

*Built on SIP — Payment Intelligence treasury/skill.md · v1.0 · vertical: payment-intelligence*
