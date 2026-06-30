import type { ExecutiveAnalysisContext, ExecutiveSignal } from "./executive-types";
import { computeExecutiveScore } from "./executive-score";
import { generateRecommendations } from "./recommendation-engine";
import { detectRisks } from "./risk-engine";
import { findOpportunities } from "./opportunity-engine";
import { detectBottlenecks } from "./bottleneck-engine";
import { rankPriorities } from "./priority-engine";
import { buildExecutiveMemory } from "./executive-memory";
import { summarizeTrend } from "./executive-insights";
import { buildExecutiveTimeline } from "./executive-events";
export function analyzeExecutiveContext(ctx:ExecutiveAnalysisContext){const score=computeExecutiveScore(ctx); const recommendations=generateRecommendations(ctx); const risks=detectRisks(ctx); const opportunities=findOpportunities(ctx); const bottlenecks=detectBottlenecks(ctx); const priorities=rankPriorities({recommendations,risks,bottlenecks}); const strategicAlerts:ExecutiveSignal[]=risks.filter(r=>r.severity==="critical"||r.subsystem==="organization").map(r=>({...r,kind:"strategic_alert" as const})); const operationalAlerts:ExecutiveSignal[]=[...risks,...bottlenecks].filter(r=>r.severity==="high"||r.severity==="critical").map(r=>({...r,kind:"operational_alert" as const})); const memory=buildExecutiveMemory(ctx.operatingHistory); const generatedAt=(ctx.now??new Date()).toISOString(); const base={score,priorities,recommendations,risks,opportunities,bottlenecks,strategicAlerts,operationalAlerts,memory,trendSummary:"",generatedAt}; const trendSummary=summarizeTrend(base); return {...base,trendSummary,timeline:buildExecutiveTimeline({...base,trendSummary})};}
