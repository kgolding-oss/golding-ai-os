# Chief of Staff Agent

Milestone 12.0A introduces the Executive Chief of Staff Agent as the deterministic executive operations coordinator for Golding AI OS.

## Architecture

The Chief of Staff lives in `lib/agents/chief-of-staff/`. It consumes deterministic outputs from Executive Intelligence, Workflow Engine, AI Runtime, Knowledge OS, Connector Runtime, Autonomy, Operating History, and Observability. It does not replace those systems and does not perform direct execution.

## Delegation Model

Delegations are generated from Executive Intelligence signals. Each delegation includes owner agent, priority, confidence, deadline, dependencies, approvals, rationale, expected impact, status, source signal IDs, and creation time. Owner routing is subsystem-based so future specialized agents can plug in without redesigning the queue.

## Executive Memory

Executive memory tracks completed delegations, executive decisions, recurring priorities, recurring risks, dismissed recommendations, organizational patterns, and historical briefings. Snapshots are persisted through the existing persistence repository using the executive snapshot table with `snapshot_type=chief_of_staff`.

## Runtime

`chiefOfStaffRuntime.synthesize` validates context, builds the briefing, creates the delegation queue, identifies approvals, generates follow-ups, updates memory, records telemetry, and optionally persists the snapshot.

## Integration

Executive Intelligence remains the deterministic analysis engine. The Chief of Staff consumes its priorities, recommendations, risks, opportunities, bottlenecks, timeline, and score, then coordinates next steps.

AI Runtime is consumed only through registered runtime metrics, sessions, and tools. Connector data is consumed only through Connector Runtime and Connector Manager outputs. Autonomy integration is recommendation-oriented: the Chief of Staff can surface approvals, prioritization, pause recommendations, and plan recommendations without executing autonomous work.

## Dashboard

The dashboard includes a Chief of Staff panel showing Executive Briefing, Today's Priorities, Pending Delegations, Approval Queue, Critical Risks, Strategic Opportunities, Follow-ups, and Executive Timeline.

## Command Agent

The command registry supports Chief of Staff commands for executive briefing, daily priorities, delegation queue, approval queue, follow ups, strategic opportunities, Chief of Staff status, explain delegation, and explain priorities.

## Persistence

Chief of Staff snapshots persist executive briefings, delegation history, priorities, recommendations, follow-ups, and memory through the existing persistence architecture. The implementation avoids creating a parallel storage layer.

## Telemetry

Telemetry records delegations, executive briefings, priority generation, recommendations, approval requests, and follow-up generation. `/api/health` exposes Chief of Staff health and telemetry.

## Security Review

The Chief of Staff never bypasses Executive Intelligence, AI Runtime, Connector Runtime, or the Approval Engine. It does not execute delegated work. Critical and autonomy-related delegations require approval routing.

## Future Specialized Agents

Legal Operations, Finance, Grants, Media, Property Management, CRM, Knowledge Curator, and other future agents can be added by extending owner routing and delegation handling while keeping the delegation schema stable.
