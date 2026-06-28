export function DashboardHeader({ organizationCount, pendingApprovals }: { organizationCount: number; pendingApprovals: number }) {
  return (
    <section className="hero panel dashboardHero">
      <div>
        <p className="eyebrow">Golding OS · Executive dashboard</p>
        <h1>Command visibility for the operating system.</h1>
        <p className="heroText">A clean Supabase-backed dashboard for organizations, work queues, approvals, AI workforce status, and system readiness.</p>
      </div>
      <div className="statusCard"><span>Executive brief</span><strong>{organizationCount} organizations</strong><p>{pendingApprovals ? `${pendingApprovals} approval${pendingApprovals === 1 ? "" : "s"} need review.` : "No pending approvals. The decision queue is clear."}</p></div>
    </section>
  );
}
