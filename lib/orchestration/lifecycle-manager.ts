import type { AgentHealthSnapshot, RegisteredAgent } from "./types";
import { nowIso } from "./utils";
export class LifecycleManager {
  private readonly heartbeats = new Map<string, string>();
  heartbeat(agentId: string) { const at = nowIso(); this.heartbeats.set(agentId, at); return at; }
  getHeartbeat(agentId: string) { return this.heartbeats.get(agentId); }
  describe(agent: RegisteredAgent, snapshot?: AgentHealthSnapshot) { return { id: agent.id, name: agent.name, role: agent.role, status: snapshot?.availability ?? agent.status, health: snapshot?.health ?? agent.health, lastHeartbeatAt: this.getHeartbeat(agent.id), source: agent.source }; }
}
