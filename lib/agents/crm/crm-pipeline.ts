import type { CrmLifecycleStage, CrmRelationship } from "./crm-types"; import { crmLifecycleStages } from "./crm-registry";
export function crmPipeline(relationships: CrmRelationship[]): Record<CrmLifecycleStage, number> { return crmLifecycleStages.reduce((acc,stage)=>({ ...acc, [stage]: relationships.filter((r)=>r.lifecycleStage===stage).length }), {} as Record<CrmLifecycleStage, number>); }
export const activeCrmRelationships=(relationships:CrmRelationship[])=>relationships.filter((r)=>!["inactive","archived"].includes(r.lifecycleStage));
