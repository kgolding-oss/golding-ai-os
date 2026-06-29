export type ReleaseHealthInput = {
  lintPassed?: boolean;
  typecheckPassed?: boolean;
  buildPassed?: boolean;
  criticalBlockers?: number;
  openApprovals?: number;
};

export type ReleaseHealth = {
  status: "ready" | "at-risk" | "blocked";
  score: number;
  reasons: string[];
};

export function evaluateReleaseHealth(input: ReleaseHealthInput): ReleaseHealth {
  const reasons: string[] = [];
  let score = 100;

  if (!input.lintPassed) { score -= 20; reasons.push("Lint has not passed."); }
  if (!input.typecheckPassed) { score -= 25; reasons.push("TypeScript validation has not passed."); }
  if (!input.buildPassed) { score -= 30; reasons.push("Production build has not passed."); }
  if ((input.criticalBlockers ?? 0) > 0) { score -= 25; reasons.push(`${input.criticalBlockers} critical blocker${input.criticalBlockers === 1 ? "" : "s"} remain.`); }
  if ((input.openApprovals ?? 0) > 0) { score -= 10; reasons.push(`${input.openApprovals} approval${input.openApprovals === 1 ? "" : "s"} remain open.`); }

  const boundedScore = Math.max(0, score);
  return {
    status: boundedScore >= 90 ? "ready" : boundedScore >= 60 ? "at-risk" : "blocked",
    score: boundedScore,
    reasons: reasons.length ? reasons : ["Release checks are clear."],
  };
}
