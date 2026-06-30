# AI Runtime and MCP Platform

Milestone 11.0E establishes Golding AI OS as an AI-native operating system by routing all model, prompt, tool, and MCP activity through registry-driven runtime abstractions.

## Architecture

The platform is provider-agnostic. OpenAI is implemented as a connector provider, MCP is implemented as a server and tool abstraction, and AI execution remains behind the Connector Runtime, AI Runtime, Approval Engine, Workflow Engine, Observability, Persistence, and organization isolation boundaries.

## Runtime and Connector Model

`lib/ai` owns model routing, policy evaluation, context assembly, token accounting, cost accounting, session records, events, and telemetry. `lib/connectors/providers/openai` exposes OpenAI authentication, discovery, health, runtime, policy, telemetry, validation, rate limiting, and error surfaces without hardcoded models. Models must be discovered by providers and registered with metadata.

## Model Registry

Each model registration includes id, provider, family, version, context window, modalities, reasoning, structured output, streaming, tool, image, vision, embedding support, cost metadata, rate limits, and safety classification. Routing is deterministic and cost-aware.

## Prompt Registry

Prompts are versioned, owner-scoped, organization-aware, lifecycle-controlled, validated, approval-ready, and rollback-capable. Prompt rendering uses explicit template variables; prompt strings should not be scattered through runtime code.

## Tool Registry

The AI tool registry maps GitHub, Supabase, Google Workspace, Vercel, Runtime, and Workflow Engine capabilities with permissions, approval metadata, destructive-operation metadata, and execution policy.

## MCP Platform

The MCP layer supports server registration, discovery, capability negotiation, tool registration, sessions, health, policy, telemetry events, and abstract execution. It intentionally contains no server-specific code.

## Context Assembly

The context builder deterministically assembles organization, active user, workflow, executive intelligence, operating history, connector context, runtime context, approval context, and knowledge context.

## AI Policies and Approvals

Approval is required for autonomous model execution, external tool execution, high-cost routing, cross-organization or unrestricted execution, destructive tool operations, and unrestricted prompts.

## Telemetry, Persistence, and Observability

AI telemetry tracks sessions, tokens, costs, latency, failures, routing, streaming, tool calls, MCP failures, retries, and approval requirements. `/api/health` exposes AI platform metrics alongside existing subsystem health. In-memory milestone stores define the persistence contract for model sessions, prompt versions, tool executions, AI costs, MCP sessions, routing history, and AI telemetry; database migrations can attach to these interfaces in a future persistence milestone.

## Dashboard and Executive Intelligence

The dashboard includes an AI Platform section for models, prompts, tools, MCP, sessions, and costs. The Executive Dashboard includes AI Operations readiness, model health, MCP health, prompt quality, tool readiness, execution efficiency, cost efficiency, and AI platform score. Executive Intelligence can deterministically flag high AI costs, unused models, duplicate or stale prompts, failing MCP servers, tool failures, token spikes, latency, and routing inefficiencies as telemetry volume grows.

## Security Review

API keys are never exposed. Live OpenAI execution remains disabled unless credentials and approval gates are configured. Organization identifiers are carried through session, request, prompt, MCP, and context abstractions. No connector or model provider bypasses runtime or policy layers.

## Future Autonomous AI

Autonomous planning can now reason about model routing, AI costs, prompt approvals, MCP execution, and tool policies. Live autonomous execution remains disabled until future milestones explicitly enable it behind approvals and recovery controls.
