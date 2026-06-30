import type { ExecutiveSnapshot } from "./executive-types";
export type ExecutiveTelemetry={generatedSnapshots:number;lastScore:number|null;lastGeneratedAt:string|null;recommendationCount:number;riskCount:number};
export class ExecutiveTelemetryRecorder{private snapshots:ExecutiveSnapshot[]=[]; record(snapshot:ExecutiveSnapshot){this.snapshots.push(snapshot); if(this.snapshots.length>25)this.snapshots.shift();} metrics():ExecutiveTelemetry{const last=this.snapshots.at(-1);return{generatedSnapshots:this.snapshots.length,lastScore:last?.score.overall??null,lastGeneratedAt:last?.generatedAt??null,recommendationCount:last?.recommendations.length??0,riskCount:last?.risks.length??0};}}
export const executiveTelemetry=new ExecutiveTelemetryRecorder();
