import type { GrantSnapshot } from "./grant-types";
export type GrantMemory = { opportunityIds: string[]; sponsorHistory: string[]; reportingHistory: string[]; scoringHistory: string[]; updatedAt: string };
export const grantMemoryFromSnapshot=(s:GrantSnapshot):GrantMemory=>({ opportunityIds:s.opportunities.map(o=>o.id), sponsorHistory:[...new Set(s.opportunities.map(o=>o.funder))], reportingHistory:s.reportingStatus, scoringHistory:s.scores.map(sc=>`${sc.opportunityId}:${sc.priorityScore}`), updatedAt:s.generatedAt });
