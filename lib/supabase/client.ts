import { getSupabaseHeaders, hasSupabaseConfig, supabaseUrl } from "./config";

export async function signInWithPassword(email: string, password: string) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: getSupabaseHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error_description ?? payload.msg ?? "Unable to sign in.");
  }

  return payload as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: { id: string; email?: string };
  };
}
