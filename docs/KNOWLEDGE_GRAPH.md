# Knowledge Graph Engine

Milestone 19 extends Knowledge OS with an organization-scoped graph engine. It does not replace document ingestion, search, permissions, providers, or health checks. Documents, media, people, organizations, projects, cases, grants, sponsors, meetings, tasks, approvals, AI agents, plugins, and connectors are represented as graph nodes with source metadata for provenance.

## Architecture

- `lib/knowledge/graph/types.ts` defines supported node types, relationship types, timeline events, and dashboard-ready query results.
- `lib/knowledge/graph/engine.ts` provides a deterministic in-memory graph registry and query engine.
- `lib/knowledge/organizational-memory/engine.ts` layers executive and timeline memory over the graph.

## Nodes

Supported nodes include organizations, departments, users, clients, cases, projects, businesses, programs, grants, sponsors, donors, partners, volunteers, meetings, board decisions, policies, documents, media, emails, tasks, approvals, AI agents, plugins, and connectors. Each node carries `organizationId`, `type`, `label`, optional source provider/table/id fields, tags, properties, entity health, and timestamps.

## Relationships

Edges support `works_for`, `member_of`, `belongs_to`, `references`, `generated_from`, `supports`, `funds`, `related_to`, `assigned_to`, `depends_on`, `approved_by`, `created_by`, `updated_by`, `mentions`, `attached_to`, `connected_to`, and `part_of`. Edges are organization-scoped, weighted, source-attributed, and evidence-ready.

## Dashboard JSON

Graph queries return nodes, edges, relationship counts, timeline events, heat-map buckets, entity health, and dependency trees. This is intentionally graph-ready JSON with no visualization dependency.
