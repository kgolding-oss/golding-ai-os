# Organizational Memory Engine

Organizational Memory is the chronological operating memory for Executive Command and AI Departments. It persists structured, non-secret context as graph timeline events while respecting organization isolation.

## Executive Memory

The engine buckets decisions, strategies, KPIs, meetings, approvals, risks, lessons learned, grant history, sponsor history, board history, project milestones, and operational metrics. Sensitive secrets must never be stored in node properties, edge evidence, or timeline metadata.

## Timeline Memory

Significant events are recorded chronologically. A grant lifecycle can be modeled as grant node -> meeting event -> board vote -> submission -> award -> report -> renewal. Each event links back to entity ids and relationship ids so agents can retrieve full context before recommendations.

## AI Workforce Integration

Executive Command, Chief of Staff, Legal, Funding, Research, Knowledge, Media, Finance, and Property agents should call `organizationalMemoryEngine.contextForAgent(organizationId, prompt)` before drafting recommendations. The result supplies relevant graph context without bypassing existing Knowledge OS permission boundaries.

## Mac Knowledge Vault Compatibility

Future Mac Knowledge Vault indexing should register files as `document` or `media` nodes after ingestion. Filesystem scanning is intentionally deferred; the graph contract already includes source provider and source id fields for later vault adapters.
