import { chunkTextDocument } from "../chunk";
import { createMemoryObject, stableChecksum, memoryToDocument } from "../memory/model";
import type { IndexingJob, KnowledgeChunk, MemoryObject } from "../types";

export function normalizeDocument(memory: MemoryObject): MemoryObject {
  return createMemoryObject({ ...memory, title: memory.title.trim(), content: memory.content.replace(/\r\n/g, "\n").replace(/[\t ]+/g, " ").trim(), summary: memory.summary.trim(), updated: memory.updated });
}

export function extractMetadata(memory: MemoryObject) {
  return { ...memory.metadata, contentLength: memory.content.length, tagCount: memory.tags.length, labelCount: memory.labels.length, checksum: memory.checksum };
}

export function generateChunks(memory: MemoryObject, chunkSize = 1200): KnowledgeChunk[] {
  return chunkTextDocument(memoryToDocument(memory), memory.content, chunkSize).map((chunk) => ({ ...chunk, checksum: stableChecksum(chunk.content), metadata: { ...chunk.metadata, organizationId: memory.organizationId } }));
}

export function validateIndexing(memory: MemoryObject, chunks: KnowledgeChunk[]) {
  const errors = [];
  if (!memory.id) errors.push("Memory id is required.");
  if (!memory.organizationId) errors.push("Organization id is required.");
  if (!memory.sourceProvider) errors.push("Source provider is required.");
  if (!memory.sourceIdentifier) errors.push("Source identifier is required.");
  if (!memory.title) errors.push("Title is required.");
  if (memory.content && !chunks.length) errors.push("Content must produce at least one chunk.");
  return { valid: errors.length === 0, errors };
}

export function orchestrateIndexing(memory: MemoryObject, now = new Date().toISOString()): IndexingJob {
  const normalized = normalizeDocument(memory);
  normalized.metadata = extractMetadata(normalized);
  const chunks = generateChunks(normalized);
  const validation = validateIndexing(normalized, chunks);
  return { id: `idx_${normalized.id}_${normalized.version}`, memoryId: normalized.id, organizationId: normalized.organizationId, providerId: normalized.sourceProvider, status: validation.valid ? "indexed" : "failed", errors: validation.errors, startedAt: now, completedAt: now, chunks };
}
