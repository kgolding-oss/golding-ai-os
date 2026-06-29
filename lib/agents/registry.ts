import { commandAgent } from "./command-agent";

export const agentRegistry = [commandAgent] as const;

export function getAgentById(id: string) {
  return agentRegistry.find((agent) => agent.id === id) ?? null;
}

export function getExecutiveCommandAgent() {
  return commandAgent;
}
