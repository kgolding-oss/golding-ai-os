export type ScheduleType = "one_time" | "recurring" | "delayed" | "dependency" | "event_triggered";
export interface SchedulePolicy { type: ScheduleType; startAt?: string; delayMs?: number; intervalMs?: number; maxOccurrences?: number; dependencyTaskIds?: string[]; eventType?: string }
export interface ScheduledPlan { id: string; planId: string; organizationId?: string | null; policy: SchedulePolicy; nextRunAt?: string; occurrences: number; status: "scheduled" | "waiting_dependency" | "waiting_event" | "completed" | "cancelled" }
