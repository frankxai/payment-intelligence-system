---
name: pay-monetize-endpoint
description: Design payment gating for an API or MCP endpoint — rail selection, gate implementation, metering
allowed-tools: [Read, Write]
argument-hint: "<endpoint-path or tool-name> [pricing-model] [expected-txn-size]"
vertical: payment-intelligence
sub-system: commerce
tier: 2
---

# /pay-monetize-endpoint

Load `SOUL.md`, `SKILL.md`, `commerce/agent.md`, `commerce/skill.md`, `rails/agent.md`, `research/mandates/a2a-x402.md`, `research/toolkits/landscape.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Parse endpoint** — path, tool name, what it does, expected caller (agent / human / both)
2. **Select pricing model** — pay-per-call / pay-per-token / session-based / subscription; determine from arguments or ask
3. **Select rail** — run mini rail selection: micropayment → x402; session → MPP; streaming → L402; subscription → Active Mandate
4. **Design the gate** — show the middleware/wrapper implementation
5. **Metering spec** — what gets measured, how, and where it’s stored
6. **Failure mode** — what happens when payment fails (401/402/service error)

## Output

```markdown
# ENDPOINT-MONETIZATION: <endpoint>

> Non-advisory clause: [paste full clause]

## Endpoint profile
- Path/tool: ...
- Caller type: agent | human | both
- Pricing model: pay-per-call | pay-per-token | session | subscription

## Rail selection
- Selected: ...
- Rationale: ...

## Gate implementation
```<language>
// <implementation sketch>
```

## Metering spec
- Unit: call | token | second | ...
- Storage: ...
- Reporting: ...

## Failure mode
- Payment missing: return 402 with X-Payment-Required header
- Payment invalid: return 402 with error detail
- Payment timeout: return 503 with retry-after header

## MCP tool definition (if applicable)
```json
{
  "name": "<tool_name>",
  "description": "<description> [Requires payment: $X per call via x402]",
  "inputSchema": { ... }
}
```

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] Rail selected with rationale
- [ ] Gate implementation shown (not just described)
- [ ] Failure mode specified for all 3 cases (missing / invalid / timeout)
- [ ] MCP tool definition included if endpoint is an MCP tool

## Rules

- Never recommend x402 for subscription-based access without noting state management complexity
- Always include the 402 failure response in the gate design

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
