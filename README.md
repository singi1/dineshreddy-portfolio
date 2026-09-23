# Dinesh Reddy Portfolio

A React + Vite personal portfolio site prepared for `dineshreddy.info`.

## Features

- Responsive professional landing page
- About, Skills, Projects and Contact sections
- Profile image included
- Resume download button
- AI Document Analyzer project card
- Future `DocumentAI.jsx` page shell included
- Ready for GitHub and Cloudflare deployment

## Run locally

1. Install Node.js 20+.
2. Open this folder in Visual Studio Code.
3. Open Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite, usually `http://localhost:5173`.

## Production build

```bash
npm run build
```

The production files will be generated in the `dist` folder.

## Cloudflare

You can deploy this project by importing the GitHub repository into Cloudflare.

Recommended settings:

- Build command: `npm run build`
- Output directory: `dist`

Then add your custom domain:

`dineshreddy.info`

## AI Document Analyzer

`src/pages/DocumentAI.jsx` contains the starting UI shell for the AI document project.
The next step is to connect the page to a secure backend/API using Gemini or another LLM.

## Important

Do not put Gemini/OpenAI API keys directly in React source code. Keep API secrets
in a server-side environment such as a Cloudflare Worker secret.
