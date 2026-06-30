import { NotImplementedKnowledgeProvider } from "../../knowledge/provider";
import type { KnowledgeProviderMetadata } from "../../knowledge/types";
import type { FinanceSnapshot } from "./finance-types";
function meta(id:string,name:string,description:string):KnowledgeProviderMetadata{return {id,name,description,status:"not_implemented",indexedDocumentCount:0,lastSyncAt:null};}
export class FinanceKnowledgeProvider extends NotImplementedKnowledgeProvider{readonly metadata=meta("finance-operations","Finance & Operations Records","Metadata-only provider for budgets, financial reports, donation reports, grant reports, and sponsor records.");}
export function finance_memorySummary(snapshot: FinanceSnapshot){ return { generatedAt: snapshot.generatedAt, budgets: snapshot.budgets.length, donations: snapshot.donations.length, grants: snapshot.grants.length, sponsors: snapshot.sponsors.length, recommendations: snapshot.recommendations.length }; }
