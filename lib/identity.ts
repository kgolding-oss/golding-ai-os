import { getRows } from "./supabase/data";

export type Organization = { id: string; name: string; industry?: string; status?: string; executive?: string };
export type Profile = { id: string; email: string; full_name?: string; role?: string };
export type Role = { id: string; name: string; description?: string };
export type Permission = { id: string; key: string; description?: string };
export type Membership = { id: string; organization_id: string; profile_id: string; status: string; profiles?: Profile; roles?: Role; organizations?: Organization };
export type Invitation = { id: string; organization_id: string; email: string; status: string; expires_at: string; role_name?: string; organizations?: Organization };
export type Preference = { id?: string; profile_id: string; active_organization_id?: string; theme: string };

export async function getVisibleOrganizations(token: string) {
  return getRows<Organization>("organizations", token, "?select=id,name,industry,status,executive&order=name");
}
