export const roles = [
  "Super Admin",
  "Organization Admin",
  "Executive Director",
  "Manager",
  "Staff",
  "Volunteer",
  "Contractor",
  "Viewer",
] as const;

export type Role = (typeof roles)[number];

export const protectedRoutes = ["/dashboard", "/organizations", "/agents", "/tasks", "/approvals", "/system-health"];

export const permissionMap: Record<Role, string[]> = {
  "Super Admin": ["*"] ,
  "Organization Admin": ["organizations:manage", "agents:manage", "tasks:manage", "approvals:manage", "health:view"],
  "Executive Director": ["organizations:view", "agents:view", "tasks:manage", "approvals:manage", "health:view"],
  Manager: ["organizations:view", "agents:view", "tasks:manage", "approvals:view", "health:view"],
  Staff: ["organizations:view", "tasks:manage", "approvals:view"],
  Volunteer: ["organizations:view", "tasks:view"],
  Contractor: ["organizations:view", "tasks:view"],
  Viewer: ["organizations:view", "tasks:view", "approvals:view", "health:view"],
};

export function can(role: Role, permission: string) {
  const permissions = permissionMap[role] ?? [];
  return permissions.includes("*") || permissions.includes(permission);
}
