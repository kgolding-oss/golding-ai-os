# Digital Twin

The Digital Twin models each organization managed by GAIOS as a simulation-only operational state. It represents organizations, departments, projects, workflows, people, agents, tasks, approvals, funding signals, budgets, Knowledge Graph health, plugins, connectors, KPIs, and governance policies.

The implementation lives in `lib/digital-twin` and builds an organization-scoped twin from dashboard data, Knowledge OS health, Governance policy, workflow registrations, and installed plugins. The twin is read-only context: connector writes are disabled, external actions are disabled, and approvals are never bypassed.

## Model coverage

- Organization identity, mission, industry, and status.
- Department inventory for Executive, Legal, Funding, Finance, Research, Knowledge, Media, Operations, Property, Education, Partnerships, and Volunteers.
- Active projects, workflows, people, agents, tasks, and approvals.
- Funding signals from grant and sponsor audit context.
- Budget estimates for operating load and approval-locked work.
- Knowledge Graph context through provider count, indexed-document count, and health.
- Plugin model hooks for enabled automation, knowledge, and dashboard plugins.
- KPI baselines and forecast deltas.
- Governance policies copied into the twin so simulations cannot ignore approval requirements.

## Safeguards

Digital Twin construction does not send emails, submit grants, file legal documents, initiate payments, or write to connectors. It only prepares structured inputs for scenario simulations and executive comparison.
