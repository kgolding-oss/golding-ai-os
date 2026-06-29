import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { ExecutiveBrief } from "../../components/dashboard/ExecutiveBrief";
import { MetricsGrid } from "../../components/dashboard/MetricsGrid";
import { Navigation } from "../../components/dashboard/Navigation";
import { OrganizationsWidget } from "../../components/dashboard/OrganizationsWidget";
import { PriorityTasks } from "../../components/dashboard/PriorityTasks";
import { RecentActivity } from "../../components/dashboard/RecentActivity";
import { SystemHealth } from "../../components/dashboard/SystemHealth";
import { buildMetrics } from "../../lib/dashboard/metrics";
import { getDashboardData } from "../../lib/dashboard/queries";
import { requireActiveOrganization } from "../../lib/activeOrganization";

export default async function DashboardPage() {
  const { session, activeOrganization, memberships } = await requireActiveOrganization();
  const data = await getDashboardData(session.access_token, activeOrganization?.id);
  const metrics = buildMetrics(data);
  const pendingApprovals = data.approvals.filter((approval) => approval.status === "pending").length;

  return (
    <main className="shell executiveShell">
      <Navigation activeOrganization={activeOrganization} memberships={memberships} />
      <DashboardHeader organizationCount={data.organizations.length} pendingApprovals={pendingApprovals} />
      <MetricsGrid metrics={metrics} />
      <section className="grid twoColumn">
        <ExecutiveBrief approvals={data.approvals} agents={data.agents} />
        <SystemHealth health={data.health} />
      </section>
      <OrganizationsWidget organizations={data.organizations} />
      <section className="grid twoColumn">
        <PriorityTasks tasks={data.tasks} />
        <RecentActivity activity={data.activity} />
      </section>
    </main>
  );
}
