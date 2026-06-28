import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseHeaders, hasSupabaseConfig, supabaseUrl } from "./config";

export type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user?: { id: string; email?: string };
};

export const sessionCookieName = "golding-supabase-session";

export function getStoredSession(): SupabaseSession | null {
  const rawSession = cookies().get(sessionCookieName)?.value;

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as SupabaseSession;
  } catch {
    return null;
  }
}

export function requireSession() {
  const session = getStoredSession();

  if (!session?.access_token) {
    redirect("/login");
  }

  return session;
}

export async function getCurrentUser(accessToken: string) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: getSupabaseHeaders(accessToken),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<{ id: string; email?: string }>;
}
