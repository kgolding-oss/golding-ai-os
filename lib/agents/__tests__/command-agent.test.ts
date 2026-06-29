import { executiveCommandAgent } from "../command-agent";
import { commandRegistry } from "../command-registry";
import { evaluateReleaseHealth } from "../release-health";
import type { DashboardData } from "../../dashboard/queries";

const fixture: DashboardData = {
  organizations: [{ id: "org-1", name: "Golding" }],
  projects: [],
  tasks: [{ id: "task-1", title: "Fix release blocker", status: "blocked", priority: "high" }],
  approvals: [{ id: "approval-1", title: "Ship preview", status: "pending", risk_score: 8 }],
  agents: [{ id: "agent-1", name: "Release Manager", status: "active", health: "healthy" }],
  activity: [{ id: "activity-1", activity_type: "update", summary: "Prepared architecture refinement" }],
  health: [],
  auditLogs: [],
  memberships: [{ id: "member-1", organization_id: "org-1", status: "active" }],
  userPreferences: [],
};

export async function commandRegistryMatchingTest() {
  if (commandRegistry.match("please show blockers")?.id !== "blockers") throw new Error("Expected blockers command to match alias text.");
}

export async function unknownCommandFallbackTest() {
  const result = await commandRegistry.execute({ input: { command: "launch rockets" }, state: fixture }, "launch rockets");
  if (result.output.metadata.matched !== false) throw new Error("Unknown command should return help metadata.");
  if (!result.output.sections[0]?.items.some((item) => item.includes("Review today's priorities"))) throw new Error("Help response should list supported commands.");
}

export async function commandAgentOutputShapeTest() {
  const result = await executiveCommandAgent.run({ input: { command: "executive brief" }, state: fixture });
  if (!result.agentId || !result.output.title || !Array.isArray(result.output.sections) || !Array.isArray(result.output.recommendations)) throw new Error("Command agent result shape is invalid.");
}

export async function recommendationPriorityBehaviorTest() {
  const result = await executiveCommandAgent.run({ input: { command: "today priorities" }, state: fixture });
  if (!result.output.recommendations.length) throw new Error("Priority command should emit recommendations for pending approvals/blockers.");
}

export function releaseHealthEvaluationTest() {
  const blocked = evaluateReleaseHealth({ lintPassed: false, typecheckPassed: false, buildPassed: true, criticalBlockers: 1 });
  if (blocked.status !== "blocked") throw new Error("Release health should be blocked when validation and critical blockers fail.");
}
