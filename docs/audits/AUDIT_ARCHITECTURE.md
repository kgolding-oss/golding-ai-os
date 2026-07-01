# GAIOS Architecture Audit

Generated: 2026-07-01

## Architecture summary

GAIOS is a Next.js application backed by Supabase REST access, server-rendered dashboard pages, deterministic agent runtimes, connector registries, orchestration/workflow layers, and persistence/audit history tables.

## Key flows

### Authentication and session

- Login posts credentials to `/auth/login`, calls Supabase password grant, then writes `gaios_session` and `gaios_user` cookies.
- Logout clears those cookies and redirects to `/login`.
- `middleware.ts` protects core app routes by checking for `gaios_session` and redirects unauthenticated users to `/login` with `redirectedFrom`.
- `requireSession()` reads the session cookie and redirects to `/login` when unavailable.

### Active organization

- `requireActiveOrganization()` requires a session, reads active organization preference and organization memberships, and returns session, active organization, and memberships.
- Current code expects `organization_memberships`; migrations currently create `organization_users`, creating a critical schema naming mismatch.

### Dashboard runtime

- The dashboard loads Supabase rows, computes metrics/recommendations, builds runtime health, synthesizes agent snapshots, creates/schedules an autonomous plan, and renders all panels in one Server Component.
- Diagnostics are partially isolated through `safeDiagnostics`; other runtime calls are not fully isolated.

### Persistence and audit

- Persistence is centralized through `PersistenceRepository`, `repositoryFrom(context).insert(...)`, `getRows(...)`, and `supabaseRequest(...)`.
- History tables cover commands, workflows, orchestration, health, system audit events, executive snapshots, and autonomous history.

## Architectural risks

1. Schema naming drift: `organization_memberships` in code vs. `organization_users` in migrations.
2. Missing product tables: `organization_invitations` and `user_roles` are routed pages with no migration.
3. Large server dashboard render: one route composes many subsystems; a single unguarded runtime exception can break the full dashboard.
4. Inline command registry: command handlers are operationally rich but difficult to audit and test as one large file.
5. Environment variables are connector-specific and mostly optional, but public Supabase variables are required for live data mode.

## Recommendations

- Add a reconciliation migration for missing tables or update code to match existing table names.
- Remove duplicate Finance panel rendering.
- Add command registry unit smoke tests for all dynamic imports and handler export references.
- Add dashboard snapshot safety wrappers for noncritical panels.
- Keep `npm run audit:gaios` in CI as a schema/import drift smoke test.
