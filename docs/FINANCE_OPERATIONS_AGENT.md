# Finance & Operations Agent

## Architecture
The Finance & Operations Agent is a specialized operational agent that extends existing agent, runtime, connector, Knowledge OS, observability, and approval patterns. It coordinates financial operations only: it never moves money, approves payments, submits reports, performs billing, or makes financial decisions.

## Budget Engine
The budget engine tracks allocated, committed, spent, remaining, forecast, and variance for annual, monthly, departmental, project, restricted, and unrestricted budgets. Budget health is deterministic: negative remaining balance or adverse forecast variance becomes a risk; low remaining balance becomes a watch item.

## Donation Manager
Donation records track donor, campaign, designation, amount, receipt status, acknowledgement status, and reporting status. The agent can identify overdue acknowledgements and reporting gaps, but no payment processing is implemented.

## Cash-flow Engine
Cash-flow forecasting is deterministic and uses expected income, expected expenses, grant schedules, sponsorship schedules, budget allocations, and restricted funds. AI is not used for financial forecasting.

## Grant Integration
Grant revenue records link to grant identifiers and track awarded, pending, reporting, reimbursement, restrictions, and remaining balances. Reporting and disbursement changes require approvals and should coordinate with the Grant Development Agent.

## Sponsor Management
Sponsor records track agreements, invoices, deliverables, renewals, balances, and risk status. The agent does not automatically bill sponsors.

## Chief of Staff Integration
The agent exposes delegation-ready outputs for budget reviews, missing invoices, grant reporting, sponsor obligations, donation acknowledgements, and financial follow-ups so the Executive Chief of Staff can coordinate owners and completion status.

## Executive Intelligence Integration
Finance recommendations are deterministic and cover budget overruns, cash shortages, missing reports, grant compliance risks, sponsor risks, financial bottlenecks, and overdue acknowledgements.

## Dashboard
The Finance & Operations dashboard panel displays Budget Summary, Cash Position, Cash Forecast, Donation Activity, Grant Revenue, Sponsor Revenue, Outstanding Invoices, Upcoming Compliance, and Financial Risks.

## Command Agent
The Command Agent supports finance dashboard, budget summary, cash forecast, donation report, grant revenue, sponsor report, compliance report, outstanding invoices, financial risks, and explain budget health.

## Persistence
The current milestone models persistence boundaries for budgets, donations, grant revenue, sponsor records, cash-flow history, forecasts, reports, finance memory, and telemetry through existing Supabase and Knowledge OS abstractions. Production storage remains connector/runtime owned.

## Observability
`/api/health` includes Finance & Operations health for budgets, forecasts, donations, grants, sponsors, reports, approvals, and telemetry.

## Security
Budget modifications, financial commitments, invoice approvals, sponsorship changes, grant disbursement changes, and report submissions require approval. The agent only reads connector data and produces reminders, summaries, classifications, report organization, comparisons, and issue extraction.

## Future Extensions
Future milestones can connect live accounting systems, donor CRMs, grant portals, and document repositories through the existing Connector Runtime while preserving approval gates and transaction prohibitions.
