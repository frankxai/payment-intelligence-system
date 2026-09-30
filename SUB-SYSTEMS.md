# SUB-SYSTEMS — Payment Intelligence Architecture

> **Non-advisory clause (non-waivable):** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

---

## Daily-5 across the stack

Five commands that cover 80% of daily operator needs. Start here.

| Command | Sub-system | Why this one first |
|---|---|---|
| **`/pay-rails-select`** | Rails | Choose the right rail before any payment move. Rail choice determines cost, latency, jurisdiction, and trust model. |
| **`/pay-mandate-design`** | Mandates | Design a new agent authorization. No agent payment without a mandate. |
| **`/pay-commerce-readiness`** | Commerce | Audit whether your shop or API is ready to receive agent payments. |
| **`/pay-compliance-map`** | Compliance | Know what law applies before any payment flows. |
| **`/pay-ops-runbook`** | Ops | Build the runbook before you need it. Incidents without runbooks cost 10× more. |

---

## Architectural premise (functional sub-systems)

A payment operator runs six functions simultaneously. These are not phases or stances — they are ongoing operational concerns a shop owner, trader, or builder needs running every day. The sub-systems model reflects that reality.

The six functions:

1. **Rails** — which protocol moves the value
2. **Mandates & Authorization** — how an agent is authorized to spend
3. **Commerce & Checkout** — how goods and services are discovered, negotiated, and purchased
4. **Treasury & Wallets** — where value lives, how it moves, how it reconciles
5. **Compliance & Tax** — what law requires and what operators must document
6. **Ops & Continuity** — what happens when things break

---

## Sub-system 1 — Rails

- **Slug:** `rails`
- **Agent:** `rails/agent.md`
- **Skill:** `rails/skill.md`
- **Knowledge:** `rails/knowledge.md`
- **Artifacts dir:** `rails/artifacts/`

### Commands (4)

| Command | Named output artifact |
|---|---|
| **`/pay-rails-select`** | `rails-selection-<context>-<date>.md` — Decision record: recommended rail + rationale + alternatives considered |
| `/pay-rails-brief` | `rails-brief-<protocol>-<date>.md` — 1-page protocol brief: What/Who/Mechanism/When-to-choose/Verified facts |
| `/pay-rails-compare` | `rails-comparison-<date>.md` — Side-by-side matrix across selected rails on stated axes |
| `/pay-rails-watch` | `rails-watch-<date>.md` — Ecosystem pulse: protocol updates, adoption signals, version changes (as-of dated) |

### Composes with

- Mandates: rail selection feeds mandate design (x402/MPP use different authorization flows than card-network AP2)
- Treasury: rail settlement mode (instant/stream/batch) determines float and reconciliation cadence
- Compliance: rail jurisdiction maps directly to regulatory requirements
- Wealth IS / DPI ledger (via `/wealth-dpi`): settlement outputs flow to portfolio accounting

### Research grounding

- `research/rails/x402.md` — x402 Foundation spec, ~165M agent txns as of 2026-06
- `research/rails/l402.md` — Lightning Network HTTP 402, macaroon credentials
- `research/rails/h402.md` — H402 independent M2M protocol
- `research/rails/stripe-mpp.md` — Stripe Machine Payments Protocol (Mar 2026)
- `research/rails/mastercard-agent-pay.md` — Agent Pay (Apr 2025) + Agent Pay for Machines (Jun 2026)
- `research/rails/visa-intelligent-commerce.md` — Visa IC + Trusted Agent Protocol (RFC 9421)
- `frameworks/rail-selection-matrix.md` — Decision framework: axes × rails

### Refusal patterns

- Rail recommendation without mechanism citation
- Settlement speed claims that conflate authorization latency with settlement finality
- Universalism ("use card rails for everything" or "use crypto for everything")
- Adoption stat citations without as-of date and source

---

## Sub-system 2 — Mandates & Authorization

- **Slug:** `mandates`
- **Agent:** `mandates/agent.md`
- **Skill:** `mandates/skill.md`

### Commands (4)

| Command | Named output artifact |
|---|---|
| **`/pay-mandate-design`** | `mandate-design-<agent-id>-<date>.md` — Mandate spec: caps/windows/merchant-rules/consensus-tier/revocation path |
| `/pay-mandate-audit` | `mandate-audit-<mandate-id>-<date>.md` — Security audit of existing mandate: scope creep, missing revocation, unbounded caps |
| `/pay-consensus-policy` | `consensus-policy-<context>-<date>.md` — Byzantine consensus policy: threshold/quorum/timeout for given transaction risk |
| `/pay-revocation-drill` | `revocation-drill-<date>.md` — Runbook drill: verify revocation path works before production mandate activation |

### Composes with

- Rails: rail selection determines mandate type (AP2 intent/cart mandates, x402 session tokens, MPP session envelopes)
- Treasury: mandate spend caps feed float planning
- Compliance: mandate scope must satisfy KYA/KYC requirements per jurisdiction
- Wealth IS / Thesis engine: mandate architecture documented as capital-control layer

### Research grounding

- `research/mandates/ap2.md` — Google AP2 signed mandates, Ed25519, 60+ partners as of 2026-06
- `research/mandates/active-mandates.md` — Active Mandates lifecycle (create/sign/authorize/revoke)
- `research/mandates/kyapay.md` — Skyfire KYAPay: Know-Your-Agent + JWT payments
- `research/mandates/a2a-x402.md` — A2A x402 extension: on-chain mandate settlement
- `frameworks/mandate-design-checklist.md` — Design checklist: caps/windows/merchant-rules/revocation/consensus tiers

### Refusal patterns

- Unbounded mandates (no spend cap or time window) — refused always
- Mandate creation without explicit revocation path
- Consensus threshold bypass or single-approver mandates above configurable amount threshold
- Intent mandate reuse across multiple merchants without scope check

---

## Sub-system 3 — Commerce & Checkout

- **Slug:** `commerce`
- **Agent:** `commerce/agent.md`
- **Skill:** `commerce/skill.md`

### Commands (4)

| Command | Named output artifact |
|---|---|
| **`/pay-commerce-readiness`** | `commerce-readiness-<shop-or-api>-<date>.md` — Agentic commerce readiness audit: ACP/UCP coverage, checkout trace, agent-accessible pricing |
| `/pay-commerce-protocol-fit` | `protocol-fit-<context>-<date>.md` — ACP vs UCP vs custom recommendation with rationale |
| `/pay-monetize-endpoint` | `monetize-<endpoint>-<date>.md` — Blueprint: put an MCP endpoint or API behind payment (x402, L402, MPP, or ACP delegate) |
| `/pay-checkout-trace` | `checkout-trace-<session>-<date>.md` — Trace of a specific agent checkout session: steps, authorizations, failures |

### Composes with

- Rails: commerce protocol selection constrains rail options (ACP uses Stripe; UCP uses card/UCP rails)
- Mandates: checkout flows require active mandate before authorization
- Ops: checkout trace feeds dispute-flow and runbook

### Research grounding

- `research/commerce/acp.md` — ACP (OpenAI + Stripe), Agentic Checkout, Delegate Payment spec
- `research/commerce/ucp.md` — UCP (Google + Shopify), catalog/cart/purchase flows

### Refusal patterns

- "Just use Stripe" as the complete commerce answer (misses mandate architecture, rail selection, ACP/UCP protocol fit)
- Agent checkout designs without operator review gate
- MCP endpoint monetization without rate-limit and abuse-prevention design

---

## Sub-system 4 — Treasury & Wallets

- **Slug:** `treasury`
- **Agent:** `treasury/agent.md`
- **Skill:** `treasury/skill.md`

### Commands (4)

| Command | Named output artifact |
|---|---|
| `/pay-treasury-design` | `treasury-design-<context>-<date>.md` — Wallet/account architecture: hot/warm/cold tier, custodial vs non-custodial, fiat/crypto split |
| `/pay-float-plan` | `float-plan-<context>-<date>.md` — Float and liquidity design: expected agent transaction volume, settlement cadence, minimum operating balance |
| `/pay-reconcile` | `reconciliation-<period>-<date>.md` — Reconciliation run: match transactions to mandates, flag discrepancies |
| `/pay-wealth-bridge` | `wealth-bridge-<date>.md` — Bridge report to Wealth IS DPI ledger (feeds `/wealth-dpi`) |

### Composes with

- Rails: settlement mode (instant/stream/batch) determines float requirements
- Mandates: active spend caps must reconcile against treasury float
- Compliance: wallet architecture must satisfy jurisdiction KYC/AML requirements
- **Wealth IS / DPI ledger** (primary composition target): treasury outputs feed the DPI capital accounting layer via `/wealth-dpi`

### Refusal patterns

- Single-wallet architecture for agent operations (no tier separation = single point of failure)
- Hot wallet for amounts exceeding operating buffer
- Crypto-only treasury without fiat float for processor settlement

---

## Sub-system 5 — Compliance & Tax

- **Slug:** `compliance`
- **Agent:** `compliance/agent.md`
- **Skill:** `compliance/skill.md`

### Commands (4)

| Command | Named output artifact |
|---|---|
| **`/pay-compliance-map`** | `compliance-map-<jurisdiction>-<date>.md` — Regulatory landscape: PSD3, MiCA, AI Act, money-transmission, KYC/AML requirements |
| `/pay-kya-check` | `kya-check-<agent-id>-<date>.md` — Know-Your-Agent audit: agent identity, authorization scope, operator accountability chain |
| `/pay-tax-pack` | `tax-pack-<period>-<date>.md` — Bookkeeping pack: transaction export, VAT/sales-tax classification, accounting entries |
| `/pay-aml-screen` | `aml-screen-<counterparty>-<date>.md` — AML screening summary for a counterparty (wallet address, merchant, or agent identity) |

### Composes with

- Mandates: compliance requirements constrain mandate scope (KYA requirements per jurisdiction)
- Treasury: KYC/AML requirements constrain wallet architecture and custodian selection
- Ops: compliance gap feeds incident runbook

### Research grounding

- `research/compliance/eu-2026.md` — PSD2→PSD3, MiCA, AI Act status as of 2026-06
- `research/compliance/us-2026.md` — US money-transmission, FinCEN, state-level MSB requirements as of 2026-06
- `research/identity/kya-and-trust.md` — KYA standards: Visa TAP, Forter TACP, Sigilum, Skyfire KYAPay

### Refusal patterns

- Compliance presented as a checklist without routing to jurisdiction-specific counsel
- "Not applicable for agents" framing (AI Act and existing payment law both apply to agentic actors)
- KYC/AML described as optional for small transactions (thresholds are regulatory, not design choices)
- Tax-pack generation without disclaimer that output requires CPA/tax-advisor review

---

## Sub-system 6 — Ops & Continuity

- **Slug:** `ops`
- **Agent:** `ops/agent.md`
- **Skill:** `ops/skill.md`

### Commands (4)

| Command | Named output artifact |
|---|---|
| **`/pay-ops-runbook`** | `ops-runbook-<context>-<date>.md` — Operational runbook: normal operation, processor-outage playbook, dispute-escalation path, backup rail activation |
| `/pay-incident` | `incident-<id>-<date>.md` — Incident record: what failed, scope, impact, root cause, remediation, post-mortem |
| `/pay-continuity-audit` | `continuity-audit-<date>.md` — Continuity audit: single points of failure, provider redundancy, payment-data backup verification |
| `/pay-dispute-flow` | `dispute-flow-<dispute-id>-<date>.md` — Dispute/chargeback runbook: evidence collection, timelines, escalation path |

### Composes with

- Rails: backup rail activation requires pre-tested secondary rail
- Commerce: checkout trace is primary evidence in dispute-flow
- Compliance: incident reports feed compliance documentation requirements

### Refusal patterns

- Single-processor architecture presented as acceptable (deplatform risk is real)
- Runbook built after first incident (continuity design must precede production payments)
- Dispute handling without documented evidence-collection protocol

---

## Composition rules summary

- **Wealth IS umbrella:** Treasury outputs feed Wealth IS DPI ledger via `/wealth-dpi`. Compliance + Mandates connect to Wealth IS capital-control layer.
- **Sibling Crypto IS:** Crypto rail options (on-chain, stablecoin) compose with Crypto IS custody architecture.
- **Mandate architecture is load-bearing:** No other sub-system produces meaningful output if Mandates is misconfigured.
- **Non-advisory clause is non-waivable:** Every artifact from every sub-system opens with the clause.

---

## Falsifier

The sub-system architecture is a means, not a monument. Testable failure condition: if a shop owner running `/pay-rails-select` + `/pay-mandate-design` + `/pay-ops-runbook` cannot produce three named artifacts with enough operator-specific detail to actually configure a payment flow in one session, the architecture failed. Re-iterate accordingly.

---

**Built on SIP** — Payment Intelligence SUB-SYSTEMS.md · v1.0 · SIP v1.1.0 (spawned 2026-06-22)
