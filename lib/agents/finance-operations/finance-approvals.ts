import type { FinanceApprovalAction, FinanceSnapshot } from "./finance-types";
export const requiredFinanceApprovals: FinanceApprovalAction[] = ["budget_modification","financial_commitment","invoice_approval","sponsorship_change","grant_disbursement_change","report_submission"];
export function finance_approvalsSummary(snapshot: FinanceSnapshot){ return { generatedAt: snapshot.generatedAt, requiredApprovals: requiredFinanceApprovals.length, recommendations: snapshot.recommendations.length }; }
