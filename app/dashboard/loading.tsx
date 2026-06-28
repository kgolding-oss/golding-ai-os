export default function DashboardLoading() {
  return (
    <main className="shell executiveShell">
      <section className="hero panel dashboardHero">
        <div>
          <p className="eyebrow">Golding OS · Executive dashboard</p>
          <h1>Loading command visibility.</h1>
          <p className="heroText">Preparing organizations, tasks, approvals, activity, and system health.</p>
        </div>
        <div className="statusCard"><span>Status</span><strong>Loading</strong><p>Fetching Supabase operating records.</p></div>
      </section>
    </main>
  );
}
