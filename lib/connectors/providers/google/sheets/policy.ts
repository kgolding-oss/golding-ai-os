const approvalOps = new Set([]);
export function evaluateSheetsPolicy(operationId: string, approved = false) { const needsApproval = approvalOps.has(operationId); return { allowed: !needsApproval || approved, needsApproval, reason: needsApproval && !approved ? 'Approval required before sensitive Google Workspace mutation.' : 'Allowed by Google Workspace policy.' }; }
