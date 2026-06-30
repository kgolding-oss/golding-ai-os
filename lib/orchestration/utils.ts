import type { AgentMessagePriority } from "./types";
export const nowIso = () => new Date().toISOString();
let sequence = 0;
export function createId(prefix: string) { sequence += 1; return `${prefix}_${Date.now().toString(36)}_${sequence.toString(36)}`; }
export const priorityWeight: Record<AgentMessagePriority, number> = { critical: 4, high: 3, normal: 2, low: 1 };
export function clamp(value: number, min = 0, max = 100) { return Math.max(min, Math.min(max, value)); }
