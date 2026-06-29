import { revalidatePath } from "next/cache";
import { formValue, getRows, supabaseRequest } from "../../lib/supabase/data";
import { requireSession } from "../../lib/supabase/server";
import { requireFormValue } from "../../lib/validation";

type OrganizationRecord = Record<string, any>;

const organizationFields = [
  "name",
  "logo_url",
  "mission",
  "description",
  "industry",
  "status",
  "primary_color",
  "secondary_color",
  "website",
  "domain",
  "executive",
  "notes",
];

async function createOrganization(formData: FormData) {
  "use server";
  const session = requireSession();
  const name = requireFormValue(formData, "name");
  const created = await supabaseRequest<OrganizationRecord[]>("organizations", {
    token: session.access_token,
    method: "POST",
    body: {
      name,
      logo_url: formValue(formData, "logo_url"),
      mission: formValue(formData, "mission"),
      description: formValue(formData, "description"),
      industry: formValue(formData, "industry"),
      status: formValue(formData, "status") ?? "active",
      primary_color: formValue(formData, "primary_color"),
      secondary_color: formValue(formData, "secondary_color"),
      website: formValue(formData, "website"),
      domain: formValue(formData, "domain"),
      executive: formValue(formData, "executive"),
      notes: formValue(formData, "notes"),
    },
  });

  const organization = created[0];
  await supabaseRequest("audit_logs", {
    token: session.access_token,
    method: "POST",
    body: {
      organization_id: organization?.id ?? null,
      actor_id: session.user?.id ?? null,
      action: "organization.created",
      entity_table: "organizations",
      entity_id: organization?.id ?? null,
      metadata: { name },
    },
  });

  revalidatePath("/organizations");
}

export default async function OrganizationsPage() {
  const session = requireSession();
  const organizations = await getRows<OrganizationRecord>("organizations", session.access_token, "?select=*&order=name");

  return (
    <main className="shell">
      <Header title="Business Registry" kicker="Organizations CRUD" />
      <CrudForm action={createOrganization} fields={organizationFields} />
      <Cards
        rows={organizations}
        titleKey="name"
        detail={(organization) => `${organization.industry ?? "No industry"} · ${organization.status ?? "active"} · ${organization.executive ?? "No executive"}`}
      />
    </main>
  );
}

function Header({ title, kicker }: { title: string; kicker: string }) {
  return (
    <section className="pageHeader panel">
      <p className="eyebrow">{kicker}</p>
      <h1>{title}</h1>
    </section>
  );
}

function CrudForm({ action, fields }: { action: (formData: FormData) => Promise<void>; fields: string[] }) {
  return (
    <form action={action} className="panel crudForm">
      {fields.map((field) => (
        <label key={field}>
          {field.replaceAll("_", " ")}
          <input name={field} required={field === "name"} />
        </label>
      ))}
      <button className="button primary" type="submit">
        Create record
      </button>
    </form>
  );
}

function Cards({ rows, titleKey, detail }: { rows: OrganizationRecord[]; titleKey: string; detail: (record: OrganizationRecord) => string }) {
  return (
    <section className="recordGrid">
      {rows.map((record) => (
        <article className="panel recordCard" key={record.id}>
          <h2>{record[titleKey]}</h2>
          <p>{detail(record)}</p>
        </article>
      ))}
    </section>
  );
}
