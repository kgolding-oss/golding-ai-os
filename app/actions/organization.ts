"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setActiveOrganization } from "../../lib/activeOrganization";
import { formValue } from "../../lib/supabase/data";
import { requireSession } from "../../lib/supabase/server";

export async function switchOrganization(formData: FormData) {
  const session = requireSession();
  const organizationId = formValue(formData, "organization_id");
  const returnTo = formValue(formData, "return_to") ?? "/dashboard";

  if (!organizationId) redirect(returnTo);

  const result = await setActiveOrganization(session.access_token, organizationId);
  if (!result.success) redirect(`${returnTo}?organizationSwitch=unauthorized`);

  revalidatePath("/dashboard");
  revalidatePath("/organizations");
  revalidatePath("/agents");
  revalidatePath("/tasks");
  revalidatePath("/approvals");
  redirect(returnTo);
}
