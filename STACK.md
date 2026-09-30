# STACK — Payment Intelligence Composition Declarations

> Where this system sits, what it composes with, and what it does not claim to be.

---

## Position in the Starlight stack

```
Starlight Orchestrator (master layer)
└── Wealth IS (universal IS)
    ├── Crypto IS (domain sub-stack, sibling)
    └── Payment IS (domain sub-stack, this system)
        ├── Rails sub-system
        ├── Mandates & Authorization sub-system
        ├── Commerce & Checkout sub-system
        ├── Treasury & Wallets sub-system
        ├── Compliance & Tax sub-system
        └── Ops & Continuity sub-system
```

---

## Composes-with declarations

### Composes-with: Wealth IS / DPI ledger

**Direction:** Payment IS Treasury → Wealth IS DPI ledger

Payment IS Treasury sub-system produces treasury designs, float plans, and reconciliation outputs. These feed Wealth IS DPI (Digital Portfolio Intelligence) ledger via `/pay-wealth-bridge` → `/wealth-dpi`. Settlement data, float balances, and reconciled transaction records become inputs to the Wealth IS capital accounting layer.

### Composes-with: Wealth IS / Thesis engine

**Direction:** Payment IS Compliance + Mandates → Wealth IS Thesis engine

Payment mandate architecture (spend caps, authorization scope, agent accountability) is documented as a capital-control layer within the Wealth IS thesis for operators who hold significant treasury value. Compliance maps feed risk disclosures in wealth thesis outputs.

### Composes-with: Crypto IS (sibling)

**Direction:** Bidirectional, namespaced

Crypto IS custody and wallet patterns inform Payment IS treasury architecture for the crypto-rail path. Payment IS rail selection matrix references crypto rail options (on-chain, stablecoin, Lightning) that compose with Crypto IS House of On-Chain and House of Sovereignty. Namespaced: `/pay-*` vs `/crypto-*` — no command namespace collision.

---

## Does not compose with (at v1.0)

- Investment IS (not yet scaffolded)
- Real Estate IS (not yet scaffolded)
- Health IS (no payment intersection at v1.0)
- People IS (no payment intersection at v1.0)

---

## Substrate contract

Payment Intelligence is a SIP-conformant Domain Sub-Stack. It inherits:
- Sovereignty clause: non-waivable, cannot be delegated to any sub-agent
- Attestation: "Built on SIP" in every artifact
- Frank DNA: voice, vibe, evidence standards
- Non-advisory clause: financial/legal/tax gate on every output

It does NOT inherit:
- Arcanea canon (no archetypal naming, no mythology references)
- Crypto IS "Houses" naming (uses functional sub-system naming per decision 2026-06-22)
- Starlight Council governance (standalone sub-stack; board-gate applies to substrate changes, not sub-stack operations)

---

**Built on SIP** — Payment Intelligence STACK.md · v1.0 · SIP v1.1.0 (2026-06-22)
