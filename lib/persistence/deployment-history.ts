export type DeploymentHistoryRecord = { organizationId: string; connectorId: "vercel"; kind: "deployment" | "release" | "runtime" | "infrastructure" | "telemetry" | "readiness"; status: string; correlationId: string; capturedAt: string; metadata: Record<string, unknown> };
const records: DeploymentHistoryRecord[] = [];
export function persistDeploymentHistory(record: DeploymentHistoryRecord) { records.push(record); if (records.length > 500) records.shift(); return record; }
export function listDeploymentHistory(organizationId?: string) { return records.filter((record) => !organizationId || record.organizationId === organizationId); }
