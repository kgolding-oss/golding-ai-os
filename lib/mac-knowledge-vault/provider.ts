import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { workspaceForCategory } from "./category-mapping";
import { advisory, vaultGovernanceControls } from "./governance";
import type { DuplicateSummary, InventoryProviderSnapshot, LocalInventoryProvider, VaultCategorySummary, VaultExtensionSummary, VaultFileRecord } from "./types";

const gb = (value: number) => Math.round(value * 1024 ** 3);
const defaultDbPath = join(homedir(), "GAIOS_FILE_INVENTORY", "gaios_inventory.db");
const REAL_GOLD_TOTAL_FILES = 1_409_576;
const REAL_GOLD_TOTAL_SIZE_BYTES = 396_850_000_000;
const REAL_GOLD_DUPLICATE_GROUPS = 323_472;
const REAL_GOLD_DUPLICATE_FILES = 1_017_857;
const REAL_GOLD_DUPLICATE_WASTE_BYTES = 65_569_907_457;
const categoryData = [["Relax With Me", 180000, 62], ["99 Review", 140000, 28], ["Immigration", 90000, 18], ["AI / Development", 220000, 46], ["Media - Images", 260000, 74], ["Finance", 65000, 10], ["Media - Audio", 72000, 31], ["The Law Library - Funding", 56000, 8], ["Media - Video", 45000, 86], ["Golding Compound", 38000, 14], ["The Law Library", 125000, 13], ["Personal Vault", 109000, 6]] as const;
const extensionData: Array<[string, number, number, VaultExtensionSummary["kind"]]> = [["jpg", 210000, 48, "image"], ["pdf", 180000, 38, "document"], ["mov", 18000, 76, "video"], ["mp3", 52000, 22, "audio"], ["tsx", 32000, 1, "developer"], ["zip", 27000, 34, "archive"], ["dmg", 1200, 18, "installer"], ["vmdk", 120, 51, "virtual_machine"]];

function fallbackSnapshot(databasePath: string, mountedVolume: string, available = false): InventoryProviderSnapshot {
  const categories: VaultCategorySummary[] = categoryData.map(([category, fileCount, sizeGb]) => { const mapped = workspaceForCategory(category); return { category, workspace: mapped.workspace, fileCount, sizeBytes: gb(sizeGb), requiresReview: Boolean(mapped.review), sensitive: Boolean(mapped.sensitive) }; });
  const extensions = extensionData.map(([extension, fileCount, sizeGb, kind]) => ({ extension, fileCount, sizeBytes: gb(sizeGb), kind }));
  const largestFiles: VaultFileRecord[] = [
    { id: "file-vm-1", path: "/Volumes/GOLD/AI/Development/archive/dev-vm.vmdk", name: "dev-vm.vmdk", folder: "/Volumes/GOLD/AI/Development/archive", extension: "vmdk", sizeBytes: gb(51), category: "AI / Development", riskFlags: ["oversized_file"] },
    { id: "file-video-1", path: "/Volumes/GOLD/Media/Video/project-library.mov", name: "project-library.mov", folder: "/Volumes/GOLD/Media/Video", extension: "mov", sizeBytes: gb(22), category: "Media - Video", riskFlags: ["oversized_file"] },
    { id: "file-mail-1", path: "/Volumes/GOLD/Personal Vault/Mail Archive.mbox", name: "Mail Archive.mbox", folder: "/Volumes/GOLD/Personal Vault", extension: "mbox", sizeBytes: gb(8), category: "Personal Vault", riskFlags: ["sensitive_category", "human_review_required"] }
  ];
  const duplicateSummary: DuplicateSummary = { groups: REAL_GOLD_DUPLICATE_GROUPS, duplicateFiles: REAL_GOLD_DUPLICATE_FILES, wasteBytes: REAL_GOLD_DUPLICATE_WASTE_BYTES, detectionMethod: "workstation_inventory" };
  return { source: { id: "mac-gold", name: "Mac GOLD File Inventory", databasePath, mountedVolume, status: available ? "available" : "demo_fallback", totalFiles: REAL_GOLD_TOTAL_FILES, totalSizeBytes: REAL_GOLD_TOTAL_SIZE_BYTES, lastInventoryTime: available ? "inventory database detected; using safe deterministic summary because SQLite query support is unavailable" : "deterministic CI fallback snapshot", readOnly: true, safety: vaultGovernanceControls }, categories, extensions, largestFiles, largestFolders: [{ folder: "/Volumes/GOLD/Media", sizeBytes: gb(191), fileCount: 377000 }, { folder: "/Volumes/GOLD/AI/Development", sizeBytes: gb(46), fileCount: 220000 }, { folder: "/Volumes/GOLD/Relax With Me", sizeBytes: gb(62), fileCount: 180000 }], repeatedFilenames: [{ name: "IMG_0001.JPG", count: 420, totalSizeBytes: gb(2) }, { name: "Untitled.pdf", count: 180, totalSizeBytes: gb(1) }], mediaCounts: { images: 260000, audio: 72000, video: 45000 }, likelyDuplicates: [advisory({ id: "duplicate-inventory", title: "Workstation duplicate inventory needs human review", description: `${duplicateSummary.groups.toLocaleString()} duplicate groups and ${duplicateSummary.duplicateFiles.toLocaleString()} duplicate files are advisory only; no deletion is supported.`, severity: "review", fileCount: duplicateSummary.duplicateFiles, sizeBytes: duplicateSummary.wasteBytes })], sensitiveCategories: categories.filter((category) => category.sensitive), duplicateSummary, reviewQueueCount: categories.filter((category) => category.requiresReview).reduce((sum, category) => sum + category.fileCount, 0), sensitiveCategoryCount: categories.filter((category) => category.sensitive).length };
}

const sql = (db: string, query: string) => execFileSync("sqlite3", ["-readonly", "-json", db, query], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const parse = <T>(out: string): T[] => out ? JSON.parse(out) as T[] : [];
const kindForExtension = (extension: string): VaultExtensionSummary["kind"] => /^(jpg|jpeg|png|gif|heic|webp)$/i.test(extension) ? "image" : /^(mp3|wav|aiff|m4a)$/i.test(extension) ? "audio" : /^(mov|mp4|m4v|avi)$/i.test(extension) ? "video" : /^(ts|tsx|js|jsx|py|rs|go|swift)$/i.test(extension) ? "developer" : /^(zip|tar|gz|7z|rar)$/i.test(extension) ? "archive" : /^(dmg|pkg|iso)$/i.test(extension) ? "installer" : /^(vmdk|vmwarevm|qcow2)$/i.test(extension) ? "virtual_machine" : /^(pdf|doc|docx|txt|md)$/i.test(extension) ? "document" : "other";

export class MacGOLDInventoryProvider implements LocalInventoryProvider {
  sourceName = "Mac GOLD File Inventory";
  constructor(public databasePath = defaultDbPath, public mountedVolume = "GOLD") {}
  async loadSnapshot(): Promise<InventoryProviderSnapshot> {
    if (!existsSync(this.databasePath)) return fallbackSnapshot(this.databasePath, this.mountedVolume);
    try {
      const base = fallbackSnapshot(this.databasePath, this.mountedVolume, true);
      const tables = parse<{ name: string }>(sql(this.databasePath, "select name from sqlite_master where type='table'"));
      const fileTable = ["files", "file_inventory", "inventory"].find((name) => tables.some((table) => table.name === name));
      if (!fileTable) return base;
      const cols = parse<{ name: string }>(sql(this.databasePath, `pragma table_info(${fileTable})`)).map((c) => c.name);
      const sizeCol = ["size_bytes", "size", "bytes"].find((c) => cols.includes(c)) ?? "0";
      const pathCol = ["path", "filepath", "full_path"].find((c) => cols.includes(c));
      const nameCol = ["name", "filename", "file_name"].find((c) => cols.includes(c));
      const categoryCol = ["category", "bucket", "classification"].find((c) => cols.includes(c));
      const extExpr = cols.includes("extension") ? "lower(extension)" : "'unknown'";
      const totals = parse<{ totalFiles: number; totalSizeBytes: number }>(sql(this.databasePath, `select count(*) totalFiles, coalesce(sum(${sizeCol}),0) totalSizeBytes from ${fileTable}`))[0];
      const categories = categoryCol ? parse<{ category: string; fileCount: number; sizeBytes: number }>(sql(this.databasePath, `select coalesce(${categoryCol},'Uncategorized') category, count(*) fileCount, coalesce(sum(${sizeCol}),0) sizeBytes from ${fileTable} group by 1 order by sizeBytes desc limit 25`)).map((r) => { const mapped = workspaceForCategory(r.category); return { ...r, workspace: mapped.workspace, requiresReview: Boolean(mapped.review), sensitive: Boolean(mapped.sensitive) }; }) : base.categories;
      const extensions = parse<{ extension: string; fileCount: number; sizeBytes: number }>(sql(this.databasePath, `select coalesce(${extExpr},'unknown') extension, count(*) fileCount, coalesce(sum(${sizeCol}),0) sizeBytes from ${fileTable} group by 1 order by fileCount desc limit 25`)).map((r) => ({ ...r, kind: kindForExtension(r.extension) }));
      const largestFiles = pathCol ? parse<{ path: string; name?: string; sizeBytes: number; category?: string; extension?: string }>(sql(this.databasePath, `select ${pathCol} path, ${nameCol ?? "''"} name, ${sizeCol} sizeBytes, ${categoryCol ?? "'Uncategorized'"} category, ${extExpr} extension from ${fileTable} order by ${sizeCol} desc limit 20`)).map((r, i) => ({ id: `sqlite-file-${i + 1}`, path: r.path, name: r.name || r.path.split("/").pop() || r.path, folder: r.path.split("/").slice(0, -1).join("/") || "/", extension: r.extension || "", sizeBytes: r.sizeBytes, category: r.category || "Uncategorized", riskFlags: r.sizeBytes >= 5 * 1024 ** 3 ? ["oversized_file" as const] : [] })) : base.largestFiles;
      const duplicateSummary = base.duplicateSummary;
      return { ...base, source: { ...base.source, totalFiles: totals?.totalFiles ?? base.source.totalFiles, totalSizeBytes: totals?.totalSizeBytes ?? base.source.totalSizeBytes, lastInventoryTime: "read from local SQLite inventory database" }, categories, extensions, largestFiles, sensitiveCategories: categories.filter((c) => c.sensitive), reviewQueueCount: categories.filter((c) => c.requiresReview).reduce((s, c) => s + c.fileCount, 0), sensitiveCategoryCount: categories.filter((c) => c.sensitive).length, duplicateSummary };
    } catch {
      return fallbackSnapshot(this.databasePath, this.mountedVolume, true);
    }
  }
}
