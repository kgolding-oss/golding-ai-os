# Architecture Decisions

## Active Organization model
- **Context:** The operating system serves multiple organizations but the executive dashboard needs one deterministic operating context.
- **Decision:** Keep an active organization selector and scope dashboard reads, memberships, projects, tasks, approvals, activity, and audit logs to that organization.
- **Rationale:** Explicit scope prevents cross-organization leakage and makes executive commands deterministic.
- **Tradeoffs:** Global views require additional aggregation logic instead of falling out of default queries.
- **Future considerations:** Add role-aware cross-organization portfolio views once organization isolation is fully validated.

## Agent framework
- **Context:** Agents need common lifecycle metadata, health, commands, tools, validation, and summaries.
- **Decision:** Define shared agent contracts in `lib/types/agent.ts` and implement a reusable abstract base class in `lib/agents/base-agent.ts`.
- **Rationale:** Shared contracts reduce duplicated type definitions and give future agents a consistent execution surface.
- **Tradeoffs:** The base class is intentionally conservative and does not prescribe persistence or asynchronous orchestration.
- **Future considerations:** Add durable run records, permission checks, and workflow orchestration hooks.

## Command Registry
- **Context:** Command routing was coupled to the command agent and difficult to extend safely.
- **Decision:** Register commands through `lib/agents/command-registry.ts`, including aliases, permissions, categories, and handlers.
- **Rationale:** Registry-based routing makes commands discoverable, testable, and extensible without editing the agent lifecycle.
- **Tradeoffs:** Handlers must remain small or be factored into domain services to keep the registry readable.
- **Future considerations:** Add permission enforcement and persistent command telemetry.

## Executive Command Agent
- **Context:** Executives need deterministic answers for priorities, blockers, activity, workforce health, and briefs.
- **Decision:** Keep the Executive Command Agent deterministic, registry-backed, and free of LLM calls or external APIs.
- **Rationale:** Determinism supports auditability and reliable browser preview behavior.
- **Tradeoffs:** Natural language flexibility is limited to registered aliases and simple matching.
- **Future considerations:** Add an optional LLM interpretation layer only after permissions, audit logs, and fallbacks are in place.

## Release Manager
- **Context:** Release readiness needs a repeatable health signal derived from validation and operating blockers.
- **Decision:** Provide a pure release health evaluator that returns status, score, and reasons.
- **Rationale:** A pure function is easy to test and can be reused by command handlers, dashboards, and future release agents.
- **Tradeoffs:** The current score is heuristic and does not yet read CI provider data.
- **Future considerations:** Integrate CI results, deployment status, and approval policies.

## Dashboard architecture
- **Context:** The dashboard combines Supabase data with derived attention and recommendation intelligence.
- **Decision:** Keep data fetching in query modules and deterministic intelligence in pure functions consumed by UI and agents.
- **Rationale:** Separating queries from derivation improves testability and keeps the UI declarative.
- **Tradeoffs:** Pure derivations may duplicate some database filtering until server-side views mature.
- **Future considerations:** Add cached server-side projections and browser-level command execution surfaces.
