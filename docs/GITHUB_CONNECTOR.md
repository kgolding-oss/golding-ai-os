# GitHub Connector

Milestone 11.0A introduces `lib/connectors/providers/github` as the reference live enterprise connector. It replaces the deterministic mock registration with a connector definition that is registered through the existing Connector Framework and executed only by `ConnectorRuntime`.

## Architecture

The provider is split into authentication, client, runtime, policy, telemetry, health, validation, capabilities, events, rate-limit, types, and errors modules. No caller should invoke GitHub directly; callers send operation requests to the connector runtime with organization, runtime session, approval context, correlation ID, and execution metadata.

## Authentication

Supported models are GitHub personal access tokens (`GITHUB_TOKEN`), GitHub App configuration (`GITHUB_APP_ID`, `GITHUB_APP_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY`), and an OAuth interface abstraction. Tokens are never returned in connector output, and errors are sanitized before telemetry or runtime responses are persisted.

## Runtime Flow

1. Command agent, dashboard, workflow, or executive intelligence creates a connector execution request.
2. `ConnectorRuntime` creates a connector session, evaluates connector policy, emits framework events, and calls the GitHub connector implementation.
3. GitHub runtime validates organization isolation, runtime session ID, and correlation ID.
4. Provider policy checks destructive operations and approval evidence.
5. The GitHub client performs the API call and captures rate-limit headers.
6. Telemetry records latency, success/failure, policy denials, and rate limits.

## Approval Flow and Policy Enforcement

Read-only operations run automatically. Merge PR, delete branch, delete repository, force-push, and release publication operations are modeled as approval-required operations and return `APPROVAL_REQUIRED` unless explicit approval evidence is present.

## Supported Operations

The connector supports repositories, branches, tags, pull requests, issues, labels, commits, actions workflow runs/jobs, releases, deployments, repository/code/issue search, rate limit, and engineering health operation IDs. Mutating create/update issue and PR operations are routed through the same runtime path.

## Telemetry and Observability

GitHub telemetry includes request counts, failure counts, average API latency, policy denials, and recent operation history. `/api/health` exposes the GitHub health snapshot and telemetry summary.

## Persistence

Connector sessions are persisted in the framework session history. Runtime outputs include repository snapshots, workflow summaries, rate-limit snapshots, and execution history so future durable repositories can store them without changing call sites.

## Executive Intelligence

GitHub signals are designed to influence executive score, risks, opportunities, recommendations, bottlenecks, and engineering health by surfacing failing CI, stale PRs, unreviewed PRs, inactive repositories, deployment failures, security alert placeholders, excessive failed builds, and repositories needing attention.

## Dashboard and Command Agent

The connector definition exposes authentication state, repository capabilities, PR/workflow/deployment/rate-limit operations, and health for the Enterprise Connectors panel. GitHub command labels should delegate to `ConnectorRuntime` and never fetch from GitHub directly.

## Security

The provider enforces organization context, runtime session context, sanitized errors, no token logging, approval gates for destructive operations, and framework policy evaluation before provider execution.

## Rate Limiting

`github-rate-limit.ts` parses GitHub rate-limit headers and exposes utilization for health and executive views.

## Future Automation

Future milestones can add webhook ingestion, installation-token exchange for GitHub Apps, durable Supabase-backed GitHub snapshots, security alert APIs, deployment environment rollups, and automatic remediation plans while preserving this module boundary.
