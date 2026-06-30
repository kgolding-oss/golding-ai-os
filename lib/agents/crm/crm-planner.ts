import type { CrmSnapshot } from "./crm-types"; export function planCrmWork(s:CrmSnapshot){ return s.recommendations.map((r)=>r.action); }
