# Mandate Design Checklist

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

A structured checklist for designing agent payment mandates. Run before `/pay-mandate-design` to understand what inputs are required; reference the output to verify completeness.

---

## 1. Scope definition

- [ ] **Agent identity** — which agent or agent class is this mandate for? (e.g., `shopping-bot@tenant`, agent-class pattern, or public key fingerprint)
- [ ] **Mandate type** — intent (general spend authorization), cart (specific item authorization), or subscription (recurring)?  
  - x402/MPP: session token  
  - AP2: `intent` or `cart` mandate with Ed25519  
  - Agent Pay: SD-JWT verifiable credential  
- [ ] **Operator identity** — who holds ultimate accountability for this agent's payments?
- [ ] **Purpose statement** — what is this mandate for? (1-2 sentences; used in KYA checks)

---

## 2. Spend caps (required — no exceptions)

- [ ] **Per-transaction cap** — maximum single transaction amount
- [ ] **Period cap** — maximum amount per period (daily/weekly/monthly)
- [ ] **Lifetime cap** (optional) — total maximum over the mandate lifetime
- [ ] **Currency** — fiat currency, stablecoin, or multi-currency allowance
- [ ] **Buffer discipline** — cap set below operator's actual risk tolerance (not at the edge)

*No mandate design is complete without all three cap levels defined. An unbounded cap is a security vulnerability.*

---

## 3. Time windows

- [ ] **Activation date/time** — when the mandate becomes active
- [ ] **Expiration date/time** — hard expiry; do not use open-ended mandates
- [ ] **Operating window** (optional) — hours or days within which the agent may transact (e.g., business-hours-only for a B2B agent)
- [ ] **Renewal policy** — manual renewal only, or auto-renewal with operator confirmation?

---

## 4. Merchant / counterparty restrictions

- [ ] **Allowlist** (preferred) — explicit set of allowed merchants, merchant categories, or API endpoints  
  OR
- [ ] **Blocklist** — prohibited merchants or categories (weaker — allowlist preferred)
- [ ] **Merchant category codes** (for card-rail mandates) — MCC allowlist/blocklist
- [ ] **Geographic restriction** (optional) — only transact with counterparties in approved jurisdictions

---

## 5. Cryptographic signing

- [ ] **Signature scheme** — Ed25519 (AP2 standard; <1ms verification), SD-JWT (Agent Pay / Mastercard), or session token (x402/MPP)
- [ ] **Key generation** — mandate signing key generated fresh; not reused from other mandates
- [ ] **Key storage** — private key stored in secure enclave or HSM; never in plaintext config
- [ ] **Public key registration** — public key registered with the mandate framework (AP2 registry, Mastercard issuer, etc.)
- [ ] **Signature verification** — counterparty can verify signature without calling back to issuer (offline verification path)

---

## 6. Byzantine consensus tier

Required for mandates above configurable high-value threshold (operator sets threshold).

- [ ] **Threshold amount** — above what transaction amount is multi-agent consensus required?
- [ ] **Quorum definition** — which agents must approve? (e.g., `purchasing + finance + compliance`)
- [ ] **Consensus threshold** — how many of N must approve? (e.g., 2 of 3)
- [ ] **Timeout** — how long to wait for consensus before failing the payment?
- [ ] **Failure mode** — if consensus times out, does the payment fail-closed or escalate?
- [ ] **Consensus audit log** — all consensus votes logged for compliance

*Below the threshold: single-approver mandate. Above the threshold: multi-agent consensus required.*

---

## 7. Revocation path (required — no exceptions)

- [ ] **Revocation endpoint** — where can the mandate be instantly revoked? (URL or on-chain revocation registry)
- [ ] **Revocation propagation time** — how quickly does revocation take effect across all counterparties?
- [ ] **Revocation test** — revocation path tested before mandate goes live (`/pay-revocation-drill` output)
- [ ] **Emergency revocation** — who can trigger emergency revocation, and how fast? (Target: <60 seconds)
- [ ] **Post-revocation behavior** — what happens to in-flight transactions when a mandate is revoked?
- [ ] **Revocation audit** — revocation events logged with timestamp, trigger, and operator identity

*No mandate ships to production without a tested revocation path.*

---

## 8. KYA / KYC requirements

- [ ] **Agent identity attestation** — does this mandate require Know-Your-Agent verification? (Required in EU under AI Act + PSD3 agent accountability provisions as of 2026-06)
- [ ] **Operator KYC** — is the operator's identity verified with the mandate framework and PSP?
- [ ] **Counterparty KYC** — does the rail require counterparty KYC? (Required for bank rails; optional for x402)
- [ ] **AML screening** — has the counterparty been screened against sanctions lists? (`/pay-aml-screen` output)

---

## 9. Rail compatibility

- [ ] **Rail confirmed** — what rail will this mandate flow over? (Output of `/pay-rails-select`)
- [ ] **Mandate type matches rail** — AP2 Ed25519 mandate for AP2 rail; SD-JWT for Agent Pay; session token for x402/MPP
- [ ] **Settlement currency matches treasury** — settlement currency of the rail matches the treasury account currency
- [ ] **Float check** — does the treasury have sufficient float for the mandate's maximum period spend?

---

## 10. Compliance

- [ ] **Jurisdiction compliance check** — mandate design reviewed against operator's jurisdiction requirements (`/pay-compliance-map` output)
- [ ] **PSD3 mandate accountability** (EU) — operator can demonstrate clear accountability chain for agent payments
- [ ] **AI Act traceability** (EU) — agent identity and decision trail traceable per AI Act requirements as of 2026-06
- [ ] **Audit trail** — all mandate lifecycle events (create, sign, authorize, revoke) logged with timestamps

---

## Pre-production gate

Before any mandate goes live:

- [ ] All required sections above completed (no empty fields in caps, time windows, revocation)
- [ ] Revocation drill passed (`/pay-revocation-drill` output present)
- [ ] Mandate audit completed if migrating from existing mandate (`/pay-mandate-audit` output)
- [ ] Rail selection confirmed and matching
- [ ] Float check passed
- [ ] Compliance check passed for operator's jurisdiction

---

**Built on SIP** — Payment Intelligence / frameworks/mandate-design-checklist.md · v1.0 · SIP v1.1.0 (2026-06-22)
