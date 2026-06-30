import type { RuntimeEvent, RuntimeEventType } from "./runtime-types";
export const runtimeId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
export function createRuntimeEvent(type: RuntimeEventType, input: Omit<RuntimeEvent, "id" | "type" | "timestamp">): RuntimeEvent { return { id: runtimeId("evt"), type, timestamp: new Date().toISOString(), ...input }; }
