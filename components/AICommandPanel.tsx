export function AICommandPanel() {
  return <div className="ai-panel"><label htmlFor="ai-command">AI Command Center</label><textarea id="ai-command" rows={5} placeholder="Ask for a portfolio brief, risk scan, or next best action. Live AI execution is intentionally deferred." /><button type="button">Draft command</button><p>No OpenAI or paid API calls are connected in Sprint 2 foundation.</p></div>;
}
