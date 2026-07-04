import type { InstalledPlugin, PluginManifest } from "./types";

export class PluginRegistry {
  private installed = new Map<string, InstalledPlugin>();
  private available = new Map<string, PluginManifest>();
  registerAvailable(plugin: PluginManifest) { this.available.set(plugin.id, plugin); return plugin; }
  install(plugin: PluginManifest, now = new Date()) { const installed: InstalledPlugin = { ...plugin, enabled: false, installedAt: now.toISOString(), updatedAt: now.toISOString(), categories: [...new Set([...plugin.categories, "installed" as const])] }; this.installed.set(plugin.id, installed); this.available.set(plugin.id, plugin); return installed; }
  listInstalled() { return [...this.installed.values()].sort((a,b)=>a.branding.name.localeCompare(b.branding.name)); }
  listAvailable() { return [...this.available.values()].sort((a,b)=>a.branding.name.localeCompare(b.branding.name)); }
  get(id: string) { return this.installed.get(id) ?? this.available.get(id) ?? null; }
  setInstalled(plugin: InstalledPlugin) { this.installed.set(plugin.id, plugin); return plugin; }
  remove(id: string) { return this.installed.delete(id); }
}
export const pluginRegistry = new PluginRegistry();
