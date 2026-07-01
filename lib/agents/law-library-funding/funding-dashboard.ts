import type { LawLibraryFundingSnapshot } from "./funding-types";
export function buildLawLibraryFundingDashboard(snapshot: LawLibraryFundingSnapshot) {
  const goal = snapshot.goals[0];
  return { goalProgress: goal ? Math.round((goal.secured / goal.target) * 100) : 0, totalGoal: snapshot.goals.reduce((s, g) => s + g.target, 0), secured: snapshot.goals.reduce((s, g) => s + g.secured, 0), weightedForecast: snapshot.weightedForecast, pendingApprovals: snapshot.approvals.filter((a) => a.status === "pending"), dueSoon: snapshot.deadlines.filter((d) => d.status === "due_soon" || d.status === "overdue"), pipelineCount: snapshot.grants.length + snapshot.sponsors.length + snapshot.donors.length + snapshot.partners.length, riskFlags: snapshot.riskFlags };
}
