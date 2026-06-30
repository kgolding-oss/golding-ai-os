# Persistence and Audit Layer

Milestone 6.2 introduces a durable operating-history layer for Golding AI OS. The design keeps existing deterministic in-memory behavior intact while adding explicit repository-style writes for executions, orchestration, health snapshots, and audit events.

## Schema design

The migration `20260630120000_milestone_6_2_persistent_execution_audit.sql` creates minimal, organization-scoped tables:

- `command_executions`
- `workflow_executions`
- `workflow_execution_steps`
- `orchestration_messages`
- `orchestration_tasks`
- `orchestration_events`
- `health_snapshots` for agent, release, and knowledge health
- `system_audit_events`

Each table includes `organization_id`, optional actor/agent/workflow references, `correlation_id`, `status`, jsonb `payload`, jsonb `result`, jsonb `error_details`, and timestamps. Specialized columns such as `command_text`, `execution_id`, `event_type`, `task_id`, and `snapshot_type` support efficient filtering without over-normalizing early architecture data.

## RLS model

All tables have RLS enabled. Select, insert, and update policies use `public.is_org_member(organization_id, auth.uid())`, which means a user can only access records for organizations where they have an active membership or platform super-admin access. There are no policies that expose cross-organization history.

## Persistence architecture

Application code writes through `lib/persistence/` only:

- `repository.ts` centralizes Supabase REST access.
- `serializer.ts` normalizes payloads and errors into safe JSON.
- `validators.ts` prevents organization-less durable writes.
- Domain modules expose focused functions for command, workflow, orchestration, health, and audit history.

If Supabase credentials, an access token, or an organization id are absent, read methods return empty states and write methods no-op/fail closed before database access. This preserves local deterministic behavior.

## Repository pattern

The repository accepts a persistence context and writes one table-specific record at a time. Product modules do not import Supabase directly for history. This keeps persistence explicit, testable, and replaceable by future background workers or server actions.

## Audit trail design

`system_audit_events` is intended for durable platform actions that are not already represented by command, workflow, orchestration, or health tables. It stores action, entity table/id, status, payload/result metadata, and error details.

## Correlation IDs

Every persistence helper accepts or generates a correlation id. Correlation ids connect a command submission to workflow executions, orchestration messages/tasks/events, health snapshots, and audit events. They are indexed for later trace views.

## Organization isolation

`organization_id` is non-null in the database schema and indexed with `created_at` for the common “recent history for active organization” query. The dashboard and command handlers pass the active organization into the persistence layer.

## Command history

The Executive Command Agent records command executions when an access token and active organization are available. New deterministic commands read operating history and return useful empty states when no persistent rows exist.

## Workflow history

The Workflow Engine still writes to its in-memory state store. When persistence context exists, it additionally records workflow execution rows and workflow step rows. Failed validation and runtime failures are captured with structured error details.

## Orchestration history

Agent Orchestration can persist messages, queued tasks, and emitted events through `orchestration-history.ts`. In-memory queues remain the source of deterministic local behavior, while durable records provide reviewable history.

## Health history

`health-history.ts` provides a shared `recordHealthSnapshot` abstraction for agent, release, and Knowledge OS health. `health_snapshots.snapshot_type` distinguishes health domains while keeping the table compact.

## Failure tracking

Failures are represented by `status = 'failed'` and/or populated `error_details`. The Operating History dashboard combines recent failed records from durable command, workflow, orchestration, and health history.

## Future observability integration

Correlation ids and timestamp indexes support a future trace viewer, background queue replay, long-term retention policies, and integration with logs/metrics systems without changing product modules.

## Future analytics integration

The schema can support analytics for command volume, workflow success rate, agent throughput, health trends, and organization-level operating cadence. Future milestones should add rollups or materialized views instead of querying raw event tables for large dashboards.
