import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRows } from "../../lib/supabase/data";
import { requireSession } from "../../lib/supabase/server";

export async function OrgSwitcher() {
  const session = requireSession();
  const organizations = await getRows<{ id: string; name: string }>("organizations", session.access_token, "?select=id,name&order=name");
  const active = cookies().get("golding-active-organization")?.value ?? organizations[0]?.id ?? "";
  async function switchOrganization(formData: FormData) {
    "use server";
    const organizationId = String(formData.get("organization_id") ?? "");
    cookies().set("golding-active-organization", organizationId, { path: "/", sameSite: "lax" });
    revalidatePath("/dashboard");
    redirect("/dashboard");
  }
  return <form action={switchOrganization} className="orgSwitcher"><label>Organization<select name="organization_id" defaultValue={active}>{organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select></label><button className="button secondary" type="submit">Switch</button></form>;
}
