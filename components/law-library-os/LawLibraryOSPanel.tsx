import { executiveCommands, lawLibraryDivisions, operationalRecords, productionSeedStructures, summarizeLawLibraryOS } from "../../lib/law-library-os";

export function LawLibraryOSPanel() {
  const summary = summarizeLawLibraryOS();
  return (
    <section className="panel stack">
      <div>
        <p className="eyebrow">Milestone 10 · Law Library OS</p>
        <h2>Production operating layer</h2>
        <p className="muted">Six divisions report through the Chief of Staff to Executive Command. AI prepares recommendations only; high-risk actions remain approval-gated.</p>
      </div>
      <div className="metricGrid">
        <div><strong>{summary.divisionCount}</strong><span>divisions</span></div>
        <div><strong>{summary.moduleCount}</strong><span>modules</span></div>
        <div><strong>{summary.agentCount}</strong><span>agents</span></div>
        <div><strong>{summary.pendingApprovals}</strong><span>seed approvals</span></div>
      </div>
      <div className="grid twoColumn">
        {lawLibraryDivisions.map((division) => (
          <article className="subpanel" key={division.id}>
            <p className="eyebrow">Reports to {division.reportsTo}</p>
            <h3>{division.name}</h3>
            <p><strong>Modules:</strong> {division.modules.join(", ")}</p>
            <p><strong>Agents:</strong> {division.agents.join(", ")}</p>
            <p><strong>Approval gates:</strong> {division.approvalGates.length ? division.approvalGates.join(", ") : "None"}</p>
          </article>
        ))}
      </div>
      <div className="subpanel">
        <h3>Executive natural-language commands</h3>
        <ul>
          {executiveCommands.map((item) => <li key={item.command}><strong>{item.command}</strong> Delegates to {item.delegatesTo.join(" → ")}. {item.output}</li>)}
        </ul>
      </div>
      <div className="subpanel">
        <h3>Production seed structures</h3>
        <p>{productionSeedStructures.join(" · ")}</p>
        <ul>
          {operationalRecords.map((record) => <li key={record.id}><strong>{record.name}</strong> — {record.workflowState}; next: {record.nextAction}</li>)}
        </ul>
      </div>
    </section>
  );
}
