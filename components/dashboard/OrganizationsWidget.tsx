import type { Organization } from "../../lib/dashboard/queries";
import { Widget } from "./Widget";

export function OrganizationsWidget({ organizations }: { organizations: Organization[] }) {
  return <Widget eyebrow="Portfolio" title="Organizations"><div className="laneGrid dashboardOrgGrid">{organizations.length ? organizations.map((org) => <article className="laneCard" key={org.id} style={{ borderColor: org.secondary_color ?? undefined }}><div className="laneHeader"><h3>{org.name}</h3><span>{org.status ?? "active"}</span></div><p>{org.mission ?? org.industry ?? "Mission not recorded yet."}</p><strong>{org.executive ?? "Executive owner pending"}</strong></article>) : <p className="emptyState">No organizations are available for this session.</p>}</div></Widget>;
}
