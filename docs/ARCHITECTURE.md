# Golding AI OS Architecture

Golding AI OS is a Next.js executive command center backed by Supabase. The application keeps data access in dashboard query modules, converts records into deterministic intelligence in reusable modules, and renders simple server/client components.

## Layers

1. **Supabase data layer**: existing tables provide organizations, projects, tasks, approvals, agent registry, agent activity, system health, audit logs, memberships, and user preferences.
2. **Dashboard data layer**: `lib/dashboard/queries.ts` loads scoped records for the active organization.
3. **Intelligence layer**: `lib/dashboard/intelligence.ts`, `lib/agents/*`, and `lib/release/*` transform records into executive outputs without external AI calls.
4. **UI layer**: dashboard components render metrics, command responses, queues, recommendations, and health signals.

## Agent contract

Every agent exposes an id, name, role, purpose, scope, available actions, health, run method, and structured output. Agents are registered in `lib/agents/registry.ts`.
