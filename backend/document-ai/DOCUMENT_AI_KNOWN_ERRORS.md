# Document AI — Known Errors & Fixes

A quick troubleshooting reference. Use the separate `DOCUMENT_AI_INSTRUCTIONS.md` for normal setup and startup.

## 1. `..venvScriptsActivate.ps1: command not found`
**Cause:** A Windows PowerShell activation command was used in Ubuntu (WSL).

**Fix:** In the backend directory, run:

```bash
source .venv/bin/activate
```

## 2. `error: externally-managed-environment`
**Cause:** `pip` attempted to install packages into Ubuntu's system-managed Python.

**Fix:** Create and activate a project virtual environment, then install packages:

```bash
sudo apt install -y python3-venv
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Avoid `--break-system-packages`.

## 3. `/api/health` returns 404, URL contains `%2A%2A`
**Cause:** The URL accidentally included `**` (Markdown bold markers), encoded as `%2A%2A`.

**Fix:** Open exactly **http://localhost:8000/api/health** with no extra characters.

## 4. Blank white React page: `Route is not defined`
**Cause:** `<Route>` was written outside the React component and/or `Route` was not imported.

**Fix:** Import React Router and put `<Route>` inside `<Routes>` within `App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DocumentAI from "./pages/DocumentAI";

// Place these within your App component (keep your homepage route):
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/document-ai" element={<DocumentAI />} />
  </Routes>
</BrowserRouter>
```

`HomePage` is a placeholder for your existing home content. If `main.jsx` already wraps the app in `BrowserRouter`, do not nest another router.

## 5. Upload area appears, but nothing gets uploaded
**Cause:** The original `DocumentAI.jsx` was a UI-only placeholder; it did not connect the file to the backend.

**Fix:** Use the functional frontend that stores the selected file in React state and sends `FormData` to `POST /api/upload`. Confirm that the filename appears after selection and the backend receives a POST request.

## 6. Upload fails with HTTP 502: `Cannot send a request, as the client has been closed`
**Cause:** A temporary Gemini SDK client was created inline, and its HTTP client closed during the request/retry flow.

**Fix:** Keep the Gemini client alive for the complete call:

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

## 7. Gemini HTTP 404 `NOT_FOUND`: model unavailable to new users
**Cause:** Google rejected `gemini-2.5-flash-lite` for the API key/project used during setup.

**Fix:** Update `GEMINI_MODEL` in `backend/document-ai/.env` to a model available to your key. During this setup, the API recommended:

```env
GEMINI_MODEL=gemini-3.5-flash-lite
```

Restart FastAPI. If model availability changes, check the API's model list or Google's current documentation.

## 8. AI outputs display literal `**bold**` and backticks
**Cause:** Gemini returns Markdown, but React rendered it as raw text.

**Fix:** Install `react-markdown`, import it, and render summary/answers using `<ReactMarkdown>{result.summary}</ReactMarkdown>` and `<ReactMarkdown>{answer}</ReactMarkdown>`.

## 9. An empty `Key Points` heading appears
**Cause:** The backend returns the executive summary and key points together in `summary`, but the frontend also tries to render a nonexistent `key_points` array.

**Fix:** Remove the duplicate `Key Points` panel, or update the backend to return `key_points` as a separate field.

## 10. Frontend accepts 10 MB, backend rejects files larger than 5 MB
**Cause:** Limits were inconsistent (`10 MB` in React, `5 MB` in FastAPI).

**Fix:** Match the React validation and displayed label to the backend's current **5 MB** limit, or deliberately update both limits.

## 11. Gemini says the supplied excerpt is incomplete
**Cause:** The original backend only sends the first 22,000 characters for summarization.

**Fix:** This is a current implementation limitation, not an upload error. To summarize longer documents fully, implement chunk-by-chunk summarization and consolidation.

## 12. Works locally but not on the deployed website
**Cause:** `http://localhost:8000` refers to each visitor's own computer and is not a publicly hosted backend.

**Fix:** Deploy FastAPI at a public HTTPS URL, update the Cloudflare Pages `VITE_DOCUMENT_AI_API` environment variable, and allow the live site origin in FastAPI CORS settings.
