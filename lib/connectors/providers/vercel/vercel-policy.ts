import { vercelApprovalOperations } from "./vercel-capabilities";
export function requiresVercelApproval(operationId: string) { return vercelApprovalOperations.includes(operationId); }
export function evaluateVercelPolicy(operationId: string, approved?: boolean) { if (requiresVercelApproval(operationId) && !approved) return { allowed: false, reason: `${operationId} requires explicit approval before Vercel execution.` }; return { allowed: true, reason: "Vercel connector policy allowed execution." }; }
