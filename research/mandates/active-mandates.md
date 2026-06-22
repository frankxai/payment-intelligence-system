# Research — Active Mandates

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

---

## What

Active Mandates is the lifecycle model for autonomous payment authorization capsules used by multi-agent payment systems. An Active Mandate packages spend caps, time windows, merchant restrictions, and cryptographic signing into a single authorization object that can be created, activated, consumed, and revoked in a fully auditable lifecycle.

The concept is implemented by several frameworks (AP2, Agentic Payments MCP server, Skyfire) with varying terminology but consistent lifecycle structure.

## Lifecycle

### 1. Create
```
mcp__agentic-payments__create_active_mandate({
  agent_id: "shopping-bot@tenant",
  holder_id: "operator@example.com",
  amount_cents: 50000,     // $500 per period
  currency: "USD",
  period: "daily",         // daily | weekly | monthly
  kind: "intent",          // intent | cart | subscription
  merchant_restrictions: ["amazon.com", "shopify-store.com"],
  expires_at: "2026-12-31T23:59:59Z"
})
```

### 2. Sign (Ed25519)
```
mcp__agentic-payments__sign_mandate({
  mandate_id: "mandate_abc123",
  private_key_hex: "ed25519_private_key"
})
```

### 3. Authorize a payment
```
mcp__agentic-payments__authorize_payment({
  mandate_id: "mandate_abc123",
  amount_cents: 2999,       // $29.99
  merchant: "amazon.com",
  description: "Book purchase",
  metadata: { order_id: "ord_123" }
})
```

### 4. Consensus (for high-value transactions)
```
mcp__agentic-payments__request_consensus({
  payment_id: "pay_abc123",
  required_agents: ["purchasing", "finance", "compliance"],
  threshold: 2,             // 2 of 3 must approve
  timeout_seconds: 300
})
```

### 5. Revoke (instant)
```
mcp__agentic-payments__revoke_mandate({
  mandate_id: "mandate_abc123",
  reason: "User requested cancellation"
})
```

## Security properties

- **Ed25519 signatures:** <1ms offline verification; tamper-evident
- **Byzantine fault tolerance:** Consensus threshold prevents single compromised agent from authorizing high-value payments
- **Spend caps enforced at authorization time:** Real-time balance check; no overdraft
- **Merchant restrictions via allowlist/blocklist:** Granular per-mandate control
- **Time-based expiration:** Mandate cannot be used outside its active window
- **Instant revocation:** Revocation takes effect immediately; in-flight transactions can be configured to fail-closed
- **Audit trail:** All mandate lifecycle events logged with timestamps and agent identities

## Refusal patterns

- No mandate without spend cap — unbounded mandates are security vulnerabilities
- No mandate without time window — open-ended mandates accumulate risk
- No consensus bypass for high-value transactions — single-approver above threshold is refused
- No mandate without tested revocation path — revoke drill required before production activation

## Sources

- ACOS agentic-payments agent: frankxai/agentic-creator-os `.claude/agents/payments/agentic-payments.md`
- AP2 mandate specification: https://github.com/google-agentic-commerce/AP2

---

**Built on SIP** — Payment Intelligence / research/mandates/active-mandates.md · v1.0 · SIP v1.1.0 (2026-06-22)
