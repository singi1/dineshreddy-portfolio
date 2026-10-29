import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { answerQuestion, connectPortfolio } from "./assistant.js";

export function createApi(client, answer = answerQuestion) {
  const origins = new Set((process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173").split(",").map((value) => value.trim()));
  // Per-process demo limits; use one worker. Proxy headers are intentionally ignored.
  const requests = new Map();
  let totalRequests = [];
  let active = 0;
  return createServer(async (req, res) => {
    const origin = req.headers.origin;
    const send = (status, data) => {
      res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(JSON.stringify(data));
    };
    res.setHeader("Vary", "Origin");
    if (origin && !origins.has(origin)) return send(403, { error: "This origin is not allowed." });
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
    if (req.method === "GET" && req.url === "/api/health") {
      return send(200, { status: "ok", mcp: "connected", configured: Boolean(process.env.GEMINI_API_KEY) });
    }
    if (req.method !== "POST" || req.url !== "/api/chat") return send(404, { error: "Not found." });
    if (!req.headers["content-type"]?.startsWith("application/json")) return send(415, { error: "Send a JSON question." });
    try {
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 8192) return send(413, { error: "The question is too large." });
        chunks.push(chunk);
      }
      let input;
      try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return send(400, { error: "Invalid JSON." }); }
      const question = input?.question;
      if (typeof question !== "string" || !question.trim() || question.length > 1000) {
        return send(400, { error: "Ask a question between 1 and 1,000 characters." });
      }
      const now = Date.now();
      for (const [address, events] of requests) {
        const recent = events.filter((time) => now - time < 3600000);
        if (recent.length) requests.set(address, recent); else requests.delete(address);
      }
      const address = req.socket.remoteAddress || "unknown";
      const events = requests.get(address) || [];
      totalRequests = totalRequests.filter((time) => now - time < 3600000);
      if (events.length >= 20 || totalRequests.length >= 100 || active >= 3) {
        res.setHeader("Retry-After", "60");
        return send(429, { error: "The demo has reached its request limit. Please try again later." });
      }
      events.push(now);
      requests.set(address, events);
      totalRequests.push(now);
      active++;
      try {
        const result = await answer(client, question.trim(), undefined, AbortSignal.timeout(45000));
        return send(200, result);
      } finally { active--; }
    } catch (error) {
      const status = [429, 502, 503].includes(error.status) ? error.status : 502;
      send(status, { error: error.status ? error.message : "The assistant could not answer right now. Please try again." });
      console.error("Portfolio chat failed:", error.name); // No user messages or secret values.
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const client = await connectPortfolio();
  const server = createApi(client);
  const port = Number(process.env.PORT || 8001);
  server.listen(port, process.env.HOST || "127.0.0.1", () => console.log(`Portfolio assistant: http://localhost:${port}`));
  const shutdown = () => server.close(async () => { await client.close(); process.exit(0); });
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
