import { createHash, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { EmptyState, PageHeader, PageShell } from "../../components/PageShell";
import { getVisibleOrganizations, type Invitation, type Role } from "../../lib/identity";
import { formValue, getRows, supabaseRequest } from "../../lib/supabase/data";
import { requireSession } from "../../lib/supabase/server";

export default async function InvitationsPage() {
  const session = requireSession();
  const organizations = await getVisibleOrganizations(session.access_token);
  const roles = await getRows<Role>("roles", session.access_token, "?select=id,name&order=name");
  const invitations = await getRows<Invitation>("safe_organization_invitations", session.access_token, "?select=*,organizations(id,name)&order=created_at.desc");
  async function createInvitation(formData: FormData) { "use server"; const currentSession = requireSession(); await supabaseRequest<Invitation>("organization_invitations", { token: currentSession.access_token, method: "POST", body: { organization_id: formValue(formData, "organization_id"), email: formValue(formData, "email"), role_id: formValue(formData, "role_id"), token_hash: createHash("sha256").update(randomUUID()).digest("hex") } }); revalidatePath("/invitations"); }
  return <PageShell organizations={organizations}><PageHeader title="Invitations" kicker="Safe Invitation View" description="Create invitations without exposing raw tokens; lists read from safe_organization_invitations." /><form action={createInvitation} className="panel crudForm"><label>Organization<select name="organization_id" required>{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select></label><label>Email<input name="email" type="email" required /></label><label>Role<select name="role_id">{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label><button className="button primary">Invite user</button></form>{invitations.length === 0 ? <EmptyState title="No invitations" message="Pending invitations will appear here without token hashes or raw tokens." /> : <section className="recordGrid">{invitations.map((invitation) => <article className="panel recordCard" key={invitation.id}><p className="recordMeta">{invitation.organizations?.name ?? "Organization"}</p><h2>{invitation.email}</h2><p>{invitation.role_name ?? "No role"} · {invitation.status} · expires {new Date(invitation.expires_at).toLocaleDateString()}</p></article>)}</section>}</PageShell>;
}
