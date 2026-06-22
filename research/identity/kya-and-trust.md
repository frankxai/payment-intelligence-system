# Research — Know-Your-Agent (KYA) and Trust Protocols

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

---

## Why KYA matters in 2026

As AI agents make payments, regulators and merchants need to know:
1. Who is this agent? (identity)
2. Who authorized it? (operator accountability)
3. What is it allowed to do? (scope)
4. Can the authorization be verified? (cryptographic proof)

EU AI Act (in force 2026) requires operators of high-risk AI systems to maintain traceability. PSD3 (in force 2026) extends PSP accountability to agent-initiated payment flows. US FinCEN guidance (evolving as of 2026-06) requires operators to maintain KYC records for agents initiating transactions above reporting thresholds.

---

## KYAPay (Skyfire)

See: `research/mandates/kyapay.md`

The most fully-developed agent identity + payment solution as of 2026-06. KYAPay combines:
- KYA registry (Skyfire-maintained, operator-verified agent identities)
- JWT credential issuance
- Payment token issuance
- No wallet/gas required

---

## Visa Trusted Agent Protocol (TAP)

See: `research/rails/visa-intelligent-commerce.md`

RFC 9421 HTTP Message Signatures applied to payment authorization:
- Agent signs HTTP payment requests with Ed25519
- Merchant verifies signature against Visa TAP registry
- Provides W3C/IETF-standard proof of agent identity at the transaction level

---

## Forter Trusted Agentic Commerce Protocol (TACP)

**Repo:** https://github.com/forter/trusted-agentic-commerce-protocol

Merchant-side fraud prevention for agent transactions:
- Sits above Visa TAP
- Behavioral fingerprinting of agent sessions
- Risk scoring per agent transaction
- Data-encrypted communication between agent, merchant, and vendor systems
- Use case: merchants that want fraud prevention on top of identity verification

---

## Sigilum (PaymanAI)

**Repo:** https://github.com/PaymanAI/sigilum

Auditable identity for AI agents from PaymanAI:
- Agent identity registry
- Spend authorization management
- Audit trail for agent payment actions
- Use case: operators who need auditable records of which agent made which payment decision

---

## KYA design principles for operators

1. **Agent identity is operator accountability.** When an agent makes a payment, the operator is accountable. KYA doesn't transfer accountability — it documents it.

2. **Least-privilege mandate scope.** The KYA credential should encode exactly what the agent is authorized to do, not a superset. Scope creep in credentials is the same as scope creep in mandates — a security risk.

3. **Revocation must be instant.** A KYA credential that cannot be revoked quickly is a liability if the agent is compromised. KYAPay JWT expiry + Skyfire revocation is one pattern; on-chain revocation registries are another.

4. **Cross-border KYA is unsettled.** As of 2026-06, there is no global KYA standard. Skyfire, Visa TAP, and AP2 are competing implementations. Design your architecture to swap identity layers without rebuilding the mandate architecture.

---

**Built on SIP** — Payment Intelligence / research/identity/kya-and-trust.md · v1.0 · SIP v1.1.0 (2026-06-22)
