import type { KnowledgeChunk, KnowledgeDocument } from "./types";

export function chunkTextDocument(document: KnowledgeDocument, content: string, chunkSize = 1200): KnowledgeChunk[] {
  if (!content.trim()) return [];
  const chunks: KnowledgeChunk[] = [];
  for (let offset = 0; offset < content.length; offset += chunkSize) {
    chunks.push({ id: `${document.id}:${chunks.length}`, documentId: document.id, providerId: document.providerId, content: content.slice(offset, offset + chunkSize), ordinal: chunks.length });
  }
  return chunks;
}
