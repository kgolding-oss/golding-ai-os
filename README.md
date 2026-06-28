# Golding AI Operating System

Sprint 2 turns the Sprint 1 dashboard shell into the production foundation for the Golding AI Operating System. The app uses Next.js App Router, TypeScript, Vercel-ready deployment, server-side Supabase authentication, protected routes, a reusable token-based theme, and SQL migrations for the operating database.

## Core modules

- Dashboard
- CEO
- The Law Library
- Golding Compound
- YouPassGo
- Relax With Me
- Funding
- CRM
- Projects
- Documents
- Knowledge
- AI Agents
- Settings

## Brand system

The official Art Deco wallpaper is represented as reusable design tokens rather than repeated imagery. Tokens live in `theme/`:

- `colors.ts`
- `typography.ts`
- `shadows.ts`
- `spacing.ts`
- `radius.ts`

Components consume CSS custom properties generated from these tokens in `app/layout.tsx`.

## Supabase environment variables

Only public Supabase variables are required:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-public-anon-key"
```

Never add a Supabase service role key to this app or to Vercel frontend/server runtime variables.

## Database setup

Apply the SQL migration in `supabase/migrations/20260628000000_sprint_2_foundation.sql` to your Supabase project. It creates:

- `profiles`
- `organizations`
- `businesses`
- `projects`
- `tasks`
- `approvals`
- `documents`
- `knowledge`
- `agent_memory`
- `audit_logs`

Every table has Row Level Security enabled. Policies restrict access to rows owned by the authenticated user.

## Run locally

1. Install Node.js 20 or newer from [nodejs.org](https://nodejs.org/).
2. Install dependencies:

   ```bash
   npm install
   ```

3. Add the Supabase public variables to `.env.local`.
4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).
6. Sign in with an existing Supabase Auth user.

## Validate production readiness

```bash
npm run lint
npm run build
```

## Deploy to Vercel

1. Push this repository branch to GitHub.
2. In Vercel, choose **Add New Project**.
3. Import the `golding-ai-os` repository.
4. Add only the two public Supabase variables listed above.
5. Keep the default Next.js build settings.
6. Click **Deploy**.

## Security notes

- No service role key is used.
- No Gmail, Google Drive, OpenAI, Twilio, or paid integrations are connected.
- Authentication is server-side and protected pages redirect unauthenticated users to `/login`.
- Dashboard data is read from Supabase REST endpoints under the signed-in user's JWT and RLS policies.
