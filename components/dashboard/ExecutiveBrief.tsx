import type { Activity, Agent, Approval, AuditLog, Health, Organization, Project, Task } from "../../lib/dashboard/queries";
import { getDisconnectedServices, getPendingApprovals, getUnhealthyAgents, isUrgentTask } from "../../lib/dashboard/intelligence";
import { Widget } from "./Widget";

export function ExecutiveBrief({ organization, tasks, approvals, agents, health, projects, activity, auditLogs, membershipCount }: { organization: Organization | null; tasks: Task[]; approvals: Approval[]; agents: Agent[]; health: Health[]; projects: Project[]; activity: Activity[]; auditLogs: AuditLog[]; membershipCount: number }) {
  const urgentTasks = tasks.filter((task) => isUrgentTask(task)).length;
  const pendingApprovals = getPendingApprovals(approvals).length;
  const unhealthyAgents = getUnhealthyAgents(agents).length;
  const disconnectedServices = getDisconnectedServices(health).length;
  const hasAttention = urgentTasks || pendingApprovals || unhealthyAgents || disconnectedServices;

  return (
    <Widget eyebrow="Executive brief" title={hasAttention ? "Karim has live items to review" : "No critical blockers detected"}>
      <div className="promptBox">
        {organization ? `${organization.name} is the active operating context. ${pendingApprovals} approvals, ${urgentTasks} urgent tasks, ${unhealthyAgents} agent exceptions, and ${disconnectedServices} service issues are visible right now.` : "No active organization is available for this account."}
      </div>
      <div className="briefGrid">
        <BriefStat label="Projects" value={projects.length} />
        <BriefStat label="Members" value={membershipCount} />
        <BriefStat label="Agent events" value={activity.length} />
        <BriefStat label="Audit events" value={auditLogs.length} />
      </div>
    </Widget>
  );
}

function BriefStat({ label, value }: { label: string; value: number }) {
  return <div className="briefStat"><strong>{value}</strong><span>{label}</span></div>;
}
