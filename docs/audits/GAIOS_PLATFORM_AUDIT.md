# GAIOS Platform Audit

Generated: 2026-07-01

## Executive summary

The GAIOS platform has coherent subsystem boundaries for Supabase data access, dashboard orchestration, deterministic agent runtimes, command handling, and persistence history. The most important audit finding is database schema drift: several runtime pages and active-organization flows reference tables that do not currently exist in migrations.

## Critical findings

| Severity | Finding | Impact | Recommended action |
| --- | --- | --- | --- |
| Critical | `organization_memberships` is referenced by active organization and dashboard flows but is not migrated. | Authenticated dashboard users may fail active organization resolution or see empty/no organization state. | Create table or change code to `organization_users`. |
| High | `organization_invitations` is queried by the Invitations page but is not migrated. | Invitations route can fail against live Supabase. | Add migration with RLS/indexes. |
| High | `user_roles` is queried by the RBAC page but is not migrated. | RBAC route can fail against live Supabase. | Add migration or map to existing permission tables. |
| Medium | Dashboard renders `FinanceOperationsPanel` twice. | Duplicate UI and render work. | Remove one render. |
| Medium | Dashboard has several unguarded runtime synthesis calls. | One runtime exception can break the full Server Component. | Wrap noncritical snapshots in safe helpers. |

## Persistence audit result

- Insert-backed history tables are migrated for command, workflow, orchestration, health, audit, executive snapshot, and autonomous history persistence.
- `executive_snapshots` migration exists.
- Migrated referenced tables have RLS enabled and index coverage.
- Missing tables have no RLS/index coverage until migrations are added.

## Migration audit result

Existing migration coverage is strongest for foundation/executive-core tables and persistent execution audit tables. The active organization/RBAC naming layer needs reconciliation.

## Dashboard audit result

All dashboard imports resolved during TypeScript/build checks. The dashboard provides required props to panels. Runtime risks are primarily duplicated finance rendering and unguarded synthesis calls.

## Agent and command audit result

Major agents provide runtime and health exports, dashboard projections are present where referenced, and documentation exists for main agent domains. Dynamic imports in the command registry resolved in the machine-readable audit.

## Environment variables

Required for live Supabase mode:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Authentication/runtime metadata:

- `NODE_ENV`
- `npm_package_version`
- `VERCEL_GIT_COMMIT_SHA`

Optional connector variables:

- GitHub: `GITHUB_TOKEN`, `GITHUB_APP_ID`, `GITHUB_APP_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY`
- Vercel: `VERCEL_PROJECT_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_TOKEN`
- OpenAI: `OPENAI_API_KEY`, `OPENAI_PROJECT_ID`, `OPENAI_ORG_ID`

## Auth/session audit result

- Login sets `gaios_session` and `gaios_user` cookies after successful Supabase token exchange.
- Logout clears both cookies.
- Middleware redirects protected routes to `/login` when `gaios_session` is absent.
- `requireSession()` redirects to `/login` when session is absent.
- Active organization depends on `user_preferences` plus membership rows; schema drift around `organization_memberships` is the key blocker.

## New audit tooling

Added `scripts/gaios-audit.mjs` and `npm run audit:gaios`. The script emits JSON for:

- repository persistence insert table references
- Supabase read table references
- migration table coverage
- missing tables
- RLS/index coverage hints
- dynamic import resolution
- discovered environment variables

## Next steps

1. Add migrations for `organization_memberships`, `organization_invitations`, and `user_roles`, or update code to use already-migrated tables.
2. Remove duplicate Finance panel rendering.
3. Add CI checks for `npm run audit:gaios`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
4. Split command registry into command-family modules and add smoke tests for handlers.
