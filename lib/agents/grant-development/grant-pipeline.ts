import type { GrantOpportunity } from "./grant-types";
export function pipelineValue(opportunities: GrantOpportunity[]) { return opportunities.reduce((sum,o)=>sum+o.amount,0); }
export function weightedForecast(opportunities: GrantOpportunity[]) { return opportunities.reduce((sum,o)=>sum+o.amount*(o.probability/100),0); }
