import assert from "node:assert/strict";
import test from "node:test";
import { CommandRegistry, parseCommand } from "../lib/agents/command-registry";
import { createExecutiveCommands, ExecutiveCommandAgent } from "../lib/agents/executive-command-agent";
import { buildAttentionQueue, buildRecommendations } from "../lib/dashboard/intelligence";
import type { AgentCommandContext } from "../lib/types/agent";
import { getReleaseHealth } from "../lib/release/release-manager";

const context: AgentCommandContext = {
  organization: { id: "org-1", name: "Golding AI", updated_at: new Date().toISOString() },
  membershipCount: 1,
  now: new Date("2026-06-29T00:00:00.000Z"),
  data: {
    organizations: [{ id: "org-1", name: "Golding AI" }],
    projects: [],
    tasks: [{ id: "task-1", title: "Ship foundation", priority: "urgent", status: "blocked", due_at: "2026-06-28T00:00:00.000Z" }],
    approvals: [{ id: "approval-1", title: "Approve launch", status: "pending", risk_score: 8 }],
    agents: [{ id: "agent-1", name: "Legal Agent", status: "inactive", health: "offline" }],
    activity: [{ id: "activity-1", activity_type: "blocked", summary: "Release blocked", created_at: "2026-06-29T00:00:00.000Z" }],
    health: [{ id: "health-1", service_name: "Supabase", connection_status: "connected", health: "healthy" }],
    auditLogs: [],
    memberships: [{ id: "member-1", organization_id: "org-1", status: "active" }],
    userPreferences: [{ profile_id: "profile-1", active_organization_id: "org-1" }],
  },
};

test("command parser normalizes executive commands", () => {
  assert.equal(parseCommand("What needs my attention?"), "what needs my attention");
});

test("command registry resolves commands and returns help for unknown commands", () => {
  const registry = new CommandRegistry(createExecutiveCommands());
  assert.equal(registry.find("Show blockers")?.id, "blockers");
  assert.equal(registry.execute("unknown", context).help?.availableCommands.length, 6);
});

test("recommendation engine prioritizes approval and blocker recommendations", () => {
  const recommendations = buildRecommendations({ ...context.data, organization: context.organization, membershipCount: context.membershipCount });
  assert.equal(recommendations[0].id, "approve");
  assert.ok(recommendations.some((recommendation) => recommendation.id === "overdue"));
});

test("executive priority ranking places overdue work first", () => {
  const queue = buildAttentionQueue(context.data);
  assert.equal(queue[0].id, "overdue-task-1");
  assert.equal(queue[0].severity, "critical");
});

test("executive command agent returns structured deterministic output", () => {
  const agent = new ExecutiveCommandAgent();
  const result = agent.execute("Prepare executive brief", context);
  assert.equal(result.output.executiveBrief.metrics.pendingApprovals, 1);
  assert.ok(result.output.attentionQueue.length > 0);
  assert.ok(result.output.suggestedNextActions.length > 0);
});

test("release health evaluates production readiness from current application state", () => {
  const health = getReleaseHealth(context.data);
  assert.equal(health.productionReady, true);
  assert.equal(health.organizationContext.status, "ready");
});
