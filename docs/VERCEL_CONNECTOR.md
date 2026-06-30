# Vercel Connector

Milestone 11.0D makes Vercel the canonical infrastructure and deployment provider for Golding AI OS. The connector lives in `lib/connectors/providers/vercel/` and is registered as a production connector instead of a deterministic mock.

## Architecture and runtime

All operations flow through Connector Runtime. Requests carry organization isolation, runtime session, workflow session, approval context, telemetry, correlation ID, and audit metadata before provider code touches Vercel APIs. No dashboard, command agent, AI runtime, or executive intelligence code imports the Vercel REST API directly.

## Authentication

The connector supports personal access tokens (`VERCEL_TOKEN`), team tokens (`VERCEL_TEAM_TOKEN` with `VERCEL_TEAM_ID`), project tokens (`VERCEL_PROJECT_TOKEN` with `VERCEL_PROJECT_ID`), and an OAuth interface. Tokens are only transformed into an authorization header inside the provider client and are never logged or returned.

## Deployment lifecycle

Supported read operations cover projects, deployments, latest deployment, deployment history, deployment health, rollback readiness, domains, DNS, SSL, environment-variable metadata, functions, and runtime logs. Environment-variable operations return keys and metadata only; values are never exposed.

## Approval policies

Read-only operations execute automatically. Production deployments, rollbacks, deployment deletion, project deletion, domain changes, and environment-variable modifications require explicit approval and return a policy denial when approval is absent.

## Telemetry and observability

The connector records API latency, deployment failures, runtime failures, function failures, retries, policy denials, domain health, SSL health, build duration, and deployment latency. `/api/health` includes the Vercel health snapshot and telemetry summary.

## Executive intelligence and dashboards

Enterprise Connectors now renders a Vercel deployment operations view with deployment status, production health, preview deployment coverage, build failures, domains, SSL, functions, logs, and readiness score. Executive Intelligence includes a Deployment Operations panel for production readiness, history, failed deployment risks, latency, release readiness, runtime health, and infrastructure score.

## Command agent

The command agent delegates deployment status, production health, latest deployment, failed deployments, runtime logs, deployment history, domain health, SSL status, infrastructure readiness, and deployment-health explanations through Connector Runtime.

## Persistence

Deployment history, release history, runtime summaries, infrastructure health, telemetry, and readiness history are represented by the deployment history persistence abstraction. The current milestone stores deterministic records in process memory and can be backed by Supabase tables without changing provider code.

## Security

Secrets are never exposed, environment values are never returned, and organization isolation is validated for every request. Provider errors are sanitized before reaching telemetry, command output, or health responses.

## Future autonomous deployment

The connector is ready for autonomous deployment orchestration once live write operations are enabled behind approval policies, rollback plans, workflow state, and durable audit evidence.
