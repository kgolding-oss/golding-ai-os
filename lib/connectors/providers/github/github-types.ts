export type GitHubAuthMode = "app" | "pat" | "oauth" | "none";
export type GitHubRuntimeInput = { organization?: string; owner?: string; repo?: string; pull_number?: number; issue_number?: number; query?: string; title?: string; body?: string; base?: string; head?: string; state?: string; per_page?: number; page?: number; [key: string]: unknown };
export type GitHubRateLimit = { limit: number; remaining: number; reset: string; used: number; resource: string };
export type GitHubTelemetryMetric = { operationId: string; status: "success" | "failure" | "denied"; durationMs: number; correlationId: string; at: string; details?: Record<string, unknown> };
export type GitHubExecutiveSignal = { id: string; severity: "low" | "medium" | "high" | "critical"; title: string; recommendation: string; evidence: string[] };
export type GitHubSnapshot = { repositories: unknown[]; pullRequests: unknown[]; workflowRuns: unknown[]; deployments: unknown[]; rateLimit?: GitHubRateLimit; capturedAt: string };
export type GitHubOAuthProvider = { getAuthorizationUrl(state: string): string; exchangeCode(code: string): Promise<{ accessToken: string; expiresAt?: string; refreshToken?: string }>; refresh?(refreshToken: string): Promise<{ accessToken: string; expiresAt?: string }> };
