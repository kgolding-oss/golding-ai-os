# Knowledge Platform Foundation

Milestone 5.2 introduces a shared Knowledge Platform for deterministic agents. The foundation is intentionally integration-free: providers are registered, typed, and queryable through a common registry, but external APIs and database schema changes are deferred.

## Architecture

The platform lives in `lib/knowledge/`:

- `types.ts` defines provider metadata, documents, chunks, search queries, search results, and indexing requests.
- `provider.ts` defines the `KnowledgeProvider` contract and a reusable not-implemented base provider.
- `registry.ts` owns provider registration and aggregate document/search operations.
- `search.ts` contains provider fan-out search orchestration.
- `document.ts` and `chunk.ts` contain small helpers for document and chunk construction.

The dashboard consumes registry metadata to show registered sources, status, indexed document count, and last sync placeholders.

## Provider model

Every provider implements:

- `listDocuments()`
- `getDocument()`
- `search()`
- `index()`
- `refresh()`

The initial provider stubs are Google Drive, Gmail, Local Files, and Supabase Documents. They compile and return explicit not-implemented responses so agents can discover capabilities without calling external systems.

## Indexing strategy

Documents are normalized into `KnowledgeDocument` records and optional ordered `KnowledgeChunk` records. Initial indexing is a no-op in provider stubs. Future providers should keep indexing organization-scoped, idempotent, and auditable.

## Search strategy

The `KnowledgeRegistry` provides a single search interface that fans out to all registered providers or a selected provider subset. Current stubs return empty results. Future search can combine keyword, metadata filters, permissions, and vector similarity.

## Security considerations

- Providers must enforce active-organization boundaries before returning documents or chunks.
- User and agent permissions should be checked before provider access.
- Provider credentials must never be exposed to agents or dashboard clients.
- Search results should include only documents the current organization and principal can access.
- Audit logging should be added before production indexing or refresh jobs.

## Future vector search integration

A later milestone can add embedding generation, chunk persistence, vector indexes, hybrid scoring, and provider-specific refresh jobs. The current provider and registry contracts are designed so vector search can be added behind provider implementations without changing the Executive Command Agent interface.
