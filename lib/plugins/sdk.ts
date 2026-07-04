import type { PluginManifest, PluginSecurity } from "./types";

export const defaultPluginSecurity = (): PluginSecurity => ({ permissions: [], externalApis: [], storage: [], networkAccess: "none", approvalRequirements: [], auditEvents: ["plugin.installed", "plugin.enabled", "plugin.disabled", "plugin.updated", "plugin.removed"] });

export function createPluginManifest(input: Omit<PluginManifest, "security" | "health" | "dependencies" | "categories"> & Partial<Pick<PluginManifest, "security" | "health" | "dependencies" | "categories">>): PluginManifest {
  return { ...input, categories: input.categories ?? ["available", "community"], dependencies: input.dependencies ?? [], health: input.health ?? "healthy", security: input.security ?? defaultPluginSecurity() };
}

export function departmentPlugin(input: Parameters<typeof createPluginManifest>[0]) { return createPluginManifest({ ...input, type: "ai_department", capabilities: [...new Set([...input.capabilities, "department" as const])] }); }
export function workflowPack(input: Parameters<typeof createPluginManifest>[0]) { return createPluginManifest({ ...input, type: "workflow_pack", capabilities: [...new Set([...input.capabilities, "workflow" as const])] }); }
export function dashboardWidget(input: Parameters<typeof createPluginManifest>[0]) { return createPluginManifest({ ...input, type: "dashboard_widget", capabilities: [...new Set([...input.capabilities, "dashboard" as const])] }); }
export function knowledgeProvider(input: Parameters<typeof createPluginManifest>[0]) { return createPluginManifest({ ...input, type: "knowledge_provider", capabilities: [...new Set([...input.capabilities, "knowledge" as const])] }); }
export function connectorPlugin(input: Parameters<typeof createPluginManifest>[0]) { return createPluginManifest({ ...input, type: "connector", capabilities: [...new Set([...input.capabilities, "connector" as const])] }); }
