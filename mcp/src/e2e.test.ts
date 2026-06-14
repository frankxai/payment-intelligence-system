/**
 * End-to-end MCP integration test.
 *
 * ⚠️ v0.2 scaffold. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * Starts the verify-only Payments server IN-PROCESS (against a temp data dir) and
 * drives it through a real SDK client over an InMemoryTransport pair. Proves:
 *   - exactly the 4 verify-only tools are exposed, and NONE is a transfer/pay/
 *     settle/move tool (the defining invariant — no money-movement surface exists);
 *   - a valid Ed25519 mandate → verified;
 *   - a forged mandate → REJECT;
 *   - an over-cap charge → ESCALATE (never auto-approved);
 *   - a replayed mandate → REJECT.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import type { Mandate } from "./types.js";
import { buildServer } from "./index.js";
import { signMandate } from "./signature.js";

const HOUR = 60 * 60 * 1000;

function future(): number {
  return Date.now() + HOUR;
}

function devMandate(overrides: Partial<Mandate> = {}): Mandate {
  const base: Omit<Mandate, "signature"> = {
    mandateId: `m_${Math.random().toString(36).slice(2)}`,
    subject: "stream:payments",
    amount: 49.0,
    currency: "EUR",
    expiresAt: future(),
    issuerKeyId: "k_dev",
    ...overrides,
  };
  return { ...base, signature: signMandate(base) };
}

/** Connect a fresh in-process client+server pair against a temp data dir. */
async function connect(): Promise<{ client: Client; dir: string; close: () => Promise<void> }> {
  const dir = mkdtempSync(join(tmpdir(), "payments-e2e-"));
  const server = buildServer({ dataDir: dir });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "payments-e2e", version: "0.2.0" });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return {
    client,
    dir,
    close: async () => {
      await client.close();
      await server.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

/** Pull the structured verdict out of a callTool result. */
function verdictOf(result: unknown): string {
  const sc = (result as { structuredContent?: { verdict?: string } }).structuredContent;
  assert.ok(sc, "expected structuredContent on the tool result");
  return String(sc!.verdict);
}

test("E2E: exactly the 4 verify-only tools exist; NONE moves money", async () => {
  const { client, close } = await connect();
  try {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    assert.deepEqual(names, [
      "check_spend_cap",
      "record_audit_entry",
      "require_human_approval",
      "verify_mandate",
    ]);
    // The defining invariant: no settlement surface exists.
    const forbidden = /transfer|pay|settle|move|send|withdraw|disburse|payout/i;
    for (const n of names) {
      assert.ok(!forbidden.test(n), `forbidden money-movement tool exposed: ${n}`);
    }
  } finally {
    await close();
  }
});

test("E2E: a valid Ed25519 mandate → verified", async () => {
  const { client, close } = await connect();
  try {
    const m = devMandate();
    const res = await client.callTool({
      name: "verify_mandate",
      arguments: {
        mandate: m,
        charge: { mandateId: m.mandateId, amount: m.amount, currency: m.currency, stream: "payments" },
      },
    });
    assert.equal(verdictOf(res), "verified");
  } finally {
    await close();
  }
});

test("E2E: a forged mandate → reject", async () => {
  const { client, close } = await connect();
  try {
    const m = devMandate();
    const forged: Mandate = { ...m, signature: Buffer.alloc(64, 9).toString("base64") };
    const res = await client.callTool({
      name: "verify_mandate",
      arguments: {
        mandate: forged,
        charge: { mandateId: forged.mandateId, amount: forged.amount, currency: forged.currency, stream: "payments" },
      },
    });
    assert.equal(verdictOf(res), "reject");
  } finally {
    await close();
  }
});

test("E2E: an over-cap charge → escalate (never auto-approved)", async () => {
  const { client, close } = await connect();
  try {
    const res = await client.callTool({
      name: "check_spend_cap",
      arguments: {
        charge: { mandateId: "m_overcap", amount: 5000, currency: "EUR", stream: "payments" },
        caps: { perTransaction: 500, perDay: 1000, perStream: 2000 },
      },
    });
    assert.equal(verdictOf(res), "escalate");
  } finally {
    await close();
  }
});

test("E2E: a replayed mandate → reject", async () => {
  const { client, close } = await connect();
  try {
    const caps = { perTransaction: 500, perDay: 1000, perStream: 2000 };
    const charge = { mandateId: "m_e2e_replay", amount: 100, currency: "EUR", stream: "payments" };

    // First spend consumes the mandate (within cap).
    const first = await client.callTool({ name: "check_spend_cap", arguments: { charge, caps } });
    assert.equal(verdictOf(first), "within-cap");

    // Replay of the same mandate id is rejected.
    const replay = await client.callTool({ name: "check_spend_cap", arguments: { charge, caps } });
    assert.equal(verdictOf(replay), "reject");
  } finally {
    await close();
  }
});

test("E2E: require_human_approval returns a PENDING object, never approved", async () => {
  const { client, close } = await connect();
  try {
    const res = await client.callTool({
      name: "require_human_approval",
      arguments: {
        charge: { mandateId: "m_pa", amount: 5000, currency: "EUR", stream: "payments" },
        reason: "over per-transaction cap",
      },
    });
    const sc = (res as { structuredContent?: Record<string, unknown> }).structuredContent;
    assert.ok(sc);
    assert.equal(sc!.status, "pending-human-approval");
    assert.equal((sc as { approved?: unknown }).approved, undefined);
  } finally {
    await close();
  }
});

test("E2E: record_audit_entry appends and a missing action FAILS CLOSED", async () => {
  const { client, close } = await connect();
  try {
    const ok = await client.callTool({
      name: "record_audit_entry",
      arguments: { action: "verify_mandate", verdict: "verified" },
    });
    assert.equal((ok as { structuredContent?: { recorded?: boolean } }).structuredContent?.recorded, true);

    // Missing action → the tool reports an error result (action must not proceed).
    const bad = await client.callTool({
      name: "record_audit_entry",
      arguments: { action: "" },
    });
    assert.equal((bad as { isError?: boolean }).isError, true);
  } finally {
    await close();
  }
});
