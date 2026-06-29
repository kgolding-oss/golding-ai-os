import { EmptyState, PageHeader, PageShell } from "../../components/PageShell";
import { getVisibleOrganizations, type Membership } from "../../lib/identity";
import { getRows } from "../../lib/supabase/data";
import { requireSession } from "../../lib/supabase/server";

export default async function PeoplePage() {
  const session = requireSession();
  const organizations = await getVisibleOrganizations(session.access_token);
  const memberships = await getRows<Membership>("organization_memberships", session.access_token, "?select=id,status,profiles(id,email,full_name),roles(id,name),organizations(id,name)&order=created_at.desc");
  return <PageShell organizations={organizations}><PageHeader title="People" kicker="Membership Directory" description="Review organization members from the consolidated organization_memberships table." />{memberships.length === 0 ? <EmptyState title="No people found" message="Members appear here after they are added to organizations." /> : <section className="recordGrid">{memberships.map((membership) => <article className="panel recordCard" key={membership.id}><p className="recordMeta">{membership.organizations?.name ?? "Organization"}</p><h2>{membership.profiles?.full_name ?? membership.profiles?.email ?? "Unknown person"}</h2><p>{membership.roles?.name ?? "No role"} · {membership.status}</p></article>)}</section>}</PageShell>;
}
