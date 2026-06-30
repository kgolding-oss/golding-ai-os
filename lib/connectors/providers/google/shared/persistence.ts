import type { GoogleWorkspaceSnapshot } from "./types";
const snapshots: GoogleWorkspaceSnapshot[] = [];
export function persistGoogleWorkspaceSnapshot(snapshot: GoogleWorkspaceSnapshot) { snapshots.push(snapshot); if (snapshots.length > 250) snapshots.shift(); return snapshot; }
export function listGoogleWorkspaceSnapshots() { return [...snapshots]; }
