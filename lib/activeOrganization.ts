import { redirect } from "next/navigation";
import { getRows, supabaseRequest } from "./supabase/data";
import { getCurrentUser, requireSession } from "./supabase/server";

export type UserOrganization = {
  id: string;
  role?: string | null;
  organization?: {
    id: string;
    name: string;
    slug?: string | null;
    status?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
  } | null;
};

export type ActiveOrganization = NonNullable<UserOrganization["organization"]>;

export async function listUserOrganizations(token: string) {
  return getRows<UserOrganization>(
    "organization_memberships",
    token,
    "?select=id,role,organization:organizations(id,name,slug,status,primary_color,secondary_color)&order=created_at.asc",
  );
}

export async function getActiveOrganization(token: string) {
  const user = await getCurrentUser(token);
  if (!user?.id) redirect("/login");

  const active = await supabaseRequest<ActiveOrganization | null>("rpc/get_active_organization", {
    token,
    method: "POST",
    body: { profile_uuid: user.id },
  });

  return active;
}

export async function setActiveOrganization(token: string, organizationId: string) {
  const user = await getCurrentUser(token);
  if (!user?.id) redirect("/login");

  return supabaseRequest<{ success: boolean; active_organization_id?: string; error?: string }>(
    "rpc/switch_active_organization",
    {
      token,
      method: "POST",
      body: { profile_uuid: user.id, organization_uuid: organizationId },
    },
  );
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
  return organizationId ? `organization_id=eq.${organizationId}` : "id=is.null";
}
