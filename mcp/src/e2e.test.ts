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
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import type { Mandate } from "./types.js";
import { buildServer, isEntrypoint } from "./index.js";
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

test("E2E: check_spend_cap is not advertised read-only (a within-cap verdict consumes the mandate)", async () => {
  const { client, close } = await connect();
  try {
    const { tools } = await client.listTools();
    const hint = (name: string) => tools.find((t) => t.name === name)?.annotations?.readOnlyHint;
    assert.equal(hint("check_spend_cap"), false);
    assert.equal(hint("verify_mandate"), true);
  } finally {
    await close();
  }
});

test("isEntrypoint matches a launch path with a space and a symlinked launch path", () => {
  const dir = mkdtempSync(join(tmpdir(), "payments entry "));
  try {
    const realDir = join(dir, "real dir");
    mkdirSync(realDir);
    const real = join(realDir, "index.js");
    writeFileSync(real, "");
    const link = join(dir, "payments-mcp");
    symlinkSync(real, link);
    const url = pathToFileURL(real).href; // percent-encodes the space, like import.meta.url

    assert.equal(isEntrypoint(real, url), true);
    assert.equal(isEntrypoint(link, url), true);
    assert.equal(isEntrypoint(join(realDir, "other.js"), url), false);
    assert.equal(isEntrypoint(undefined, url), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("E2E: the stdio server starts when launched through a symlink in a spaced path", async () => {
  const dir = mkdtempSync(join(tmpdir(), "payments launch "));
  try {
    const link = join(dir, "payments-mcp.ts");
    symlinkSync(fileURLToPath(new URL("./index.ts", import.meta.url)), link);
    const child = spawn(process.execPath, ["--import", "tsx", link], {
      cwd: fileURLToPath(new URL("..", import.meta.url)), // resolves `--import tsx` from mcp/node_modules
      env: { ...process.env, PAYMENTS_DATA_DIR: join(dir, "data") },
      stdio: ["pipe", "pipe", "ignore"],
    });
    try {
      const reply = new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("server did not answer initialize")), 10_000);
        child.stdout.once("data", (chunk) => {
          clearTimeout(timer);
          resolve(String(chunk));
        });
        child.once("exit", () => {
          clearTimeout(timer);
          reject(new Error("server exited without answering initialize"));
        });
      });
      child.stdin.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "t", version: "0" } },
        }) + "\n",
      );
      assert.match(await reply, /"serverInfo":\{"name":"payments-mcp"/);
    } finally {
      child.kill();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
