# Knowledge OS & Memory Foundation

Knowledge OS is the provider-independent memory layer for Golding AI OS. It lives under `lib/knowledge/` and separates memory, ingestion, indexing, permissions, metadata, cache, synchronization, search, embeddings, and adapters so future providers can plug in without changing the public interfaces.

## Overall architecture

- `memory/` defines the unified memory model and deterministic checksum helpers.
- `ingestion/` converts trusted provider payloads into memory objects.
- `indexing/` normalizes documents, extracts metadata, generates chunks, validates input, and produces deterministic indexing jobs.
- `permissions/` enforces organization, user, role, agent, and public access rules.
- `search/` provides keyword, metadata, tag, provider, organization, and permission-filtered search.
- `registry.ts` registers memory, search, and indexing providers independently while preserving compatibility with the existing knowledge provider pattern.
- `health/` reports provider readiness, stale providers, indexing failures, cache health, sync status, and a readiness score.
- `embeddings/` reserves the embedding provider contract but intentionally performs no embedding generation.
- `cache/` and `sync/` provide deterministic internal state summaries for future refresh jobs.
- `adapters/` describes reusable provider adapter capabilities.

## Memory model

Every memory object is provider-independent and includes a unique id, organization id, source provider, source identifier, title, content, summary, metadata, labels, tags, permissions, owner, created and updated timestamps, checksum, version, and status. Providers map Google Drive files, Gmail threads, SharePoint documents, local files, or storage objects into this model before indexing.

## Indexing pipeline

Indexing is deterministic:

1. Normalize line endings, spacing, title, summary, and content.
2. Extract metadata such as content length, tag count, label count, and checksum.
3. Generate stable text chunks without embeddings.
4. Validate required identity, organization, provider, source identifier, title, and chunk output.
5. Return an indexing job with status, errors, timestamps, and generated chunks.

Embeddings can be attached later to chunks or indexing jobs without changing memory, search, or registry callers.

## Provider architecture

Providers can implement one or more interfaces:

- `MemoryProvider` lists, retrieves, and upserts memory objects.
- `SearchProvider` executes structured searches.
- `IndexingProvider` indexes memory and exposes indexing jobs.
- `KnowledgeProvider` combines all three for compatibility with existing provider stubs.

A Google Drive provider should authenticate outside this layer, enumerate accessible files, map each file to `MemoryObject`, run the indexing pipeline, persist provider-owned state, and register itself with the `KnowledgeRegistry`.

## Registry architecture

The registry owns three maps: memory providers, search providers, and indexing providers. This allows a provider to support search but not ingestion, or indexing but not sync. The registry exposes provider listings, aggregate search, indexing job summaries, and health metadata in the same pattern as the Agent, Workflow, Command, and legacy Knowledge registries.

## Search architecture

Search accepts a structured query with keyword text, organization id, provider ids, tags, metadata filters, requester id, requester roles, and limit. The deterministic in-memory engine evaluates:

- organization isolation first,
- permission filtering second,
- provider filters,
- tag filters,
- metadata exact-match filters,
- keyword matches against title, summary, content, and tags.

Results include provider id, document projection, memory object, score, excerpt, and matched fields.

## Permission model and organization isolation

Organization filtering is mandatory whenever an organization id is provided. Permissions support users, organizations, roles, agents, and public subjects with read, write, index, and admin actions. Empty permissions are treated as internally visible after organization isolation so architecture stubs can operate without fake ACL data.

## Cache strategy

The cache abstraction is an internal deterministic key/value snapshot with key count, last update, and status. Future providers can cache normalized memory, provider cursors, or search summaries behind this interface. Cache state is surfaced in Knowledge Health.

## Synchronization model

Synchronization is provider-owned. The shared sync summary derives stale/degraded status from registered provider metadata and last sync timestamps. Future provider sync jobs should update provider metadata rather than changing registry contracts.

## Future embedding architecture

`embeddings/` defines an `EmbeddingProvider` contract and vector type. Embedding generation is intentionally deferred. Future implementations should run after deterministic chunk generation and store vectors in provider-owned or platform-owned indexes.

## Future vector search

Vector search should be added as another search provider capability. Public search queries should remain stable while providers optionally combine keyword, metadata, permission-filtered candidate sets, and vector similarity.

## Future RAG integration

RAG agents should call the registry search interface, receive structured results, cite memory ids/source identifiers, and never bypass organization or permission filtering. Agent-specific memory can be registered as another memory provider while sharing the same indexing, health, and search contracts.

## Milestone 10 production activation

Knowledge Operations indexes Google Drive, internal SOPs, grant templates, immigration templates, FOIA templates, habeas templates, board documents, research, media, property documents, and policies. Production agents should retrieve relevant knowledge sources before generating drafts and should include citation context for human review.
