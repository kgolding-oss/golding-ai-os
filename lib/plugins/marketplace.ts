import { pluginLoader } from "./loader";
import type { PluginCategory } from "./types";
export function marketplaceSnapshot() { const installed = pluginLoader.listInstalled(); const available = pluginLoader.listAvailable(); const byCategory = (category: PluginCategory) => available.filter((p)=>p.categories.includes(category)); return { installed, available, updates: available.filter((p)=>installed.some((i)=>i.id===p.id && i.version!==p.version)), featured: byCategory("featured"), official: byCategory("official"), community: byCategory("community"), health: pluginLoader.healthCheck() }; }
