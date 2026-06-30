import type { FinanceSnapshot } from "./finance-types";
export function finance_plannerSummary(snapshot: FinanceSnapshot){ return { generatedAt: snapshot.generatedAt, budgets: snapshot.budgets.length, donations: snapshot.donations.length, grants: snapshot.grants.length, sponsors: snapshot.sponsors.length, recommendations: snapshot.recommendations.length }; }
