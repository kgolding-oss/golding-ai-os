const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const rawSupabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseUrl = rawSupabaseUrl.trim().replace(/\/+$/, "");
export const supabasePublishableKey = rawSupabasePublishableKey.trim();

function hasValidSupabaseUrl() {
  try {
    const url = new URL(supabaseUrl);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function hasSupabaseConfig() {
  return Boolean(hasValidSupabaseUrl() && supabasePublishableKey);
}

export function getSupabaseHeaders(accessToken?: string) {
  return {
    apikey: supabasePublishableKey,
    Authorization: `Bearer ${accessToken ?? supabasePublishableKey}`,
    "Content-Type": "application/json",
  };
}
