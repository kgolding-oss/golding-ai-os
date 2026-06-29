import { revalidatePath } from "next/cache";
import { EmptyState } from "../../components/identity/EmptyState";
import { formValue, getRows, supabaseRequest } from "../../lib/supabase/data";
import { slugify } from "../../lib/identity";
import { requireSession } from "../../lib/supabase/server";

export default async function OrganizationsPage() {
  const session = requireSession();
  async function createOrganization(formData: FormData) { "use server"; const s = requireSession(); const name = formValue(formData, "name") ?? "Untitled Organization"; await supabaseRequest("organizations", { token: s.access_token, method: "POST", body: { name, slug: formValue(formData, "slug") ?? slugify(name), mission: formValue(formData, "mission"), industry: formValue(formData, "industry"), status: formValue(formData, "status") ?? "active", website: formValue(formData, "website"), domain: formValue(formData, "domain"), executive: formValue(formData, "executive") } }); await supabaseRequest("audit_logs", { token: s.access_token, method: "POST", body: { action: "organization.created", entity_table: "organizations", metadata: { name } } }); revalidatePath("/organizations"); }
  const organizations = await getRows<Record<string, any>>("organizations", session.access_token, "?select=*&order=name");
  return <main className="shell"><section className="pageHeader panel"><p className="eyebrow">Organization Management</p><h1>Organizations</h1><p>Create and maintain operating companies, domains, executives, and lifecycle status.</p></section><form action={createOrganization} className="panel crudForm">{["name","slug","mission","industry","status","website","domain","executive"].map((f)=><label key={f}>{f.replaceAll("_"," ")}<input name={f}/></label>)}<button className="button primary" type="submit">Create organization</button></form>{organizations.length ? <section className="recordGrid">{organizations.map((o)=><article className="panel recordCard" key={o.id}><h2>{o.name}</h2><p>{o.industry ?? "No industry"} · {o.status ?? "active"} · {o.executive ?? "No executive"}</p><small>{o.domain ?? o.slug}</small></article>)}</section> : <EmptyState title="No organizations yet" message="Create the first organization to unlock memberships, agents, and RBAC." />}</main>;
}
