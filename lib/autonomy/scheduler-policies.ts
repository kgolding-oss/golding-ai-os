import type { SchedulePolicy } from "./scheduler-types";
export function nextRunForPolicy(policy: SchedulePolicy, now = new Date(), completedDependencies: string[] = [], eventType?: string): string | undefined {
  if (policy.type === "dependency") return (policy.dependencyTaskIds ?? []).every((id) => completedDependencies.includes(id)) ? now.toISOString() : undefined;
  if (policy.type === "event_triggered") return policy.eventType === eventType ? now.toISOString() : undefined;
  if (policy.type === "delayed") return new Date(now.getTime() + (policy.delayMs ?? 0)).toISOString();
  if (policy.type === "recurring") return new Date(Date.parse(policy.startAt ?? now.toISOString()) + (policy.intervalMs ?? 86_400_000)).toISOString();
  return policy.startAt ?? now.toISOString();
}
