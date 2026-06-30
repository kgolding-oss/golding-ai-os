import type { CorrelationContext } from "./types";
export function createCorrelationId(prefix = "corr") { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`; }
export function withCorrelation(context: CorrelationContext = {}): Required<Pick<CorrelationContext, "correlationId">> & CorrelationContext { return { ...context, correlationId: context.correlationId ?? createCorrelationId() }; }
