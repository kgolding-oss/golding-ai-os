import { revalidatePath } from "next/cache";
import { PageShell } from "../../components/PageShell";
import { requireActiveOrganization } from "../../lib/activeOrganization";
import { formValue, getRows, supabaseRequest } from "../../lib/supabase/data";

type Row = Record<string, string | number | boolean | null>;

export default async function TasksPage() {
  const { session, activeOrganization, memberships } = await requireActiveOrganization();
  async function createRecord(formData: FormData) {
    "use server";
    const { session: serverSession, activeOrganization: serverOrganization } = await requireActiveOrganization();
    if (!serverOrganization) return;
    await supabaseRequest("tasks", { token: serverSession.access_token, method: "POST", body: { title: formValue(formData, "title"), description: formValue(formData, "description"), organization_id: serverOrganization.id, status: formValue(formData, "status") ?? "todo", priority: formValue(formData, "priority") ?? "medium" } });
    revalidatePath("/tasks");
  }

  const rows = activeOrganization
    ? await getRows<Row>("tasks", session.access_token, `?select=*&organization_id=eq.${encodeURIComponent(activeOrganization.id)}&order=created_at.desc`)
    : [];

  return (
    <PageShell title="Tasks" kicker="Task engine" activeOrganization={activeOrganization} memberships={memberships}>
      {!activeOrganization ? <EmptyState /> : null}
      <CrudForm action={createRecord} fields={["title", "description", "priority", "status"]} />
      <section className="recordGrid">
        {rows.map((row) => (
          <article className="panel recordCard" key={String(row.id)}>
            <h2>{String(row.title ?? "Untitled")}</h2>
            <p>{String(row.status ?? "No detail")}</p>
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
