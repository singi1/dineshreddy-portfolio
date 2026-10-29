# Ask About My Portfolio

A React chat page at `/ask-portfolio`, a Node.js API, and a real MCP server exposing four read-only tools. Gemini chooses the tools, the API calls them over MCP stdio, and the returned public information grounds the answer. Expand each answer's activity panel to inspect the actual tool results.

## Run locally

Use Node.js 22.9+ (Node.js 24 recommended). From the repository root:

```powershell
cd backend/portfolio-ai
npm install
Copy-Item .env.example .env
```

Edit `backend/portfolio-ai/.env` and supply your Gemini API key. You can use the same Gemini key as DocumentAI; this service does not read DocumentAI's `.env` automatically. If a local `.env` is already configured, skip the copy step. Keys stay on the backend. `GEMINI_MODEL` can be changed to a function-calling model available to your account.

From the repository root, start both the frontend and assistant with:

```powershell
npm run dev
```

Open `http://localhost:5173/ask-portfolio`. The frontend defaults to the new backend on port 8001. The backend starts the MCP server automatically as a child process. DocumentAI remains on its existing port 8000.

To run the services separately, use `npm run dev:frontend` and `npm run dev:assistant` in two terminals at the repository root. The combined `npm run dev` command reuses an assistant already running at the configured host and port; stopping development leaves that existing assistant running.

From the repository root, `npm start` starts only the assistant backend (an alias for `npm run dev:assistant`). Production frontend files are built separately with `npm run build` and served by your static hosting provider.

If needed, add this line to the root `.env.local`, preserving its existing values, and restart Vite:

```dotenv
VITE_PORTFOLIO_AI_API=http://localhost:8001
```

## Practice the live demo

1. Ask “Which of Dinesh's projects involve Java?”
2. Expand “View retrieved information” to see `get_projects` and the data returned by the MCP server.
3. Ask “What certifications does Dinesh hold?” to demonstrate a different tool.
4. Ask about an unpublished detail, such as salary expectations. The assistant should explain that the portfolio does not publish it.

Questions are independent. The browser shows previous answers, but does not send conversation history. No chat history is persisted by this app. Questions and retrieved public information are sent to Gemini to generate answers.

## Where the information lives

`portfolio.json` is a curated copy of public portfolio content. Update it when changing the homepage's profile, skills, projects, or certifications. Do not add private employer/client details. Tools cannot access arbitrary files or URLs. They return these four sections:

- `get_profile`
- `get_skills`
- `get_projects`
- `get_certifications`

`mcp-server.js` can also run independently with `npm run mcp` for a compatible desktop MCP client. Configure the client to launch `node` with the absolute path to `mcp-server.js`. Its stdio output is protocol traffic, not a terminal chat interface.

## Checks

```powershell
npm test
```

Tests start the real MCP subprocess, check discovery and retrieval, simulate the model's tool-selection loop, and exercise HTTP input validation, CORS and rate limits. They do not need an API key or consume model credits. A successful real Gemini answer still requires configured credentials and network access.

## Deployment

Deploy this folder to a Node.js host supporting long-running processes and child processes, separately from the static Vite frontend. Install with `npm ci`, start with `npm start`, and set:

- `GEMINI_API_KEY` and optionally `GEMINI_MODEL`
- `HOST=0.0.0.0`
- `PORT` supplied by your host
- `ALLOWED_ORIGINS=https://dineshreddy.info` (comma-separated; include other actual frontend origins if needed)

Set frontend `VITE_PORTFOLIO_AI_API` to the backend's HTTPS URL and rebuild the frontend. Configure the frontend host to serve `index.html` for `/ask-portfolio`, as for the existing `/document-ai` route. This backend cannot run as a static Cloudflare Pages asset or an ordinary Cloudflare Worker because it launches a local MCP process.

`GET /api/health` reports backend startup and whether a key is present; it does not verify the key or provider availability. Request limits are per-process: 20 questions per IP/hour, 100 total/hour, and 3 concurrent questions. Proxy headers are ignored, so some hosting proxies may group users together. Run one instance for this demo; distributed hosting needs shared rate limits. A request can make up to four model calls and eight read-only tool calls.

MCP uses the official [TypeScript SDK v1](https://ts.sdk.modelcontextprotocol.io/). Model generation uses Google's [Gemini REST API](https://ai.google.dev/api/generate-content).
