# Workflow Engine

The Workflow Engine is the deterministic orchestration layer for Golding AI OS agents. It lives in `lib/workflows` and mirrors the Agent Framework and Knowledge Registry pattern: workflows register with a registry, the engine resolves workflow definitions by id, and an executor owns validation, state transitions, result capture, and execution history.

## Architecture

- `types.ts` defines strict workflow contracts, execution states, trigger types, context, results, summaries, and history records.
- `registry.ts` stores reusable workflow definitions without switch statements or hardcoded routing.
- `state.ts` maintains in-process execution state and append-only history for the current server runtime.
- `executor.ts` performs the lifecycle: pending, validating, running, succeeded, or failed.
- `engine.ts` composes the registry, executor, and state store and exposes list, status, history, and execute operations.
- `workflows.ts` contains production deterministic workflows that reuse existing dashboard intelligence, Release Manager health scoring, and Knowledge Registry search.

## Workflow lifecycle

A workflow starts as registered metadata with `ready`, `disabled`, or `blocked` status. When execution is requested, the executor creates an execution record, validates context, runs the workflow, stores a structured result, and updates history.

## Registration model

Workflows implement the `Workflow` interface and are registered in `createWorkflowEngine()`. This matches the command and knowledge registries so future workflows can be added by instantiating and registering a class instead of editing command routing logic.

## Validation process

Each workflow owns deterministic validation through `validate(context)`. Validation returns all errors up front. Invalid workflows transition to `failed` without calling `execute`.

## Execution pipeline

1. Command Agent, dashboard, or a future scheduler calls `workflowEngine.execute(id, context)`.
2. The engine resolves the workflow from the registry.
3. The executor creates an execution record.
4. The workflow validates its context.
5. The workflow executes deterministic application logic.
6. The executor stores the result or failure and exposes it through status/history APIs.

## State transitions

Supported execution states are `pending`, `validating`, `running`, `succeeded`, `failed`, and `cancelled`. Cancellation is reserved for queue or distributed execution support.

## Failure handling

Validation failures and thrown runtime errors are captured on the execution record. The Command Agent converts failed records into structured agent output with actionable recommendations.

## Future scheduling support

Trigger metadata already distinguishes `manual`, `scheduled`, `event`, and `agent` workflows. A scheduler can enqueue executions by workflow id without changing workflow classes.

## Future queue support

The executor boundary is intentionally narrow. A queue-backed executor can persist execution records and distribute work while preserving the same registry and workflow interfaces.

## Future distributed execution

Distributed execution should replace the in-process state store with a durable implementation and use idempotent workflow inputs. Workflow classes should remain deterministic and side-effect boundaries should be explicit.

## Relationship to Agent Framework and Knowledge Platform

The Executive Command Agent delegates workflow commands to the engine instead of embedding orchestration logic. The Knowledge Discovery workflow uses the Knowledge Registry rather than provider-specific code. Release Verification reuses Release Manager scoring, and Executive Daily Brief reuses dashboard intelligence and active organization context.
