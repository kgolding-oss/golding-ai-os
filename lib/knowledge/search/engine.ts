import { memoryToDocument } from "../memory/model";
import { canAccessMemory } from "../permissions/policy";
import type { KnowledgeSearchQuery, KnowledgeSearchResult, MemoryObject } from "../types";

function includes(value: string, query: string) { return value.toLowerCase().includes(query.toLowerCase()); }

export function searchMemoryObjects(memory: MemoryObject[], query: KnowledgeSearchQuery): KnowledgeSearchResult[] {
  const q = query.query.trim();
  return memory.filter((item) => canAccessMemory(item, { organizationId: query.organizationId, requesterId: query.requesterId, requesterRoles: query.requesterRoles }))
    .filter((item) => !query.providerIds?.length || query.providerIds.includes(item.sourceProvider))
    .filter((item) => !query.tags?.length || query.tags.every((tag) => item.tags.includes(tag)))
    .filter((item) => !query.metadata || Object.entries(query.metadata).every(([key, value]) => item.metadata[key] === value))
    .map((item) => {
      const matchedFields = [includes(item.title, q) ? "title" : "", includes(item.content, q) ? "content" : "", includes(item.summary, q) ? "summary" : "", item.tags.some((tag) => includes(tag, q)) ? "tags" : ""].filter(Boolean);
      const score = matchedFields.length + (matchedFields.includes("title") ? 2 : 0);
      return { providerId: item.sourceProvider, document: memoryToDocument(item), memory: item, score, excerpt: item.summary || item.content.slice(0, 180), matchedFields };
    })
    .filter((result) => !q || result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, query.limit ?? 10);
}
