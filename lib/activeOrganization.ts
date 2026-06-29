import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, requireSession } from "./supabase/server";
import { getRows, supabaseRequest } from "./supabase/data";

export type ActiveOrganization = {
  id: string;
  name: string;
  slug?: string | null;
  status?: string | null;
  industry?: string | null;
};

export type OrganizationMembership = {
  id: string;
  organization_id: string;
  profile_id: string;
  status?: string | null;
  organizations?: ActiveOrganization | null;
};

type SwitchResult = { success: boolean; active_organization_id?: string; error?: string };

function encode(value: string) {
  return encodeURIComponent(value);
}

export async function listUserOrganizations(token: string) {
  const query = "?select=id,organization_id,profile_id,status,organizations(id,name,slug,status,industry)&status=eq.active&order=created_at.asc";
  return getRows<OrganizationMembership>("organization_memberships", token, query);
}

export async function getActiveOrganization(token: string) {
  const user = await getCurrentUser(token);
  if (!user?.id) return null;
  const rows = await supabaseRequest<ActiveOrganization[]>("rpc/get_active_organization", {
    token,
    method: "POST",
    body: { profile_uuid: user.id },
  });
  return rows[0] ?? null;
}

export async function setActiveOrganization(token: string, organizationId: string) {
  const user = await getCurrentUser(token);
  if (!user?.id) return { success: false, error: "unauthenticated" } satisfies SwitchResult;
  return supabaseRequest<SwitchResult>("rpc/switch_active_organization", {
    token,
    method: "POST",
    body: { profile_uuid: user.id, organization_uuid: organizationId },
  });
}

export async function requireActiveOrganization() {
  const session = requireSession();
  const [activeOrganization, memberships] = await Promise.all([
    getActiveOrganization(session.access_token),
    listUserOrganizations(session.access_token),
  ]);
  return { session, activeOrganization, memberships };
}

export function organizationFilter(organizationId?: string | null) {
  if (!organizationId) return "";
  return `organization_id=eq.${encode(organizationId)}`;
}

export function currentPath() {
  return headers().get("x-current-path") ?? "/dashboard";
}

export function redirectToCurrentFallback(path?: string | null) {
  redirect(path || currentPath());
}
