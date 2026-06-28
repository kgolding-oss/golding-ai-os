import { NextResponse } from "next/server";
import { sessionCookieName } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  response.cookies.delete(sessionCookieName);
  return response;
}
