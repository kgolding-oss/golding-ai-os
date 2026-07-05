import type { VaultDigitalArchivistReport } from "../../lib/mac-knowledge-vault";
import { Widget } from "../dashboard/Widget";

const formatBytes = (bytes: number) => `${(bytes / 1024 ** 3).toFixed(bytes >= 10 * 1024 ** 3 ? 0 : 1)} GB`;

export function MacKnowledgeVaultPanel({ report }: { report: VaultDigitalArchivistReport }) {
  const risks = [...report.cleanupRecommendations, ...report.archiveRecommendations].slice(0, 4);
  const reviewQueues = report.categories.filter((category) => category.requiresReview);
  const sensitive = report.categories.filter((category) => category.sensitive);
  return (
    <section className="panel stack">
      <div className="panelHeader">
        <div><p className="eyebrow">Mac Knowledge Vault</p><h2>Read-only GOLD inventory</h2><p className="muted">Metadata-only integration. GAIOS does not modify, move, rename, delete, upload, rewrite, or content-index local files.</p></div>
        <span className="pill">{report.source.status}</span>
      </div>
      <section className="grid threeColumn">
        <Widget eyebrow="Source status" title={report.source.name}><p>{report.source.databasePath}</p><p>{report.source.readOnly ? "Read-only enforced" : "Review safety"}</p></Widget>
        <Widget eyebrow="Inventory scale" title={`${report.source.totalFiles.toLocaleString()} files`}><p>{formatBytes(report.source.totalSizeBytes)} · mounted volume {report.source.mountedVolume}</p></Widget>
        <Widget eyebrow="Safety status" title="Execution disabled"><p>Recommendations only · human approval required · file operations unsupported.</p></Widget>
      </section>
      <section className="grid twoColumn">
        <Widget eyebrow="Top categories" title="Workspace mapping"><ul>{report.categories.slice(0, 6).map((category) => <li key={category.category}>{category.category} → {category.workspace} ({category.fileCount.toLocaleString()})</li>)}</ul></Widget>
        <Widget eyebrow="Largest storage risks" title="Advisory only"><ul>{risks.map((risk) => <li key={risk.id}>{risk.action}: {risk.affectedScope}</li>)}</ul></Widget>
      </section>
      <section className="grid twoColumn">
        <Widget eyebrow="Review queues" title={`${reviewQueues.length} queues`}><ul>{reviewQueues.map((category) => <li key={category.category}>{category.category}: {category.fileCount.toLocaleString()} files</li>)}</ul></Widget>
        <Widget eyebrow="Sensitive categories" title={`${sensitive.length} restricted areas`}><ul>{sensitive.map((category) => <li key={category.category}>{category.category} → {category.workspace}</li>)}</ul></Widget>
      </section>
      <Widget eyebrow="Recommended next actions" title="Safe metadata-first steps"><ul>{report.nextSafeActions.map((action) => <li key={action}>{action}</li>)}</ul></Widget>
    </section>
  );
}
