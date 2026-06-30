export type ApprovalLevel = "automatic" | "executive" | "organization_admin" | "legal" | "financial" | "security" | "multi_party";
export type ApprovalStatus = "not_required" | "pending" | "approved" | "rejected" | "deferred" | "expired";
export type ApprovalAction = "approve" | "reject" | "defer" | "expire";
export interface ApprovalEvidence { id: string; label: string; value: string; source: string }
export interface ApprovalDecision { id: string; taskId: string; planId: string; organizationId?: string | null; level: ApprovalLevel; status: ApprovalStatus; approver?: string; timestamp: string; reason: string; expiration?: string; evidence: ApprovalEvidence[]; requiredParties: ApprovalLevel[]; grantedParties: ApprovalLevel[] }
export interface ApprovalRequest { taskId: string; planId: string; organizationId?: string | null; riskScore: number; impactScore: number; requiredCapabilities: string[]; touchesExternalSystem: boolean; estimatedCostCents?: number; dataClassification: "public" | "internal" | "confidential" | "restricted"; evidence?: ApprovalEvidence[] }
