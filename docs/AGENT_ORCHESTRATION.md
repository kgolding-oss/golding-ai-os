# Agent Orchestration Architecture

Milestone 6.1 introduces a deterministic, provider-independent orchestration layer under `lib/orchestration/`. It coordinates registered AI agents without external APIs, LLM calls, distributed brokers, or schema changes.

## Architecture

The orchestration package is composed of reusable modules:

- `agent-bus`: creates and publishes structured agent messages.
- `orchestrator`: public facade for discovery, delegation, execution, health, metrics, and workforce snapshots.
- `scheduler`, `dispatcher`, `coordinator`: typed extension seams that currently resolve to deterministic orchestrator behavior and can be replaced by specialized implementations later.
- `execution-context`: shared execution context types for task-scoped work.
- `task-queue`: deterministic in-memory queue with enqueue, dequeue, cancel, retry, prioritize, inspect, and execution history.
- `state-manager`: idempotency and execution history tracking.
- `event-system`: in-process orchestration event stream.
- `lifecycle-manager`: heartbeat and lifecycle summaries.
- `telemetry` and `metrics`: deterministic runtime and health calculations.
- `registry-integration`: adapts the system Command Agent and dashboard `agent_registry` records into a common runtime shape.

## Communication Protocol

Agents communicate with `AgentMessage` objects rather than direct method calls. Supported message types are `request`, `response`, `event`, `notification`, `delegation`, `completion`, `failure`, `health_update`, and `heartbeat`.

Every message includes a message id, correlation id, organization id, workflow id, sender, recipient, timestamp, priority, payload, metadata, and status. The protocol is transport-neutral so a future distributed bus can preserve the same public contract.

## Execution Lifecycle

1. An agent or Command Agent creates a delegation request.
2. The bus publishes a structured message.
3. The task queue stores a queued task with an idempotency key.
4. The orchestrator dequeues work deterministically by priority and creation time.
5. The state manager creates an execution context and prevents duplicate execution.
6. Execution history, metrics, and events are recorded.
7. Health snapshots and dashboard summaries update from deterministic state.

## Task Queue

The in-memory queue is intentionally deterministic. Priority ordering is `critical`, `high`, `normal`, then `low`, with FIFO ordering inside the same priority. The queue records cancellation reasons, retry attempts, max attempts, last error, and history records. Its interface is isolated so Redis, RabbitMQ, Postgres-backed queues, or cloud task services can replace it later without changing dashboard or Command Agent integrations.

## Scheduling and Delegation Model

Scheduling is currently explicit and deterministic: tasks are enqueued and executed by dispatcher calls. Future autonomous scheduling can add policy engines on top of the same queue and protocol. Delegation always targets a registered agent and records sender, recipient, correlation id, organization scope, workflow scope, priority, and metadata.

## Execution Context

Execution contexts carry task id, agent id, organization id, workflow id, input payload, metadata, attempts, timestamps, and an idempotency key. Contexts are deliberately provider-independent and safe to persist in future milestones.

## Event System

The event system emits task and lifecycle events including message sent, task enqueued, task started, task completed, task failed, task cancelled, agent heartbeat, and health updates. It is in-memory today and can be bridged to audit logs, observability pipelines, or a distributed event bus later.

## Health Monitoring and Metrics

Agent health snapshots track availability, execution count, success rate, failure rate, average runtime, last heartbeat, last execution, queued work, current activity, and health score. System health tracks registered agents, running agents, idle agents, queued work, completed work, failed work, throughput, and aggregate health score.

Health scores are deterministic: success rate, failure rate, queued work, and heartbeat presence are combined into a clamped 0-100 score. Scores map to healthy, degraded, or unhealthy states.

## Failure Recovery

Failures are recorded as execution records and reflected in metrics. Queue retry support is available with max-attempt enforcement. Duplicate execution is prevented by idempotency keys. Persistent dead-letter queues and replay tooling are future extensions.

## Relationships With Existing Systems

- **Agent Registry**: dashboard registry rows are adapted into orchestration agents without schema changes.
- **Workflow Engine**: orchestration commands report running workflows and can carry workflow ids on messages.
- **Knowledge OS**: agents can share knowledge context through message payloads and metadata without direct provider coupling.
- **Release Manager**: release and workflow commands remain deterministic and can be delegated through the queue in later milestones.
- **Executive Command Agent**: command handlers delegate orchestration behavior to `lib/orchestration/` rather than embedding queue or health logic.

## Dashboard

The Executive Dashboard includes an AI Workforce command center with registered agents, running and idle agents, queued work, completed work, orchestration health, throughput, execution metrics, and communication event empty states. It uses real in-memory/server-session state and dashboard registry records only; no fake production data is introduced.

## Future Extensibility

Future milestones can add persistent queues, distributed message buses, autonomous policy schedulers, workflow-aware multi-agent plans, durable event stores, and provider-backed LLM execution. The public protocol, queue interface, and execution context are designed to survive those changes.
