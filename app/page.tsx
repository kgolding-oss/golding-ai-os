import Link from "next/link";

export default function Home() {
  return (
    <main className="shell">
      <section className="hero panel">
        <div>
          <p className="eyebrow">Golding AI Operating System · Milestone 2</p>
          <h1>Executive command center with Supabase authentication.</h1>
          <p className="heroText">
            The public landing page now routes operators into a secure login flow before the dashboard can be opened.
          </p>
          <div className="heroActions" aria-label="Primary actions">
            <Link className="button primary" href="/login">Sign in</Link>
            <Link className="button secondary" href="/dashboard">Open protected dashboard</Link>
          </div>
        </div>
        <div className="statusCard" aria-label="Milestone status">
          <span>Foundation status</span>
          <strong>Auth-ready</strong>
          <p>Supabase REST auth · protected route · RLS migration</p>
        </div>
      </section>
    </main>
  );
}
