import type { LawLibraryFundingSnapshot, FundingApproval, FundingIntegration, FundingSubAgent } from "./funding-types";

const approvalBoundaries = ["external_outreach", "submission", "sponsorship_commitment", "financial_promise", "compliance_sensitive_action"] as const;
const agents: FundingSubAgent[] = [
  { role: "grant_research", name: "Grant Research Agent", responsibilities: ["Find aligned funders", "Score eligibility", "Track grant deadlines"], approvalBoundaries: ["external_outreach"] },
  { role: "grant_drafting", name: "Grant Drafting Agent", responsibilities: ["Draft LOIs", "Assemble narratives", "Coordinate proposal packages"], approvalBoundaries: ["submission", "compliance_sensitive_action"] },
  { role: "sponsor_acquisition", name: "Sponsor Acquisition Agent", responsibilities: ["Build sponsor pipeline", "Draft sponsor decks", "Track commitments"], approvalBoundaries: ["external_outreach", "sponsorship_commitment", "financial_promise"] },
  { role: "donor_development", name: "Donor Development Agent", responsibilities: ["Segment donors", "Draft asks", "Plan stewardship"], approvalBoundaries: ["external_outreach", "financial_promise"] },
  { role: "partnership_development", name: "Partnership Development Agent", responsibilities: ["Identify aligned institutions", "Draft MOUs", "Coordinate partner value exchange"], approvalBoundaries: ["external_outreach", "compliance_sensitive_action"] },
  { role: "compliance_review", name: "Compliance Review Agent", responsibilities: ["Review restricted funds", "Flag legal and nonprofit obligations", "Gate sensitive actions"], approvalBoundaries: ["submission", "financial_promise", "compliance_sensitive_action"] },
  { role: "impact_reporting", name: "Impact Reporting Agent", responsibilities: ["Collect outcome evidence", "Draft funder reports", "Maintain reporting calendar"], approvalBoundaries: ["submission", "compliance_sensitive_action"] },
  { role: "campaign_operations", name: "Campaign Operations Agent", responsibilities: ["Coordinate campaigns", "Maintain approval queue", "Publish internal operating cadence"], approvalBoundaries: [...approvalBoundaries] },
];
const integrations: FundingIntegration[] = [
  { agent: "Grant Development Agent", responsibility: "Syncs grant opportunities, proposals, deadlines, documents, reporting status, and grant risk signals." },
  { agent: "CRM Agent", responsibility: "Syncs sponsor, donor, partner, relationship history, follow-up tasks, and segmentation." },
  { agent: "Finance & Operations Agent", responsibility: "Validates funding goals, financial promises, committed revenue, restrictions, invoices, and weighted forecast." },
  { agent: "Research & Intelligence Agent", responsibility: "Feeds funder research, policy trends, impact evidence, and prospect intelligence." },
  { agent: "Media & Communications Agent", responsibility: "Prepares approved campaign messaging, sponsor visibility drafts, and outreach assets." },
  { agent: "Chief of Staff", responsibility: "Coordinates cross-agent priorities, deadlines, blockers, and executive review packets." },
  { agent: "Executive Command Agent", responsibility: "Surfaces funding command metrics, approval decisions, escalations, and strategic tradeoffs." },
];
const approvals: FundingApproval[] = [
  { id: "approval-grant-submit", action: "submission", label: "Submit Access to Justice capacity grant", status: "pending", requiredBy: "2026-07-12", owner: "Grant Drafting Agent" },
  { id: "approval-sponsor-ask", action: "external_outreach", label: "Send founding sponsor outreach", status: "pending", requiredBy: "2026-07-05", owner: "Sponsor Acquisition Agent" },
  { id: "approval-donor-promise", action: "financial_promise", label: "Confirm donor matching language", status: "pending", requiredBy: "2026-07-08", owner: "Donor Development Agent" },
  { id: "approval-compliance-report", action: "compliance_sensitive_action", label: "Approve restricted-fund impact report", status: "pending", requiredBy: "2026-07-20", owner: "Compliance Review Agent" },
];
export class LawLibraryFundingRuntime {
  synthesize(input?: { now?: Date }): LawLibraryFundingSnapshot {
    const now = input?.now ?? new Date();
    const goals = [{ id: "goal-annual", label: "Law Library annual funding goal", target: 750000, secured: 185000, forecast: 472500, deadline: "2026-12-31", owner: "Executive Command Agent" }];
    const grants = [{ id: "grant-ajc", funder: "Access to Justice Foundation", program: "Community Legal Knowledge", amount: 250000, probability: 0.55, deadline: "2026-07-15", status: "approval_required" as const, owner: "grant_drafting" as const, proposalId: "proposal-ajc", reportId: "report-ajc" }];
    const sponsors = [{ id: "sponsor-founding", name: "Founding Legal Technology Sponsor", level: "Founding", amount: 100000, probability: 0.45, status: "approval_required" as const, nextStep: "Human-approved sponsorship outreach", approvalId: "approval-sponsor-ask" }];
    const donors = [{ id: "donor-major", name: "Major Donor Circle", segment: "major" as const, askAmount: 50000, probability: 0.6, status: "approval_required" as const, nextStep: "Approve matching language before ask", approvalId: "approval-donor-promise" }];
    const partners = [{ id: "partner-clinic", name: "Community Legal Clinic Network", purpose: "Shared legal literacy programming", value: 75000, probability: 0.5, status: "qualified" as const, nextStep: "Draft partnership MOU for review", approvalId: undefined }];
    const weightedForecast = [...grants.map((g) => g.amount * g.probability), ...sponsors.map((s) => s.amount * s.probability), ...donors.map((d) => d.askAmount * d.probability), ...partners.map((p) => p.value * p.probability)].reduce((a, b) => a + b, 0);
    return { systemName: "The Law Library Funding OS", agents, integrations, goals, grants, sponsors, donors, partners, deadlines: [{ id: "deadline-ajc", recordId: "grant-ajc", label: "Capacity grant submission", dueAt: "2026-07-15", owner: "grant_drafting", status: "due_soon" }, { id: "deadline-report", recordId: "report-ajc", label: "Restricted fund impact report", dueAt: "2026-07-30", owner: "impact_reporting", status: "upcoming" }], proposals: [{ id: "proposal-ajc", title: "Access to Justice Capacity Proposal", relatedTo: "grant-ajc", status: "approval_required", owner: "grant_drafting", approvalId: "approval-grant-submit" }], reports: [{ id: "report-ajc", title: "Restricted-Fund Impact Report", relatedTo: "grant-ajc", dueAt: "2026-07-30", status: "approval_required", owner: "impact_reporting", approvalId: "approval-compliance-report" }], outreachDrafts: [{ id: "outreach-sponsor", audience: "sponsor", subject: "Founding sponsorship invitation", relatedTo: "sponsor-founding", status: "approval_required", owner: "sponsor_acquisition", approvalId: "approval-sponsor-ask" }], approvals, weightedForecast, riskFlags: [{ id: "risk-approval-gate", severity: "high", title: "External funding actions are blocked until human approval", mitigation: "Route outreach, submissions, commitments, promises, and compliance-sensitive actions to Approvals before execution." }], generatedAt: now.toISOString() };
  }
}
export const lawLibraryFundingRuntime = new LawLibraryFundingRuntime();
export function lawLibraryFundingHealthSnapshot() { const s = lawLibraryFundingRuntime.synthesize(); return { status: "healthy", system: s.systemName, agents: s.agents.length, approvalsPending: s.approvals.filter((a) => a.status === "pending").length, weightedForecast: s.weightedForecast, message: "The Law Library Funding OS is registered; external outreach, submissions, commitments, financial promises, and compliance-sensitive actions require human approval." }; }
