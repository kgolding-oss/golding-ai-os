# AI Runtime

Milestone 7 introduces a deterministic AI Runtime under `lib/runtime/`. The runtime lets agents discover, validate, and invoke registered tools without external API calls. It is intentionally MCP-ready and OpenAI tool-calling-ready while remaining local-only for this milestone.

## Architecture

The runtime is split into strongly typed modules:

- `runtime-types.ts` defines tool definitions, sessions, results, events, policies, telemetry, and security classifications.
- `runtime-registry.ts` owns `registerTool`, `unregisterTool`, `listTools`, `getTool`, `validateTool`, and `executeTool` with map-based routing and no switch statements.
- `runtime-executor.ts` creates sessions, evaluates policy, invokes tools, emits events, records telemetry, and bridges events into the existing persistence/audit path.
- `runtime-policy.ts` evaluates permissions, organization isolation, allowlists, denylists, execution limits, timeout limits, retry limits, security classification, and deterministic enforcement.
- `runtime-telemetry.ts` calculates deterministic metrics from completed sessions.
- `runtime.ts` registers deterministic built-in mock tools.

## Session lifecycle

Every tool execution occurs inside a runtime session:

1. Create a `RuntimeExecutionContext` with organization, workflow, agent, user, permission, memory, and execution context.
2. Create a runtime session.
3. Emit `session.started` and `tool.requested` events.
4. Validate the tool definition, input schema, permissions, policy, timeout, retry, classification, and determinism.
5. Execute the registered tool handler if validation succeeds.
6. Emit completed or failed tool events.
7. Complete the runtime result and update deterministic telemetry.
8. Persist events through the existing orchestration event persistence bridge when a token and organization are available.

## Tool registry

Every tool must self-register with a `RuntimeToolDefinition`. Tool definitions include identity, description, category, version, organization scope, permissions, input and output schemas, deterministic behavior, streaming/async capability flags, health, timeout, retry policy, and security classification.

Routing is data-driven through `Map<string, RuntimeToolDefinition>`. Future MCP servers and connectors can register tools without modifying the executor.

## Policy engine

Runtime policy is reusable by future agents. It enforces:

- permission validation,
- organization isolation,
- allowlists and denylists,
- execution count limits,
- timeout validation,
- retry validation,
- security classification ceilings,
- deterministic-only execution.

Policies are passed per execution, so a command agent, workflow, or orchestrated agent can apply stricter limits without changing tool code.

## Events and persistence

The runtime emits deterministic events for session start, tool request, validation, execution, failure, completion, policy denial, and runtime completion. Events are appended to the session timeline and telemetry. When persistence context is present, events are recorded via the existing persistence/audit layer so runtime behavior appears in durable operating history without adding breaking database migrations.

## Telemetry

Telemetry exposes executions, failures, average duration, tool usage, organization usage, success rate, retry count, policy violations, and runtime health. Current metrics are deterministic in-memory snapshots. Future dedicated runtime tables can persist the same model without changing runtime callers.

## Security model

Security is explicit in the tool definition. A tool declares required permissions and a classification of `public`, `internal`, `confidential`, or `restricted`. Runtime policy can cap classification and deny tools exceeding the caller's allowed boundary. Organization-scoped tools require an organization id.

## Deterministic guarantees

Built-in tools do not call external services, OpenAI, MCP servers, browser automation, or network APIs. They only use local application state. Non-deterministic tools can be represented in the model but are denied by default policy.

## Built-in tools

The runtime ships with deterministic mock tools: Echo Tool, JSON Validator, Text Formatter, Organization Context Tool, Workflow Summary Tool, Knowledge Summary Tool, and Runtime Health Tool.

## MCP compatibility strategy

Future MCP servers can be adapted by converting MCP tool descriptors into `RuntimeToolDefinition` objects and registering an executor that calls a local MCP client. Policy should run before MCP invocation. MCP server health should update tool health, and MCP resource permissions should map into runtime permissions.

## OpenAI tool-calling compatibility

OpenAI tool definitions can be generated from runtime tool metadata and schemas. Tool call results should return `RuntimeToolResult` payloads. The model should never call tools directly; agent code should hand tool call requests to the runtime executor so policy, telemetry, events, sessions, and audit remain centralized.

## Future browser automation and connector architecture

Browser automation, Gmail, Google Drive, Supabase, GitHub, Vercel, and custom enterprise connectors should be implemented as connector packages that register tools. Each connector should provide health checks, deterministic dry-run modes, scoped permissions, timeout and retry policy, and security classification. Connectors should not bypass sessions or policy.

## Relationship to platform systems

- Knowledge OS tools summarize registered knowledge providers and can later expose search or memory operations.
- Workflow Engine can call runtime tools from workflow steps.
- Agent Orchestration can delegate tool execution to runtime sessions.
- Persistence and Audit receive runtime events through the existing event bridge.
- Release Manager can use runtime telemetry and policy violations as release-readiness signals.
