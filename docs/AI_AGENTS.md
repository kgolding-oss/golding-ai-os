# AI Agents

## Executive Command Agent

The Executive Command Agent is the first operating-layer agent. It does not call an LLM. It reads existing dashboard data and returns deterministic structured intelligence.

### Data sources

- organizations
- projects
- tasks
- approvals
- agent_registry
- agent_activity
- system_health
- audit_logs
- organization_memberships
- user_preferences

### Supported commands

- Review today's priorities
- What needs my attention?
- Show blockers
- Summarize recent activity
- Review AI workforce
- Prepare executive brief

### Output shape

The agent returns executiveBrief, attentionQueue, recommendations, blockers, timeline, suggestedNextActions, priorityRanking, supportedCommands, and display sections.
