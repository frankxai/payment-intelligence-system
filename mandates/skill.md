---
name: mandates-skill
vertical: payment-intelligence
sub-system: mandates
version: 1.0
---

# Mandates Skill

Auto-activates when mandate design, authorization, consensus, or revocation questions are detected.

## Activation triggers

- Keywords: mandate, Ed25519, Byzantine consensus, spend cap, revocation, AP2, active mandate, intent mandate, cart mandate, SD-JWT, KYA, KYAPay, signing key
- Commands: `/pay-mandate-design`, `/pay-mandate-audit`, `/pay-consensus-policy`, `/pay-revocation-drill`
- Context: designing agent payment authorization architecture, configuring multi-agent consensus

## Loading sequence

```
Load SOUL.md → SKILL.md → mandates/agent.md → mandates/skill.md → [command]
```

## Invariants

1. Every mandate must have a spend cap — unbounded mandates refused
2. Every mandate must have a revocation path — non-negotiable
3. Cryptographic signing is required — no trust-based authorization
4. Consensus thresholds must be configured before deployment
5. Non-advisory clause opens every artifact

## Knowledge sources

- `research/mandates/` — 4 research docs (AP2, Active Mandates, KYAPay, A2A x402)
- `frameworks/mandate-design-checklist.md` — 10-section design checklist
- `mandates/agent.md` — toolkit and lifecycle

## Output artifacts

| Command | Artifact |
|---------|----------|
| `/pay-mandate-design` | MANDATE-DESIGN: \<agent-name\> |
| `/pay-mandate-audit` | MANDATE-AUDIT: \<mandate-id\> |
| `/pay-consensus-policy` | CONSENSUS-POLICY: \<system-name\> |
| `/pay-revocation-drill` | REVOCATION-DRILL: \<agent-name\> |

---

*Built on SIP — Payment Intelligence mandates/skill.md · v1.0 · vertical: payment-intelligence*
