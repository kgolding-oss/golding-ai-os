import { revalidatePath } from "next/cache";
import { getRows, supabaseRequest } from "../../lib/supabase/data";
import { requireSession } from "../../lib/supabase/server";
import { optionalFormValue, requireEmail, requireFormValue } from "../../lib/validation";

type Invitation = { id: string; organization_id: string; email: string; role_id?: string | null; status?: string | null; expires_at?: string | null; organizations?: { name?: string | null } | null };

const invitationListSelect = "?select=id,organization_id,email,role_id,status,expires_at,organizations(name)&order=created_at.desc";

async function createInvitation(formData: FormData) {
  "use server";
  const session = requireSession();
  const organizationId = requireFormValue(formData, "organization_id");
  const email = requireEmail(formData);
  const roleId = requireFormValue(formData, "role_id");

  await supabaseRequest("organization_invitations", { token: session.access_token, method: "POST", body: { organization_id: organizationId, email, role_id: roleId, status: "pending", expires_at: optionalFormValue(formData, "expires_at") } });
  await supabaseRequest("audit_logs", { token: session.access_token, method: "POST", body: { organization_id: organizationId, actor_id: session.user?.id ?? null, action: "invitation.created", entity_table: "organization_invitations", metadata: { email, role_id: roleId } } });
  revalidatePath("/invitations");
}

function InvitationForm() {
  return (
    <form action={createInvitation} className="panel crudForm">
      <label>Organization ID<input name="organization_id" required /></label>
      <label>Email<input name="email" type="email" required /></label>
      <label>Role ID<input name="role_id" required /></label>
      <label>Expires at<input name="expires_at" type="datetime-local" /></label>
      <button className="button primary" type="submit">Create invitation</button>
    </form>
  );
}

function InvitationCard({ invitation }: { invitation: Invitation }) {
  return (
    <article className="panel recordCard">
      <h2>{invitation.email}</h2>
      <p>{invitation.organizations?.name ?? invitation.organization_id}</p>
      <p>{invitation.role_id ?? "No role"} · {invitation.status ?? "pending"}</p>
      <small>Invitation token hidden for security.</small>
    </article>
  );
}

export default async function InvitationsPage() {
  const session = requireSession();
  const invitations = await getRows<Invitation>("organization_invitations", session.access_token, invitationListSelect);

  return (
    <main className="shell">
      <section className="pageHeader panel"><p className="eyebrow">Identity & Organization Engine</p><h1>Invitations</h1></section>
      <InvitationForm />
      <section className="recordGrid">{invitations.map((invitation) => <InvitationCard key={invitation.id} invitation={invitation} />)}</section>
    </main>
  );
}
