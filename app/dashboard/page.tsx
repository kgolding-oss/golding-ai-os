import { AgentStatusPanel } from "../../components/dashboard/AgentStatusPanel";
import { AttentionQueue } from "../../components/dashboard/AttentionQueue";
import { CommandBar } from "../../components/dashboard/CommandBar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { ExecutiveBrief } from "../../components/dashboard/ExecutiveBrief";
import { MetricsGrid } from "../../components/dashboard/MetricsGrid";
import { KnowledgeDashboard } from "../../components/knowledge/KnowledgeDashboard";
import { Navigation } from "../../components/dashboard/Navigation";
import { OrganizationsWidget } from "../../components/dashboard/OrganizationsWidget";
import { PriorityTasks } from "../../components/dashboard/PriorityTasks";
import { RecentActivity } from "../../components/dashboard/RecentActivity";
import { RecommendationPanel } from "../../components/dashboard/RecommendationPanel";
import { SystemHealth } from "../../components/dashboard/SystemHealth";
import { currentPath, requireActiveOrganization } from "../../lib/activeOrganization";
import { buildAttentionQueue, buildRecommendations } from "../../lib/dashboard/intelligence";
import { buildMetrics } from "../../lib/dashboard/metrics";
import { getDashboardData } from "../../lib/dashboard/queries";
import { knowledgeRegistry } from "../../lib/knowledge/registry";

export default async function DashboardPage() {
  const { session, activeOrganization, memberships } = await requireActiveOrganization();
  const data = await getDashboardData(session.access_token, activeOrganization?.id);
  const activeOrganizationRecord = data.organizations[0] ?? activeOrganization ?? null;
  const metrics = buildMetrics(data);
  const pendingApprovals = data.approvals.filter((approval) => approval.status === "pending").length;
  const attentionItems = buildAttentionQueue(data);
  const recommendations = buildRecommendations({ ...data, organization: activeOrganizationRecord, membershipCount: data.memberships.length });
  const knowledgeProviders = knowledgeRegistry.listProviders();

  return (
    <main className="shell executiveShell">
      <Navigation activeOrganization={activeOrganization} memberships={memberships} returnTo={currentPath()} />
      <DashboardHeader organizationCount={data.organizations.length} pendingApprovals={pendingApprovals} />
      <CommandBar />
      <MetricsGrid metrics={metrics} />
      <section className="grid twoColumn">
        <ExecutiveBrief organization={activeOrganizationRecord} tasks={data.tasks} approvals={data.approvals} agents={data.agents} health={data.health} projects={data.projects} activity={data.activity} auditLogs={data.auditLogs} membershipCount={data.memberships.length} />
        <AttentionQueue items={attentionItems} />
      </section>
      <section className="grid twoColumn">
        <AgentStatusPanel agents={data.agents} activity={data.activity} />
        <SystemHealth health={data.health} />
      </section>
      <KnowledgeDashboard providers={knowledgeProviders} />
      <OrganizationsWidget organizations={data.organizations} />
      <section className="grid twoColumn">
        <PriorityTasks tasks={data.tasks} />
        <RecentActivity activity={data.activity} auditLogs={data.auditLogs} />
      </section>
      <RecommendationPanel recommendations={recommendations} />
    </main>
  );
}
