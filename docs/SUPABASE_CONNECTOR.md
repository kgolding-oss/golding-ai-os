# Supabase Enterprise Connector

Milestone 11.0B adds `lib/connectors/providers/supabase/` as the canonical data-platform connector implementation. It replaces the previous deterministic Supabase mock registration with a live-capable provider that still fails safely when credentials are absent.

## Architecture

The connector is split into auth, client, runtime, policy, health, telemetry, events, validation, schema, capabilities, rate-limit, error, and type modules. `supabase-connector.ts` assembles the provider definition consumed by the shared Connector Registry.

## Runtime flow

Callers must invoke Supabase through `connectorRuntime.execute()` with organization ID, runtime session ID, workflow session metadata, approval context, correlation ID, telemetry metadata, and audit metadata. The provider validates organization isolation and runtime context before any network operation.

## Authentication

Supported modes are anon key, service-role abstraction, JWT session abstraction, and SSR session abstraction. Credentials are resolved from environment variables or explicit runtime abstraction inputs, but secrets are never logged or returned. Diagnostics only report the auth mode.

## Approval policies

Read-only operations run automatically. Delete, truncate, schema modifications, table drops, destructive RPCs, storage deletes, and service-role mutations require explicit approval via the connector input before execution.

## Telemetry and observability

Telemetry records request counts, failures, policy denials, query latency, auth failures, storage metrics, edge-function failures, and realtime failures. `/api/health` includes the Supabase health snapshot alongside platform and GitHub health.

## Persistence

The connector exposes persisted record types for connector sessions, schema snapshots, migration history, health history, telemetry, and readiness history. Runtime sessions continue to be captured by the shared Connector Runtime; future durable adapters can write the typed payloads without changing callers.

## Executive Intelligence

Supabase health exposes deterministic signals for failed migrations, unhealthy auth, schema drift, RLS review, missing indexes, failed edge functions, realtime health, storage issues, and database readiness. Recommendations are deterministic and do not depend on AI generation.

## Dashboard integration

Enterprise Connectors now receives the live Supabase connector definition, including auth state, database health, migration status, auth status, storage status, edge functions, realtime, schema version, and connector health through the provider health snapshot.

## Command Agent

The Command Agent supports Supabase status, database health, migration status, auth status, storage status, edge functions, schema overview, database readiness, and migration-risk explanations. Commands delegate to Connector Runtime and never call Supabase directly.

## Security

Supabase secrets remain inside `supabase-auth.ts` and `supabase-client.ts`. The connector enforces organization isolation, runtime sessions, approval gates for destructive work, and sanitized errors. No direct Supabase client usage should be added outside the provider implementation.

## Migration strategy

Start with read-only health, schema, migration, and readiness operations. Enable mutations only after approval workflows and service-role controls are configured. Expand schema introspection and migration history using approved service-role metadata queries.

## Future autonomous operations

Autonomy can discover Supabase capabilities through the connector registry and AI Runtime metadata. Future agents should request runtime execution plans, approval decisions, and persisted health/readiness snapshots rather than importing Supabase client code.
