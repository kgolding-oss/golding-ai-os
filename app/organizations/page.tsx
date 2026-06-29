import { revalidatePath } from "next/cache";
import { PageShell } from "../../components/PageShell";
import { requireActiveOrganization } from "../../lib/activeOrganization";
import { formValue, getRows, supabaseRequest } from "../../lib/supabase/data";

type Row = Record<string, string | number | boolean | null>;

export default async function OrganizationsPage() {
  const { session, activeOrganization, memberships } = await requireActiveOrganization();
  async function createRecord(formData: FormData) {
    "use server";
    const { session: serverSession, activeOrganization: serverOrganization } = await requireActiveOrganization();
    if (!serverOrganization) return;
    await supabaseRequest("organizations", { token: serverSession.access_token, method: "POST", body: { name: formValue(formData, "name"), slug: formValue(formData, "slug"), status: formValue(formData, "status") ?? "active", industry: formValue(formData, "industry") } });
    revalidatePath("/organizations");
  }

  const rows = activeOrganization
    ? await getRows<Row>("organizations", session.access_token, `?select=*&id=eq.${encodeURIComponent(activeOrganization.id)}&order=created_at.desc`)
    : [];

  return (
    <PageShell title="Business Registry" kicker="Organizations" activeOrganization={activeOrganization} memberships={memberships}>
      {!activeOrganization ? <EmptyState /> : null}
      <CrudForm action={createRecord} fields={["name", "slug", "industry", "status"]} />
      <section className="recordGrid">
        {rows.map((row) => (
          <article className="panel recordCard" key={String(row.id)}>
            <h2>{String(row.name ?? "Untitled")}</h2>
            <p>{String(row.industry ?? "No detail")}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}

function EmptyState() {
  return <section className="panel"><p>No active organization is available for this account.</p></section>;
}

function CrudForm({ action, fields }: { action: (formData: FormData) => Promise<void>; fields: string[] }) {
  return (
    <form action={action} className="panel crudForm">
      {fields.map((field) => (
        <label key={field}>
          {field.replaceAll("_", " ")}
          <input name={field} />
        </label>
      ))}
      <button className="button primary" type="submit">Create record</button>
    </form>
  );
}
