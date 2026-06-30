# Research & Intelligence Agent

## Architecture
The Research & Intelligence Agent is a specialized operational agent that coordinates research metadata, queues, sources, citations, evidence, monitoring schedules, and briefs for human review. It extends existing agent patterns and does not replace AI Runtime, Connector Runtime, Knowledge OS, Approval Engine, Autonomy Engine, persistence, or observability.

## Research Registry
The registry defines research categories, source types, and approved connector-only source channels. It tracks research item metadata including organization, topic, category, owner, priority, status, jurisdiction, deadline, confidence, evidence status, citation status, and review status.

## Query Engine
Queries track research questions, search terms, source types, date ranges, jurisdiction, language, required citations, reviewer, and status. Query records organize work only; they do not produce autonomous final answers.

## Source Manager
Sources track title, URL or connector reference, publisher, author, publication date, retrieved date, source type, reliability rating, jurisdiction, tags, and citation metadata. External collection must flow through Connector Runtime; no direct scraping or browser automation is introduced.

## Citation Engine
Citations link to known source records and include quote metadata, paraphrase metadata, authority level, and review status. The engine validates citation references and treats unknown references as non-authoritative. It never fabricates citations.

## Evidence Collection
Evidence records track source references, chain-of-custody metadata, matter or project reference, document category, verification status, missing evidence, and review status.

## Legal Research Boundaries
Legal research supports operational tracking for case law, statutes, regulations, agency guidance, court rules, administrative policies, detention policies, and immigration relief categories. The agent never provides legal advice and never makes final legal conclusions.

## Knowledge OS Integration
The integration is metadata-only for research briefs, sources, citations, evidence, legal research, policy research, and funding research. Embeddings are intentionally deferred.

## Chief of Staff Integration
The delegation module prepares deterministic Chief of Staff work items for queue review, source collection, citation verification, policy monitoring, grant research, partner research, legal research preparation, and media monitoring.

## Executive Intelligence Integration
The risk module generates deterministic recommendations for stale or unreviewed research, missing citations, low-confidence sources, incomplete evidence, overdue or blocked briefs, emerging risks, and high-priority gaps.

## Dashboard
The Research & Intelligence dashboard exposes Active Research, Research Queue, Source Tracker, Citation Status, Evidence Collection, Legal Research, Policy Monitoring, Funding Research, Media Monitoring, and Research Risks.

## Command Agent
The Executive Command Agent supports research dashboard, research queue, source tracker, citation report, evidence report, legal research status, policy monitoring, funding research, media monitoring, research risks, and explain research confidence.

## Persistence
The current milestone models persistable shapes for research items, queries, sources, citations, evidence records, briefs, monitoring schedules, research memory, and telemetry. Production persistence should use the existing repository abstractions and organization scoping.

## Observability
Platform health and `/api/health` include Research & Intelligence health covering active research, queries, sources, citations, evidence, briefs, monitoring, and telemetry.

## Security
The agent is connector-runtime scoped, metadata-only for Knowledge OS, and bounded by Approval Engine review for legal, citation, evidence, and publication-sensitive work. It does not bypass connectors, scrape the web, automate browsers, invent sources, produce final conclusions, or provide legal advice.

## Future Extensions
Future work may add production persistence tables, reviewer workflows, Knowledge OS ingestion jobs, connector-backed source importers, policy trend scheduling, richer brief templates, and approval-gated publication workflows.
