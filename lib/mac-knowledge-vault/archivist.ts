import { advisory, recommendation } from "./governance";
import { buildStorageInsights } from "./insights";
import type { InventoryProviderSnapshot, VaultDigitalArchivistReport, VaultGraphEdge, VaultGraphNode } from "./types";

function buildGraph(snapshot: InventoryProviderSnapshot): { nodes: VaultGraphNode[]; edges: VaultGraphEdge[] } {
  const nodes: VaultGraphNode[] = [{ id: snapshot.source.id, type: "vault_source", label: snapshot.source.name, metadata: { totalFiles: snapshot.source.totalFiles, readOnly: true } }];
  const edges: VaultGraphEdge[] = [];
  for (const category of snapshot.categories) {
    const categoryId = `category:${category.category}`; const workspaceId = `workspace:${category.workspace}`;
    nodes.push({ id: categoryId, type: "category", label: category.category, metadata: { fileCount: category.fileCount, sizeBytes: category.sizeBytes, sensitive: category.sensitive } }, { id: workspaceId, type: "workspace", label: category.workspace, metadata: { requiresReview: category.requiresReview } });
    edges.push({ from: snapshot.source.id, to: categoryId, type: "contains" }, { from: categoryId, to: workspaceId, type: "mapped_to" });
    if (category.requiresReview) edges.push({ from: categoryId, to: workspaceId, type: "requires_review" });
  }
  for (const file of snapshot.largestFiles) {
    const fileId = `file:${file.id}`; const folderId = `folder:${file.folder}`;
    nodes.push({ id: folderId, type: "folder", label: file.folder, metadata: { category: file.category } }, { id: fileId, type: file.category.startsWith("Media") ? "media_asset" : "file", label: file.name, metadata: { extension: file.extension, sizeBytes: file.sizeBytes, contentIndexed: false } });
    edges.push({ from: snapshot.source.id, to: folderId, type: "contains" }, { from: folderId, to: fileId, type: "contains" }, { from: fileId, to: `category:${file.category}`, type: "belongs_to" });
  }
  return { nodes, edges };
}

export function generateDigitalArchivistReport(snapshot: InventoryProviderSnapshot): VaultDigitalArchivistReport {
  const insights = buildStorageInsights(snapshot);
  const legal = snapshot.categories.filter((c) => ["Immigration", "The Law Library"].some((name) => c.category.includes(name))).reduce((sum, c) => sum + c.fileCount, 0);
  const funding = snapshot.categories.filter((c) => c.category.includes("Funding")).reduce((sum, c) => sum + c.fileCount, 0);
  const business = snapshot.categories.filter((c) => c.category.includes("Relax With Me")).reduce((sum, c) => sum + c.fileCount, 0);
  return { source: snapshot.source, categories: snapshot.categories, extensions: snapshot.extensions, largestFiles: snapshot.largestFiles, largestFolders: snapshot.largestFolders, highVolumeCacheFolders: insights.filter((i) => i.id === "cache-locations"), likelySystemDeveloperFiles: insights.filter((i) => ["virtual-machines", "installers"].includes(i.id)), likelyMediaArchives: insights.filter((i) => i.id === "media-projects"), legalImmigrationConcentration: advisory({ id: "legal-immigration", title: "Legal and immigration concentration", description: `${legal.toLocaleString()} metadata records map to Law Library/legal operations signals.`, severity: "review", fileCount: legal }), fundingConcentration: advisory({ id: "funding", title: "Funding concentration", description: `${funding.toLocaleString()} metadata records map to Funding OS.`, severity: "review", fileCount: funding }), businessConcentration: advisory({ id: "business", title: "Business concentration", description: `${business.toLocaleString()} metadata records map to Relax With Me business portfolio.`, severity: "info", fileCount: business }), cleanupRecommendations: [recommendation("review-cache", "Review cache/temp folders", "Cache signals can reduce storage pressure if approved in a future milestone.", "Metadata-only cache candidates", ["cache_volume"]), recommendation("review-duplicates", "Review duplicate candidates", "Repeated filenames should be validated by humans before future dedupe planning.", "Repeated filename groups", ["duplicate_candidate"])], archiveRecommendations: [recommendation("phase-media", "Plan phased media archive", "Media categories have the largest storage footprint and need a staged retention model.", "Media Department categories", []), recommendation("protect-sensitive", "Protect sensitive categories", "Legal, finance, immigration, and personal records need restricted handling.", "Sensitive categories", ["sensitive_category"])], sensitiveDataWarnings: insights.filter((i) => ["email-archives", "human-review-categories"].includes(i.id)), nextSafeActions: ["Review the dashboard metadata summary.", "Confirm category-to-workspace mappings with a human owner.", "Prioritize 99 Review and Personal Vault classification.", "Design future approval gates before any cleanup, migration, upload, or archive execution.", "Keep file-content indexing disabled until explicitly approved."], graph: buildGraph(snapshot) };
}
