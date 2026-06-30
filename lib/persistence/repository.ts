import { getRows, supabaseRequest } from "../supabase/data";
import { safeJson } from "./serializer";
import type { OperatingHistory, PersistenceContext, PersistentRecord } from "./types";
import { hasPersistenceContext, requireOrganizationId } from "./validators";

export type InsertRecord = Partial<PersistentRecord> & { organization_id?: string | null; payload?: unknown; result?: unknown; error_details?: unknown };

export class PersistenceRepository {
  constructor(private readonly token?: string | null) {}
  async insert<T extends PersistentRecord>(table: string, input: InsertRecord): Promise<T | null> {
    if (!this.token) return null;
    const organization_id = requireOrganizationId(input.organization_id);
    const body = { ...input, organization_id, payload: safeJson(input.payload), result: safeJson(input.result), error_details: input.error_details ? safeJson(input.error_details) : null };
    const rows = await supabaseRequest<T[]>(table, { token: this.token, method: "POST", body, prefer: "return=representation" });
    return rows[0] ?? null;
  }
  async list<T extends PersistentRecord>(table: string, organizationId?: string | null, limit = 10, extra = ""): Promise<T[]> {
    if (!this.token || !organizationId) return [];
    try {
      return await getRows<T>(table, this.token, `?select=*&organization_id=eq.${encodeURIComponent(organizationId)}${extra}&order=created_at.desc&limit=${limit}`);
    } catch (error) {
      console.error(`Operating history source unavailable: ${table}`, error);
      return [];
    }
  }
}
export function repositoryFrom(context: PersistenceContext) { return new PersistenceRepository(context.token); }
export async function getOperatingHistory(context: PersistenceContext, limit = 8): Promise<OperatingHistory> {
  if (!hasPersistenceContext(context)) return { commands: [], workflows: [], orchestrationEvents: [], failedEvents: [], healthSnapshots: [] };
  const repo = repositoryFrom(context);
  const [commands, workflows, orchestrationEvents, healthSnapshots] = await Promise.all([
    repo.list("command_executions", context.organizationId, limit), repo.list("workflow_executions", context.organizationId, limit), repo.list("orchestration_events", context.organizationId, limit), repo.list("health_snapshots", context.organizationId, limit),
  ]);
  const failedEvents = [...commands, ...workflows, ...orchestrationEvents, ...healthSnapshots].filter((r) => r.status === "failed" || r.error_details).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, limit);
  return { commands, workflows, orchestrationEvents, failedEvents, healthSnapshots } as OperatingHistory;
}
