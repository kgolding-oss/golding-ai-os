type LoginPageProps = {
  searchParams?: { error?: string };
};

const errorMessages: Record<string, string> = {
  missing: "Enter an email address and password to continue.",
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const rawError = searchParams?.error;
  const error = rawError ? errorMessages[rawError] ?? rawError : null;

  return (
    <main className="authShell">
      <section className="authCard panel">
        <p className="eyebrow">Golding AI OS · Secure Access</p>
        <h1>Sign in to the executive operating system.</h1>
        <p className="heroText">Use your Supabase account credentials to access the protected dashboard foundation.</p>
        {error ? <p className="authError" role="alert">{error}</p> : null}
        <form className="authForm" action="/auth/login" method="post">
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="button primary" type="submit">Open dashboard</button>
        </form>
      </section>
    </main>
  );
}
