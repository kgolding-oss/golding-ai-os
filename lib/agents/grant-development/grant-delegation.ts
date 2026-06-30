import type { GrantRecommendation } from "./grant-types";
export function grantDelegationsForChiefOfStaff(recommendations: GrantRecommendation[]){ return recommendations.map(r=>({ id:`cos-grant-${r.id}`, ownerAgent:"grant-development-agent", title:r.title, priority:r.severity, approvals:["Approval Engine"], rationale:r.action })); }
