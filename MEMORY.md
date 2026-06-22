# MEMORY — Payment Intelligence Identity and State

---

## Identity

- **System slug:** `pay`
- **Full name:** Payment Intelligence System
- **Spawned:** 2026-06-22
- **Position in stack:** Domain Sub-Stack under Wealth IS (sibling to Crypto IS)
- **Repo:** `frankxai/payment-intelligence-system`
- **Branch at spawn:** `claude/payment-intelligence-system-tltrlg`
- **SIP version:** v1.1.0

---

## Composition map

| Composes-with | Direction | Via |
|---|---|---|
| Wealth IS / DPI ledger | Output → Wealth IS | `/pay-wealth-bridge` → `/wealth-dpi` |
| Wealth IS / Thesis engine | Output → Wealth IS | Mandate architecture documented as capital-control layer |
| Crypto IS | Sibling (bidirectional) | Crypto rail + custody patterns inform Payment IS treasury; Payment IS rail selection references crypto options |
| Starlight Orchestrator | Substrate routing | Payment IS commands discoverable via Starlight command index |

---

## Sub-system registry

| Sub-system | Slug | Agent | Skill | Status |
|---|---|---|---|---|
| Rails | `rails` | `rails/agent.md` | `rails/skill.md` | v1.0 |
| Mandates & Authorization | `mandates` | `mandates/agent.md` | `mandates/skill.md` | v1.0 |
| Commerce & Checkout | `commerce` | `commerce/agent.md` | `commerce/skill.md` | v1.0 |
| Treasury & Wallets | `treasury` | `treasury/agent.md` | `treasury/skill.md` | v1.0 |
| Compliance & Tax | `compliance` | `compliance/agent.md` | `compliance/skill.md` | v1.0 |
| Ops & Continuity | `ops` | `ops/agent.md` | `ops/skill.md` | v1.0 |

---

## Pre-publish checklist (resolved at spawn)

- [x] Non-advisory clause in SKILL.md and all command files
- [x] SUB-SYSTEMS.md written and contains falsifier
- [x] SOUL.md theater patterns documented
- [x] STACK.md composition with Wealth IS declared
- [x] "Built on SIP" attestation in all core files
- [x] Metrics Truth Rule: all adoption numbers carry "as of 2026-06" dating
- [x] Anti-slop: no banned words in any artifact
- [x] 24 /pay-* commands in .claude/commands/
- [x] All 6 sub-systems have agent.md + skill.md
- [x] Draft PR opened on both repos

---

## Vault namespace

Payment Intelligence uses vault namespace `pay/` within Wealth IS vault scope:
- `pay/rails-decisions/` — rail selection decision records
- `pay/mandate-designs/` — active mandate specifications
- `pay/compliance-maps/` — jurisdiction compliance maps
- `pay/incidents/` — incident records

---

**Built on SIP** — Payment Intelligence MEMORY.md · v1.0 · SIP v1.1.0 (2026-06-22)
