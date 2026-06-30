import type { GrantSnapshot } from "./grant-types";
export function planGrantWork(s: GrantSnapshot){ return s.recommendations.map(r=>r.action); }
