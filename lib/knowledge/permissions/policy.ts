import type { KnowledgePermission, MemoryObject } from "../types";

export type PermissionContext = { organizationId?: string; requesterId?: string; requesterRoles?: string[]; action?: "read" | "write" | "index" | "admin" };

function allows(permission: KnowledgePermission, context: PermissionContext) {
  const action = context.action ?? "read";
  if (!permission.actions.includes(action) && !permission.actions.includes("admin")) return false;
  if (permission.subjectType === "public") return true;
  if (permission.subjectType === "organization") return permission.subjectId === context.organizationId;
  if (permission.subjectType === "user" || permission.subjectType === "agent") return permission.subjectId === context.requesterId;
  if (permission.subjectType === "role") return Boolean(context.requesterRoles?.includes(permission.subjectId));
  return false;
}

export function canAccessMemory(memory: MemoryObject, context: PermissionContext) {
  if (context.organizationId && memory.organizationId !== context.organizationId) return false;
  if (!memory.permissions.length) return true;
  return memory.permissions.some((permission) => allows(permission, context));
}
