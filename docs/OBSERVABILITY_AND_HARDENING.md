# Observability and Platform Hardening

Milestone 7.1 centralizes defensive platform infrastructure in `lib/observability/` without changing authentication, RLS, schemas, or external integrations.

## Logging architecture

`logger.ts` emits structured JSON records for `info`, `warn`, `error`, and `debug`. Every record includes timestamp, event, subsystem, optional correlation/user/organization identifiers, redacted metadata, and safe error serialization.

## Correlation ID strategy

`correlation.ts` creates deterministic-shaped correlation IDs for request, command, workflow, runtime, and persistence paths. Callers can pass existing IDs to preserve trace continuity.

## Health checks

`health.ts` produces a single platform report with overall status, subsystem statuses, warnings, errors, timestamp, and build metadata. The `/api/health` route returns this JSON and never exposes secrets.

Covered subsystems include environment variables, Supabase connectivity, active organization, dashboard data, persistence, command registry, agent registry, workflow engine, knowledge registry, orchestration, AI runtime, and release manager.

## Diagnostics checks

`diagnostics.ts` aggregates startup, registry, and runtime checks. Findings are warnings or errors and include subsystem and registration IDs.

## Startup checks

`startup-checks.ts` validates required public environment configuration and reports degraded local mode when Supabase is not configured.

## Registry checks

`registry-checks.ts` validates tools, workflows, commands, knowledge providers, runtime tools, and orchestration agents for duplicate IDs, missing metadata, empty registries, unhealthy registrations, invalid security classification, permissions, and missing handlers.

## Runtime checks

`runtime-checks.ts` reviews AI Runtime metrics, policy violations, and orchestration health without calling external APIs.

## Dashboard fault tolerance

The dashboard includes a Diagnostics panel with platform health, degraded subsystems, warnings, critical errors, registration counts, runtime health, and last checked time. Diagnostics are wrapped in a safe loader that logs failures and renders an explicit degraded empty state instead of crashing the dashboard.

## Safe error serialization

`errors.ts` defines `PlatformError`, error kinds, redacted metadata, and serialization that avoids stack traces, tokens, cookies, API keys, passwords, and authorization headers.

## Production incident process

1. Check `/api/health` for overall status and degraded subsystem list.
2. Run Command Agent observability commands: platform health, diagnostics, startup checks, registry checks, and runtime checks.
3. Inspect structured logs by correlation ID and subsystem.
4. Contain unhealthy connectors or registries before retrying workflows or runtime tools.
5. Record remediation and add a targeted check for recurrence.

## Future observability integrations

Future milestones can export logger events to hosted log drains, persistence-backed health snapshots, and dashboard trend lines.

## Future alerting integrations

Alerting can be layered on health status transitions, critical diagnostics, repeated persistence failures, and runtime policy violation thresholds.

## Future OpenTelemetry strategy

The correlation context and structured logger are intentionally compatible with future OpenTelemetry trace/span IDs. A later milestone can map logger fields to OTel attributes and export traces without changing product code paths.
