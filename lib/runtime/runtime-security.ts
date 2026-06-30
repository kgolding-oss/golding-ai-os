import type { RuntimeSecurityClassification } from "./runtime-types";
export function canAccessClassification(max: RuntimeSecurityClassification, requested: RuntimeSecurityClassification) { const rank = { public: 0, internal: 1, confidential: 2, restricted: 3 } as const; return rank[requested] <= rank[max]; }
