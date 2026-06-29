"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="shell executiveShell">
      <section className="panel pageHeader">
        <p className="eyebrow">Dashboard unavailable</p>
        <h1>Command center needs a refresh.</h1>
        <p className="heroText">{error.message || "The dashboard could not load its operating records."}</p>
        <button className="button primary" onClick={() => reset()}>Try again</button>
      </section>
    </main>
  );
}
