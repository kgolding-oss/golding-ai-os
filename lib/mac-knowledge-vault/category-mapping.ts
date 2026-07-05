export const categoryWorkspaceMap: Record<string, { workspace: string; sensitive?: boolean; review?: boolean }> = {
  "Relax With Me": { workspace: "Business Portfolio / Relax With Me" },
  Immigration: { workspace: "Law Library / Legal Operations", sensitive: true },
  "The Law Library - Funding": { workspace: "Law Library / Funding OS", sensitive: true },
  "Golding Compound": { workspace: "Property OS" },
  "AI / Development": { workspace: "GAIOS / Platform Engineering" },
  "Media - Images": { workspace: "Media Department" },
  "Media - Audio": { workspace: "Media Department" },
  "Media - Video": { workspace: "Media Department" },
  Finance: { workspace: "Finance Department", sensitive: true },
  "Personal Vault": { workspace: "Personal / Restricted", sensitive: true, review: true },
  "99 Review": { workspace: "Review Queue / Needs Classification", review: true }
};
export function workspaceForCategory(category: string) { return categoryWorkspaceMap[category] ?? { workspace: "Review Queue / Needs Classification", review: true }; }
