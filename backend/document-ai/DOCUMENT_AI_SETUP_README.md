# Document AI Playground — Setup & Troubleshooting README

A reusable guide based on the steps used to add a PDF/DOCX/TXT summarization and document Q&A demo to the **dineshreddy.info** React/Vite portfolio. Backend: **FastAPI** with selectable **Gemini** or **OpenAI** provider. Development environment: **Ubuntu on WSL**, with the project stored on the Windows drive.

## 1. Project organization

Keep the page in `src/pages/` and the Python API in `backend/document-ai/`:

```text
dineshreddy-portfolio/
├── src/
│   ├── components/           # Existing portfolio sections
│   ├── pages/
│   │   └── DocumentAI.jsx    # Upload, summary, and document Q&A UI
│   ├── App.jsx               # React routes
│   └── main.jsx
├── backend/
│   └── document-ai/
│       ├── main.py           # FastAPI app
│       ├── requirements.txt
│       ├── .env              # Server-only secrets; never commit
│       └── .venv/            # Local Linux Python environment; never commit
├── .env.local                # Vite's public backend URL; no secrets
├── package.json
└── vite.config.js
```

The React frontend and FastAPI backend run as **two separate processes**.

## 2. Create the backend and install dependencies (Ubuntu/WSL)

Open an Ubuntu terminal:

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio
mkdir -p backend/document-ai
cd backend/document-ai
```

Copy the backend's `main.py` and `requirements.txt` into this folder, then run:

```bash
sudo apt update
sudo apt install -y python3-venv
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

**Why venv?** Ubuntu manages its system Python and can show `externally-managed-environment` when `pip install` is run globally. A venv isolates project dependencies. **Do not** use the Windows PowerShell activation command (`.venv\Scripts\Activate.ps1`) inside Ubuntu. Avoid `--break-system-packages`.

Each later Ubuntu session needs only `source .venv/bin/activate` (not another install).

## 3. Configure the backend AI provider

Create `backend/document-ai/.env`:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=replace_with_your_key
GEMINI_MODEL=gemini-3.5-flash-lite

OPENAI_API_KEY=replace_with_your_key_if_using_openai
OPENAI_MODEL=gpt-4o-mini

ALLOWED_ORIGINS=http://localhost:5173,https://dineshreddy.info,https://www.dineshreddy.info
```

The model ID above is the **replacement Google suggested in the API error during this setup**; model availability and pricing can change. Set `GEMINI_MODEL` to an ID currently allowed for your API key. Keep API keys server-side.

To use OpenAI instead, change **only** `AI_PROVIDER=openai` (and ensure its key/model are valid), then restart FastAPI. The React frontend does not need to change.

The backend should load `.env` using `python-dotenv` (`load_dotenv()`).

## 4. Run and verify the FastAPI backend

From `backend/document-ai/` with the venv activated:

```bash
python -m uvicorn main:app --reload --port 8000
```

Open:
- Health: http://localhost:8000/api/health
- FastAPI docs: http://localhost:8000/docs

Expected health response resembles:

```json
{"status":"ok","provider":"gemini","model":"gemini-3.5-flash-lite"}
```

Use the **exact** health URL. At one point `/api/health**` was accidentally opened: the `**` appeared as `%2A%2A` in server logs and caused a 404.

## 5. Add the React page and route

Put the upload UI at `src/pages/DocumentAI.jsx`. In the portfolio root:

```bash
npm install react-router-dom react-markdown
```

Keep the existing homepage sections intact. An example `src/App.jsx` is:

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
  return <><Header /><main><About /><Skills /><Certifications /><Projects /><Contact /></main></>;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/document-ai" element={<DocumentAI />} />
  </Routes></BrowserRouter>;
}
```

If `main.jsx` **already** wraps the app in `BrowserRouter`, do not add a second router: use `Routes` directly in `App.jsx`.

**Past issue:** A loose `<Route ... />` placed *outside* the component caused `ReferenceError: Route is not defined`. Import `Route`, `Routes`, and (if needed) `BrowserRouter`, and put the routes inside the component.

## 6. Point React to FastAPI

In the **portfolio root**, beside `package.json`, create `.env.local`:

```env
VITE_DOCUMENT_AI_API=http://localhost:8000
```

The page reads it with:

```jsx
const API_URL = import.meta.env.VITE_DOCUMENT_AI_API || "http://localhost:8000";
```

`VITE_` variables are accessible in browser code, so **never** put `GEMINI_API_KEY` or `OPENAI_API_KEY` there. Restart Vite after changing `.env.local`.

## 7. Start the frontend (second terminal)

Keep FastAPI running. In another Ubuntu terminal:

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio
npm run dev
```

Open http://localhost:5173/document-ai and verify the homepage still loads at http://localhost:5173/.

Add a `Try Live Demo` link to `/document-ai` in the portfolio's Projects section when ready.

## 8. Wire up document upload and Q&A

The page provides drag/drop or file-picker selection, then POSTs the file using `FormData` (do not manually set `Content-Type`):

```js
const formData = new FormData();
formData.append("file", file);
const response = await fetch(`${API_URL}/api/upload`, {
  method: "POST", body: formData,
});
const result = await response.json();
```

Current backend API contract:
- `POST /api/upload` → `{document_id, filename, characters, chunks, summary, expires_in_seconds}`
- `POST /api/ask` with JSON `{document_id, question}` → `{answer, sources}`
- `GET /api/health` → `{status, provider, model}`

Example Q&A request:

```js
const response = await fetch(`${API_URL}/api/ask`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ document_id: result.document_id, question }),
});
```

Current FastAPI max upload size is **5 MB** (`MAX_BYTES = 5 * 1024 * 1024`); match that limit in the React validation and upload label. The backend extracts text from PDF/DOCX/TXT; scanned PDFs need OCR, which is not implemented.

## 9. Fix the Gemini client lifecycle error

During testing, `genai.Client(api_key=key).models.generate_content(...)` produced:

```text
RuntimeError: Cannot send a request, as the client has been closed.
```

Keep a live client for the full request, and close it after the call:

```python
from google import genai
from google.genai import types

with genai.Client(api_key=key) as client:
    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system,
            temperature=0.2,
            max_output_tokens=1600,
        ),
    )
    result = response.text
```

Retain the separate OpenAI branch in `ask_ai()` to keep provider switching.

## 10. Fix model-not-available error

After the client fix, the API returned:

```text
404 NOT_FOUND: models/gemini-2.5-flash-lite is no longer available to new users
```

Google's error recommended `gemini-3.5-flash-lite`. Updating `GEMINI_MODEL` in `backend/document-ai/.env` and restarting the backend resolved the model-selection obstacle for this setup. A 200 response from `/api/health` **does not** prove that an actual model call will succeed; test by analyzing a real document.

## 11. Render responses cleanly

Gemini returns Markdown. Install `react-markdown` and render both summary and answer:

```jsx
import ReactMarkdown from "react-markdown";

<div className="ai-markdown"><ReactMarkdown>{result.summary}</ReactMarkdown></div>
<div className="ai-markdown"><ReactMarkdown>{answer}</ReactMarkdown></div>
```

The current backend includes five key points **inside the `summary` string**, not in a separate `key_points` array. Remove any redundant empty `result.key_points` section unless you update the backend contract to return structured key points separately.

Add CSS for `.ai-markdown` headings, lists, inline code, and code blocks to improve appearance.

## 12. Successful local test

1. Start backend (`uvicorn`) and frontend (`npm run dev`) in separate terminals.
2. Open `/document-ai`, select a small `.txt`, `.docx`, or text-based `.pdf` file.
3. Verify the filename appears in the upload area.
4. Click **Analyze with AI**; confirm summary and key points appear.
5. Ask a question such as **“List all the steps”**; confirm the response is grounded in the uploaded document and Markdown/code blocks render correctly.
6. Check the FastAPI terminal for `POST /api/upload` and `POST /api/ask` successful responses.

This local end-to-end flow was demonstrated successfully. **Public deployment was not completed in this walkthrough.**

## 13. Before deploying publicly

- Deploy the **React/Vite frontend** through the existing Cloudflare Pages workflow, using `/document-ai` as the page route.
- Deploy the **Python FastAPI backend** separately (e.g., a Python-capable hosting provider); Cloudflare Pages does not run a conventional long-lived Uvicorn server.
- Set `VITE_DOCUMENT_AI_API` to the publicly reachable **HTTPS** backend URL in the frontend hosting environment, then rebuild/redeploy.
- Set API keys, selected model, and `ALLOWED_ORIGINS` as **backend hosting secrets/config**. Never commit `.env`.
- Add per-IP/user rate limits, upload limits, cost controls, document retention/cleanup, privacy notice, and abuse protection before accepting anonymous visitors.
- Current in-memory document store has a 1-hour TTL and is not durable across restarts/multiple workers; consider persistent storage for production.
- Current summary only includes the first **22,000 characters** of assembled excerpts; use chunk-wise/map-reduce summarization for long documents.
- Current Q&A ranks chunks by **keyword overlap** (not embedding-based semantic RAG). Upgrade retrieval later if needed.
- Confirm SPA deep-link routing works for `/document-ai` on the production host.

## Quick start (after one-time installation)

**Terminal A — backend:**

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio/backend/document-ai
source .venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

**Terminal B — frontend:**

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio
npm run dev
```

**URLs:**
- http://localhost:8000/api/health
- http://localhost:8000/docs
- http://localhost:5173/document-ai

## Git safety

Ensure `.gitignore` covers at least:

```gitignore
.env
.env.*
!.env.example
.venv/
__pycache__/
```

Never commit API keys. If a secret was accidentally pushed to Git, rotate it immediately.
