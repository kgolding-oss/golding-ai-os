# CRM & Relationship Management Agent

## Architecture
The CRM Agent is a specialized operational agent under `lib/agents/crm`. It follows the existing agent pattern used by Chief of Staff and Grant Development: a deterministic runtime synthesizes a snapshot, the agent exposes connector tools as metadata-only capabilities, and dashboard, command, telemetry, validation, policy, and health modules are separated.

The agent coordinates relationships but does not send communications, make relationship decisions, bypass approval gates, or change lifecycle stages autonomously.

## Contact Registry
Contact and relationship models are registry-driven. Supported contact registry types are individual, business, nonprofit, government, educational institution, media, law firm, volunteer, donor, and sponsor. Supported relationship types include clients, prospective clients, volunteers, donors, sponsors, partners, board members, vendors, contractors, community organizations, government agencies, law firms, and media contacts.

## Relationship Lifecycle
Lifecycle stages are deterministic: lead, contacted, qualified, active, awaiting response, onboarding, engaged, inactive, and archived. AI is not allowed to generate lifecycle changes.

## Pipeline Engine
The pipeline engine counts relationships by registered lifecycle stage. It can report active relationships and archive/inactive distribution without changing records.

## Follow-up Engine
The follow-up engine tracks next contact, overdue follow-ups, scheduled meetings, reminders, recurring check-ins, and onboarding milestones. It generates reminder-only records and never sends communications.

## Scoring Model
Relationship scoring is deterministic. Inputs are interaction frequency, response history, engagement, recency, opportunity value, and partnership status. Scores are for prioritization and review only.

## Chief of Staff Integration
CRM recommendations can be converted into Chief of Staff delegation items for new contact intake, donor follow-up, volunteer onboarding, sponsor relationship review, board reminders, client outreach planning, and partner meetings. Completion status remains delegated work metadata.

## Executive Intelligence Integration
The CRM risk engine emits deterministic recommendations for inactive relationships, overdue follow-ups, high-value contacts, partnership risks, donor engagement, volunteer retention, sponsor engagement, and bottlenecks.

## Dashboard
The dashboard includes a CRM & Relationships panel with Active Contacts, Pipeline, Upcoming Follow-ups, Donors, Sponsors, Volunteers, Partners, Relationship Health, Overdue Activities, and Strategic Opportunities.

## Command Agent
The Command Agent supports CRM dashboard, contact summary, relationship summary, follow-up report, donor relationships, volunteer status, sponsor relationships, partner report, relationship health, overdue follow-ups, and explain relationship score.

## Persistence
The CRM memory shape is ready for persistence of contacts, organizations, relationship history, communications metadata, follow-ups, reminders, scores, CRM memory, and telemetry. The implementation preserves the existing persistence abstractions and avoids creating a parallel repository layer.

## Observability
`/api/health` includes CRM health with contacts, organizations, follow-ups, overdue items, relationship health, pipeline, and telemetry.

## Connector Integration
Gmail, Google Calendar, Google Drive, Google Docs, Supabase, and Knowledge OS are exposed only through the existing Connector Runtime abstractions. Communication history stores metadata only. Gmail send and automatic calendar creation remain disabled.

## Knowledge OS
CRM registers contact, organization, communication, meeting, and relationship metadata only. Embeddings are explicitly disabled for CRM memory in this milestone.

## Security
Approval Engine gates are required before bulk communications, contact merges, deleting contacts, relationship ownership changes, and organization merges. AI Runtime is limited to summaries, classification, duplicate detection, contact normalization, issue extraction, and communication summaries.

## Future Extensions
Future milestones can add production Supabase repositories, connector sync jobs, duplicate-review queues, richer dashboard filtering, approval-backed merge workflows, and Knowledge OS metadata provider registrations without changing the core runtime contract.
