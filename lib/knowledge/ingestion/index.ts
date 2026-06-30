import { createMemoryObject } from "../memory/model";
import type { MemoryObject } from "../types";
export type IngestionInput = Omit<MemoryObject, "checksum" | "version" | "status"> & Partial<Pick<MemoryObject, "checksum" | "version" | "status">>;
export interface IngestionAdapter { readonly id: string; ingest(input: IngestionInput): Promise<MemoryObject>; }
export class DeterministicIngestionAdapter implements IngestionAdapter { readonly id = "deterministic-ingestion"; async ingest(input: IngestionInput) { return createMemoryObject(input); } }
