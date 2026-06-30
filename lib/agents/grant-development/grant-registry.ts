import type { GrantOpportunityType } from "./grant-types";
export const grantOpportunityRegistry: { type: GrantOpportunityType; label: string; requiresPublicSource: boolean }[] = ["federal","state","local","foundation","corporate","community","international","private","sponsorship"].map((type) => ({ type: type as GrantOpportunityType, label: type.replace("_"," "), requiresPublicSource: type !== "private" }));
export function isRegisteredOpportunityType(type: string): type is GrantOpportunityType { return grantOpportunityRegistry.some((entry) => entry.type === type); }
