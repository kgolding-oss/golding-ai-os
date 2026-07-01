# GAIOS Database and Persistence Audit

Generated: 2026-07-01

## Scope

This audit traces persistence writes through `repositoryFrom(...).insert(...)`, reads through `getRows(...)` / `supabaseRequest(...)`, and reconciles those references with `supabase/migrations`.

## Code-referenced tables

### Persistence insert targets

| Table | Primary references | Migration status |
| --- | --- | --- |
| `executive_snapshots` | `lib/agents/chief-of-staff/chief-of-staff-memory.ts`, `lib/persistence/executive-history.ts` | Present in `20260701010000_create_executive_snapshots.sql` |
| `autonomous_history` | `lib/autonomy/autonomous-history.ts` | Present in `20260701010000_create_executive_snapshots.sql` |
| `system_audit_events` | `lib/persistence/audit-log.ts` | Present in `20260630120000_milestone_6_2_persistent_execution_audit.sql` |
| `command_executions` | `lib/persistence/command-history.ts` | Present in `20260630120000_milestone_6_2_persistent_execution_audit.sql` |
| `health_snapshots` | `lib/persistence/health-history.ts` | Present in `20260630120000_milestone_6_2_persistent_execution_audit.sql` |
| `orchestration_messages` | `lib/persistence/orchestration-history.ts` | Present in `20260630120000_milestone_6_2_persistent_execution_audit.sql` |
| `orchestration_tasks` | `lib/persistence/orchestration-history.ts` | Present in `20260630120000_milestone_6_2_persistent_execution_audit.sql` |
| `orchestration_events` | `lib/persistence/orchestration-history.ts` | Present in `20260630120000_milestone_6_2_persistent_execution_audit.sql` |
| `workflow_executions` | `lib/persistence/workflow-history.ts` | Present in `20260630120000_milestone_6_2_persistent_execution_audit.sql` |
| `workflow_execution_steps` | `lib/persistence/workflow-history.ts` | Present in `20260630120000_milestone_6_2_persistent_execution_audit.sql` |

### Query targets

| Table | References | Migration status |
| --- | --- | --- |
| `agent_registry` | app pages and dashboard queries | Present |
| `approvals` | app pages and dashboard queries | Present |
| `organization_invitations` | invitations page | **Missing migration** |
| `organizations` | app pages, health checks, dashboard queries | Present |
| `organization_memberships` | people page, active organization flow, dashboard queries | **Missing migration** |
| `user_preferences` | profile page, dashboard queries | Present |
| `user_roles` | RBAC page | **Missing migration** |
| `tasks` | tasks page and dashboard queries | Present |

## Missing schema objects

### Missing tables

1. `organization_memberships` is queried by active organization flow and People/dashboard pages but is not created by migrations. Existing migrations create `organization_users`, so either the code should read `organization_users` or a compatibility migration should create `organization_memberships`.
2. `organization_invitations` is queried by the Invitations page but has no migration.
3. `user_roles` is queried by the RBAC page but has no migration. Existing migrations include `permission_groups` and `role_permissions`, but not `user_roles`.

### Missing columns

No definitive blocking column gaps were found for migrated tables during manual review. The audit script emits a conservative `missingColumns` list when it sees nested payload keys in inline insert objects; treat those entries as review hints rather than confirmed database failures. Persisted history tables intentionally store most agent-specific data in JSON columns (`payload`, `result`, `error_details`) plus canonical scalar columns.

### Indexes

All migrated code-referenced persistence tables include at least one index in migration SQL. Missing tables listed above also lack indexes by definition.

Recommended indexes for missing tables if they are created:

- `organization_memberships(organization_id, status, created_at)`
- `organization_invitations(organization_id, created_at)`
- `user_roles(organization_id, created_at)`

### RLS policies

Migrated code-referenced tables have RLS enabled. Missing tables have no RLS policies by definition.

Recommended policy pattern for missing tables:

- Enable RLS.
- Allow authenticated members of `organization_id` to read rows for their organization.
- Restrict writes to appropriate owner/admin roles once RBAC is finalized.

## Migration reconciliation

- `executive_snapshots` migration exists: `supabase/migrations/20260701010000_create_executive_snapshots.sql`.
- Persistent execution audit migration exists: `supabase/migrations/20260630120000_milestone_6_2_persistent_execution_audit.sql`.
- The primary mismatch is naming drift between code (`organization_memberships`) and schema (`organization_users`).

## Machine-readable audit

Run:

```bash
npm run audit:gaios
```

The script prints JSON with referenced tables, migration files, missing tables, RLS/index hints, dynamic import checks, and discovered environment variables.
