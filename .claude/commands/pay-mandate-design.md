---
name: pay-mandate-design
description: Design a complete Active Mandate for a specific agent — spend caps, time windows, merchant rules, signing, consensus tier, revocation path
allowed-tools: [Read, Write]
argument-hint: "<agent-name> <use-case> [budget] [period]"
vertical: payment-intelligence
sub-system: mandates
tier: 1
---

# /pay-mandate-design

Load `SOUL.md`, `SKILL.md`, `mandates/agent.md`, `mandates/skill.md`, `frameworks/mandate-design-checklist.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse agent profile** — extract: agent name/ID, use case, operator identity, required budget and period
2. **Walk the checklist** — run all 10 sections of `frameworks/mandate-design-checklist.md`:
   - Scope definition (agent_id, holder_id, mandate type, purpose)
   - Spend caps (per-transaction, period, lifetime)
   - Time windows (activation, expiration, operating window, renewal)
   - Merchant/counterparty restrictions
   - Cryptographic signing (algorithm, key storage, offline verification)
   - Byzantine consensus tier (threshold amount, quorum, timeout, failure mode)
   - Revocation path (endpoint, propagation time, drill schedule, emergency procedure)
   - KYA/KYC requirements
   - Rail compatibility
   - Compliance flags
3. **Generate mandate spec** — emit the complete `create_active_mandate` parameters
4. **Sign spec** — show the `sign_mandate` call shape
5. **Pre-production gate** — walk the pre-production checklist from the design checklist

## Output

```markdown
# MANDATE-DESIGN: <agent-name>

> Non-advisory clause: [paste full clause]

## Agent profile
- Agent ID: ...
- Holder: ...
- Use case: ...
- Mandate type: intent | cart | subscription

## Mandate parameters
```javascript
mcp__agentic-payments__create_active_mandate({
  agent_id: "...",
  holder_id: "...",
  amount_cents: ...,
  currency: "...",
  period: "...",
  kind: "...",
  merchant_restrictions: [...],
  expires_at: "..."
})
```

## Signing
```javascript
mcp__agentic-payments__sign_mandate({
  mandate_id: "<mandate_id>",
  private_key_hex: "<ed25519_private_key>"
})
```

## Consensus policy
- Threshold amount: $...
- Quorum: N-of-M
- Required agents: [...]
- Timeout: ...s

## Revocation path
- Endpoint: ...
- Propagation time: ...
- Drill schedule: ...
- Emergency: ...

## Compliance flags
- KYA requirement: ...
- Jurisdiction: ...

## Pre-production gate
- [ ] Spend cap verified
- [ ] Revocation path tested
- [ ] Ed25519 key stored in HSM/secure enclave
- [ ] Consensus quorum configured
- [ ] KYA check integrated at authorization time

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] Spend cap is explicit (no unbounded mandates)
- [ ] Revocation path is fully specified
- [ ] Ed25519 signing call included
- [ ] Consensus policy configured (even if threshold is high)
- [ ] KYA requirement addressed
- [ ] Pre-production checklist present

## Rules

- Refuse to emit a mandate design without a spend cap
- Refuse to emit a mandate design without a revocation path
- If merchant_restrictions is empty, require explicit operator confirmation before proceeding

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
