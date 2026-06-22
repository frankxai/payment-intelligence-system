# Research — Provider Toolkits Landscape

> **Non-advisory clause:** This is system architecture, not financial, legal, or tax advice. PSP terms of service and jurisdiction-specific counsel govern instruments; the operator accepts settlement and regulatory risk; the substrate accepts no claim.

Survey of official provider toolkits, SDKs, and MCP servers that give AI agent frameworks payment capabilities out of the box. Verified as of 2026-06.

---

## Stripe AI

**Repo:** https://github.com/stripe/ai

Official Stripe monorepo for AI integrations:
- **`@stripe/agent-toolkit`** — function-calling SDK for LangChain, Vercel AI SDK, OpenAI Agents SDK, and Claude. Payment creation, customer management, subscription handling, metered billing.
- **Stripe MCP server** — available at `mcp.stripe.com` (remote) or `npx @stripe/mcp` (local). Restricted-key permission control. Documented at https://docs.stripe.com/mcp.
- **Machine Payments Protocol (MPP)** — session-based agent payments (Mar 2026, see research/rails/stripe-mpp.md)
- **Claude skills** — `stripe-best-practices`, `stripe-directory`, `stripe-projects`, `upgrade-stripe` (installable via Claude Code)

---

## PayPal Agent Toolkit

**Repo:** https://github.com/paypal/agent-toolkit

Official PayPal toolkit for AI agents:
- **30+ MCP tools** as of 2026-06: payments, invoices, disputes, subscriptions, transaction reports, payout, orders
- **Framework support:** OpenAI Agents SDK, LangChain, Vercel AI SDK, Model Context Protocol
- **PayPal MCP server:** `paypal/agent-toolkit/tree/main/modelcontextprotocol`
- **Capability highlights:** Create orders, capture payments, create/manage invoices, handle disputes, manage subscriptions, send payouts

---

## Coinbase AgentKit

**Repo:** https://github.com/coinbase/agentkit

Framework-agnostic crypto wallet and on-chain actions for AI agents:
- Provides every agent with a custodial or non-custodial crypto wallet
- On-chain actions: send, receive, swap, stake, deploy contracts
- Framework adapters: LangChain, Vercel AI SDK, OpenAI Agents SDK, MCP
- Chains supported: Base (primary), Ethereum, other EVM chains
- Used as the default wallet layer for x402 facilitator payments

---

## GOAT SDK

**Repo:** https://github.com/goat-sdk/goat

Agentic finance toolkit with 100+ plugins:
- Payments, swaps, staking, NFTs, DeFi protocols
- EVM and Solana support
- Adaptable to any agent framework
- Plugin categories: DEX (Uniswap, Orca), lending (Aave, Compound), payments (USDC transfer, ERC-20), commerce, NFT

---

## Amazon Bedrock AgentCore Payments

**Product page:** https://aws.amazon.com/bedrock/agentcore/

AWS preview service (Apr 2026) for agent payment capabilities:
- Managed payment credential store for Bedrock agents
- **Integrations:** Coinbase (crypto wallet + on-chain) and Stripe (fiat payments)
- Agents can make purchases and API calls without the developer managing credentials directly
- Part of Amazon Bedrock AgentCore (broader agent infrastructure platform)
- Status as of 2026-06: Preview/limited availability

---

## Nevermined Payments

**Repos:** https://github.com/nevermined-io/payments (TypeScript) / https://github.com/nevermined-io/payments-py (Python)

Credit-based pricing for agent commerce:
- Credit/subscription plans for API and service monetization
- Fiat and crypto checkout
- Built-in MCP tool, resource, and prompt pricing
- A2A integration
- Use case: monetize MCP servers on a per-call credit basis

---

## Crossmint Checkout MCP

**Repo:** https://github.com/Crossmint/mcp-crossmint-checkout

Headless checkout MCP server:
- Purchase physical and digital goods via Crossmint's checkout
- NFT minting, physical goods purchase, crypto payment
- MCP tool interface for agent-driven purchasing

---

**Built on SIP** — Payment Intelligence / research/toolkits/landscape.md · v1.0 · SIP v1.1.0 (2026-06-22)
