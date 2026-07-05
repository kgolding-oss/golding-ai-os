import type { VaultCleanupRecommendation, VaultGovernanceControls, VaultRiskFlag, VaultStorageInsight } from "./types";

export const vaultGovernanceControls: VaultGovernanceControls = { noFileDeletion: true, noFileMovement: true, noRenaming: true, noFilesystemWrites: true, noAutomaticUploads: true, noContentIndexing: true, noInventoryDatabaseEdits: true, recommendationOnly: true, requiresHumanApproval: true, executionSupported: false };
export const advisory = <T extends Omit<VaultStorageInsight, "recommendationOnly" | "requiresHumanApproval" | "executionSupported">>(insight: T): VaultStorageInsight => ({ ...insight, recommendationOnly: true, requiresHumanApproval: true, executionSupported: false });
export function recommendation(id: string, action: string, rationale: string, affectedScope: string, riskFlags: VaultRiskFlag[] = []): VaultCleanupRecommendation { return { id, action, rationale, affectedScope, riskFlags, ...vaultGovernanceControls }; }
export function assertReadOnlyVaultAction(action: string): never { throw new Error(`Mac Knowledge Vault is read-only. Blocked file operation: ${action}`); }
