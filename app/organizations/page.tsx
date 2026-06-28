import { revalidatePath } from "next/cache";
import { formValue, getRows, supabaseRequest } from "../../lib/supabase/data";
import { requireSession } from "../../lib/supabase/server";

export default async function OrganizationsPage() {
  const session = requireSession();
  async function createOrganization(formData: FormData) { "use server"; const s = requireSession(); await supabaseRequest("organizations", { token: s.access_token, method: "POST", body: { name: formValue(formData, "name"), logo_url: formValue(formData, "logo_url"), mission: formValue(formData, "mission"), description: formValue(formData, "description"), industry: formValue(formData, "industry"), status: formValue(formData, "status") ?? "active", primary_color: formValue(formData, "primary_color"), secondary_color: formValue(formData, "secondary_color"), website: formValue(formData, "website"), domain: formValue(formData, "domain"), executive: formValue(formData, "executive"), notes: formValue(formData, "notes") } }); revalidatePath("/organizations"); }
  const organizations = await getRows<Record<string, any>>("organizations", session.access_token, "?select=*&order=name");
  return <main className="shell"><Header title="Business Registry" kicker="Organizations CRUD" /><CrudForm action={createOrganization} fields={["name","logo_url","mission","description","industry","status","primary_color","secondary_color","website","domain","executive","notes"]} /><Cards rows={organizations} titleKey="name" detail={(o) => `${o.industry ?? "No industry"} · ${o.status ?? "active"} · ${o.executive ?? "No executive"}`} /></main>;
}
function Header({title,kicker}:{title:string;kicker:string}){return <section className="pageHeader panel"><p className="eyebrow">{kicker}</p><h1>{title}</h1></section>}
function CrudForm({action,fields}:{action:(fd:FormData)=>Promise<void>;fields:string[]}){return <form action={action} className="panel crudForm">{fields.map(f=><label key={f}>{f.replaceAll("_"," ")}<input name={f}/></label>)}<button className="button primary" type="submit">Create record</button></form>}
function Cards({rows,titleKey,detail}:{rows:Record<string,any>[];titleKey:string;detail:(r:Record<string,any>)=>string}){return <section className="recordGrid">{rows.map(r=><article className="panel recordCard" key={r.id}><h2>{r[titleKey]}</h2><p>{detail(r)}</p></article>)}</section>}
