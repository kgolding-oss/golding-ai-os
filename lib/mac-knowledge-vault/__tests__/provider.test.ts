import { MacGOLDInventoryProvider } from "../provider";
import { forbiddenVaultOperations, isVaultOperationAllowed, vaultGovernanceControls } from "../governance";

export async function missingSqliteInventoryFallsBackSafelyTest() {
  const provider = new MacGOLDInventoryProvider("/tmp/gaios-missing-inventory-do-not-create.db", "GOLD");
  const snapshot = await provider.loadSnapshot();
  if (snapshot.source.status !== "demo_fallback") throw new Error("Missing SQLite inventory should use deterministic fallback data.");
  if (snapshot.source.totalFiles !== 1_409_576) throw new Error("Fallback should preserve known GOLD total file count.");
  if (snapshot.duplicateSummary.groups !== 323_472 || snapshot.duplicateSummary.wasteBytes !== 65_569_907_457) throw new Error("Fallback should expose known duplicate summary.");
  if (!snapshot.source.readOnly || snapshot.source.safety.executionSupported !== false) throw new Error("Fallback source must remain read-only with execution disabled.");
}

export function noDestructiveVaultOperationExposedTest() {
  if (!vaultGovernanceControls.recommendationOnly || !vaultGovernanceControls.requiresHumanApproval || vaultGovernanceControls.executionSupported) throw new Error("Vault governance must remain recommendation-only, approval-gated, and execution-disabled.");
  for (const operation of forbiddenVaultOperations) {
    if (isVaultOperationAllowed(`please ${operation} a local file`)) throw new Error(`Destructive vault operation was exposed: ${operation}`);
  }
}
