import { repositoryFrom } from "./repository";
import { correlationId } from "./serializer";
import type { CommandExecutionRecord, PersistenceContext } from "./types";
export async function recordCommandExecution(context: PersistenceContext, input: { commandText: string; status: string; agentId?: string; result?: unknown; error?: unknown }) {
  return repositoryFrom(context).insert<CommandExecutionRecord>("command_executions", { organization_id: context.organizationId, created_by: context.profileId ?? null, agent_id: input.agentId ?? "executive-command-agent", correlation_id: context.correlationId ?? correlationId("cmd"), status: input.status, payload: { commandText: input.commandText }, result: input.result, error_details: input.error, command_text: input.commandText } as never);
}
