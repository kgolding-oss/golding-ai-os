import type { KnowledgeDocument, KnowledgeProviderId } from "./types";

export function createKnowledgeDocument(input: Omit<KnowledgeDocument, "providerId"> & { providerId: KnowledgeProviderId }): KnowledgeDocument {
  return { ...input, metadata: input.metadata ?? {} };
}
