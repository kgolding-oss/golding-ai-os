import { revalidatePath } from "next/cache";
import { EmptyState, PageHeader, PageShell } from "../../components/PageShell";
import { getVisibleOrganizations, type Preference, type Profile } from "../../lib/identity";
import { formValue, getRows, supabaseRequest } from "../../lib/supabase/data";
import { requireSession } from "../../lib/supabase/server";

export default async function ProfilePage() {
  const session = requireSession();
  const organizations = await getVisibleOrganizations(session.access_token);
  const profiles = await getRows<Profile>("profiles", session.access_token, "?select=id,email,full_name,role");
  const preferences = await getRows<Preference>("user_preferences", session.access_token, "?select=id,profile_id,active_organization_id,theme");
  const profile = profiles[0];
  async function savePreferences(formData: FormData) { "use server"; const currentSession = requireSession(); await supabaseRequest<Preference>("user_preferences", { token: currentSession.access_token, method: "POST", prefer: "resolution=merge-duplicates,return=representation", body: { profile_id: currentSession.user?.id, active_organization_id: formValue(formData, "active_organization_id"), theme: formValue(formData, "theme") ?? "system" } }); revalidatePath("/profile"); }
  return <PageShell organizations={organizations}><PageHeader title="Profile" kicker="User Preferences" description="Manage only your own profile preferences and active organization context." />{!profile ? <EmptyState title="No profile" message="A profile record is required before preferences can be saved." /> : <section className="grid twoColumn"><article className="panel recordCard"><p className="recordMeta">Signed in</p><h2>{profile.full_name ?? profile.email}</h2><p>{profile.role ?? "operator"}</p></article><form action={savePreferences} className="panel crudForm"><label>Active organization<select name="active_organization_id" defaultValue={preferences[0]?.active_organization_id ?? ""}><option value="">None</option>{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select></label><label>Theme<select name="theme" defaultValue={preferences[0]?.theme ?? "system"}><option value="system">System</option><option value="dark">Dark</option><option value="light">Light</option></select></label><button className="button primary">Save preferences</button></form></section>}</PageShell>;
}
