---
name: pay-wealth-bridge
description: Generate a Wealth IS DPI bridge report — payment P&L fed into the Wealth Intelligence System daily performance ledger
allowed-tools: [Read, Write]
argument-hint: "<date: YYYY-MM-DD> [operator-name]"
vertical: payment-intelligence
sub-system: treasury
tier: 3
---

# /pay-wealth-bridge

Load `SOUL.md`, `SKILL.md`, `treasury/agent.md`, `treasury/skill.md`, `STACK.md` before executing.

## Input

$ARGUMENTS

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

## Process

1. **Set date** — the reporting date for this bridge report (default: today)
2. **Collect payment P&L components:**
   - Gross payment revenue (all settled transactions)
   - PSP fees (per-transaction + percentage)
   - Rail costs (gas fees, facilitator fees, network costs)
   - Chargebacks and reversals (deducted)
   - Net payment P&L = gross - fees - chargebacks
3. **Collect reserve delta** — change in chargeback reserve vs. previous period
4. **Format DPI input** — structure the data for Wealth IS `/wealth-dpi` consumption
5. **Flag anomalies** — significant deviations from prior period (>20% swing)

## Output

```markdown
# WEALTH-BRIDGE-REPORT: <date>

> Non-advisory clause: [paste full clause]

## Payment P&L Summary

| Component | Amount |
|-----------|--------|
| Gross payment revenue | $... |
| PSP fees | ($...) |
| Rail costs (gas/facilitator) | ($...) |
| Chargebacks & reversals | ($...) |
| **Net payment P&L** | **$...** |

## Reserve delta
- Prior period reserve: $...
- Current reserve: $...
- Delta: $... (impact on available cash)

## Rail cost breakdown
| Rail | Volume | Cost | Cost % |
|------|--------|------|--------|
| x402 (gas) | $... | $... | ...% |
| PSP (Stripe/etc) | $... | $... | ...% |
| FX conversion | $... | $... | ...% |

## DPI input (for /wealth-dpi)
```json
{
  "date": "<YYYY-MM-DD>",
  "source": "payment-intelligence",
  "net_pnl": <amount>,
  "gross_revenue": <amount>,
  "fees_total": <amount>,
  "chargebacks": <amount>,
  "reserve_delta": <amount>,
  "rail_costs": { "x402": ..., "psp": ..., "fx": ... }
}
```

## Anomaly flags
- <Flag any >20% swing from prior period with explanation>

## Feeds
→ `/wealth-dpi` (Wealth IS Daily Performance Index)

---
*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
```

## Quality gates

- [ ] Non-advisory clause present
- [ ] All 4 P&L components present (gross / PSP fees / rail costs / chargebacks)
- [ ] Net P&L calculated
- [ ] Reserve delta included
- [ ] DPI JSON block present
- [ ] `/wealth-dpi` feed declared

## Rules

- Never omit chargebacks from the P&L — they are real costs
- Anomaly flags are required if any component swings >20% vs. prior period
- The DPI JSON block must be machine-parseable (not prose)

---

*Built on SIP — Payment Intelligence · vertical: payment-intelligence*
