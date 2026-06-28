import { getSupabaseHeaders, hasSupabaseConfig, supabaseUrl } from "./config";

export type DbRecord = Record<string, unknown>;

type RequestOptions = {
  token: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: DbRecord;
  query?: string;
  prefer?: string;
};

export async function supabaseRequest<T>(table: string, options: RequestOptions): Promise<T> {
  if (!hasSupabaseConfig()) return ([] as unknown) as T;
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}${options.query ?? ""}`, {
    method: options.method ?? "GET",
    headers: {
      ...getSupabaseHeaders(options.token),
      Prefer: options.prefer ?? "return=representation",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`${table} request failed: ${message}`);
  }
  if (response.status === 204) return ([] as unknown) as T;
  return response.json() as Promise<T>;
}

export async function getRows<T>(table: string, token: string, query = "?select=*") {
  return supabaseRequest<T[]>(table, { token, query });
}

export function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function formBool(formData: FormData, key: string) {
  return formData.get(key) === "on";
}
