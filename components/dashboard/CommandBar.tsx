"use client";

import { useMemo, useState } from "react";
import { commandAgent, type CommandAgentOutput } from "../../lib/agents/command-agent";
import type { DashboardData } from "../../lib/dashboard/queries";

export function CommandBar({ data, initialOutput }: { data: DashboardData; initialOutput: CommandAgentOutput }) {
  const [command, setCommand] = useState("Prepare executive brief");
  const [response, setResponse] = useState(initialOutput);
  const suggestions = useMemo(() => commandAgent.availableActions, []);

  function submitCommand(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = commandAgent.run({ input: data, command });
    setResponse(result.output);
  }

  return (
    <section className="panel commandBar" aria-label="Command agent input">
      <div>
        <p className="eyebrow">Command bar</p>
        <h2>Ask the Executive Command Agent</h2>
      </div>
      <form onSubmit={submitCommand} className="commandForm">
        <label>
          <span className="srOnly">Ask the Command Agent</span>
          <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Ask the Command Agent…" />
        </label>
        <button className="button primary" type="submit">Run command</button>
      </form>
      <div className="commandSuggestions" aria-label="Supported starter commands">
        {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => setCommand(suggestion)}>{suggestion}</button>)}
      </div>
      <div className={`commandResponse ${response.status}`} aria-live="polite">
        <div>
          <p className="eyebrow">Structured response</p>
          <strong>{response.summary}</strong>
          <span>Generated {new Date(response.generatedAt).toLocaleString()}</span>
        </div>
        <div className="commandSections">
          {response.sections.map((section) => (
            <div className="commandSection" key={section.title}>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
