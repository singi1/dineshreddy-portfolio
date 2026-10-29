import { readFile } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Only this curated public file is accessible to the tools. No arbitrary file access.
const portfolio = JSON.parse(await readFile(new URL("./portfolio.json", import.meta.url), "utf8"));
const server = new McpServer({ name: "dinesh-portfolio", version: "1.0.0" });
const sections = {
  get_profile: ["Get Dinesh's professional background, location, and interests.", "profile"],
  get_skills: ["Get Dinesh's published technical skills, grouped by category.", "skills"],
  get_projects: ["Get Dinesh's projects, technologies, descriptions, and public links.", "projects"],
  get_certifications: ["Get Dinesh's professional certifications and verification links.", "certifications"],
};

for (const [name, [description, section]] of Object.entries(sections)) {
  server.registerTool(name, {
    description,
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async () => ({
    content: [{ type: "text", text: JSON.stringify(portfolio[section]) }],
  }));
}

await server.connect(new StdioServerTransport());
