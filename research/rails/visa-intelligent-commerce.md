# Research — Visa Intelligent Commerce + Trusted Agent Protocol

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

---

## What

**Visa Intelligent Commerce (IC)** is Visa's program for enabling AI agent purchases at Visa-accepting merchants. The **Trusted Agent Protocol (TAP)** is the technical standard within Visa IC that uses RFC 9421 HTTP Message Signatures to verify agent identity and bind purchase intent to transactions. Forter's Trusted Agentic Commerce Protocol (TACP) sits on top for merchant-side fraud prevention.

## Who

Developer: **Visa**. TAP is Visa's implementation on top of RFC 9421 (IETF HTTP Message Signatures standard). Forter TACP is a companion protocol from Forter (fraud prevention company) that extends TAP for merchant fraud screening.

## Mechanism

**Visa Trusted Agent Protocol (TAP):**

1. Agent is provisioned with a signing key pair; public key registered with Visa TAP registry
2. At checkout, agent signs the HTTP request carrying purchase intent using Ed25519 (per RFC 9421)
3. Signature covers: request method, path, body, timestamp, and purchase metadata
4. Merchant receives the signed request and the agent's public key reference
5. Merchant (or merchant's processor) verifies the signature against the Visa TAP registry
6. Visa network processes the authorization with TAP attestation attached
7. Settlement: standard Visa T+1/T+2 card rails

**RFC 9421 (HTTP Message Signatures):** IETF standard for signing HTTP requests and responses. TAP is an application of RFC 9421 to agentic payment authorization.

**Forter TACP:**

Sits above TAP. Adds:
- Agent behavioral fingerprinting (pattern analysis across agent sessions)
- Merchant-side risk scoring on agent transactions
- Data-encrypted communication between agents, merchants, and merchant vendors

## When to choose

- Agent shopping at Visa-accepting merchants (broad coverage)
- You need IETF-standard identity verification (RFC 9421) at the network level
- Merchant already uses Forter for fraud prevention and wants TACP integration
- Cardholder/operator wants W3C/IETF-standard proof of agent authorization

**Not for:** M2M API payments (use x402), non-Visa markets, stablecoin settlement.

## Verified facts as of 2026-06

- **TAP basis:** RFC 9421 — HTTP Message Signatures (IETF, published April 2024)
- **Signature scheme:** Ed25519 (per RFC 9421 recommendations)
- **Visa TAP registry:** Centralized public key registry for agent identity verification
- **Forter TACP:** https://github.com/forter/trusted-agentic-commerce-protocol
- **Visa TAP documentation:** https://developer.visa.com/capabilities/trusted-agent-protocol
- **Settlement:** Standard Visa card rails (T+1/T+2)

## Sources

- Visa TAP: https://developer.visa.com/capabilities/trusted-agent-protocol
- RFC 9421: https://www.rfc-editor.org/rfc/rfc9421
- Forter TACP: https://github.com/forter/trusted-agentic-commerce-protocol

---

**Built on SIP** — Payment Intelligence / research/rails/visa-intelligent-commerce.md · v1.0 · SIP v1.1.0 (2026-06-22)
