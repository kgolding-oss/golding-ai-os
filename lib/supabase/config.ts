export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseHeaders(accessToken?: string) {
  return {
    apikey: supabasePublishableKey,
    Authorization: `Bearer ${accessToken ?? supabasePublishableKey}`,
    "Content-Type": "application/json",
  };
}
