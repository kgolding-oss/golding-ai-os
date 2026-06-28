"use server";

import { redirect } from "next/navigation";
import { signInWithPassword, signOut } from "@/lib/supabase/server";

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };
  try {
    await signInWithPassword(email, password);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Login failed." };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  await signOut();
  redirect("/login");
}
