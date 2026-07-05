export type LiveDataSourceType =
  | "mac_knowledge_vault"
  | "google_drive"
  | "gmail"
  | "google_calendar"
  | "supabase_operational_tables"
  | "manual_csv"
  | "manual_json";

export type OnboardingStatus =
  | "not_connected"
  | "discovered"
  | "pending_review"
  | "approved_for_indexing"
  | "indexed_metadata_only"
  | "indexed_content"
  | "failed"
  | "disabled";

export type ApprovalGate =
  | "indexing_file_contents"
  | "importing_contacts"
  | "importing_emails"
  | "importing_calendar_events"
  | "linking_records"
  | "exposing_records_to_ai_agents";

export type DataClassification =
  | "public"
  | "internal"
  | "confidential"
  | "legal_sensitive"
  | "financial_sensitive"
  | "personal_sensitive"
  | "restricted";

export type WorkspaceMapping =
  | "The Law Library"
  | "Golding Compound"
  | "Relax With Me"
  | "YouPassGo"
  | "TLC Creations"
  | "Musa Links"
  | "YardYank"
  | "J&J Catering"
  | "Personal Vault";

export type OnboardingAuditEvent = {
  id: string;
  sourceId: string;
  action: string;
  decision:
    | "system_staged"
    | "human_required"
    | "approved"
    | "rejected"
    | "disabled";
  actor: "system" | "owner" | "data_steward";
  createdAt: string;
  notes: string;
};

export type LiveDataSource = {
  id: string;
  name: string;
  type: LiveDataSourceType;
  status: OnboardingStatus;
  workspace: WorkspaceMapping;
  classification: DataClassification;
  stagedRecords: number;
  sensitiveCategories: DataClassification[];
  approvalGates: ApprovalGate[];
  nextSafeAction: string;
  errors: string[];
  aiExposure: "blocked" | "metadata_only" | "content_allowed_after_approval";
  automaticContentIngestion: false;
  auditEvents: OnboardingAuditEvent[];
};

export const onboardingStatuses: OnboardingStatus[] = [
  "not_connected",
  "discovered",
  "pending_review",
  "approved_for_indexing",
  "indexed_metadata_only",
  "indexed_content",
  "failed",
  "disabled",
];
export const dataClassifications: DataClassification[] = [
  "public",
  "internal",
  "confidential",
  "legal_sensitive",
  "financial_sensitive",
  "personal_sensitive",
  "restricted",
];
export const workspaceMappings: WorkspaceMapping[] = [
  "The Law Library",
  "Golding Compound",
  "Relax With Me",
  "YouPassGo",
  "TLC Creations",
  "Musa Links",
  "YardYank",
  "J&J Catering",
  "Personal Vault",
];

const allGates: ApprovalGate[] = [
  "indexing_file_contents",
  "importing_contacts",
  "importing_emails",
  "importing_calendar_events",
  "linking_records",
  "exposing_records_to_ai_agents",
];

function audit(
  sourceId: string,
  action: string,
  notes: string,
): OnboardingAuditEvent {
  return {
    id: `${sourceId}-${action}`,
    sourceId,
    action,
    decision: "human_required",
    actor: "system",
    createdAt: "2026-07-05T00:00:00.000Z",
    notes,
  };
}

export const liveDataSources: LiveDataSource[] = [
  {
    id: "mac-knowledge-vault",
    name: "Mac Knowledge Vault inventory",
    type: "mac_knowledge_vault",
    status: "discovered",
    workspace: "Personal Vault",
    classification: "confidential",
    stagedRecords: 128,
    sensitiveCategories: [
      "legal_sensitive",
      "personal_sensitive",
      "restricted",
    ],
    approvalGates: [
      "indexing_file_contents",
      "linking_records",
      "exposing_records_to_ai_agents",
    ],
    nextSafeAction:
      "Review folder-level inventory and approve metadata-only indexing per workspace.",
    errors: [],
    aiExposure: "blocked",
    automaticContentIngestion: false,
    auditEvents: [
      audit(
        "mac-knowledge-vault",
        "discovery_staged",
        "Inventory is staged as metadata; file contents remain blocked.",
      ),
    ],
  },
  {
    id: "google-drive",
    name: "Google Drive",
    type: "google_drive",
    status: "not_connected",
    workspace: "The Law Library",
    classification: "internal",
    stagedRecords: 0,
    sensitiveCategories: [
      "confidential",
      "legal_sensitive",
      "financial_sensitive",
    ],
    approvalGates: [
      "indexing_file_contents",
      "linking_records",
      "exposing_records_to_ai_agents",
    ],
    nextSafeAction:
      "Connect OAuth with read-only discovery scopes, then classify folders before indexing.",
    errors: [],
    aiExposure: "blocked",
    automaticContentIngestion: false,
    auditEvents: [
      audit(
        "google-drive",
        "connection_required",
        "No Google Drive records are read until a steward connects the source.",
      ),
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    type: "gmail",
    status: "not_connected",
    workspace: "Personal Vault",
    classification: "personal_sensitive",
    stagedRecords: 0,
    sensitiveCategories: [
      "personal_sensitive",
      "legal_sensitive",
      "restricted",
    ],
    approvalGates: [
      "importing_contacts",
      "importing_emails",
      "linking_records",
      "exposing_records_to_ai_agents",
    ],
    nextSafeAction:
      "Approve mailbox labels and date windows before any email or contact import.",
    errors: [],
    aiExposure: "blocked",
    automaticContentIngestion: false,
    auditEvents: [
      audit(
        "gmail",
        "mail_import_blocked",
        "Email and contact import require explicit approval gates.",
      ),
    ],
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    type: "google_calendar",
    status: "pending_review",
    workspace: "Golding Compound",
    classification: "personal_sensitive",
    stagedRecords: 42,
    sensitiveCategories: ["personal_sensitive", "confidential"],
    approvalGates: [
      "importing_calendar_events",
      "linking_records",
      "exposing_records_to_ai_agents",
    ],
    nextSafeAction:
      "Review calendars, redact private titles, and approve event import boundaries.",
    errors: [],
    aiExposure: "blocked",
    automaticContentIngestion: false,
    auditEvents: [
      audit(
        "google-calendar",
        "calendar_review_required",
        "Calendar event import is staged for review only.",
      ),
    ],
  },
  {
    id: "supabase-operational",
    name: "Supabase operational tables",
    type: "supabase_operational_tables",
    status: "indexed_metadata_only",
    workspace: "The Law Library",
    classification: "confidential",
    stagedRecords: 64,
    sensitiveCategories: [
      "financial_sensitive",
      "legal_sensitive",
      "personal_sensitive",
    ],
    approvalGates: ["linking_records", "exposing_records_to_ai_agents"],
    nextSafeAction:
      "Approve table-by-table relationships before linking records to people, cases, or grants.",
    errors: [],
    aiExposure: "metadata_only",
    automaticContentIngestion: false,
    auditEvents: [
      audit(
        "supabase-operational",
        "metadata_indexed",
        "Only schemas and record counts are available without relationship approval.",
      ),
    ],
  },
  {
    id: "manual-csv",
    name: "Manual CSV import",
    type: "manual_csv",
    status: "pending_review",
    workspace: "YouPassGo",
    classification: "internal",
    stagedRecords: 18,
    sensitiveCategories: ["financial_sensitive", "personal_sensitive"],
    approvalGates: allGates,
    nextSafeAction:
      "Validate columns, classify rows, and approve a dry-run import manifest.",
    errors: ["Two columns need steward classification before import."],
    aiExposure: "blocked",
    automaticContentIngestion: false,
    auditEvents: [
      audit(
        "manual-csv",
        "csv_manifest_staged",
        "CSV rows are staged; destructive imports are disabled.",
      ),
    ],
  },
  {
    id: "manual-json",
    name: "Manual JSON import",
    type: "manual_json",
    status: "discovered",
    workspace: "Musa Links",
    classification: "internal",
    stagedRecords: 7,
    sensitiveCategories: ["confidential"],
    approvalGates: allGates,
    nextSafeAction:
      "Review JSON schema and map fields to a workspace before import.",
    errors: [],
    aiExposure: "blocked",
    automaticContentIngestion: false,
    auditEvents: [
      audit(
        "manual-json",
        "json_schema_discovered",
        "JSON schema is discovered without importing payload content.",
      ),
    ],
  },
];

export function buildLiveDataOnboardingDashboard(
  sources: LiveDataSource[] = liveDataSources,
) {
  const sourcesDiscovered = sources.filter(
    (source) =>
      source.status !== "not_connected" && source.status !== "disabled",
  ).length;
  const sourcesPendingApproval = sources.filter((source) =>
    ["discovered", "pending_review", "approved_for_indexing"].includes(
      source.status,
    ),
  ).length;
  const recordsStaged = sources.reduce(
    (sum, source) => sum + source.stagedRecords,
    0,
  );
  const ingestionErrors = sources.flatMap((source) =>
    source.errors.map((error) => ({ source: source.name, error })),
  );
  const sensitiveCategories = Array.from(
    new Set(sources.flatMap((source) => source.sensitiveCategories)),
  );
  const nextSafeActions = sources.map((source) => ({
    source: source.name,
    action: source.nextSafeAction,
  }));
  return {
    sources,
    sourcesDiscovered,
    sourcesPendingApproval,
    recordsStaged,
    sensitiveCategories,
    ingestionErrors,
    nextSafeActions,
    auditEventCount: sources.reduce(
      (sum, source) => sum + source.auditEvents.length,
      0,
    ),
  };
}
