import { ActivityFeed } from "@/components/ActivityFeed";
import { AICommandPanel } from "@/components/AICommandPanel";
import { ApprovalCard } from "@/components/ApprovalCard";
import { BusinessCard } from "@/components/BusinessCard";
import { ExecutiveCard } from "@/components/ExecutiveCard";
import { MetricCard } from "@/components/MetricCard";
import { NavigationSidebar } from "@/components/NavigationSidebar";
import { TaskTable } from "@/components/TaskTable";
import { TopNavigation } from "@/components/TopNavigation";
import { getDashboardData } from "@/lib/data/dashboard";
import { requireSession } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const session = await requireSession();
  const data = await getDashboardData(session.accessToken);
  return <main className="app-frame"><NavigationSidebar /><div className="workspace"><TopNavigation email={session.user.email} /><section className="metrics"><MetricCard label="Businesses" value={data.businesses.length} detail="Authenticated operating lanes" /><MetricCard label="Today's tasks" value={data.tasks.length} detail="Open tasks from Supabase" /><MetricCard label="Pending approvals" value={data.approvals.length} detail="Executive decisions required" /><MetricCard label="Recent activity" value={data.auditLogs.length} detail="Audit events visible" /></section><section className="dashboard-grid"><ExecutiveCard eyebrow="Executive Brief" title="Authenticated operating brief"><p className="brief-text">Golding OS is connected to Supabase using public anon credentials and row-level security. Dashboard sections render data owned by the signed-in user or their organizations.</p></ExecutiveCard><ExecutiveCard eyebrow="AI Command Center" title="Command console"><AICommandPanel /></ExecutiveCard></section><section className="dashboard-grid"><ExecutiveCard eyebrow="Today's Tasks" title="Execution queue"><TaskTable tasks={data.tasks} /></ExecutiveCard><ExecutiveCard eyebrow="Pending Approvals" title="Decision queue"><div className="stack">{data.approvals.length ? data.approvals.map((approval) => <ApprovalCard approval={approval} key={approval.id} />) : <p className="empty-state">No pending approvals.</p>}</div></ExecutiveCard></section><section className="dashboard-grid"><ExecutiveCard eyebrow="Business Overview" title="Portfolio lanes"><div className="business-grid">{data.businesses.length ? data.businesses.map((business) => <BusinessCard business={business} key={business.id} />) : <p className="empty-state">No businesses have been created for this account.</p>}</div></ExecutiveCard><ExecutiveCard eyebrow="Recent Activity" title="Audit log"><ActivityFeed items={data.auditLogs} /></ExecutiveCard></section></div></main>;
}
