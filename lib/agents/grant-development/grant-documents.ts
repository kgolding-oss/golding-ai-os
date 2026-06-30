import type { GrantDocument, GrantOpportunity } from "./grant-types";
export function missingGrantDocuments(opportunities: GrantOpportunity[]): GrantDocument[] { return opportunities.flatMap((o)=>o.requiredDocuments.filter((d)=>d.status==="missing")); }
export function grantKnowledgeProviders(opportunities: GrantOpportunity[]) { return opportunities.flatMap((o)=>o.requiredDocuments.map((d)=>({ id:`grant-doc-${d.id}`, source:"grant-development", title:d.title, metadata:{ ...d.metadata, opportunityId:o.id, documentType:d.type, provider:d.provider } }))); }
