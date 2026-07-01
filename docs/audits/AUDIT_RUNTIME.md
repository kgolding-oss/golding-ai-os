# GAIOS Dashboard Runtime Audit

Generated: 2026-07-01

## Dashboard entry point

Audited file: `app/dashboard/page.tsx`.

## Imported components and agents

All statically imported dashboard components and agent runtimes resolve in the repository based on TypeScript/build resolution. The dashboard imports panels for workforce, status, attention, command, executive brief/workflow, metrics, knowledge, runtime, connectors, diagnostics, intelligence, autonomy, Chief of Staff, Grant Development, Media Communications, CRM, Finance, and AI operations.

## Panel prop verification

The dashboard passes required high-level props to each panel:

- `Navigation`: active organization, memberships, return path.
- `DashboardHeader`: organization count and pending approvals.
- `ExecutiveBrief`: organization, tasks, approvals, agents, health, projects, activity, audit logs, membership count.
- `AttentionQueue`: attention items.
- `AgentStatusPanel`: agents and activity.
- `AIWorkforcePanel`: orchestrator.
- `SystemHealth`: health rows.
- `ExecutiveWorkflowPanel`: workflows.
- `KnowledgeDashboard`: health report.
- `AIRuntimePanel`: tools, sessions, metrics.
- `AIPlatformPanel`: models, prompts, tools, MCP servers, sessions, costs.
- `AIOperationsPanel`: score and readiness items.
- `EnterpriseConnectorsPanel`: connectors, sessions, diagnostics.
- `DiagnosticsPanel`: platform health and diagnostics.
- Agent panels: synthesized snapshots.
- `AutonomousOperationsPanel`: plans, approvals, schedules, retry queue, recovery queue.
- `OperatingHistory`, `OrganizationsWidget`, `PriorityTasks`, `RecentActivity`, and `RecommendationPanel`: expected data collections.

## Runtime risk findings

1. `FinanceOperationsPanel` is rendered twice with the same `financeSnapshot`. This is not a compile failure, but it creates duplicated UI and duplicate render cost.
2. The dashboard is a Server Component and invokes many runtime singletons during render. Most diagnostics are guarded by `safeDiagnostics`, but other synthesis calls can still fail the page if an imported runtime throws at module evaluation or synthesize time.
3. `chiefOfStaffRuntime.synthesize(...)` awaits persistence through a Supabase-backed context. It degrades when no token/context is available, but database schema drift can still appear as runtime errors if called with a live token and a missing/mismatched table.
4. Dashboard data loading uses optional row fetchers for several tables, but active organization resolution depends on `organization_memberships`, which currently lacks a migration and is a potential redirect/no-organization failure point.

## Recommended remediation

- Remove the duplicate `FinanceOperationsPanel` render.
- Add or rename migrations for `organization_memberships`, `organization_invitations`, and `user_roles`.
- Consider wrapping all noncritical agent snapshot synthesis in dashboard-local safe helpers, matching the `safeDiagnostics` pattern.
