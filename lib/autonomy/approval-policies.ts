import type { ApprovalLevel, ApprovalRequest } from "./approval-types";
export interface ApprovalPolicyResult { level: ApprovalLevel; requiredParties: ApprovalLevel[]; reason: string; expiresInMs: number }
export function evaluateApprovalPolicy(request: ApprovalRequest): ApprovalPolicyResult {
  const parties: ApprovalLevel[] = [];
  if (request.dataClassification === "restricted" || request.requiredCapabilities.some((c) => c.includes("security"))) parties.push("security");
  if ((request.estimatedCostCents ?? 0) > 0 || request.requiredCapabilities.some((c) => c.includes("billing"))) parties.push("financial");
  if (request.dataClassification === "confidential" || request.requiredCapabilities.some((c) => c.includes("legal"))) parties.push("legal");
  if (request.impactScore >= 70 || request.riskScore >= 70) parties.push("executive");
  if (request.touchesExternalSystem || request.impactScore >= 40) parties.push("organization_admin");
  const unique = Array.from(new Set(parties));
  if (unique.length > 1) return { level: "multi_party", requiredParties: unique, reason: `Requires ${unique.join(", ")} approval by deterministic policy.`, expiresInMs: 86_400_000 };
  if (unique[0]) return { level: unique[0], requiredParties: unique, reason: `Requires ${unique[0]} approval by deterministic policy.`, expiresInMs: 86_400_000 };
  return { level: "automatic", requiredParties: [], reason: "Automatic approval: low risk, low impact, deterministic, and no external execution.", expiresInMs: 3_600_000 };
}
