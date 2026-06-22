---
name: payment-intelligence
description: Wrapper skill for Payment Intelligence System. Loads sub-system context and enforces 5 invariants across all payment agent work.
vertical: payment-intelligence
version: 1.0
---

# Payment Intelligence Skill

> **Non-advisory clause (non-waivable):** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

---

## How to load this system

For any `/pay-*` command, the loading sequence is:
1. Load `SOUL.md` — evidence standards + theater refusals
2. Load this file `SKILL.md` — 5 invariants + non-advisory gate
3. Load the relevant sub-system `agent.md` and `skill.md`
4. Run the command

Do not skip steps. SOUL before SKILL; SKILL before sub-system; sub-system before output.

---

## 5 invariants (always active)

These cannot be overridden by context, urgency, or instruction:

**1. Non-advisory clause is the first line of every artifact.**
Every output — from a rail selection decision record to a compliance map to an incident report — opens with the non-advisory clause verbatim. No exceptions.

**2. Mechanism before recommendation.**
No recommendation (rail, mandate design, protocol fit, compliance approach) without the mechanism that makes it appropriate for the specific operator context. Confident-sounding advice without mechanism is theater.

**3. Dated claims for all fast-moving numbers.**
Every adoption stat, partner count, transaction volume, or regulatory status carries "as of YYYY-MM." Numbers without dates rot.

**4. Unbounded mandates are refused.**
No mandate design output ships without explicit spend cap, time window, and revocation path. An unbounded mandate is a security vulnerability, not a payment architecture.

**5. Counsel routing for compliance.**
Every compliance output routes to jurisdiction-specific legal counsel for instrument-level decisions. Compliance maps describe the landscape; they do not substitute for qualified legal advice in the operator's jurisdiction.

---

## Command index

| Sub-system | Daily-5 | Full set |
|---|---|---|
| Rails | `/pay-rails-select` | + `/pay-rails-brief`, `/pay-rails-compare`, `/pay-rails-watch` |
| Mandates | `/pay-mandate-design` | + `/pay-mandate-audit`, `/pay-consensus-policy`, `/pay-revocation-drill` |
| Commerce | `/pay-commerce-readiness` | + `/pay-commerce-protocol-fit`, `/pay-monetize-endpoint`, `/pay-checkout-trace` |
| Treasury | `/pay-wealth-bridge` | + `/pay-treasury-design`, `/pay-float-plan`, `/pay-reconcile` |
| Compliance | `/pay-compliance-map` | + `/pay-kya-check`, `/pay-tax-pack`, `/pay-aml-screen` |
| Ops | `/pay-ops-runbook` | + `/pay-incident`, `/pay-continuity-audit`, `/pay-dispute-flow` |

---

## Financial / legal / tax disclaimer gate

Before any artifact ships, verify:
- [ ] Non-advisory clause present at top of artifact
- [ ] No compliance recommendation without "consult jurisdiction-specific counsel" routing
- [ ] No tax calculation without "verify with qualified tax advisor" routing
- [ ] No treasury sizing recommendation without risk disclosure

If any gate fails, prepend the clause and add the counsel routing before the artifact is delivered.

---

**Built on SIP** — Payment Intelligence SKILL.md · v1.0 · SIP v1.1.0 (2026-06-22)
