import type { AgentEndpoint, AgentMessage, AgentMessagePriority, AgentMessageStatus, AgentMessageType } from "./types";
import { createId, nowIso } from "./utils";
export class AgentBus {
  private readonly messages: AgentMessage[] = [];
  createMessage<T>(input: { type: AgentMessageType; organizationId?: string | null; workflowId?: string | null; sender: AgentEndpoint; recipient: AgentEndpoint; payload: T; priority?: AgentMessagePriority; metadata?: Record<string, unknown>; correlationId?: string; status?: AgentMessageStatus }): AgentMessage<T> {
    return { id: createId("msg"), correlationId: input.correlationId ?? createId("corr"), organizationId: input.organizationId ?? null, workflowId: input.workflowId ?? null, sender: input.sender, recipient: input.recipient, timestamp: nowIso(), type: input.type, priority: input.priority ?? "normal", payload: input.payload, metadata: input.metadata ?? {}, status: input.status ?? "draft" };
  }
  publish<T>(message: AgentMessage<T>) { const sent = { ...message, status: "sent" as const, timestamp: nowIso() }; this.messages.unshift(sent); return sent; }
  list(limit = 50) { return this.messages.slice(0, limit); }
}
