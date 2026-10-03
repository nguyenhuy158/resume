// One-command E2E: start `wrangler dev` -> run the smoke suite -> stop it.
//
// Environment:
// - E2E_PORT: port for wrangler dev (default 8793, off `pnpm dev`'s 8787 so
//   both can run side by side)
import { run, startServer } from "@huyab/e2e";

const PORT = process.env.E2E_PORT || "8793";
const BASE = `http://127.0.0.1:${PORT}`;

let failed = false;
let server;
try {
  server = await startServer({
    command: "pnpm",
    args: ["exec", "wrangler", "dev", "--ip", "127.0.0.1", "--port", PORT],
    readyUrl: `${BASE}/`,
  });
  console.log(`\nServer ready at ${BASE}\n`);
  await run("node", ["e2e/readonly-smoke.mjs"], { label: "smoke", env: { E2E_BASE_URL: BASE } });
} catch (error) {
  failed = true;
  console.error("E2E FAIL:", error.message);
} finally {
  await server?.stop();
}

process.exit(failed ? 1 : 0);
