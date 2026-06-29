export type Option = { id: string; name: string; slug?: string | null };

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function csv(value: string | null) {
  return (value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

export function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export const identityPermissions = [
  "organizations:view",
  "organizations:manage",
  "people:view",
  "people:manage",
  "roles:view",
  "roles:manage",
  "invitations:manage",
  "agents:manage",
  "audit:view",
];
