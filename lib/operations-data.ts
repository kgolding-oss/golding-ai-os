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
  return Object.fromEntries(entities.map((entity, index) => [entity, rows[index]])) as ProductionData;
}

export function summarizeProductionData(data: ProductionData) {
  const totalRecords = entities.reduce((sum, entity) => sum + data[entity].length, 0);
  const emptyEntities = entities.filter((entity) => data[entity].length === 0);
  const activeQueues = entities.map((entity) => ({ entity, records: data[entity].filter((record) => !["closed", "complete", "completed", "archived"].includes(String(record.status ?? "").toLowerCase())) })).filter((queue) => queue.records.length > 0);
  return { totalRecords, emptyEntities, activeQueues };
}
