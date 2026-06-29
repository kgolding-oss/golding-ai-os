# Architecture Decisions

## Active Organization model

- **Context:** Operators can belong to multiple organizations, while dashboards and workflows must remain scoped to the currently selected operating context.
- **Decision:** Keep active organization as an explicit application context and require organization-aware queries for dashboard records.
- **Rationale:** This prevents cross-organization data leakage and keeps executive intelligence deterministic.
- **Tradeoffs:** Every feature must accept or derive organization scope before querying data.
- **Future considerations:** Add policy tests and database helper views for higher-volume organization-aware workflows.

## Agent framework

- **Context:** Golding AI OS will support many specialized agents with common lifecycle needs.
- **Decision:** Introduce `BaseAgent` and shared agent types so agents inherit identity, health, commands, tools, validation, recommendations, and summaries.
- **Rationale:** A common contract minimizes boilerplate and makes future Legal, Funding, Property, Release Manager, Knowledge, Marketing, and Executive Assistant agents consistent.
- **Tradeoffs:** The base class intentionally stays small, so agent-specific orchestration remains in concrete agents.
- **Future considerations:** Add persistence, permissions enforcement, execution history, and tool adapters as real integrations mature.

## Release Manager

- **Context:** Release readiness should be visible before external deployment APIs are integrated.
- **Decision:** Add a deterministic `getReleaseHealth()` model built from current application state.
- **Rationale:** Engineering can evaluate architecture, database, authentication, organization context, runtime, deployment, blockers, and recommendations without network calls.
- **Tradeoffs:** Deployment health is marked as a manual warning until Vercel integration exists.
- **Future considerations:** Add CI, Vercel, Supabase migration, and observability checks as external APIs become available.

## Dashboard architecture

- **Context:** The dashboard is the executive command surface for organization-scoped operating data.
- **Decision:** Keep dashboard querying, intelligence derivation, and presentation separated.
- **Rationale:** Components remain reusable while deterministic intelligence functions can be tested independently.
- **Tradeoffs:** Server pages must compose several modules instead of relying on one monolithic dashboard service.
- **Future considerations:** Add route-level command execution and cached organization-scoped snapshots for larger datasets.

## Command Registry

- **Context:** Hardcoded switch statements will not scale as commands and agents grow.
- **Decision:** Commands register with ids, labels, descriptions, categories, permissions, phrases, and handlers in `CommandRegistry`.
- **Rationale:** Dynamic lookup makes commands discoverable and provides structured help responses for unknown input.
- **Tradeoffs:** Command metadata must be maintained alongside handlers.
- **Future considerations:** Add permission checks, command aliases from persisted configuration, and audit logging.

## Executive Command Agent

- **Context:** Executives need deterministic summaries without LLM calls for core operating visibility.
- **Decision:** Refactor the agent to extend `BaseAgent`, use `CommandRegistry`, and return structured outputs for briefs, attention, recommendations, blockers, timeline, and suggested next actions.
- **Rationale:** This creates a reliable foundation for command automation while keeping business logic testable.
- **Tradeoffs:** Natural-language flexibility is limited to registered phrases until an LLM layer is explicitly added.
- **Future considerations:** Add streaming responses, persisted command runs, and optional LLM synthesis on top of deterministic facts.
