# GAIOS Agent and Command Audit

Generated: 2026-07-01

## Agent modules reviewed

The platform exposes agent families under `lib/agents` and related runtimes:

- Chief of Staff
- Grant Development
- Property / Asset Management
- Finance & Operations
- CRM Relationship
- Media Communications
- Research Intelligence
- Executive Command / command registry
- Release health support

## Runtime/export coverage

The major dashboard-referenced agents export runtime entry points consumed by `app/dashboard/page.tsx` and health snapshots consumed by `app/api/health/route.ts` / observability.

Observed dashboard runtime imports include:

- `chiefOfStaffRuntime`
- `grantDevelopmentRuntime`
- `mediaRuntime`
- `crmRuntime`
- `financeOperationsRuntime`

Observed health snapshot imports include:

- `chiefOfStaffHealthSnapshot`
- `grantDevelopmentHealthSnapshot`
- `propertyHealthSnapshot`
- `financeOperationsHealthSnapshot`
- `crmHealthSnapshot`
- `mediaCommunicationsHealthSnapshot`
- `researchIntelligenceHealthSnapshot`

## Dashboard projections

Dashboard projections exist where referenced by panels and command handlers. The principal risk is not missing projection code, but schema drift for persisted projections/history when live Supabase persistence is enabled.

## Command registry audit

`lib/agents/command-registry.ts` uses dynamic imports for agent, connector, autonomy, workflow, observability, runtime, and AI modules. The machine-readable audit resolved relative dynamic imports successfully and found no broken dynamic import targets.

Command handlers reference exported functions from their dynamically imported modules. TypeScript remains the authority for handler/export compatibility.

## Documentation coverage

Agent documentation is present in `docs/` for the main agent families:

- `CHIEF_OF_STAFF_AGENT.md`
- `GRANT_DEVELOPMENT_AGENT.md`
- `PROPERTY_ASSET_MANAGEMENT_AGENT.md`
- `FINANCE_OPERATIONS_AGENT.md`
- `CRM_RELATIONSHIP_AGENT.md`
- `MEDIA_COMMUNICATIONS_AGENT.md`
- `RESEARCH_INTELLIGENCE_AGENT.md`
- `AGENT_ORCHESTRATION.md`

## Findings

- No broken dynamic imports were identified by `scripts/gaios-audit.mjs`.
- Agent persistence relies on migrated history tables; live execution may surface the missing active-organization/RBAC/invitation tables before agent work can start.
- The command registry is large and inline; splitting command families into separate modules would make future audits easier and reduce blast radius.
