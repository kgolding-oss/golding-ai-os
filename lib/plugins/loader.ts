import { corePluginCatalog } from "./catalog";
import { pluginRegistry } from "./registry";
import type { InstalledPlugin, PluginHealthCheck, PluginManifest, PluginOperationResult } from "./types";

export class PluginLoader {
  constructor(private registry = pluginRegistry, private coreVersion = "17.0.0") { corePluginCatalog.forEach((p)=>this.registry.registerAvailable(p)); }
  install(id: string) { const plugin = this.registry.get(id); if (!plugin) return this.fail(id, "Plugin is not available."); const compatibility = this.checkVersionCompatibility(plugin); if (!compatibility.ok) return compatibility; this.registry.install(plugin as PluginManifest); return this.ok(id, "Plugin installed."); }
  enable(id: string) { const plugin = this.installed(id); if (!plugin) return this.fail(id, "Plugin is not installed."); for (const dep of plugin.dependencies) if (!this.installed(dep)?.enabled) return this.fail(id, `Dependency ${dep} must be installed and enabled.`); this.registry.setInstalled({ ...plugin, enabled: true, health: "healthy", updatedAt: new Date().toISOString() }); return this.ok(id, "Plugin enabled."); }
  disable(id: string) { const plugin = this.installed(id); if (!plugin) return this.fail(id, "Plugin is not installed."); this.registry.setInstalled({ ...plugin, enabled: false, health: "disabled", updatedAt: new Date().toISOString() }); return this.ok(id, "Plugin disabled."); }
  update(id: string, next?: PluginManifest) { const current = this.installed(id); if (!current) return this.fail(id, "Plugin is not installed."); const manifest = next ?? (this.registry.get(id) as PluginManifest); this.registry.setInstalled({ ...current, ...manifest, enabled: current.enabled, updatedAt: new Date().toISOString() }); return this.ok(id, "Plugin updated."); }
  remove(id: string) { return this.registry.remove(id) ? this.ok(id, "Plugin removed.") : this.fail(id, "Plugin is not installed."); }
  listInstalled() { return this.registry.listInstalled(); }
  listAvailable() { return this.registry.listAvailable(); }
  healthCheck(id?: string): PluginHealthCheck[] { const plugins = id ? this.registry.listInstalled().filter((p)=>p.id===id) : this.registry.listInstalled(); const checkedAt = new Date().toISOString(); return plugins.map((p)=>({ pluginId:p.id, status:p.enabled?p.health:"disabled", messages:[p.enabled?"Plugin is enabled and compatible.":"Plugin is installed but disabled."], checkedAt })); }
  checkVersionCompatibility(plugin: PluginManifest): PluginOperationResult { return plugin.compatibility.coreVersion.startsWith(this.coreVersion.split(".")[0]) ? this.ok(plugin.id, "Plugin is compatible with this core version.") : this.fail(plugin.id, `Plugin requires core ${plugin.compatibility.coreVersion}.`); }
  private installed(id:string): InstalledPlugin | undefined { return this.registry.listInstalled().find((p)=>p.id===id); }
  private ok(pluginId:string, message:string) { return { ok:true, pluginId, message }; }
  private fail(pluginId:string, message:string) { return { ok:false, pluginId, message }; }
}
export const pluginLoader = new PluginLoader();
corePluginCatalog.forEach((plugin)=>{ pluginLoader.install(plugin.id); if (plugin.id !== "funding-os") pluginLoader.enable(plugin.id); });
pluginLoader.enable("funding-os");
