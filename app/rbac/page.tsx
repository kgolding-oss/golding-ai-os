import { EmptyState, PageHeader, PageShell } from "../../components/PageShell";
import { getVisibleOrganizations, type Permission, type Role } from "../../lib/identity";
import { getRows } from "../../lib/supabase/data";
import { requireSession } from "../../lib/supabase/server";

export default async function RbacPage() {
  const session = requireSession();
  const organizations = await getVisibleOrganizations(session.access_token);
  const roles = await getRows<Role>("roles", session.access_token, "?select=id,name,description&order=name");
  const permissions = await getRows<Permission>("permissions", session.access_token, "?select=id,key,description&order=key");
  return <PageShell organizations={organizations}><PageHeader title="RBAC" kicker="Roles & Permissions" description="Inspect the single roles, permissions, role_permission_mappings, and user_roles model." />{roles.length === 0 ? <EmptyState title="No roles configured" message="System roles are seeded by the Milestone 4 migration." /> : <section className="grid twoColumn"><div className="panel spacious"><h2>Roles</h2><div className="list">{roles.map((role) => <div className="row" key={role.id}><strong>{role.name}</strong><span>{role.description ?? "No description"}</span></div>)}</div></div><div className="panel spacious"><h2>Permissions</h2><div className="list">{permissions.map((permission) => <div className="row" key={permission.id}><strong>{permission.key}</strong><span>{permission.description ?? "No description"}</span></div>)}</div></div></section>}</PageShell>;
}
