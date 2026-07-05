import { advisory } from "./governance";
import type { InventoryProviderSnapshot, VaultStorageInsight } from "./types";

export function buildStorageInsights(snapshot: InventoryProviderSnapshot): VaultStorageInsight[] {
  const oversized = snapshot.largestFiles.filter((file) => file.sizeBytes >= 5 * 1024 ** 3);
  return [
    advisory({ id: "oversized-files", title: "Oversized files identified", description: "Largest inventory records should be reviewed before any archive or migration plan.", severity: "review", fileCount: oversized.length, sizeBytes: oversized.reduce((sum, file) => sum + file.sizeBytes, 0) }),
    advisory({ id: "repeated-filenames", title: "Repeated filenames detected", description: "Common names may indicate duplicate candidates, exports, or camera-roll bursts; no deduplication is executed.", severity: "review", fileCount: snapshot.repeatedFilenames.reduce((sum, item) => sum + item.count, 0) }),
    advisory({ id: "cache-locations", title: "Temporary/cache locations should be classified", description: "Cache folders are advisory signals only and require approval before any future cleanup workflow.", severity: "info" }),
    advisory({ id: "virtual-machines", title: "Virtual machine images may dominate storage", description: "Large .vmdk/.ova-style inventory records should be reviewed for retention policy and backup strategy.", severity: "warning", sizeBytes: snapshot.extensions.filter((extension) => extension.kind === "virtual_machine").reduce((sum, item) => sum + item.sizeBytes, 0) }),
    advisory({ id: "installers", title: "Installer files detected", description: "DMG/PKG/ISO-style files can be candidates for review, never automatic removal.", severity: "info", fileCount: snapshot.extensions.filter((extension) => extension.kind === "installer").reduce((sum, item) => sum + item.fileCount, 0) }),
    advisory({ id: "media-projects", title: "Media project archive pressure", description: "Video/audio/image categories have high storage concentration and should use phased archive planning.", severity: "review", fileCount: snapshot.mediaCounts.images + snapshot.mediaCounts.audio + snapshot.mediaCounts.video }),
    advisory({ id: "email-archives", title: "Large email archives require care", description: "MBOX/PST-style records may contain personal, legal, or financial data and require restricted review.", severity: "warning" }),
    advisory({ id: "human-review-categories", title: "Categories requiring human review", description: "Personal Vault and 99 Review are routed to restricted/review queues.", severity: "warning", fileCount: snapshot.categories.filter((category) => category.requiresReview).reduce((sum, category) => sum + category.fileCount, 0) })
  ];
}
