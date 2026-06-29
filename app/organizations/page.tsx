import { revalidatePath } from "next/cache";
import { EmptyState, PageHeader, PageShell } from "../../components/PageShell";
import { getVisibleOrganizations, type Organization } from "../../lib/identity";
import { formValue, supabaseRequest } from "../../lib/supabase/data";
import { requireSession } from "../../lib/supabase/server";

export default async function OrganizationsPage() {
  const session = requireSession();
  const organizations = await getVisibleOrganizations(session.access_token);

  async function createOrganization(formData: FormData) {
    "use server";
    const currentSession = requireSession();
    const name = formValue(formData, "name");
    await supabaseRequest<Organization>("organizations", {
      token: currentSession.access_token,
      method: "POST",
      body: {
        name,
        slug: (name ?? "organization").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        mission: formValue(formData, "mission"),
        description: formValue(formData, "description"),
        industry: formValue(formData, "industry"),
        status: formValue(formData, "status") ?? "active",
      },
    });
    revalidatePath("/organizations");
  }

  return (
    <PageShell organizations={organizations}>
      <PageHeader title="Organizations" kicker="Identity Engine" description="Manage the organizations the current user can access through memberships or platform administration." />
      <form action={createOrganization} className="panel crudForm">
        {[
          ["name", "Name"],
          ["mission", "Mission"],
          ["description", "Description"],
          ["industry", "Industry"],
          ["status", "Status"],
        ].map(([name, label]) => (
          <label key={name}>{label}<input name={name} required={name === "name"} /></label>
        ))}
        <button className="button primary" type="submit">Create organization</button>
      </form>
      {organizations.length === 0 ? <EmptyState title="No organizations yet" message="Create or join an organization to begin using the operating system." /> : (
        <section className="recordGrid">{organizations.map((organization) => <article className="panel recordCard" key={organization.id}><p className="recordMeta">{organization.status ?? "active"}</p><h2>{organization.name}</h2><p>{organization.industry ?? "No industry set"} · {organization.executive ?? "No executive assigned"}</p></article>)}</section>
      )}
    </PageShell>
  );
}
