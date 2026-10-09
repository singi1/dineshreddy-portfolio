# Document AI Playground — Complete Step-by-Step Build Guide

**Project:** `dineshreddy.info/document-ai`  
**Stack:** React + Vite (frontend), FastAPI + Python (backend), Google Gemini or OpenAI (switchable AI provider)  
**Development environment:** Ubuntu on WSL (Windows), Cloudflare Pages for the portfolio frontend

This guide documents **what we did, why each step was necessary, how to check it, and the errors we encountered**. It is intended to be repeatable for future AI demos.

> **Current status:** Local upload, AI summary, and document question answering have been tested successfully. Production backend deployment, robust public rate limiting, and semantic vector search have **not** been completed.

## Step 1 — Decide the architecture and location of files

**What we did:** Kept the existing portfolio and added a separate React page plus a Python backend dedicated to Document AI.

**Why:** React provides the interactive website. FastAPI extracts document text and securely calls an AI provider. API keys must remain on the server, not in browser code.

Our structure:

```text
dineshreddy-portfolio/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── About.jsx
│   │   ├── Skills.jsx
│   │   ├── Certifications.jsx
│   │   ├── Projects.jsx
│   │   └── Contact.jsx
│   ├── pages/
│   │   └── DocumentAI.jsx
│   ├── App.jsx
│   └── main.jsx
├── backend/
│   └── document-ai/
│       ├── main.py
│       ├── requirements.txt
│       ├── .env                 # Secrets; do NOT commit
│       └── .venv/               # Local Python packages; do NOT commit
├── .env.local                   # React-facing API base URL; no secrets
├── package.json
└── vite.config.js
```

**Action:** In Ubuntu (WSL), go to your existing portfolio repository:

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio
mkdir -p src/pages backend/document-ai
```

**Check:** Run `ls src/pages backend/document-ai`. The two directories should exist.

## Step 2 — Place the React page and backend files

**What we did:** Put the full-page UI in `src/pages/DocumentAI.jsx`, not `src/components/`, and put the Python backend in `backend/document-ai/`.

**Why:** The `pages` directory is for website routes. The `components` directory is for reusable pieces of the homepage. Python is a separate server process and cannot be run by the Vite dev server.

**Action:** Copy the Document AI React page into `src/pages/DocumentAI.jsx`; place the unified Gemini/OpenAI `main.py` and `requirements.txt` in `backend/document-ai/`.

**Check:** From the portfolio root:

```bash
ls src/pages/DocumentAI.jsx backend/document-ai/main.py backend/document-ai/requirements.txt
```

All three paths should print without a `No such file or directory` error.

## Step 3 — Install Python virtual environment support on Ubuntu

**What we did:** Installed `python3-venv` in WSL Ubuntu.

**Why:** Ubuntu's Python 3.12 may be marked *externally managed* (PEP 668). Trying to install dependencies globally with `pip install -r requirements.txt` generated the `externally-managed-environment` error. A virtual environment is an isolated Python installation for this project, avoiding conflicts with Ubuntu and other applications.

**Action:**

```bash
sudo apt update
sudo apt install -y python3-venv
```

**Check:** `python3 --version` shows Python is available; `python3 -m venv --help` should display usage instead of an import error.

**Important:** Do not use `--break-system-packages` to bypass Ubuntu's package protection.

## Step 4 — Create the Python virtual environment

**What we did:** Created `.venv` inside `backend/document-ai`.

**Why:** Each AI demo can have its own library versions without conflicting with your other Python projects.

**Action:**

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio/backend/document-ai
python3 -m venv .venv
```

**Check:** `ls .venv/bin/python` should show a Python executable.

> We initially tried the Windows PowerShell command `.\.venv\Scripts\Activate.ps1` and received `command not found`. That is expected inside **Ubuntu Bash**; the Linux activation command is different.

## Step 5 — Activate the virtual environment

**What we did:** Activated the environment in the Ubuntu terminal.

**Why:** Activating makes `python` and `pip` refer to this project's environment rather than Ubuntu's system-managed Python.

**Action:**

```bash
source .venv/bin/activate
```

**Check:** Your prompt should begin with `(.venv)`, for example:

```text
(.venv) singi@singi:.../backend/document-ai$
```

You can additionally run `which python`; it should point to `.../backend/document-ai/.venv/bin/python`.

**Repeat usage:** When opening a new Ubuntu terminal later, return to the backend directory and run `source .venv/bin/activate` again. You **do not** need to recreate `.venv` every time.

## Step 6 — Install the backend dependencies

**What we did:** Upgraded pip, then installed the libraries listed in `requirements.txt`.

**Why:** FastAPI serves the API; the Google GenAI and OpenAI SDKs call the selected AI model; `pypdf` and `python-docx` read uploaded documents; `python-dotenv` loads configuration from `.env`. Other dependencies come from `requirements.txt`.

**Action (with `(.venv)` shown in your prompt):**

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

**Check:**

```bash
python -c "import fastapi, google.genai, openai, pypdf, docx, dotenv; print('Backend dependencies OK')"
```

Expected: `Backend dependencies OK`.

## Step 7 — Configure Gemini/OpenAI privately in the backend

**What we did:** Created `backend/document-ai/.env` with the selected provider, model, server-only API keys, and browser origins.

**Why:** Both AI providers run through one `main.py`; changing `AI_PROVIDER` lets you switch providers. The secret key must never appear in React source or be committed to GitHub.

**Action:** Create this file under `backend/document-ai/.env`:

```dotenv
AI_PROVIDER=gemini
GEMINI_API_KEY=replace_with_your_real_key
GEMINI_MODEL=gemini-3.5-flash-lite

OPENAI_API_KEY=replace_with_your_openai_key
OPENAI_MODEL=gpt-4o-mini

ALLOWED_ORIGINS=http://localhost:5173,https://dineshreddy.info,https://www.dineshreddy.info
```

**Note:** The Gemini model shown above is the model Google's error message recommended during our troubleshooting. Use a model actually available to **your** API key/account; model availability can change.

**Check:** Later, the health endpoint should report `provider` and `model` as expected; the health endpoint does **not** check whether your key is valid.

**Switch providers:** Change `AI_PROVIDER=gemini` to `AI_PROVIDER=openai` (or back), then restart the backend. You do not need to edit React.

**Security:** In the root `.gitignore`, include `.env`, `.env.*`, `!.env.example`, `.venv/`, and `__pycache__/`. Do not print or share actual API keys.

## Step 8 — Understand what the Python backend does

**What we built:** A unified FastAPI app in `backend/document-ai/main.py`.

**Why each endpoint exists:**

- `GET /api/health` — confirms the server is running and shows selected provider/model.
- `POST /api/upload` — accepts a PDF, DOCX, or TXT file, extracts readable text, stores temporary chunks, and requests a summary from the selected model.
- `POST /api/ask` — accepts a document ID and question, retrieves relevant stored passages, and asks the model to answer based on those passages.

**Technical details of this version:** The backend caps uploads at **5 MB**, stores extracted chunks **in memory** for approximately **1 hour**, and uses **keyword overlap** to pick passages for Q&A. It is not yet an embedding/vector-database RAG implementation. Scanned image-only PDFs require OCR and are not supported by the current text extraction.

**Check:** Once started, `http://localhost:8000/docs` displays the registered FastAPI endpoints.

## Step 9 — Start the Python backend

**What we did:** Started Uvicorn from the backend directory while `.venv` was active.

**Why:** Uvicorn hosts the FastAPI server separately from the React development server.

**Action:**

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio/backend/document-ai
source .venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

**Check:** The terminal should show:

```text
Uvicorn running on http://127.0.0.1:8000
Application startup complete.
```

Then open **http://localhost:8000/api/health**. A working configuration produces a response similar to:

```json
{"status":"ok","provider":"gemini","model":"gemini-3.5-flash-lite"}
```

**Our earlier 404:** We accidentally opened `/api/health**`. In the log, the extra `**` appeared encoded as `%2A%2A`. The correct URL is exactly `/api/health` (without asterisks).

## Step 10 — Set up React Router for a dedicated page

**What we did:** Created a route for `/document-ai` while preserving the existing homepage.

**Why:** Putting a `<Route>` after the closing `App()` function caused `ReferenceError: Route is not defined`. Routes must be imported and rendered inside a router.

**Action (portfolio root):**

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio
npm install react-router-dom
```

Then use this structure in `src/App.jsx` (preserving your actual component imports):

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Certifications from "./components/Certifications";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import DocumentAI from "./pages/DocumentAI";

function HomePage() {
  return <>
    <Header />
    <main>
      <About />
      <Skills />
      <Certifications />
      <Projects />
      <Contact />
    </main>
  </>;
}

export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/document-ai" element={<DocumentAI />} />
    </Routes>
  </BrowserRouter>;
}
```

**Important:** If `BrowserRouter` is already in `src/main.jsx`, do not nest a second one in `App.jsx`.

**Check:** Your homepage `/` still renders as before; `/document-ai` shows the new page.

## Step 11 — Connect React to the Python server

**What we did:** Created a **frontend-only** `.env.local` file in the **portfolio root**, next to `package.json`.

**Why:** React needs to know where the Python API lives. This setting is not a secret because browser users can see the API URL.

**Action:**

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio
echo 'VITE_DOCUMENT_AI_API=http://localhost:8000' > .env.local
```

**Check:** `cat .env.local` should print exactly that setting. Restart Vite after adding or editing `.env.local`.

**Important:** Never put `GEMINI_API_KEY` or `OPENAI_API_KEY` in a `VITE_` variable — Vite exposes those values to browsers.

## Step 12 — Implement file selection and uploading in DocumentAI.jsx

**What we did:** Replaced an initial visual-only placeholder with a working React page.

**Why:** The first UI showed an upload box but did not actually send the file. The working version uses `useState` and `useRef` to manage selection, errors, responses, and Q&A.

**Frontend behaviors to preserve:**

1. Clicking the drop zone opens a hidden `<input type="file" accept=".pdf,.docx,.txt">`.
2. Dragging/dropping a document selects it.
3. React displays the **filename** and **file size** so users know it was selected.
4. Clicking **Analyze with AI** sends `FormData` with the key `file` to `POST ${API_URL}/api/upload`.
5. React stores the returned `document_id` and displays `summary`.
6. Typing a question and clicking **Ask AI** sends `{document_id, question}` as JSON to `POST ${API_URL}/api/ask`.
7. React displays the answer and any request error.

**Important consistency fix:** The backend accepts **5 MB**, so the React file-size validation and upload-area label should both say **5 MB** (the initial React version incorrectly said 10 MB).

**Check:** Before clicking Analyze, the file box should display a filename such as `run.txt` and its size. After Analyze, the FastAPI terminal should log `POST /api/upload`.

## Step 13 — Start the React frontend

**What we did:** Ran the Vite development server in a **second Ubuntu terminal**, leaving FastAPI running in the first.

**Why:** Vite serves React on port 5173; FastAPI serves document processing on port 8000. Both processes need to be running for local testing.

**Action:**

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio
npm run dev
```

**Check:** Open **http://localhost:5173/document-ai**. You should see the file drop zone, selected filename, and Analyze button.

## Step 14 — Troubleshoot the Gemini upload failure

**What happened:** Clicking Analyze initially returned HTTP `502` with `gemini request failed; check server logs`.

**Why we looked at the backend:** The browser's 502 was only a generic wrapper. The FastAPI traceback revealed the real error.

**First error:**

```text
RuntimeError: Cannot send a request, as the client has been closed.
```

**Fix:** We stopped creating an ephemeral `genai.Client(...)` directly inside the chained request call. Instead, in `ask_ai()` we kept the Gemini client alive for the entire request, using a context manager:

```python
with genai.Client(api_key=key) as client:
    response = client.models.generate_content(
        model=os.getenv('GEMINI_MODEL', 'gemini-3.5-flash-lite'),
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system,
            temperature=0.2,
            max_output_tokens=1600,
        ),
    )
    result = response.text
```

**Check:** The old client-closed traceback should no longer occur.

**Second error (after fixing the client):**

```text
404 NOT_FOUND: gemini-2.5-flash-lite is no longer available to new users
```

**Fix:** We changed `GEMINI_MODEL` in the backend `.env` to the replacement model indicated by Google's error message: `gemini-3.5-flash-lite`, then restarted FastAPI.

**Check:** `/api/health` reports the new configured model, and the upload request produces a real AI summary. If your account shows a different supported model, use the model available to your API key.

## Step 15 — Format AI summaries and answers as Markdown

**What we did:** Installed `react-markdown` and rendered the generated text with it.

**Why:** The AI response contains Markdown like `**Executive Summary**`, numbered steps, backticks, and code blocks. Displaying the raw string in `<p>` showed formatting symbols instead of a clean document.

**Action (portfolio root):**

```bash
npm install react-markdown
```

Import it at the top of `DocumentAI.jsx`:

```jsx
import ReactMarkdown from "react-markdown";
```

Render the summary:

```jsx
<div className="ai-markdown">
  <ReactMarkdown>{result.summary}</ReactMarkdown>
</div>
```

Render the answer:

```jsx
<div className="ai-markdown">
  <ReactMarkdown>{answer}</ReactMarkdown>
</div>
```

**Check:** Bold headings appear bold; numbered steps and code samples render neatly, matching the successful screenshot.

**Styling:** Add `.ai-markdown` rules to your CSS for spacing, lists, and code block backgrounds. Keep Markdown rendering sanitized; avoid injecting raw HTML from uploaded documents.

## Step 16 — Fix the empty duplicate Key Points heading

**What happened:** The React UI showed `Key Points` with nothing underneath it, even though the AI summary already included five key points.

**Why:** The backend returns a single string field called `summary`; it does not currently return a `key_points` array.

**Fix for the current version:** Remove the separate JSX block that maps `result.key_points`, because those points already appear in the Markdown summary.

**Future enhancement:** Ask the AI for structured JSON and return separate `summary` and `key_points` fields if you want two independently styled panels.

## Step 17 — Verify full document question answering

**What we tested:** Uploaded a small TXT document containing the Python setup steps, then asked questions such as **“give me list of commands”** and **“list me all the steps.”**

**What happened:** Gemini produced a detailed, neatly formatted response with the correct commands (install venv, create venv, activate, install dependencies, start Uvicorn, verify health).

**What that proves:** The frontend selected and uploaded a file, the backend extracted its text, the model summarized it, and `/api/ask` returned a grounded response. It does **not** yet establish accuracy on every PDF/DOCX or complex long document.

## Step 18 — Day-to-day runbook (after initial setup)

**Terminal 1 — Backend:**

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio/backend/document-ai
source .venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio
npm run dev
```

**Verify:**

1. API health: http://localhost:8000/api/health
2. API documentation: http://localhost:8000/docs
3. Portfolio homepage: http://localhost:5173/
4. Document AI page: http://localhost:5173/document-ai
5. Upload a small TXT file and ask a question based on its contents.

To stop either process, press `Ctrl+C` in its terminal. Leave the backend terminal running while testing document uploads.

## Step 19 — Save work to GitHub safely

**What we did / recommend:** Keep source code and documentation under version control while excluding credentials and local installed dependencies.

**Before committing:** Confirm the root `.gitignore` includes:

```gitignore
.env
.env.*
!.env.example
.venv/
__pycache__/
node_modules/
```

Your Vite API URL can be configured through a nonsecret environment variable at deployment time. You may create a safe `.env.example` with placeholder keys to document configuration.

**Action (portfolio root):**

```bash
git status
git add src/pages/DocumentAI.jsx src/App.jsx backend/document-ai/main.py backend/document-ai/requirements.txt DOCUMENT_AI_COMPLETE_WALKTHROUGH.md
# Include the appropriate updated package.json and lockfile if react-router-dom/react-markdown were added.
git commit -m "Document AI demo with Gemini/OpenAI backend"
git push
```

**Check:** Review `git status` and the staged files before committing. Never commit `.env` or actual API keys.

## Step 20 — Understand what remains before public deployment

**Working locally:** React page, FastAPI server, TXT test, Gemini summaries and Q&A, Markdown rendering, provider/model selection through backend configuration.

**Not yet completed:**

1. Deploy FastAPI on an HTTPS-accessible host such as Render/Railway; Cloudflare Pages alone does not run this conventional Python server.
2. Set a **production** `VITE_DOCUMENT_AI_API` value pointing to the public HTTPS backend (not `localhost`).
3. Add rate limiting, abuse protection, request/time quotas, and cost monitoring for anonymous visitors.
4. Set CORS to your real frontend origins, and secure all provider API keys as backend deployment secrets.
5. Replace or harden in-memory document storage for multi-worker deployments and ensure expiration/privacy handling.
6. Improve long-document summarization: the current summary uses the first **22,000 characters** of assembled text and may miss later pages.
7. Consider semantic retrieval (embeddings/vector store), stronger document-grounding checks, and support for scanned PDFs through OCR.
8. Add convenient multi-turn chat history, styled source citations, and downloadable results if desired.

---

## Quick troubleshooting reference

| Symptom | What caused it in our build | Fix |
|---|---|---|
| `Activate.ps1: command not found` | Windows PowerShell command run in Ubuntu WSL | `source .venv/bin/activate` |
| `externally-managed-environment` | `pip` attempted global installation in Ubuntu | Create/activate `.venv`, then install |
| `GET /api/health%2A%2A` gives 404 | Extra `**` pasted into URL | Use `/api/health` exactly |
| `Route is not defined` | `<Route>` outside `App`, missing import/router | Import `BrowserRouter, Routes, Route` and nest routes correctly |
| Upload box doesn't show selected filename | Initial frontend was UI-only placeholder | Add file input, file state, and upload fetch |
| `POST /api/upload` gives 502 | AI provider call failed on backend | Read the complete FastAPI traceback |
| `client has been closed` | Gemini SDK client lifetime too short | Use `with genai.Client(...) as client` around the request |
| Gemini 404 model unavailable | Account couldn't use `gemini-2.5-flash-lite` | Change `GEMINI_MODEL` to a supported model |
| Markdown asterisks shown literally | Raw AI text rendered as plain text | Use `react-markdown` for summary and answer |
| Empty `Key Points` section | No `result.key_points` in backend response | Remove duplicate section or return structured key points |
| `localhost:8000` fails from live site | `localhost` points to each visitor's own computer | Deploy API publicly and update production API URL |

**Reusable project checklist:** Choose frontend route → create backend folder → create/activate venv → install requirements → configure server secrets → start/test FastAPI → create React page → connect API URL → test upload/Q&A → render Markdown → troubleshoot from server logs → harden and deploy.
