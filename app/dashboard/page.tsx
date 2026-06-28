import Link from "next/link";
import { getRows } from "../../lib/supabase/data";
import { getCurrentUser, requireSession } from "../../lib/supabase/server";

type Row = Record<string, any>;

export default async function Dashboard() {
  const session = requireSession();
  const user = await getCurrentUser(session.access_token);
  const [organizations, projects, tasks, approvals, agents, activity, health] = await Promise.all([
    getRows<Row>("organizations", session.access_token, "?select=*&order=name"),
    getRows<Row>("projects", session.access_token, "?select=*&order=created_at.desc"),
    getRows<Row>("tasks", session.access_token, "?select=*&order=due_at.asc"),
    getRows<Row>("approvals", session.access_token, "?select=*&order=created_at.desc"),
    getRows<Row>("agent_registry", session.access_token, "?select=*&order=name"),
    getRows<Row>("agent_activity", session.access_token, "?select=*&order=created_at.desc&limit=6"),
    getRows<Row>("system_health", session.access_token, "?select=*&order=service_name"),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = tasks.filter((task) => String(task.due_at ?? "").startsWith(today));
  const pending = approvals.filter((approval) => approval.status === "pending");
  const priorities = tasks.filter((task) => ["high", "urgent"].includes(task.priority)).slice(0, 5);
  const healthy = health.filter((service) => service.health === "Healthy" || service.connection_status === "Connected").length;

  return <main className="shell executiveShell">
    <nav className="topNav panel"><div><span>Signed in as</span><strong>{user?.email ?? session.user?.email ?? "Golding operator"}</strong></div><div className="navLinks"><Link href="/organizations">Organizations</Link><Link href="/agents">AI Agents</Link><Link href="/tasks">Tasks</Link><Link href="/approvals">Approvals</Link><Link href="/system-health">Health</Link></div><form action="/auth/logout" method="post"><button className="button secondary" type="submit">Log out</button></form></nav>
    <section className="hero panel"><div><p className="eyebrow">Golding AI Operating System · Milestone 3.1</p><h1>Executive operating system shell.</h1><p className="heroText">Live Supabase-backed command surface for organizations, projects, tasks, approvals, AI workforce records, activity, and system readiness.</p></div><div className="statusCard"><span>Executive Brief</span><strong>{pending.length} pending decisions</strong><p>{dueToday.length} tasks due today · {agents.length} registered agents · {healthy}/{health.length} services healthy or connected.</p></div></section>
    <section className="metrics"><article className="metric panel"><span>Organizations</span><strong>{organizations.length}</strong><p>Portfolio companies</p></article><article className="metric panel"><span>Projects</span><strong>{projects.length}</strong><p>Active operating work</p></article><article className="metric panel"><span>Tasks Due Today</span><strong>{dueToday.length}</strong><p>Execution focus</p></article><article className="metric panel"><span>Pending Approvals</span><strong>{pending.length}</strong><p>CEO review queue</p></article></section>
    <section className="grid threeColumn"><Widget title="AI Agents" rows={agents.map((a) => [a.name, `${a.role} · ${a.status} · ${a.health}`])} /><Widget title="Recent Activity" rows={activity.map((a) => [a.activity_type, a.summary])} /><Widget title="System Health" rows={health.slice(0, 8).map((h) => [h.service_name, `${h.connection_status} · ${h.health}`])} /></section>
    <section className="grid twoColumn bottomGrid"><Widget title="Today's Priorities" rows={priorities.map((t) => [t.title, `${t.priority} · ${t.status}`])} /><Widget title="Organizations" rows={organizations.map((o) => [o.name, `${o.industry ?? "Executive"} · ${o.status}`])} /></section>
  </main>;
}

function Widget({ title, rows }: { title: string; rows: string[][] }) {
  return <article className="panel widget"><p className="eyebrow">{title}</p><h2>{title}</h2><div className="list">{rows.length ? rows.map(([name, detail]) => <div className="row" key={`${title}-${name}`}><div><strong>{name}</strong><span>{detail}</span></div></div>) : <p className="emptyState">No live records found.</p>}</div></article>;
}
