# Rails Knowledge

> Reference knowledge for the Rails sub-system. Mechanism deep-dives, specification pointers, and integration patterns.

---

## HTTP-Native Rails: The x402 Family

### x402 — the reference implementation

**Spec origin:** Coinbase, open-sourced 2025. x402 Foundation (Visa, Mastercard, Stripe, Google, Cloudflare, Coinbase) formed 2026.

**6-step payment flow:**
1. Client makes HTTP request without payment
2. Server responds `402 Payment Required` with `X-Payment-Required` header (JSON body: scheme, network, amount, recipient, resource)
3. Client reads payment details, constructs `X-Payment` header with signed transaction
4. Client retries request with `X-Payment` header
5. Server validates payment on-chain via Coinbase facilitator (Base L2)
6. Server returns `200 OK` with `X-Payment-Response` header confirming receipt

**As of 2026-06:** ~165M transactions processed. Foundation members: Visa, Mastercard, Stripe, Google, Cloudflare, Coinbase.

**Latency profile:** <500ms authorization (facilitator), 12-18 seconds on-chain finality (Base L2).

**SDK surface:** `@coinbase/x402` (TypeScript), `x402-go`, `x402-python`. CDK at `x402.org`.

### L402 — Lightning micropayments

**Origin:** Lightning Labs, built on Lightning Network + BOLT11 invoices + macaroon authentication tokens.

**Flow:**
1. Server issues BOLT11 invoice + macaroon preimage
2. Client pays invoice via Lightning node
3. Client presents preimage as Bearer credential
4. Server validates preimage, grants access

**Strengths:** Sub-cent micropayments, streaming micropayments (pay-per-token), no on-chain finality wait.

**Limitations:** Requires Lightning node on client side (or LSP). Not suitable for large amounts (channel liquidity caps).

### H402 — PSP-agnostic HTTP 402

**Origin:** bit-gpt. PSP-agnostic implementation of HTTP 402 pattern.

**Differentiator:** Backend-configurable PSP (Stripe, PayPal, or custom). No native crypto requirement. Drop-in for existing web infrastructure.

### Stripe MPP — Machine Payment Protocol

**Released:** March 2026.

**Mechanism:** Pre-authorized session envelope. Before an agentic session starts, the operator creates a session with a spend cap. Each tool call within the session charges against the pre-authorized envelope. Settlement is metered at T+2.

**Integration surface:**
- `@stripe/agent-toolkit` — native MCP tools for Stripe operations
- Stripe MCP server — `npx @stripe/mcp --api-key <key>`
- Pairs with ACP (Agentic Commerce Protocol) for checkout flows

**Limits:** Stripe-bound PSP. No on-chain settlement. Not suitable for cross-border where Stripe is unavailable.

---

## Card-Network Rails

### Mastercard Agent Pay (Apr 2025)

**Credential type:** SD-JWT (Selective Disclosure JWT) verifiable credential.

**Mandate types:**
- **Intent mandate** — authorized for a class of purchases (e.g., "grocery under $200")
- **Cart mandate** — authorized for a specific shopping cart at point of sale

**Signing:** Ed25519 via SD-JWT selective disclosure. Agent presents only the fields required for the transaction.

### Agent Pay for Machines (Jun 2026)

M2M extension. Machine identity replaces human cardholder credential. Enables agent-to-agent payment without human in the loop at transaction time.

### Visa Intelligent Commerce + TAP

**Technical foundation:** RFC 9421 HTTP Message Signatures.

**TAP (Trusted Agent Protocol):**
- Public key registry (centralized per-agent key management)
- Ed25519 signing of payment requests
- Forter TACP on top for fraud prevention

---

## API Mandate Rails

### Google AP2 (Agent Payments Protocol)

**Mechanism:** Ed25519 signed mandate objects. Operator creates mandate; agent signs payment requests against mandate.

**As of 2026-06:** 60+ integration partners.

**Mandate types:** intent (purchase class), cart (specific transaction).

**Byzantine consensus:** Built-in threshold consensus for high-value transactions. Configurable quorum (2-of-3, 3-of-5, etc.).

---

## Commerce Protocols (Checkout Layers, Not Rails)

### ACP — Agentic Commerce Protocol

OpenAI + Stripe. Two specs:
- **Agentic Checkout** — agent-initiated purchase flow
- **Delegate Payment** — human delegates payment authority to agent

ChatGPT Instant Checkout is the reference implementation. Stripe-bound PSP.

### UCP — Universal Commerce Protocol

Google + Shopify. PSP-agnostic. Agent checkout across any PSP that implements UCP.

Shopify UCP CLI: `shopify ucp install`. JS and Python SDKs available.

---

## Settlement Speed Reference

| Rail | Authorization | Settlement |
|------|--------------|------------|
| x402 | <500ms | 12-18s (Base L2) |
| L402 | <100ms | <1s (Lightning) |
| Stripe MPP | <200ms | T+2 |
| Mastercard Agent Pay | <300ms | T+1 |
| Visa IC | <300ms | T+1 |
| AP2 | <200ms | Depends on downstream rail |
| SEPA Instant | <10s | <10s |
| ACH Same Day | <1s auth | T+1 |
| Stablecoin (Base) | <500ms | 12-18s |

*All times as of 2026-06. Settlement times vary by network conditions.*

---

*Built on SIP — Payment Intelligence rails/knowledge.md · v1.0 · vertical: payment-intelligence*
