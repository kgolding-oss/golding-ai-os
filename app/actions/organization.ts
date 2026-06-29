"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setActiveOrganization } from "../../lib/activeOrganization";
import { requireSession } from "../../lib/supabase/server";

const revalidationPaths = ["/dashboard", "/organizations", "/people", "/agents", "/tasks", "/approvals", "/profile", "/rbac", "/invitations"];

export async function switchOrganization(formData: FormData) {
  const session = requireSession();
  const organizationId = formData.get("organization_id");
  const returnToValue = formData.get("return_to");
  const returnTo = typeof returnToValue === "string" && returnToValue.startsWith("/") ? returnToValue : "/dashboard";

  if (typeof organizationId !== "string" || !organizationId) {
    redirect(`${returnTo}?organizationSwitch=unauthorized`);
  }

  const result = await setActiveOrganization(session.access_token, organizationId);
  if (!result.success) {
    redirect(`${returnTo}?organizationSwitch=unauthorized`);
  }

  revalidationPaths.forEach((path) => revalidatePath(path));
  redirect(returnTo);
}
