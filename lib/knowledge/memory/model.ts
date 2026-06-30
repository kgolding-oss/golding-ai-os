import type { MemoryObject } from "../types";

export function stableChecksum(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (Math.imul(31, hash) + value.charCodeAt(index)) | 0;
  return Math.abs(hash).toString(16).padStart(8, "0");
}

export function createMemoryObject(input: Omit<MemoryObject, "checksum" | "version" | "status"> & Partial<Pick<MemoryObject, "checksum" | "version" | "status">>): MemoryObject {
  const checksum = input.checksum ?? stableChecksum(`${input.organizationId}:${input.sourceProvider}:${input.sourceIdentifier}:${input.title}:${input.content}`);
  return { ...input, metadata: input.metadata ?? {}, labels: input.labels ?? [], tags: input.tags ?? [], permissions: input.permissions ?? [], checksum, version: input.version ?? 1, status: input.status ?? "draft" };
}

export function memoryToDocument(memory: MemoryObject) {
  return { id: memory.id, providerId: memory.sourceProvider, title: memory.title, updatedAt: memory.updated, metadata: memory.metadata };
}
