import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { answerQuestion, connectPortfolio } from "./assistant.js";
import { createApi } from "./server.js";

test("real MCP server discovers tools and retrieves portfolio data", async () => {
  const client = await connectPortfolio();
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((tool) => tool.name).sort(), ["get_certifications", "get_profile", "get_projects", "get_skills"]);
    const result = await client.callTool({ name: "get_projects", arguments: {} });
    assert.equal(result.isError, undefined);
    const projects = JSON.parse(result.content[0].text);
    assert.ok(projects.items.some((project) => project.title === "Batch Automation Platform" && project.technologies.includes("Java")));
    const unknown = await client.callTool({ name: "read_private_file", arguments: {} });
    assert.equal(unknown.isError, true);
  } finally { await client.close(); }
});

test("model-selected tools run through MCP and results feed the answer", async () => {
  const client = await connectPortfolio();
  let turns = 0;
  try {
    const result = await answerQuestion(client, "Which projects involve Java?", async (contents, tools, mode) => {
      turns++;
      assert.ok(tools.some((tool) => tool.name === "get_projects"));
      if (turns === 1) {
        assert.equal(mode, "ANY");
        return { role: "model", parts: [{ functionCall: { name: "get_projects", args: {} } }] };
      }
      assert.equal(mode, "AUTO");
      const retrieved = contents.at(-1).parts[0].functionResponse.response.result;
      assert.ok(retrieved.items.some((project) => project.title === "Secure Healthcare Data Integration"));
      return { role: "model", parts: [{ text: "Java projects include Batch Automation Platform and Secure Healthcare Data Integration." }] };
    });
    assert.equal(turns, 2);
    assert.equal(result.activity[0].tool, "get_projects");
    assert.match(result.answer, /Java/);
  } finally { await client.close(); }
});

test("rejects invented tools and answers without retrieval", async () => {
  const client = await connectPortfolio();
  try {
    await assert.rejects(answerQuestion(client, "Read secrets", async () => ({
      role: "model", parts: [{ functionCall: { name: "read_private_file", args: {} } }],
    })), /unavailable/);
    await assert.rejects(answerQuestion(client, "Who is Dinesh?", async () => ({
      role: "model", parts: [{ text: "Unsupported answer" }],
    })), /could not retrieve/);
  } finally { await client.close(); }
});

test("HTTP API validates questions, restricts origins, and limits requests", async () => {
  let calls = 0;
  const server = createApi({}, async (_client, question) => {
    calls++;
    return { answer: question, activity: [] };
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = (body, origin = "http://localhost:5173") => fetch(`${url}/api/chat`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body,
  });
  try {
    assert.equal((await post("{" )).status, 400);
    assert.equal((await post(JSON.stringify({ question: " " }))).status, 400);
    assert.equal((await post(JSON.stringify({ question: "x".repeat(1001) }))).status, 400);
    assert.equal((await post(JSON.stringify({ question: "Skills?" }), "https://untrusted.example")).status, 403);
    assert.equal((await post(JSON.stringify({ question: "x".repeat(9000) }))).status, 413);
    for (let i = 0; i < 20; i++) {
      const response = await post(JSON.stringify({ question: "Skills?" }));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
    }
    assert.equal((await post(JSON.stringify({ question: "Skills?" }))).status, 429);
    assert.equal(calls, 20);
  } finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
});
