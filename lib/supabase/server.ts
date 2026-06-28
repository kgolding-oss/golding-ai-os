import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseEnv, hasSupabaseEnv } from "./env";

const ACCESS_COOKIE = "golding-sb-access-token";
const REFRESH_COOKIE = "golding-sb-refresh-token";

type SupabaseSession = { access_token: string; refresh_token?: string; expires_in?: number; user: { id: string; email?: string } };

function authHeaders(token?: string) {
  const { anonKey } = getSupabaseEnv();
  return { apikey: anonKey, Authorization: `Bearer ${token || anonKey}`, "Content-Type": "application/json" };
}

export async function signInWithPassword(email: string, password: string) {
  const { url } = getSupabaseEnv();
  if (!hasSupabaseEnv()) throw new Error("Supabase public environment variables are not configured.");
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Invalid email or password.");
  const session = (await response.json()) as SupabaseSession;
  const store = cookies();
  store.set(ACCESS_COOKIE, session.access_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: session.expires_in ?? 3600 });
  if (session.refresh_token) store.set(REFRESH_COOKIE, session.refresh_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function signOut() {
  const store = cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  const { url } = getSupabaseEnv();
  if (token && hasSupabaseEnv()) await fetch(`${url}/auth/v1/logout`, { method: "POST", headers: authHeaders(token), cache: "no-store" }).catch(() => undefined);
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getSession() {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (!token || !hasSupabaseEnv()) return null;
  const { url } = getSupabaseEnv();
  const response = await fetch(`${url}/auth/v1/user`, { headers: authHeaders(token), cache: "no-store" });
  if (!response.ok) return null;
  const user = await response.json() as { id: string; email?: string };
  return { accessToken: token, user };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function supabaseSelect<T>(table: string, token: string, query = "select=*") {
  const { url } = getSupabaseEnv();
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, { headers: authHeaders(token), cache: "no-store" });
  if (!response.ok) return [] as T[];
  return response.json() as Promise<T[]>;
}
