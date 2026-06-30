# Property & Asset Management Agent

## Architecture

The Property & Asset Management Agent is a specialized operational agent under `lib/agents/property-assets`. It extends existing agent patterns and reuses the AI Runtime, Connector Runtime, Workflow Engine, Knowledge OS metadata registration, Approval Engine policy boundaries, persistence abstractions, and observability health route. It coordinates records and recommendations only.

## Property Registry

The property registry tracks organization, property, address, ownership status, occupancy, zoning metadata, insurance metadata, maintenance status, inspection status, and lifecycle status. Registry validation rejects unregistered ownership and lifecycle values.

## Asset Registry

The asset registry tracks asset ID, category, location, assigned owner, purchase date, warranty metadata, depreciation metadata, service history, replacement schedule, and lifecycle stage. Asset health is deterministic and intended for prioritization only.

## Maintenance Engine

Maintenance records cover preventative maintenance, recurring maintenance, repairs, inspection follow-ups, service history, warranty coverage, and the maintenance calendar. The agent generates reminders only and never authorizes or executes maintenance.

## Inspection Engine

Inspection records track due inspections, completed inspections, violations, follow-ups, and corrective actions. The agent generates alerts only; corrective work must be approved outside the agent.

## Project Management

Projects support renovations, construction, repairs, expansions, relocations, equipment upgrades, and infrastructure improvements. Records include milestones, budget reference, approvals, vendors, risks, dependencies, completion percentage, and status. There is no autonomous execution.

## Inventory

Inventory tracks levels, storage locations, check-in/check-out ownership, assigned assets, and replacement recommendations. The agent does not purchase inventory.

## Chief of Staff Integration

Recommendations can be converted into delegation records for the Executive Chief of Staff. Delegations are completion-status oriented and preserve the rule that the Property & Asset Management Agent does not execute work.

## Executive Intelligence Integration

The runtime emits deterministic recommendations for overdue maintenance, inspection risks, aging assets, lease expirations, vendor concentration, project delays, warranty expirations, insurance gaps, and inventory shortages.

## Dashboard

`buildPropertyDashboard` powers a Property & Assets panel with properties, buildings, active projects, maintenance calendar, upcoming inspections, asset inventory, vehicles, vendor activity, lease renewals, and property risks.

## Command Agent

The Executive Command Agent supports property commands: property dashboard, asset inventory, maintenance schedule, inspection report, project summary, lease report, vehicle report, vendor report, property risks, and explain asset health.

## Persistence

The current milestone uses existing persistence abstractions and records metadata-shaped memory for properties, assets, maintenance, inspections, leases, projects, and telemetry. Production storage can map these records to Supabase tables without changing the agent runtime contract.

## Observability

`/api/health` includes Property & Asset Management health for properties, assets, maintenance, inspections, projects, leases, vendors, and telemetry.

## Security

The agent cannot purchase assets, approve expenditures, sign contracts, execute maintenance, send lease notices, schedule contractors, dispatch vehicles, or modify insurance. Approval gates are required before maintenance authorizations, contractor assignments, vendor changes, lease modifications, capital projects, asset disposal, and insurance changes. AI is limited to summaries, classification, maintenance note extraction, inspection summaries, duplicate detection, and document organization.

## Future Extensions

Future work can add production Supabase schemas, connector-backed document metadata sync, richer insurance compliance models, calendar reminder exports, and executive trend analytics while keeping approvals and execution outside the agent.
