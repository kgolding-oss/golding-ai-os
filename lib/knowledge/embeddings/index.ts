export type EmbeddingVector = number[];
export interface EmbeddingProvider { readonly id: string; embed(text: string): Promise<EmbeddingVector>; }
export const embeddingsDeferredMessage = "Embeddings are intentionally deferred; indexing and search interfaces are vector-ready.";
