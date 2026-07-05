import { countPendingLiveDataApprovals, hasUnresolvedApprovalGates } from "./live-data-onboarding";

export function indexedMetadataOnlySourcesWithOpenGatesCountAsPendingApprovalsTest() {
  const pendingCount = countPendingLiveDataApprovals([
    {
      id: "seeded-supabase",
      status: "indexed_metadata_only",
      approvalGates: [{ id: "approve-ingestion", status: "pending" }],
    },
  ]);

  if (pendingCount !== 1) throw new Error("indexed_metadata_only sources with unresolved gates must count as pending approvals.");
}

export function sourceStatusDoesNotSuppressUnresolvedApprovalGatesTest() {
  const pendingCount = countPendingLiveDataApprovals([
    { id: "not-connected", status: "not_connected", approvalGates: [{ id: "metadata", status: "pending" }] },
    { id: "discovered", status: "discovered", approvalGates: [{ id: "stage", status: "deferred" }] },
    { id: "staged", status: "staged_metadata", approvalGates: [{ id: "index", status: null }] },
    { id: "custom", status: "custom_non_final", approvalGates: [{ id: "custom", resolvedAt: null }] },
    { id: "approved", status: "indexed_metadata_only", approvalGates: [{ id: "done", status: "approved" }] },
  ]);

  if (pendingCount !== 4) throw new Error("Any unresolved approval gate should count regardless of source status.");
}

export function resolvedApprovalGatesAreNotPendingTest() {
  if (hasUnresolvedApprovalGates({ approvalGates: [{ id: "approved", status: "approved" }] })) throw new Error("Approved gates should be resolved.");
  if (hasUnresolvedApprovalGates({ approvalGates: [{ id: "resolved", status: "pending", resolvedAt: "2026-07-05T00:00:00.000Z" }] })) throw new Error("Gates with resolvedAt should be resolved.");
}
