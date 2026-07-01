export type DivisionId = "executive" | "legal" | "funding" | "education" | "partnership" | "knowledge";
export type ApprovalGate = "legal_filing" | "financial_transaction" | "email" | "publishing" | "grant_submission" | "sponsor_outreach";
export type WorkflowState = "intake" | "triage" | "active" | "waiting_on_client" | "waiting_on_agency" | "approval_required" | "submitted" | "closed";

export type OperationalRecord = {
  id: string;
  name: string;
  division: DivisionId;
  ownerAgent: string;
  workflowState: WorkflowState;
  nextAction: string;
  approvalRequired?: ApprovalGate;
  knowledgeSources: string[];
};

export type LawLibraryDivision = {
  id: DivisionId;
  name: string;
  reportsTo: "Chief of Staff";
  modules: string[];
  agents: string[];
  approvalGates: ApprovalGate[];
};

export const lawLibraryDivisions: LawLibraryDivision[] = [
  { id: "executive", name: "Executive Office", reportsTo: "Chief of Staff", modules: ["Executive Briefing", "Priority Queue", "Urgent Cases", "Upcoming Hearings", "Grant Deadlines", "Sponsor Pipeline", "Donor Pipeline", "Financial Snapshot", "Property Updates", "AI Recommendations", "Pending Approvals", "System Health"], agents: ["Executive Command", "Chief of Staff"], approvalGates: [] },
  { id: "legal", name: "Legal Operations", reportsTo: "Chief of Staff", modules: ["Client Intake", "Case Management", "Evidence Management", "FOIA Tracking", "Habeas Tracking", "Removal Defense", "USCIS", "EOIR", "ICE Detention", "Court Calendar", "Deadlines", "Document Generation", "Case Timeline"], agents: ["Intake Agent", "Case Manager", "FOIA Agent", "Habeas Agent", "Research Agent", "Court Monitor"], approvalGates: ["legal_filing", "email"] },
  { id: "funding", name: "Funding Operations", reportsTo: "Chief of Staff", modules: ["Grant Pipeline", "Grant Calendar", "Grant Writer Workspace", "Sponsor CRM", "Donor CRM", "Foundation CRM", "Corporate Partnership CRM", "Campaign Tracker", "Funding Forecast", "Revenue Dashboard", "Board Reporting", "Impact Reporting", "Compliance Checklist", "Submission Queue"], agents: ["Grant Research", "Grant Writer", "Sponsor Acquisition", "Donor Development", "Partnership Development", "Compliance", "Reporting"], approvalGates: ["grant_submission", "sponsor_outreach", "financial_transaction", "email"] },
  { id: "education", name: "Education Operations", reportsTo: "Chief of Staff", modules: ["Orange Trees & Backyards", "Crimmigration Corner", "Courses", "Toolkits", "Workshops", "Volunteer Training", "Educational Calendar", "Lesson Planning", "Content Production", "Publishing Queue", "Approval Queue"], agents: ["Podcast", "Newsletter", "Social", "Course Publishing"], approvalGates: ["publishing", "email"] },
  { id: "partnership", name: "Partnership Operations", reportsTo: "Chief of Staff", modules: ["Law Firms", "Universities", "Community Organizations", "Sponsors", "Corporate Partners", "Foundations", "Government Agencies", "Volunteers", "Partner Health Score", "Follow-up Queue", "Relationship Timeline", "Meeting Notes", "Opportunity Tracker"], agents: ["CRM", "Scheduling", "Partnership Development"], approvalGates: ["sponsor_outreach", "email"] },
  { id: "knowledge", name: "Knowledge Operations", reportsTo: "Chief of Staff", modules: ["Google Drive", "Internal SOPs", "Grant Templates", "Immigration Templates", "FOIA Templates", "Habeas Templates", "Board Documents", "Research", "Media", "Property Documents", "Policies", "Search", "Citation Review"], agents: ["Knowledge Indexer", "Search Agent", "Citation Agent", "Document Classifier"], approvalGates: [] },
];

export const productionSeedStructures = ["Organizations", "Programs", "Cases", "Clients", "Grants", "Sponsors", "Donors", "Partners", "Volunteers", "Projects", "Knowledge Sources", "Media Assets", "Tasks", "Approvals"];

export const operationalRecords: OperationalRecord[] = [
  { id: "case-seed-001", name: "Anonymous removal-defense matter", division: "legal", ownerAgent: "Case Manager", workflowState: "triage", nextAction: "Verify deadlines and evidence inventory; do not provide legal advice.", approvalRequired: "legal_filing", knowledgeSources: ["Immigration Templates", "Policies"] },
  { id: "grant-seed-001", name: "General operating support prospect", division: "funding", ownerAgent: "Grant Writer", workflowState: "approval_required", nextAction: "Prepare internal grant briefing for human review.", approvalRequired: "grant_submission", knowledgeSources: ["Grant Templates", "Board Documents"] },
  { id: "education-seed-001", name: "Crimmigration Corner content batch", division: "education", ownerAgent: "Course Publishing", workflowState: "approval_required", nextAction: "Queue draft for editorial and legal review before publishing.", approvalRequired: "publishing", knowledgeSources: ["Research", "Policies"] },
  { id: "partner-seed-001", name: "Law firm pro bono partner follow-up", division: "partnership", ownerAgent: "CRM", workflowState: "active", nextAction: "Draft follow-up for approval before outreach.", approvalRequired: "email", knowledgeSources: ["Internal SOPs"] },
];

export const executiveCommands = [
  { command: "Show today's priorities.", delegatesTo: ["Chief of Staff", "Executive Command"], output: "Priority queue assembled from cases, funding, approvals, and system health." },
  { command: "What cases need attention?", delegatesTo: ["Chief of Staff", "Case Manager", "Court Monitor"], output: "Legal attention list; excludes legal advice and filing decisions." },
  { command: "Prepare grant briefing.", delegatesTo: ["Chief of Staff", "Grant Research", "Grant Writer", "Compliance"], output: "Grant briefing with submission held for approval." },
  { command: "Generate sponsor report.", delegatesTo: ["Chief of Staff", "Sponsor Acquisition", "CRM"], output: "Sponsor pipeline and outreach queue; no outreach sent automatically." },
  { command: "Show detainees requiring action.", delegatesTo: ["Chief of Staff", "Habeas Agent", "Court Monitor"], output: "Detention action queue with approval-gated next steps." },
  { command: "Prepare board report.", delegatesTo: ["Chief of Staff", "Reporting", "Finance"], output: "Board report draft with impact, finance, and approvals." },
  { command: "Generate executive summary.", delegatesTo: ["Chief of Staff", "Executive Command"], output: "Auditable cross-division executive summary." },
];

export function summarizeLawLibraryOS() {
  const pendingApprovals = operationalRecords.filter((record) => record.approvalRequired).length;
  return { divisionCount: lawLibraryDivisions.length, moduleCount: lawLibraryDivisions.reduce((sum, division) => sum + division.modules.length, 0), agentCount: new Set(lawLibraryDivisions.flatMap((division) => division.agents)).size, pendingApprovals, seedStructures: productionSeedStructures.length };
}
