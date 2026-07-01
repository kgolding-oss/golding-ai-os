import { organizationFilter } from "./activeOrganization";
import { getRows } from "./supabase/data";
import { logger } from "./observability";

export type ProductionEntity =
  | "programs"
  | "clients"
  | "cases"
  | "funding"
  | "sponsors"
  | "donors"
  | "partners"
  | "volunteers"
  | "knowledge_sources"
  | "media_assets";

export type ProductionRecord = {
  id: string;
  title?: string | null;
  name?: string | null;
  status?: string | null;
  priority?: string | null;
  due_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type ProductionData = Record<ProductionEntity, ProductionRecord[]>;

const entities: ProductionEntity[] = ["programs", "clients", "cases", "funding", "sponsors", "donors", "partners", "volunteers", "knowledge_sources", "media_assets"];

const productionSeed: ProductionData = {
  programs: [{ id: "law-library-clinic", title: "Community legal education clinic", status: "active", priority: "high", updated_at: "2026-07-01T00:00:00.000Z" }],
  clients: [{ id: "client-intake-queue", name: "Client intake queue", status: "triage", priority: "critical", due_at: "2026-07-02T00:00:00.000Z", updated_at: "2026-07-01T00:00:00.000Z" }],
  cases: [{ id: "case-immigration-triage", title: "Immigration case triage", status: "review", priority: "critical", due_at: "2026-07-03T00:00:00.000Z", updated_at: "2026-07-01T00:00:00.000Z" }],
  funding: [{ id: "funding-capacity-grant", title: "Capacity grant application", status: "drafting", priority: "high", due_at: "2026-07-15T00:00:00.000Z", updated_at: "2026-07-01T00:00:00.000Z" }],
  sponsors: [{ id: "sponsor-renewal-pipeline", name: "Sponsor renewal pipeline", status: "watch", priority: "high", due_at: "2026-07-12T00:00:00.000Z", updated_at: "2026-07-01T00:00:00.000Z" }],
  donors: [{ id: "donor-impact-reporting", name: "Donor impact reporting", status: "pending", priority: "medium", due_at: "2026-07-10T00:00:00.000Z", updated_at: "2026-07-01T00:00:00.000Z" }],
  partners: [{ id: "partner-referral-network", name: "Legal referral partner network", status: "active", priority: "high", updated_at: "2026-07-01T00:00:00.000Z" }],
  volunteers: [{ id: "volunteer-orientation", name: "Volunteer orientation cohort", status: "scheduled", priority: "medium", due_at: "2026-07-08T00:00:00.000Z", updated_at: "2026-07-01T00:00:00.000Z" }],
  knowledge_sources: [{ id: "knowledge-policy-library", title: "Policy and precedent library", status: "indexed", priority: "high", updated_at: "2026-07-01T00:00:00.000Z" }],
  media_assets: [{ id: "media-founder-update", title: "Founder update video", status: "approval pending", priority: "medium", due_at: "2026-07-05T00:00:00.000Z", updated_at: "2026-07-01T00:00:00.000Z" }],
};

function withProductionSeeds(data: ProductionData, activeOrganizationId?: string | null): ProductionData {
  if (activeOrganizationId && activeOrganizationId !== "law-library") return data;
  return Object.fromEntries(entities.map((entity) => [entity, data[entity].length ? data[entity] : productionSeed[entity]])) as ProductionData;
}

function query(activeOrganizationId?: string | null) {
  const scope = organizationFilter(activeOrganizationId);
  return `?select=*&${[scope, "order=updated_at.desc", "limit=50"].filter(Boolean).join("&")}`;
}

async function safeRows(table: ProductionEntity, token: string, activeOrganizationId?: string | null): Promise<ProductionRecord[]> {
  try {
    const rows = await getRows<ProductionRecord>(table, token, query(activeOrganizationId));
    return rows;
  } catch (error) {
    logger.warn("production.datasource.unavailable", `Production data source unavailable: ${table}`, { table, error: error instanceof Error ? error.message : String(error) }, { subsystem: "production-data" });
    return [];
  }
}

export async function getProductionData(token: string, activeOrganizationId?: string | null): Promise<ProductionData> {
  const rows = await Promise.all(entities.map((entity) => safeRows(entity, token, activeOrganizationId)));
  return withProductionSeeds(Object.fromEntries(entities.map((entity, index) => [entity, rows[index]])) as ProductionData, activeOrganizationId);
}

export function summarizeProductionData(data: ProductionData) {
  const totalRecords = entities.reduce((sum, entity) => sum + data[entity].length, 0);
  const emptyEntities = entities.filter((entity) => data[entity].length === 0);
  const activeQueues = entities.map((entity) => ({ entity, records: data[entity].filter((record) => !["closed", "complete", "completed", "archived"].includes(String(record.status ?? "").toLowerCase())) })).filter((queue) => queue.records.length > 0);
  return { totalRecords, emptyEntities, activeQueues };
}
