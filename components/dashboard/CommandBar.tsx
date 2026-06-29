export function CommandBar() {
  return (
    <section className="panel commandBar" aria-label="Command agent input">
      <div>
        <p className="eyebrow">Command bar</p>
        <h2>Prepare an instruction for the operating system</h2>
      </div>
      <label>
        <span className="srOnly">Ask the Command Agent</span>
        <input placeholder="Ask the Command Agent…" disabled />
      </label>
      <button className="button primary" type="button" disabled>Coming soon</button>
    </section>
  );
}
