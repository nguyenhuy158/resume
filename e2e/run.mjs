// One-command E2E: start `wrangler dev` -> run the smoke suite -> stop it.
//
// Environment:
// - E2E_PORT: port for wrangler dev (default 8793, off `pnpm dev`'s 8787 so
//   both can run side by side)
import { spawn } from "node:child_process";

const PORT = process.env.E2E_PORT || "8793";
const BASE = `http://127.0.0.1:${PORT}`;
const SERVER_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 500;

/** Runs a command to completion; rejects on a non-zero exit. */
function run(command, args, label, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", env });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${label} failed (exit ${code})`))));
  });
}

/** Waits until the server answers /, or throws once the deadline passes. */
async function waitForServer(child) {
  const deadline = Date.now() + SERVER_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`wrangler dev exited early (exit ${child.exitCode})`);
    try {
      if ((await fetch(`${BASE}/`)).ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`wrangler dev not up after ${SERVER_TIMEOUT_MS}ms`);
}

const server = spawn("pnpm", ["exec", "wrangler", "dev", "--ip", "127.0.0.1", "--port", PORT], {
  stdio: ["ignore", "inherit", "inherit"],
  env: { ...process.env, CI: "1" },
  detached: true,
});

/** Signals the server's whole process group; a group that is already gone is fine. */
function stopServer(signal) {
  try {
    process.kill(-server.pid, signal);
  } catch {
    // Already exited.
  }
}

// Ctrl-C must not leave wrangler holding the port either.
process.on("SIGINT", () => {
  stopServer("SIGKILL");
  process.exit(130);
});

let failed = false;
try {
  await waitForServer(server);
  console.log(`\nServer ready at ${BASE}\n`);
  await run("node", ["e2e/readonly-smoke.mjs"], "smoke", { ...process.env, E2E_BASE_URL: BASE });
} catch (error) {
  failed = true;
  console.error("E2E FAIL:", error.message);
} finally {
  // pnpm -> wrangler -> workerd: signal the whole process group (the server was
  // spawned detached), or the grandchildren outlive this script and hold the port.
  stopServer("SIGTERM");
  // Give wrangler time to clean up, then force it so the process never hangs.
  const stopped = await Promise.race([
    new Promise((resolve) => server.once("exit", () => resolve(true))),
    new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
  ]);
  if (!stopped) stopServer("SIGKILL");
}

process.exit(failed ? 1 : 0);
