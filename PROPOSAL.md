# PROPOSAL — Payment Intelligence System: VERTICALS.md Registry Entry

> Ready-to-paste registry entry for the Starlight board. Requires board approval before editing VERTICALS.md.

---

## Status

Draft for board review. Do not merge into VERTICALS.md until board verdict.

Proposed by: Payment Intelligence System (spawned 2026-06-22, branch `claude/payment-intelligence-system-tltrlg`)

---

## Proposed VERTICALS.md entry

```yaml
payment-intelligence:
  name: Payment Intelligence System
  slug: pay
  repo: frankxai/payment-intelligence-system
  status: v1.0
  spawned: 2026-06-22
  pattern: Domain Sub-Stack (functional sub-systems)
  layer: Wealth IS (sibling: Crypto IS)
  sub-systems:
    - slug: rails
      commands: [pay-rails-select, pay-rails-brief, pay-rails-compare, pay-rails-watch]
    - slug: mandates
      commands: [pay-mandate-design, pay-mandate-audit, pay-consensus-policy, pay-revocation-drill]
    - slug: commerce
      commands: [pay-commerce-readiness, pay-commerce-protocol-fit, pay-monetize-endpoint, pay-checkout-trace]
    - slug: treasury
      commands: [pay-treasury-design, pay-float-plan, pay-reconcile, pay-wealth-bridge]
    - slug: compliance
      commands: [pay-compliance-map, pay-kya-check, pay-tax-pack, pay-aml-screen]
    - slug: ops
      commands: [pay-ops-runbook, pay-incident, pay-continuity-audit, pay-dispute-flow]
  composes-with:
    - Wealth IS / DPI ledger (via /pay-wealth-bridge → /wealth-dpi)
    - Wealth IS / Thesis engine (mandate + compliance layer)
    - Crypto IS (sibling, bidirectional rail + custody patterns)
  non-advisory: financial/legal/tax clause non-waivable on all artifacts
  sip-attestation: ambient (Built on SIP in all artifacts)
  naming-pattern: functional (not Houses)
  naming-decision: >
    2026-06-22 — Houses pattern (Crypto IS) is on proof-of-pattern at v0.1 with open
    falsifier. Payment sub-systems are simultaneous operational functions a shop owner
    runs every day, not archetypal stances. Functional naming (Sound/People IS precedent)
    adopted. Revisit if Crypto IS Houses passes falsifier.
```

---

## Architecture decision log

**Decision: Functional sub-systems, not Houses**

The Crypto IS "Houses" pattern is on proof-of-pattern at v0.1 with an open falsifier. Payment sub-systems (Rails, Mandates, Commerce, Treasury, Compliance, Ops) are not stances a practitioner chooses between — they are operational functions a shop owner runs simultaneously. Functional naming (Sound IS / People IS precedent) reflects this reality. If Crypto IS Houses pattern passes its falsifier (4-5 named artifacts from House of On-Chain in one week), future Payment IS versions may reconsider. The functional decomposition adopted here remains valid regardless.

**Decision: PROPOSAL.md instead of direct VERTICALS.md edit**

VERTICALS.md is a substrate-level file requiring Starlight board gate before any edit. This PROPOSAL.md ships ready-to-paste; the board gate runs before merge.

---

**Built on SIP** — Payment Intelligence PROPOSAL.md · v1.0 · SIP v1.1.0 (2026-06-22)
