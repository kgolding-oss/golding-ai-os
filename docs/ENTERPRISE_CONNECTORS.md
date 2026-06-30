# Enterprise Connectors

Milestone 8.0 introduces a deterministic Enterprise Connector Framework for future production integrations. The framework is intentionally metadata-first: mock connectors expose definitions, health, capabilities, policies, sessions, events, and telemetry without OAuth, network calls, browser automation, MCP calls, or external service access.

## Architecture

The framework lives in `lib/connectors/` and separates connector definition, registration, runtime execution, session tracking, policy evaluation, security, health, telemetry, and validation. Future connectors self-register through `registerConnector()` and are discovered via the registry. There are no switch statements or hardcoded routing paths.

## Registry

`connector-registry.ts` owns connector lifecycle:

- `registerConnector()` validates and records a connector.
- `unregisterConnector()` removes a connector.
- `getConnector()` resolves one connector by id.
- `listConnectors()` returns all connectors sorted by name.
- `validateConnector()` validates a registered definition.
- `connectorHealth()` returns the health model.

A new connector should export a `ConnectorDefinition` and call `registerConnector(definition)` from its module or package bootstrap.

## Connector Definition

Every connector declares identity, provider, category, organization scope, authentication strategies, permissions, capabilities, operations, resources, rate limits, retry policy, timeout, health, deterministic mode, streaming/async/webhook/event support, and security classification.

## Runtime

`connector-runtime.ts` executes requests through the registry. Each execution receives session context, organization, user, workflow, runtime session, permissions, correlation id, policy, telemetry, and audit-compatible events. Runtime sessions are tracked in-memory for deterministic review and can be persisted by a future migration.

## Authentication Abstraction

Authentication is modeled but not implemented. Supported strategy types include OAuth2, OAuth PKCE, API keys, JWT, service accounts, bearer tokens, personal access tokens, signed requests, and `none` for deterministic mocks. Secret storage, refresh, consent screens, and OAuth callbacks are future work.

## Policy Engine

`connector-policy.ts` evaluates organization isolation, connector allowlists/denylists, operation restrictions, resource restrictions, timeout ceilings, deterministic execution requirements, audit requirements, and operation permissions before any execution occurs.

## Telemetry and Events

`connector-events.ts` records connector registered, initialized, authentication requested/completed, execution started/completed/failed, policy denied, and health changed event types. `connector-telemetry.ts` summarizes executions, failures, policy denials, and recent events for dashboards and diagnostics.

## Health Model

Connector health tracks availability, authentication status, registration status, health score, recent failures, last execution, average duration, rate-limit utilization, warnings, diagnostics, and check timestamp. Mock connectors default to healthy and state that no network calls are performed.

## Capability Model

Capabilities declare deterministic operations and resources. Future production connectors should add capabilities without modifying the runtime or command agent. The dashboard and command agent read capabilities dynamically.

## Security Model and Organization Isolation

Connector definitions include security classification and organization scope. Organization-scoped connectors require an organization id unless policy explicitly disables isolation. The framework does not change Active Organization behavior and does not bypass existing RBAC or runtime permissions.

## Runtime, Workflow, Orchestration, and Persistence Integration

The AI Runtime discovers connectors through the connector registry instead of importing connector implementations. Workflows and orchestration can pass workflow ids, agent ids, runtime session ids, and correlation ids into connector requests. Persistence integration is represented through audit-compatible events and session records; durable connector tables can be added later without changing connector definitions.

## Mock Connectors

The current registry bootstraps deterministic mock connectors for GitHub, Gmail, Google Drive, Google Calendar, Supabase, Vercel, Browser, OpenAI, and MCP Server. They expose metadata, capabilities, health, and supported operations only.

## Adding a Connector

1. Create a strongly typed `ConnectorDefinition`.
2. Define operations, resources, permissions, capabilities, rate limits, retry policy, timeout, health, and security classification.
3. Keep `execute()` deterministic unless a future production milestone explicitly enables network access.
4. Register with `registerConnector(definition)`.
5. Validate with `validateConnector(id)` and inspect dashboard/command output.

## Future Production Integrations

Future milestones can implement OAuth, MCP transport, OpenAI API operations, and browser automation by adding connector modules that conform to `ConnectorDefinition`. The registry, runtime, policies, telemetry, dashboard, and command agent should not require redesign for 500+ connectors.
