import Link from "next/link";
import { buildRecommendations, formatClock, formatDateTime, getTopPriorities, isIncomplete, type ExecutiveRow, asText } from "../../lib/executive-intelligence";
import { getRows } from "../../lib/supabase/data";
import { getCurrentUser, requireSession } from "../../lib/supabase/server";

type TimelineItem = { id: string; label: string; detail: string; timestamp: string; href: string };

export default async function Dashboard() {
  const session = requireSession();
  const user = await getCurrentUser(session.access_token);
  const [organizations, projects, tasks, approvals, agents, activity, health, notifications, documents] = await Promise.all([
    getRows<ExecutiveRow>("organizations", session.access_token, "?select=*&order=name"),
    getRows<ExecutiveRow>("projects", session.access_token, "?select=*&order=updated_at.desc"),
    getRows<ExecutiveRow>("tasks", session.access_token, "?select=*&order=due_at.asc"),
    getRows<ExecutiveRow>("approvals", session.access_token, "?select=*&order=created_at.desc"),
    getRows<ExecutiveRow>("agent_registry", session.access_token, "?select=*&order=name"),
    getRows<ExecutiveRow>("agent_activity", session.access_token, "?select=*&order=created_at.desc&limit=12"),
    getRows<ExecutiveRow>("system_health", session.access_token, "?select=*&order=service_name"),
    getRows<ExecutiveRow>("notifications", session.access_token, "?select=*&order=created_at.desc&limit=12"),
    getRows<ExecutiveRow>("documents", session.access_token, "?select=*&order=updated_at.desc&limit=8"),
  ]);

  const now = new Date();
  const pendingTasks = tasks.filter((task) => isIncomplete(task.status));
  const overdueTasks = pendingTasks.filter((task) => asText(task.due_at) && new Date(asText(task.due_at)).getTime() < now.getTime());
  const pendingApprovals = approvals.filter((approval) => asText(approval.status) === "pending");
  const unreadNotifications = notifications.filter((notification) => asText(notification.status, notification.read_at ? "read" : "unread") === "unread");
  const topPriorities = getTopPriorities(tasks, now);
  const recommendations = buildRecommendations({ organizations, projects, tasks, approvals, health, documents });
  const healthyCount = health.filter((service) => ["healthy", "connected"].includes(asText(service.health, asText(service.connection_status)).toLowerCase())).length;
  const focusMinutes = topPriorities.reduce((total, task) => total + task.estimatedFocusMinutes, 0);
  const topScore = topPriorities[0]?.priorityScore ?? 0;
  const timeline = buildTimeline({ tasks, approvals, projects, organizations, activity });

  return <main className="executiveLayout">
    <aside className="sideRail panel"><Link className="brandMark" href="/dashboard">Golding OS</Link><NavLink href="/organizations" label="Organizations"/><NavLink href="/tasks" label="Tasks"/><NavLink href="/approvals" label="Approvals"/><NavLink href="/agents" label="AI Agents"/><NavLink href="/system-health" label="Health"/></aside>
    <section className="mainDeck">
      <nav className="topNav panel"><div><span>Signed in as</span><strong>{user?.email ?? session.user?.email ?? "Golding operator"}</strong></div><div className="notificationBell">🔔 <strong>{unreadNotifications.length}</strong><span>unread</span></div><form action="/auth/logout" method="post"><button className="button secondary" type="submit">Log out</button></form></nav>
      <section className="executiveBrief panel">
        <div><p className="eyebrow">Golding AI Operating System · Milestone 3.2</p><h1>{getGreeting(now)}, Karim.</h1><p className="heroText">Executive brief generated from live Supabase operating data only. It highlights attention, change, priority, risk, and opportunity every login.</p><div className="briefMeta"><span>{formatDateTime(now)}</span><span>{formatClock(now)}</span></div></div>
        <div className="briefScore"><span>Priority Score</span><strong>{topScore}</strong><p>Estimated focus time: {formatMinutes(focusMinutes)}</p></div>
      </section>
      <section className="metrics executiveMetrics">
        <Metric label="Pending Tasks" value={pendingTasks.length} detail="Open execution items"/><Metric label="Overdue Tasks" value={overdueTasks.length} detail="Need recovery plan"/><Metric label="Pending Approvals" value={pendingApprovals.length} detail="Decision queue"/><Metric label="Organizations" value={organizations.length} detail="Operating portfolio"/><Metric label="Projects" value={projects.length} detail="Active initiatives"/><Metric label="Recent Activity" value={timeline.length} detail="Timeline events"/><Metric label="System Health" value={`${healthyCount}/${health.length}`} detail="Healthy or connected"/><Metric label="Notifications" value={unreadNotifications.length} detail="Unread alerts"/>
      </section>
      <section className="grid twoColumn bottomGrid"><Widget title="Top 10 Priorities" href="/tasks" rows={topPriorities.map((task) => [task.title, `${task.priorityScore}/100 · ${task.scoreReasons.join(", ")} · ${task.estimatedFocusMinutes} min`])}/><Widget title="Executive Timeline" href="/dashboard" rows={timeline.map((item) => [item.label, `${item.detail} · ${item.timestamp}`])}/></section>
      <section className="widgetGrid"><Widget title="Organizations" href="/organizations" rows={organizations.map((item) => [asText(item.name, "Organization"), `${asText(item.industry, "Executive")} · ${asText(item.status, "active")}`])}/><Widget title="Projects" href="/tasks" rows={projects.map((item) => [asText(item.name, "Project"), `${asText(item.status, "planned")} · due ${asText(item.due_date, "unscheduled")}`])}/><Widget title="Tasks" href="/tasks" rows={tasks.slice(0, 5).map((item) => [asText(item.title, "Task"), `${asText(item.priority, "medium")} · ${asText(item.status, "todo")}`])}/><Widget title="Approvals" href="/approvals" rows={approvals.slice(0, 5).map((item) => [asText(item.title, "Approval"), `${asText(item.status, "pending")} · risk ${String(item.risk_score ?? 0)}`])}/><Widget title="AI Agents" href="/agents" rows={agents.map((item) => [asText(item.name, "Agent"), `${asText(item.role, "Agent")} · ${asText(item.health, "Healthy")}`])}/><Widget title="Notifications" href="/dashboard" rows={notifications.map((item) => [asText(item.title, "Notification"), `${asText(item.priority, "medium")} · ${asText(item.status, item.read_at ? "read" : "unread")}`])}/><Widget title="Recent Documents" href="/dashboard" rows={documents.map((item) => [asText(item.title, "Document"), `${asText(item.document_type, "note")} · ${asText(item.updated_at, "not updated")}`])}/><Widget title="Recent Activity" href="/dashboard" rows={activity.map((item) => [asText(item.activity_type, "activity"), asText(item.summary, "No summary")])}/></section>
    </section>
    <aside className="insightsPanel panel"><p className="eyebrow">Top Recommendations</p>{recommendations.map((recommendation) => <div className="insight" key={recommendation}>{recommendation}</div>)}<p className="eyebrow healthEyebrow">System Health Summary</p><p className="mutedCopy">{healthyCount} of {health.length} services are healthy or connected. Deferred external integrations remain placeholders.</p></aside>
  </main>;
}

function getGreeting(date: Date) { const hour = date.getUTCHours(); if (hour < 12) return "Good morning"; if (hour < 18) return "Good afternoon"; return "Good evening"; }
function formatMinutes(minutes: number) { const hours = Math.floor(minutes / 60); const remainder = minutes % 60; return hours ? `${hours}h ${remainder}m` : `${remainder}m`; }
function NavLink({ href, label }: { href: string; label: string }) { return <Link className="sideLink" href={href}>{label}</Link>; }
function Metric({ label, value, detail }: { label: string; value: number | string; detail: string }) { return <article className="metric panel"><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>; }
function Widget({ title, href, rows }: { title: string; href: string; rows: string[][] }) { return <article className="panel widget"><div className="widgetHeader"><div><p className="eyebrow">{title}</p><h2>{title}</h2></div><Link href={href}>Open</Link></div><div className="list">{rows.length ? rows.map(([name, detail]) => <div className="row" key={`${title}-${name}-${detail}`}><div><strong>{name}</strong><span>{detail}</span></div></div>) : <p className="emptyState">No live records found.</p>}</div></article>; }
function buildTimeline(input: { tasks: ExecutiveRow[]; approvals: ExecutiveRow[]; projects: ExecutiveRow[]; organizations: ExecutiveRow[]; activity: ExecutiveRow[] }) {
  const items: TimelineItem[] = [];
  input.tasks.filter((task) => asText(task.status) === "done" || asText(task.completion_date)).forEach((task) => items.push({ id: `task-${asText(task.id, asText(task.title))}`, label: "Task completed", detail: asText(task.title, "Completed task"), timestamp: asText(task.completion_date, asText(task.updated_at)), href: "/tasks" }));
  input.approvals.forEach((approval) => items.push({ id: `approval-${asText(approval.id, asText(approval.title))}`, label: "Approval", detail: `${asText(approval.title, "Approval")} · ${asText(approval.status, "pending")}`, timestamp: asText(approval.decided_at, asText(approval.created_at)), href: "/approvals" }));
  input.projects.forEach((project) => items.push({ id: `project-${asText(project.id, asText(project.name))}`, label: "Project updated", detail: asText(project.name, "Project"), timestamp: asText(project.updated_at, asText(project.created_at)), href: "/tasks" }));
  input.organizations.forEach((organization) => items.push({ id: `organization-${asText(organization.id, asText(organization.name))}`, label: "Organization added", detail: asText(organization.name, "Organization"), timestamp: asText(organization.created_at), href: "/organizations" }));
  input.activity.forEach((event) => items.push({ id: `activity-${asText(event.id, asText(event.summary))}`, label: "Agent activity", detail: asText(event.summary, "Agent activity"), timestamp: asText(event.created_at), href: "/agents" }));
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 12);
}
