import { vercelClient } from "./vercel-client";
import type { VercelRuntimeInput } from "./vercel-types";
export async function listVercelDomains(i: VercelRuntimeInput) { return vercelClient.request(`/v5/domains?limit=${i.limit ?? 20}`); }
export async function inspectVercelDomain(i: VercelRuntimeInput) { if (!i.domain) return listVercelDomains(i); return vercelClient.request(`/v5/domains/${encodeURIComponent(i.domain)}`); }
export function domainHealth(domain: any) { return { configured: Boolean(domain), dnsStatus: domain?.verified === true ? "healthy" : "attention_required", sslStatus: domain?.certs?.some?.((c: any) => c.autoRenew) ? "healthy" : "unknown", issues: domain?.verified === false ? ["Domain DNS verification is incomplete."] : [] }; }
