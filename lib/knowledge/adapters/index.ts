export type KnowledgeAdapterCapability = "memory" | "search" | "indexing" | "sync";
export interface KnowledgeAdapter { readonly id: string; readonly name: string; readonly capabilities: KnowledgeAdapterCapability[]; }
