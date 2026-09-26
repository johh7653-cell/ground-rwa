#!/usr/bin/env node
// Start an isolated production server, verify the saved APIs, and stop only our server.
// Run npm run build first. Usage: node scripts/verify-production.mjs [port]
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const projectDir = fileURLToPath(new URL("../", import.meta.url));
const requestedPort = process.argv[2] ?? "4345";
const port = /^\d+$/.test(requestedPort) ? Number(requestedPort) : NaN;
const hasExited = (child) => child.exitCode !== null || child.signalCode !== null;

async function assertFreePort() {
  const probe = createServer();
  await new Promise((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(port, "127.0.0.1", () => probe.close((error) => error ? reject(error) : resolve()));
  }).catch(() => { throw new Error(`Port ${port} is unavailable. Stop its server or choose a different port; this check will not reuse or stop an existing server.`); });
}

async function stop(child) {
  if (!child || hasExited(child)) return;
  child.kill("SIGTERM");
  await Promise.race([once(child, "close").catch(() => {}), delay(2000, undefined, { ref: false })]);
  if (!hasExited(child)) {
    child.kill("SIGKILL");
    await once(child, "close").catch(() => {});
  }
}

let server;
let verification;
let spawnError;
let interrupted;
function interrupt(signal) {
  interrupted = signal;
  verification?.kill("SIGTERM");
  server?.kill("SIGTERM");
}
const onInterrupt = () => interrupt("SIGINT");
const onTerminate = () => interrupt("SIGTERM");
process.once("SIGINT", onInterrupt);
process.once("SIGTERM", onTerminate);

try {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Choose an integer port between 1 and 65535.");
  if (!existsSync(new URL("../.next/BUILD_ID", import.meta.url))) throw new Error("A production build is required. Run npm run build first.");
  await assertFreePort();
  if (interrupted) throw new Error(`Interrupted by ${interrupted}.`);
  const base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, [fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url)), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: projectDir,
    env: { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "inherit",
  });
  server.once("error", (error) => { spawnError = error; });

  const deadline = Date.now() + 30_000;
  let ready = false;
  while (Date.now() < deadline) {
    if (spawnError) throw spawnError;
    if (interrupted) throw new Error(`Interrupted by ${interrupted}.`);
    if (hasExited(server)) throw new Error("The production server exited before it became ready.");
    try {
      const response = await fetch(`${base}/api/assets?limit=1`, { signal: AbortSignal.timeout(3000), redirect: "error" });
      if (response.ok) {
        const body = await response.json();
        if (body.mode === "archive" && body.assets?.length === 1) { ready = true; break; }
      }
    } catch { /* Startup can briefly refuse connections; retry within the deadline. */ }
    await delay(250);
  }
  if (!ready) throw new Error("The production archive API did not become ready within 30 seconds.");
  if (interrupted) throw new Error(`Interrupted by ${interrupted}.`);

  console.log(`Production API ready at ${base}; running read-only archive verification.`);
  verification = spawn(process.execPath, [fileURLToPath(new URL("./verify-catalogue-api.mjs", import.meta.url)), base], { cwd: projectDir, stdio: "inherit" });
  const [code, signal] = await once(verification, "close");
  if (code !== 0) throw new Error(`Archive verification failed (${signal ?? `exit ${code}`}).`);
} catch (error) {
  console.error(`FAIL · ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = interrupted === "SIGINT" ? 130 : interrupted === "SIGTERM" ? 143 : 1;
} finally {
  await stop(verification);
  await stop(server);
  process.removeListener("SIGINT", onInterrupt);
  process.removeListener("SIGTERM", onTerminate);
}
