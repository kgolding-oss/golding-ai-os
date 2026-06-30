import { githubDestructiveOperations } from "./github-capabilities";
export function requiresGitHubApproval(operationId: string) { return githubDestructiveOperations.includes(operationId); }
export function evaluateGitHubPolicy(operationId: string, approved?: boolean) { if (requiresGitHubApproval(operationId) && !approved) return { allowed: false, reason: `${operationId} requires explicit approval before execution.` }; return { allowed: true, reason: "GitHub connector policy allowed execution." }; }
