import { revalidatePath } from "next/cache";
import { getRows, supabaseRequest } from "../../lib/supabase/data";
import { requireSession } from "../../lib/supabase/server";
import { optionalFormValue, requireFormValue } from "../../lib/validation";

type Membership = { id: string; organization_id: string; profile_id?: string | null; user_id?: string | null; role_id?: string | null; role?: string | null; status?: string | null; profiles?: { email?: string | null; full_name?: string | null } | null; organizations?: { name?: string | null } | null };

const membershipSelect = "?select=id,organization_id,profile_id,user_id,role_id,role,status,profiles(email,full_name),organizations(name)&order=created_at.desc";

async function assignRole(formData: FormData) {
  "use server";
  const session = requireSession();
  const profileId = requireFormValue(formData, "profile_id");
  const organizationId = requireFormValue(formData, "organization_id");
  const roleId = requireFormValue(formData, "role_id");

  await supabaseRequest("organization_users", { token: session.access_token, method: "POST", body: { profile_id: profileId, user_id: profileId, organization_id: organizationId, role_id: roleId, role: optionalFormValue(formData, "role") ?? "Viewer", status: optionalFormValue(formData, "status") ?? "active" } });
  await supabaseRequest("audit_logs", { token: session.access_token, method: "POST", body: { organization_id: organizationId, actor_id: session.user?.id ?? null, action: "membership.created", entity_table: "organization_users", metadata: { profile_id: profileId, role_id: roleId } } });
  await supabaseRequest("audit_logs", { token: session.access_token, method: "POST", body: { organization_id: organizationId, actor_id: session.user?.id ?? null, action: "role.assigned", entity_table: "organization_users", metadata: { profile_id: profileId, role_id: roleId } } });
  revalidatePath("/people");
}

function PersonCard({ membership }: { membership: Membership }) {
  const profile = membership.profiles;
  const displayName = profile?.full_name ?? profile?.email ?? membership.profile_id ?? membership.user_id ?? "Unknown person";

  return (
    <article className="panel recordCard">
      <h2>{displayName}</h2>
      <p>{membership.organizations?.name ?? membership.organization_id}</p>
      <p>{membership.role ?? membership.role_id ?? "No role"} · {membership.status ?? "active"}</p>
    </article>
  );
}

function RoleAssignmentForm() {
  return (
    <form action={assignRole} className="panel crudForm">
      <label>Organization ID<input name="organization_id" required /></label>
      <label>Profile ID<input name="profile_id" required /></label>
      <label>Role ID<input name="role_id" required /></label>
      <label>Role label<input name="role" /></label>
      <button className="button primary" type="submit">Assign role</button>
    </form>
  );
}

export default async function PeoplePage() {
  const session = requireSession();
  const memberships = await getRows<Membership>("organization_users", session.access_token, membershipSelect);

  return (
    <main className="shell">
      <section className="pageHeader panel"><p className="eyebrow">Identity & Organization Engine</p><h1>People</h1></section>
      <RoleAssignmentForm />
      <section className="recordGrid">{memberships.map((membership) => <PersonCard key={membership.id} membership={membership} />)}</section>
    </main>
  );
}
