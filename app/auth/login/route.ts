import { NextResponse } from "next/server";
import { signInWithPassword } from "../../../lib/supabase/client";
import { sessionCookieName } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing", request.url), { status: 303 });
  }

  try {
    const session = await signInWithPassword(email, password);
    const response = NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });

    response.cookies.set({
      name: sessionCookieName,
      value: JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + session.expires_in,
        user: session.user,
      }),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.expires_in,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url), { status: 303 });
  }
}
