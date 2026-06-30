import type { PropertyRecommendation } from "./property-types";
export function buildPropertyDelegations(recs:PropertyRecommendation[]){ return recs.map(r=>({ id:`property-del-${r.id}`, ownerAgent:"executive-chief-of-staff", title:r.title, status:"queued", approvalRequired:true, rationale:r.action, sourceId:r.sourceId })); }
