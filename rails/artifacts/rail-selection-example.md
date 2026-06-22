# RAIL-SELECT Example: API Monetization — Pay-per-Token LLM Endpoint

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

**Context provided:**
- Use case: LLM inference API, pay-per-1K-tokens
- Transaction size: $0.001–$0.10 per call (micropayment)
- Counterparty: M2M (agent calling another agent's API)
- Settlement: Instant (API should gate on payment confirmation)
- Trust model: Cryptographic (no PSP relationship required)
- Jurisdiction: Global

---

## Selected rail: x402

**Mechanism (6 steps):**
1. Agent client requests `/v1/completions` without payment
2. API server returns `402 Payment Required` with `X-Payment-Required` header
3. Header body: `{"scheme":"exact","network":"base","maxAmountRequired":"100","resource":"/v1/completions","description":"LLM inference — 1K tokens"}`
4. Client signs payment transaction on Base L2 via Coinbase facilitator
5. Client retries request with `X-Payment` header containing signed transaction
6. Server validates on-chain, returns `200 OK` with completion response

**Fit rationale:**

| Axis | Score | Reasoning |
|------|-------|----------|
| Transaction size | ✅ | Sub-cent to low-dollar micropayments — x402 handles $0.001+ |
| Counterparty | ✅ | M2M — no human checkout flow required |
| Settlement | ✅ | <500ms authorization, 12-18s on-chain finality — acceptable for API |
| Trust model | ✅ | Cryptographic (no PSP relationship required) |
| Jurisdiction | ✅ | Global via Base L2 |

**Downstream dependencies:**
- Coinbase facilitator account (or self-hosted facilitator via x402 CDK)
- Base L2 wallet on client side (or wallet abstraction via `@coinbase/x402`)
- `@coinbase/x402` SDK on server: `npm install @coinbase/x402`

**Why not L402:**
L402 requires Lightning node on client side. Most agent runtimes (LangChain, Claude agents, Magentic-One) do not have native Lightning support. x402 is more broadly supported.

**Why not Stripe MPP:**
MPP requires pre-authorized session envelope — adds friction for pure API monetization where the payer may not be known in advance. MPP fits better for session-based agentic applications with a known operator.

**Why not ACH/SEPA:**
Batch settlement is incompatible with real-time API gating. Chargeback risk for sub-cent micropayments is unworkable.

---

## Implementation sketch

```typescript
import { wrapWithPaymentHandler } from '@coinbase/x402/middleware';

// Wrap Express route with x402 payment gate
app.use('/v1/completions', wrapWithPaymentHandler({
  scheme: 'exact',
  network: 'base-mainnet',
  maxAmountRequired: '100', // $0.001 in USDC units (6 decimal)
  description: 'LLM inference — 1K tokens',
  recipient: process.env.PAYMENT_ADDRESS,
}));
```

**Monitoring:** Track `X-Payment-Response` headers for payment confirmations. Log `paymentId` against request ID for audit trail.

---

*Built on SIP — Payment Intelligence rails/artifacts/rail-selection-example.md · v1.0 · vertical: payment-intelligence*
