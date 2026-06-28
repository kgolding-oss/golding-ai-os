import { getCurrentUser, requireSession } from "../../lib/supabase/server";

type Lane = {
  name: string;
  summary: string;
  status: "Online" | "Draft" | "Review";
  metric: string;
};

type Approval = {
  item: string;
  lane: string;
  priority: "High" | "Medium" | "Low";
};

type Task = {
  title: string;
  owner: string;
  due: string;
};

const lanes: Lane[] = [
  {
    name: "The Law Library",
    summary: "Legal education content, lead magnets, and research workflows staged for review.",
    status: "Review",
    metric: "12 assets mapped",
  },
  {
    name: "YouPassGo",
    summary: "Driving school operations hub for lesson funnels, reminders, and local growth plans.",
    status: "Online",
    metric: "4 automations mocked",
  },
  {
    name: "Golding Compound",
    summary: "Executive real estate and compound planning lane with capital projects visible at a glance.",
    status: "Draft",
    metric: "6 milestones queued",
  },
  {
    name: "Relax With Me",
    summary: "Wellness brand dashboard for content calendar, offers, and customer experience ideas.",
    status: "Online",
    metric: "9 content prompts",
  },
];

const approvals: Approval[] = [
  { item: "Approve Sprint 2 data model proposal", lane: "Golding AI OS", priority: "High" },
  { item: "Review Law Library landing page copy", lane: "The Law Library", priority: "Medium" },
  { item: "Confirm YouPassGo reminder language", lane: "YouPassGo", priority: "High" },
];

const tasks: Task[] = [
  { title: "Define Supabase tables for future sprint", owner: "Product", due: "Next sprint" },
  { title: "Draft CEO daily briefing format", owner: "Operations", due: "This week" },
  { title: "Inventory reusable brand assets", owner: "Creative", due: "This week" },
  { title: "Prepare Vercel production deployment", owner: "Engineering", due: "Today" },
];

const auditLog = [
  "Milestone 2 auth foundation rebuilt cleanly on main.",
  "Supabase publishable key authentication helpers added.",
  "Approval queue seeded for executive review workflow.",
  "Business lanes initialized for portfolio visibility.",
];

export default async function Dashboard() {
  const session = requireSession();
  const user = await getCurrentUser(session.access_token);

  return (
    <main className="shell">
      <nav className="topNav panel">
        <div>
          <span>Signed in as</span>
          <strong>{user?.email ?? session.user?.email ?? "Golding operator"}</strong>
        </div>
        <form action="/auth/logout" method="post">
          <button className="button secondary" type="submit">Log out</button>
        </form>
      </nav>
      <section className="hero panel">
        <div>
          <p className="eyebrow">Golding AI Operating System · Milestone 2</p>
          <h1>Executive command center for the Golding portfolio.</h1>
          <p className="heroText">
            A protected Next.js dashboard foundation for decisions, approvals, task visibility, and authenticated operating context.
          </p>
          <div className="heroActions" aria-label="Primary dashboard actions">
            <a className="button primary" href="#command-panel">Open command panel</a>
            <a className="button secondary" href="#approval-queue">Review approvals</a>
          </div>
        </div>
        <div className="statusCard" aria-label="Sprint status">
          <span>Deployment status</span>
          <strong>Protected Supabase shell</strong>
          <p>Supabase auth · RLS-backed data model · clean main baseline</p>
        </div>
      </section>

      <section className="metrics" aria-label="Executive dashboard metrics">
        <article className="metric panel"><span>Business lanes</span><strong>4</strong><p>Portfolio operating areas</p></article>
        <article className="metric panel"><span>Open approvals</span><strong>3</strong><p>Awaiting CEO decision</p></article>
        <article className="metric panel"><span>Active tasks</span><strong>4</strong><p>Static Sprint 1 queue</p></article>
        <article className="metric panel"><span>Integrations</span><strong>0</strong><p>Safely deferred</p></article>
      </section>

      <section id="command-panel" className="grid twoColumn">
        <article className="panel commandPanel">
          <p className="eyebrow">CEO AI command panel mock</p>
          <h2>Ask the operating system</h2>
          <div className="promptBox">Summarize today&apos;s approvals, risks, and next best actions across every Golding lane.</div>
          <div className="mockResponse">
            <strong>Mock response</strong>
            <p>Three approvals need review. YouPassGo has the highest near-term operational impact. Sprint 2 now includes a protected dashboard, authentication actions, and a database/RLS foundation for future operating workflows.</p>
          </div>
        </article>

        <article id="approval-queue" className="panel">
          <p className="eyebrow">Approval queue</p>
          <h2>Decisions waiting</h2>
          <div className="list">
            {approvals.map((approval) => (
              <div className="row" key={approval.item}>
                <div><strong>{approval.item}</strong><span>{approval.lane}</span></div>
                <em className={`pill ${approval.priority.toLowerCase()}`}>{approval.priority}</em>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <p className="eyebrow">Business lanes</p>
        <h2>Portfolio command lanes</h2>
        <div className="laneGrid">
          {lanes.map((lane) => (
            <article className="laneCard" key={lane.name}>
              <div className="laneHeader"><h3>{lane.name}</h3><span>{lane.status}</span></div>
              <p>{lane.summary}</p>
              <strong>{lane.metric}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="grid twoColumn bottomGrid">
        <article className="panel">
          <p className="eyebrow">Task list</p>
          <h2>Execution queue</h2>
          <div className="list">
            {tasks.map((task) => (
              <div className="row" key={task.title}>
                <div><strong>{task.title}</strong><span>{task.owner}</span></div>
                <em>{task.due}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Audit log</p>
          <h2>System activity</h2>
          <ol className="auditList">
            {auditLog.map((entry) => <li key={entry}>{entry}</li>)}
          </ol>
        </article>
      </section>
    </main>
  );
}
