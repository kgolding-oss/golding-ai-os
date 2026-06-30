import type { ExecutiveSnapshot } from "./executive-types";
export class ExecutiveRegistry{private latestSnapshot:ExecutiveSnapshot|null=null; set(snapshot:ExecutiveSnapshot){this.latestSnapshot=snapshot; return snapshot;} latest(){return this.latestSnapshot;}}
export const executiveRegistry=new ExecutiveRegistry();
