# Document AI — Setup & Run Instructions

Use this guide to set up or restart the Document AI demo on Ubuntu (WSL). Commands assume the existing `dineshreddy-portfolio` project.

## Part A — First-time setup (do once)

### Step 1 — Open the portfolio project
Open an Ubuntu (WSL) terminal and navigate to your portfolio root:

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio
```

### Step 2 — Confirm the files are in place
Keep the React page at `src/pages/DocumentAI.jsx`, and the Python files at `backend/document-ai/main.py` and `backend/document-ai/requirements.txt`. Your `App.jsx` must define the `/document-ai` route. The portfolio root contains `package.json`.

### Step 3 — Install frontend dependencies
From the portfolio root, install the dependencies used by React routing and Markdown rendering:

```bash
npm install
npm install react-router-dom react-markdown
```

### Step 4 — Configure the frontend API address
Create `dineshreddy-portfolio/.env.local` with:

```env
VITE_DOCUMENT_AI_API=http://localhost:8000
```

This tells the React page where FastAPI is running locally. Do not put API keys in this file.

### Step 5 — Go to the Python backend

```bash
cd backend/document-ai
```

### Step 6 — Install Python virtual environment support
Ubuntu manages its system Python packages. Install `venv` so project packages can be kept separate:

```bash
sudo apt update
sudo apt install -y python3-venv
```

### Step 7 — Create the virtual environment
Run this **once** in `backend/document-ai`:

```bash
python3 -m venv .venv
```

It creates the `.venv` directory for this backend.

### Step 8 — Activate the virtual environment

```bash
source .venv/bin/activate
```

Your terminal prompt should begin with `(.venv)`.

### Step 9 — Install backend dependencies
With the environment active:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### Step 10 — Configure AI provider and CORS
Create `backend/document-ai/.env` with the provider you want. Example:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=replace_with_your_key
GEMINI_MODEL=gemini-3.5-flash-lite

OPENAI_API_KEY=replace_with_your_key_if_using_openai
OPENAI_MODEL=gpt-4o-mini

ALLOWED_ORIGINS=http://localhost:5173,https://dineshreddy.info,https://www.dineshreddy.info
```

Keep `.env` private and ignored by Git. Change `AI_PROVIDER=openai` to switch providers, then restart the backend. Model availability can change; use a model currently available to your API key.

## Part B — Run the application (every time)

### Step 11 — Start the backend (Ubuntu terminal 1)
Navigate to the backend, activate its existing environment, and start FastAPI:

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio/backend/document-ai
source .venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

Leave this terminal running. Check **http://localhost:8000/api/health**: you should get `status: ok` with your provider and model.

### Step 12 — Start the frontend (Ubuntu terminal 2)
Open a **separate** Ubuntu terminal:

```bash
cd /mnt/c/Users/Singi/OneDrive/Documents/Resume/dineshreddy-portfolio
npm run dev
```

Leave this terminal running. Open **http://localhost:5173/document-ai** in your browser.

### Step 13 — Test the demo
Select a PDF, DOCX, or TXT document (the current backend limit is **5 MB**). Click **Analyze with AI** to generate a summary and key points. Enter a question and click **Ask AI** to get an answer based on the document.

### Step 14 — Stop the app
Press **Ctrl+C** in each terminal when finished. On the next run, repeat only **Steps 11–13**. You do **not** need to recreate `.venv` or reinstall dependencies each time.

## Notes
- React site and FastAPI backend are separate processes; both must be running for local demo usage.
- The local API URL does not work for public website visitors. Before deploying, host FastAPI at a public HTTPS endpoint and configure `VITE_DOCUMENT_AI_API` for your Cloudflare Pages build.
- Keep provider API keys on the backend; implement rate limiting and other abuse protections before making the demo public.
- See `DOCUMENT_AI_KNOWN_ERRORS.md` only if something fails.
