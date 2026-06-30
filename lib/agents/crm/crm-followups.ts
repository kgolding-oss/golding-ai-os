import type { CrmFollowUp, CrmRelationship } from "./crm-types";
function statusFor(f:CrmFollowUp, now:Date): CrmFollowUp["status"] { if(f.status==="complete") return "complete"; return new Date(f.dueAt)<now ? "overdue" : f.status; }
export function buildCrmFollowUps(relationships: CrmRelationship[], now = new Date()): CrmFollowUp[] { return relationships.flatMap((r)=>r.followUps.map((f)=>({ ...f, status: statusFor(f, now), reminderOnly:true }))); }
export const overdueCrmFollowUps=(followUps:CrmFollowUp[])=>followUps.filter((f)=>f.status==="overdue");
