export type LiveDataSourceStatus =
  | "not_connected"
  | "discovered"
  | "staged_metadata"
  | "indexed_metadata_only"
  | "connected"
  | "approved"
  | "ingested"
  | "exposed_to_ai"
  | "disabled"
  | "archived"
  | string;

export type ApprovalGateStatus = "pending" | "approved" | "rejected" | "deferred" | "expired" | string;

export type LiveDataApprovalGate = {
  id: string;
  label?: string;
  status?: ApprovalGateStatus | null;
  required?: boolean | null;
  resolvedAt?: string | null;
};

export type LiveDataOnboardingSource = {
  id: string;
  name?: string;
  status?: LiveDataSourceStatus | null;
  approvalGates?: LiveDataApprovalGate[] | null;
};

export type LiveDataOnboardingSnapshot = {
  sources: LiveDataOnboardingSource[];
  pendingApprovalCount: number;
  nextSafeActions: string[];
  safety: {
    automaticIngestion: false;
    automaticAiExposure: false;
    destructiveActions: false;
    approvalGatedProgressionOnly: true;
  };
};

const resolvedApprovalGateStatuses = new Set(["approved", "rejected", "expired"]);

export function hasUnresolvedApprovalGates(source: Pick<LiveDataOnboardingSource, "approvalGates">) {
  return (source.approvalGates ?? []).some((gate) => {
    const status = String(gate.status ?? "pending").toLowerCase();
    return gate.resolvedAt == null && !resolvedApprovalGateStatuses.has(status);
  });
}

export function countPendingLiveDataApprovals(sources: LiveDataOnboardingSource[]) {
  return sources.filter(hasUnresolvedApprovalGates).length;
}

export function buildLiveDataOnboardingSnapshot(sources: LiveDataOnboardingSource[]): LiveDataOnboardingSnapshot {
  const pendingApprovalCount = countPendingLiveDataApprovals(sources);

  return {
    sources,
    pendingApprovalCount,
    nextSafeActions: pendingApprovalCount
      ? [
          "Review unresolved source approval gates before ingestion.",
          "Keep metadata-only sources out of AI context until exposure is explicitly approved.",
          "Require human approval before cleanup, migration, upload, archive, or destructive source actions.",
        ]
      : ["No live-data approval gates are pending."],
    safety: {
      automaticIngestion: false,
      automaticAiExposure: false,
      destructiveActions: false,
      approvalGatedProgressionOnly: true,
    },
  };
}
