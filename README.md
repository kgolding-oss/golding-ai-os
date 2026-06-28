# Golding AI Operating System

Sprint 1 is a deployable Next.js executive dashboard shell for the Golding AI Operating System. It uses static mock data only and intentionally does **not** connect to OpenAI, Gmail, Google Drive, Supabase, Twilio, or any other paid/external integration.

## What is included

- Next.js App Router application at `/`
- TypeScript project setup
- Professional dark executive dashboard UI
- CEO AI command panel mock interface
- Business lanes for:
  - The Law Library
  - YouPassGo
  - Golding Compound
  - Relax With Me
- Approval queue
- Task list
- Audit log
- Mobile-friendly CSS

## Run locally

1. Install Node.js 20 or newer from [nodejs.org](https://nodejs.org/).
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for production

```bash
npm run build
```

If the build succeeds, the app is ready to deploy to Vercel.

## Beginner Vercel deployment

1. Create or sign in to a Vercel account at [vercel.com](https://vercel.com/).
2. Push this repository to GitHub.
3. In Vercel, choose **Add New Project**.
4. Import the `golding-ai-os` repository.
5. Keep the default framework settings. Vercel should detect Next.js automatically.
6. Do not add environment variables for Sprint 1.
7. Click **Deploy**.
8. After deployment completes, open the production URL Vercel provides.

## Sprint 1 safety notes

- No secrets are required.
- No `.env` file is needed.
- No live AI calls are made.
- All dashboard content is mock data stored in the app source.
