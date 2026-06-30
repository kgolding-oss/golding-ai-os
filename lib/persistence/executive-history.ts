import { repositoryFrom } from "./repository";
import type { PersistenceContext, PersistentRecord } from "./types";
import type { ExecutiveSnapshot } from "../intelligence";
export type ExecutiveSnapshotRecord = PersistentRecord & { snapshot_type?: string | null };
export async function recordExecutiveSnapshot(context: PersistenceContext, snapshot: ExecutiveSnapshot) { return repositoryFrom(context).insert<ExecutiveSnapshotRecord>("executive_snapshots", { organization_id: context.organizationId, status: "succeeded", payload: snapshot, result: { score: snapshot.score.overall, recommendations: snapshot.recommendations.length, risks: snapshot.risks.length } }); }
