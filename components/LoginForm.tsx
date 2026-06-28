"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/app/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="button primary" type="submit" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>;
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, undefined);
  return <form className="login-form" action={formAction}><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{state?.error ? <p className="form-error" role="alert">{state.error}</p> : null}<SubmitButton /></form>;
}
