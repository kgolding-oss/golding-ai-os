import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { workspaceForCategory } from "./category-mapping";
import { advisory, vaultGovernanceControls } from "./governance";
import type { InventoryProviderSnapshot, LocalInventoryProvider, VaultCategorySummary, VaultExtensionSummary, VaultFileRecord } from "./types";

const gb = (value: number) => Math.round(value * 1024 ** 3);
const defaultDbPath = join(homedir(), "GAIOS_FILE_INVENTORY", "gaios_inventory.db");
const categoryData = [["Relax With Me", 180000, 62], ["99 Review", 140000, 28], ["Immigration", 90000, 18], ["AI / Development", 220000, 46], ["Media - Images", 260000, 74], ["Finance", 65000, 10], ["Media - Audio", 72000, 31], ["The Law Library - Funding", 56000, 8], ["Media - Video", 45000, 86], ["Golding Compound", 38000, 14], ["The Law Library", 125000, 13], ["Personal Vault", 109000, 6]] as const;
const extensionData: Array<[string, number, number, VaultExtensionSummary["kind"]]> = [["jpg", 210000, 48, "image"], ["pdf", 180000, 38, "document"], ["mov", 18000, 76, "video"], ["mp3", 52000, 22, "audio"], ["tsx", 32000, 1, "developer"], ["zip", 27000, 34, "archive"], ["dmg", 1200, 18, "installer"], ["vmdk", 120, 51, "virtual_machine"]];

export class MacGOLDInventoryProvider implements LocalInventoryProvider {
  sourceName = "Mac GOLD File Inventory";
  constructor(public databasePath = defaultDbPath, public mountedVolume = "GOLD") {}
  async loadSnapshot(): Promise<InventoryProviderSnapshot> {
    const available = existsSync(this.databasePath);
    const categories: VaultCategorySummary[] = categoryData.map(([category, fileCount, sizeGb]) => { const mapped = workspaceForCategory(category); return { category, workspace: mapped.workspace, fileCount, sizeBytes: gb(sizeGb), requiresReview: Boolean(mapped.review), sensitive: Boolean(mapped.sensitive) }; });
    const extensions = extensionData.map(([extension, fileCount, sizeGb, kind]) => ({ extension, fileCount, sizeBytes: gb(sizeGb), kind }));
    const largestFiles: VaultFileRecord[] = [
      { id: "file-vm-1", path: "/Volumes/GOLD/AI/Development/archive/dev-vm.vmdk", name: "dev-vm.vmdk", folder: "/Volumes/GOLD/AI/Development/archive", extension: "vmdk", sizeBytes: gb(51), category: "AI / Development", riskFlags: ["oversized_file"] },
      { id: "file-video-1", path: "/Volumes/GOLD/Media/Video/project-library.mov", name: "project-library.mov", folder: "/Volumes/GOLD/Media/Video", extension: "mov", sizeBytes: gb(22), category: "Media - Video", riskFlags: ["oversized_file"] },
      { id: "file-mail-1", path: "/Volumes/GOLD/Personal Vault/Mail Archive.mbox", name: "Mail Archive.mbox", folder: "/Volumes/GOLD/Personal Vault", extension: "mbox", sizeBytes: gb(8), category: "Personal Vault", riskFlags: ["sensitive_category", "human_review_required"] }
    ];
    return { source: { id: "mac-gold", name: this.sourceName, databasePath: this.databasePath, mountedVolume: this.mountedVolume, status: available ? "available" : "demo_fallback", totalFiles: 1_400_000, totalSizeBytes: gb(396), lastInventoryTime: available ? "inventory database detected; timestamp unavailable without SQLite driver" : "demo fallback snapshot", readOnly: true, safety: vaultGovernanceControls }, categories, extensions, largestFiles, largestFolders: [{ folder: "/Volumes/GOLD/Media", sizeBytes: gb(191), fileCount: 377000 }, { folder: "/Volumes/GOLD/AI/Development", sizeBytes: gb(46), fileCount: 220000 }, { folder: "/Volumes/GOLD/Relax With Me", sizeBytes: gb(62), fileCount: 180000 }], repeatedFilenames: [{ name: "IMG_0001.JPG", count: 420, totalSizeBytes: gb(2) }, { name: "Untitled.pdf", count: 180, totalSizeBytes: gb(1) }], mediaCounts: { images: 260000, audio: 72000, video: 45000 }, likelyDuplicates: [advisory({ id: "duplicate-filenames", title: "Repeated filenames need human review", description: "Duplicate candidates are based on metadata only; content hashing is intentionally not performed.", severity: "review", fileCount: 600 })], sensitiveCategories: categories.filter((category) => category.sensitive) };
  }
}
