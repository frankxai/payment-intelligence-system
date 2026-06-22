---
name: rails-skill
vertical: payment-intelligence
sub-system: rails
version: 1.0
---

# Rails Skill

Auto-activates when rail selection, protocol comparison, or payment mechanism questions are detected.

## Activation triggers

- Keywords: rail, x402, L402, H402, MPP, Agent Pay, Visa IC, AP2, ACP, UCP, stablecoin, ACH, SEPA, settlement, HTTP 402
- Commands: `/pay-rails-select`, `/pay-rails-brief`, `/pay-rails-compare`, `/pay-rails-watch`
- Context: operator choosing between payment protocols, API monetization, agent-to-agent payment

## Loading sequence

```
Load SOUL.md → SKILL.md → rails/agent.md → rails/skill.md → [command]
```

## Invariants

1. Mechanism before recommendation — always explain how the rail works before saying "use this"
2. Dated claims — every adoption figure carries "as of YYYY-MM"
3. Context-bound selection — no "best rail" without stated axes (size / counterparty / settlement / trust / jurisdiction)
4. Non-advisory clause opens every artifact
5. Stablecoin recommendation → flag CASP/MSB compliance requirement

## Knowledge sources

- `research/rails/` — 6 rail research docs (x402, L402, H402, Stripe MPP, Mastercard Agent Pay, Visa IC)
- `frameworks/rail-selection-matrix.md` — decision matrix
- `rails/knowledge.md` — mechanism deep-dives and protocol specs

## Output artifacts

| Command | Artifact |
|---------|----------|
| `/pay-rails-select` | RAIL-SELECT: \<context\> |
| `/pay-rails-brief` | RAIL-BRIEF: \<protocol\> |
| `/pay-rails-compare` | RAIL-COMPARE: \<A\> vs \<B\> |
| `/pay-rails-watch` | RAIL-WATCH: \<date\> |

---

*Built on SIP — Payment Intelligence rails/skill.md · v1.0 · vertical: payment-intelligence*
