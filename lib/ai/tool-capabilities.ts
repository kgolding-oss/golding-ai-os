import type { ToolDefinition } from "./model-types"; export function toolHasCapability(tool:ToolDefinition,capability:string){return tool.capabilities.includes(capability);}
