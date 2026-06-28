import { logoutAction } from "@/app/actions";

export function TopNavigation({ email }: { email?: string }) {
  return <header className="top-nav"><div><p className="eyebrow">Production foundation</p><h1>Executive Dashboard</h1></div><form action={logoutAction}><span>{email}</span><button className="button secondary" type="submit">Logout</button></form></header>;
}
