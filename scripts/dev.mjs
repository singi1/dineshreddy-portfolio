import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";

const root = fileURLToPath(new URL("../", import.meta.url));
const backend = new URL("../backend/portfolio-ai/", import.meta.url);
let config = {};
try {
  config = parseEnv(await readFile(new URL(".env", backend), "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const port = process.env.PORT || config.PORT || "8001";
const host = process.env.HOST || config.HOST || "127.0.0.1";
const address = host === "0.0.0.0" || host === "::" ? "127.0.0.1" : host;
const url = `http://${address.includes(":") ? `[${address}]` : address}:${port}`;
let running = false;
try {
  const response = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(1500) });
  const health = await response.json();
  running = response.ok && health.status === "ok" && health.mcp === "connected";
  if (!running) throw new Error("Unexpected service response");
} catch (error) {
  // A refused connection means the port is free. Other responses may belong to
  // another service; leave that process alone and explain the conflict.
  if (error.cause?.code !== "ECONNREFUSED") {
    console.error(`Cannot use the assistant at ${url}. Check the service occupying that port or update backend/portfolio-ai/.env.`);
    process.exit(1);
  }
}

const children = [];
if (running) {
  console.log(`Reusing portfolio assistant at ${url}`);
} else {
  children.push(spawn(process.execPath, ["--env-file-if-exists=.env", "server.js"], {
    cwd: fileURLToPath(backend),
    stdio: "inherit",
  }));
}
children.push(spawn(process.execPath, ["node_modules/vite/bin/vite.js", ...process.argv.slice(2)], {
    cwd: root,
    stdio: "inherit",
  }));

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill();
}

for (const child of children) {
  child.on("error", (error) => {
    console.error("Could not start development service:", error.message);
    stop(1);
  });
  child.on("exit", (code) => stop(code ?? 1));
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
