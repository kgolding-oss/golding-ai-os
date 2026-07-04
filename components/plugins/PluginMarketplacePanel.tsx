import type { marketplaceSnapshot } from "../../lib/plugins/marketplace";

type MarketplaceSnapshot = ReturnType<typeof marketplaceSnapshot>;

export function PluginMarketplacePanel({ marketplace }: { marketplace: MarketplaceSnapshot }) {
  const enabled = marketplace.installed.filter((plugin) => plugin.enabled).length;
  return (
    <section className="panel">
      <div className="panelHeader">
        <div><p className="eyebrow">Plugin Marketplace</p><h2>Modular AI Operating System</h2></div>
        <span className="pill">{enabled}/{marketplace.installed.length} enabled</span>
      </div>
      <div className="grid threeColumn">
        <div><h3>Installed</h3><p>{marketplace.installed.length} plugins installed across departments, workflows, dashboards, knowledge, reports, connectors, and automation.</p></div>
        <div><h3>Available</h3><p>{marketplace.available.length} marketplace plugins available for white-label deployment.</p></div>
        <div><h3>Updates</h3><p>{marketplace.updates.length} updates ready for compatibility review.</p></div>
      </div>
      <div className="grid threeColumn">
        {marketplace.installed.map((plugin) => (
          <article className="card" key={plugin.id} style={{ borderColor: plugin.branding.accentColor }}>
            <p className="eyebrow">{plugin.type.replaceAll("_", " ")} · {plugin.author}</p>
            <h3>{plugin.branding.name}</h3>
            <p>{plugin.branding.description}</p>
            <p><strong>Capabilities:</strong> {plugin.capabilities.join(", ")}</p>
            <p><strong>Scopes:</strong> workspace, organization, permission, and theme compatible</p>
            <span className="pill">{plugin.enabled ? plugin.health : "disabled"}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
