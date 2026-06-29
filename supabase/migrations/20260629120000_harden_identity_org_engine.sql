-- Harden Milestone 4 Identity & Organization Engine RLS and sensitive invitation handling.
create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade unique,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role_id uuid references public.roles(id) on delete set null,
  token_hash text not null default encode(digest(gen_random_uuid()::text, 'sha256'), 'hex'),
  status text not null default 'pending',
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.organization_users add column if not exists profile_id uuid references public.profiles(id) on delete cascade;
alter table public.organization_users add column if not exists role_id uuid references public.roles(id) on delete set null;
update public.organization_users set profile_id = user_id where profile_id is null and user_id is not null;

insert into public.roles (name) values
  ('Super Admin'), ('Organization Admin'), ('Executive Director'), ('Manager'), ('Staff'), ('Viewer'), ('Volunteer'), ('Contractor')
on conflict (name) do nothing;

create or replace view public.organization_invitation_list as
select id, organization_id, email, role_id, status, expires_at, created_by, created_at
from public.organization_invitations;

create or replace function public.is_platform_super_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_users ou
    left join public.roles r on r.id = ou.role_id
    where coalesce(ou.profile_id, ou.user_id) = auth.uid()
      and ou.status = 'active'
      and (ou.role = 'Super Admin' or r.name = 'Super Admin')
  );
$$;

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select public.is_platform_super_admin() or exists (
    select 1 from public.organization_users ou
    where ou.organization_id = target_organization_id
      and coalesce(ou.profile_id, ou.user_id) = auth.uid()
      and ou.status = 'active'
  ) or exists (
    select 1 from public.organizations o
    where o.id = target_organization_id and o.owner_id = auth.uid()
  );
$$;

create or replace function public.can_manage_org(target_organization_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select public.is_platform_super_admin() or exists (
    select 1 from public.organization_users ou
    left join public.roles r on r.id = ou.role_id
    where ou.organization_id = target_organization_id
      and coalesce(ou.profile_id, ou.user_id) = auth.uid()
      and ou.status = 'active'
      and coalesce(r.name, ou.role) in ('Organization Admin', 'Executive Director', 'Super Admin')
  );
$$;

create or replace function public.has_permission(target_organization_id uuid, requested_permission text)
returns boolean language sql security definer set search_path = public as $$
  select public.is_platform_super_admin() or exists (
    select 1 from public.organization_users ou
    left join public.roles r on r.id = ou.role_id
    join public.role_permissions rp on rp.role = coalesce(r.name, ou.role)
    where ou.organization_id = target_organization_id
      and coalesce(ou.profile_id, ou.user_id) = auth.uid()
      and ou.status = 'active'
      and (rp.permission = requested_permission or rp.permission = '*')
  );
$$;

insert into public.role_permissions (role, permission_group_id, permission)
select role_name, pg.id, permission
from public.permission_groups pg
cross join (values
  ('Super Admin','*'),
  ('Organization Admin','roles:manage'),
  ('Executive Director','roles:manage')
) as rp(role_name, permission)
where pg.name = 'Executive Core'
on conflict (role, permission) do nothing;

alter table public.roles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.organization_invitations enable row level security;

-- Replace broad authenticated policies with organization-scoped policies.
drop policy if exists "milestone 3 authenticated organizations" on public.organizations;
create policy "organizations member readable" on public.organizations for select to authenticated using (public.is_org_member(id));
create policy "organizations admins manage" on public.organizations for all to authenticated using (public.can_manage_org(id)) with check (public.can_manage_org(id));

drop policy if exists "authenticated manage organization_users" on public.organization_users;
create policy "memberships member readable" on public.organization_users for select to authenticated using (public.is_org_member(organization_id));
create policy "memberships admins manage" on public.organization_users for all to authenticated using (public.can_manage_org(organization_id)) with check (public.can_manage_org(organization_id));

drop policy if exists "authenticated manage role_permissions" on public.role_permissions;
drop policy if exists "authenticated manage permission_groups" on public.permission_groups;
create policy "roles readable" on public.roles for select to authenticated using (true);
create policy "role permissions readable" on public.role_permissions for select to authenticated using (true);
create policy "permission groups readable" on public.permission_groups for select to authenticated using (true);
create policy "role assignments require permission" on public.role_permissions for all to authenticated using (public.is_platform_super_admin()) with check (public.is_platform_super_admin());

create policy "invitations member readable" on public.organization_invitations for select to authenticated using (public.is_org_member(organization_id));
create policy "invitations admins manage" on public.organization_invitations for all to authenticated using (public.can_manage_org(organization_id)) with check (public.can_manage_org(organization_id));

create policy "preferences self read" on public.user_preferences for select to authenticated using (profile_id = auth.uid() or public.is_platform_super_admin());
create policy "preferences self update" on public.user_preferences for update to authenticated using (profile_id = auth.uid() or public.is_platform_super_admin()) with check (profile_id = auth.uid() or public.is_platform_super_admin());
create policy "preferences self insert" on public.user_preferences for insert to authenticated with check (profile_id = auth.uid() or public.is_platform_super_admin());

-- Keep audit log insert/read scoped while allowing platform admins full visibility.
drop policy if exists "audit logs are organization scoped" on public.audit_logs;
drop policy if exists "audit logs can be inserted by members" on public.audit_logs;
create policy "audit logs scoped read" on public.audit_logs for select to authenticated using (organization_id is null or public.is_org_member(organization_id) or public.is_platform_super_admin());
create policy "audit logs scoped insert" on public.audit_logs for insert to authenticated with check (organization_id is null or public.is_org_member(organization_id) or public.is_platform_super_admin());

create or replace function public.audit_preferences_updated()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs (organization_id, actor_id, action, entity_table, entity_id, metadata)
  values (null, auth.uid(), 'preferences.updated', 'user_preferences', new.id, jsonb_build_object('profile_id', new.profile_id));
  return new;
end;
$$;

drop trigger if exists audit_preferences_updated on public.user_preferences;
create trigger audit_preferences_updated
after update on public.user_preferences
for each row execute function public.audit_preferences_updated();
