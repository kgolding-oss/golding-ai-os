-- Milestone 7: Schema reconciliation for active organization identity and RBAC tables.
create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid references public.roles(id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role_id uuid references public.roles(id) on delete set null,
  invited_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending',
  token text unique,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, organization_id, role_id)
);

insert into public.roles (name, description) values
  ('Platform Super Admin', 'Global platform administrator.'),
  ('Organization Admin', 'Organization administrator.'),
  ('Executive Director', 'Executive operating lead.'),
  ('Manager', 'Team manager.'),
  ('Staff', 'Internal team member.'),
  ('Viewer', 'Read-only organization viewer.'),
  ('Volunteer', 'Volunteer contributor.'),
  ('Contractor', 'External contractor.')
on conflict (name) do update set description = excluded.description, updated_at = now();

insert into public.organization_memberships (organization_id, profile_id, role_id, status)
select ou.organization_id, ou.user_id, r.id, coalesce(ou.status, 'active')
from public.organization_users ou
left join public.roles r on r.name = coalesce(nullif(ou.role, ''), 'Viewer')
where ou.organization_id is not null and ou.user_id is not null
on conflict (organization_id, profile_id) do update
set role_id = coalesce(excluded.role_id, public.organization_memberships.role_id),
    status = excluded.status,
    updated_at = now();

insert into public.organization_memberships (organization_id, profile_id, role_id, status)
select o.id, o.owner_id, r.id, 'active'
from public.organizations o
left join public.roles r on r.name = 'Organization Admin'
where o.owner_id is not null
on conflict (organization_id, profile_id) do update
set role_id = coalesce(public.organization_memberships.role_id, excluded.role_id),
    status = 'active',
    updated_at = now();

create index if not exists roles_name_idx on public.roles(name);
create index if not exists organization_memberships_organization_created_idx on public.organization_memberships(organization_id, created_at desc);
create index if not exists organization_memberships_profile_status_idx on public.organization_memberships(profile_id, status);
create index if not exists organization_invitations_organization_created_idx on public.organization_invitations(organization_id, created_at desc);
create index if not exists user_roles_organization_created_idx on public.user_roles(organization_id, created_at desc);
create index if not exists user_roles_profile_idx on public.user_roles(profile_id);

alter table public.roles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "roles are visible to authenticated users" on public.roles;
create policy "roles are visible to authenticated users" on public.roles for select to authenticated using (true);
