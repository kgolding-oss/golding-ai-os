import type { ExecutiveAnalysisContext, ExecutiveSnapshot } from "./executive-types";
import { validateExecutiveContext } from "./executive-validator";
import { analyzeExecutiveContext } from "./executive-analyzer";
import { executiveTelemetry } from "./executive-telemetry";
import { executiveRegistry } from "./executive-registry";
export class ExecutiveIntelligenceEngine{analyze(ctx:ExecutiveAnalysisContext):ExecutiveSnapshot{const errors=validateExecutiveContext(ctx); if(errors.length) throw new Error(`Invalid executive context: ${errors.join(", ")}`); const snapshot=analyzeExecutiveContext(ctx); executiveTelemetry.record(snapshot); return executiveRegistry.set(snapshot);}}
export const executiveIntelligenceEngine=new ExecutiveIntelligenceEngine();
