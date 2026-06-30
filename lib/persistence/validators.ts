import type { PersistenceContext } from "./types";
export function hasPersistenceContext(context: PersistenceContext) { return Boolean(context.token && context.organizationId); }
export function requireOrganizationId(organizationId?: string | null) { if (!organizationId) throw new Error("Persistence writes require an organization_id."); return organizationId; }
