-- Milestone 4: Identity & Organization Engine.
create extension if not exists pgcrypto;

alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists timezone text default 'UTC';
alter table public.agent_registry add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  department text,
  status text not null default 'active' check (status in ('active','invited','suspended','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  scope text not null default 'organization' check (scope in ('platform','organization')),
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permission_mappings (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(role_id, permission_id)
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(organization_id, profile_id, role_id)
);

create table if not exists public.user_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  default_organization_id uuid references public.organizations(id) on delete set null,
  theme text not null default 'system' check (theme in ('system','dark','light')),
  dashboard_density text not null default 'comfortable' check (dashboard_density in ('comfortable','compact')),
  email_notifications boolean not null default true,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role_id uuid references public.roles(id) on delete set null,
  token text not null default encode(gen_random_bytes(24), 'hex'),
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  invited_by uuid references public.profiles(id) on delete set null,
  accepted_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(organization_id, email, status)
);

create index if not exists idx_memberships_profile on public.organization_memberships(profile_id);
create index if not exists idx_user_roles_profile on public.user_roles(profile_id);
create index if not exists idx_invitations_email on public.invitations(email);
create index if not exists idx_agent_registry_org on public.agent_registry(organization_id);

insert into public.permissions (key, description) values
('organizations:view','View organizations'),('organizations:manage','Create and manage organizations'),('people:view','View people directory'),('people:manage','Manage memberships'),('roles:view','View RBAC configuration'),('roles:manage','Manage RBAC configuration'),('invitations:manage','Invite and onboard users'),('agents:manage','Manage AI agents'),('audit:view','View audit logs')
on conflict (key) do nothing;

insert into public.roles (name, description, scope, is_system) values
('Super Admin','Full platform administration','platform',true),('Organization Admin','Manage one organization','organization',true),('Executive Director','Executive oversight and approvals','organization',true),('Manager','Operational manager','organization',true),('Staff','Internal operator','organization',true),('Volunteer','Limited contributor','organization',true),('Contractor','External contributor','organization',true),('Viewer','Read-only access','organization',true)
on conflict (name) do update set description=excluded.description, scope=excluded.scope, is_system=excluded.is_system;

insert into public.role_permission_mappings (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on
  r.name = 'Super Admin' or
  (r.name = 'Organization Admin' and p.key in ('organizations:view','organizations:manage','people:view','people:manage','roles:view','invitations:manage','agents:manage','audit:view')) or
  (r.name = 'Executive Director' and p.key in ('organizations:view','people:view','roles:view','agents:manage','audit:view')) or
  (r.name = 'Manager' and p.key in ('organizations:view','people:view','agents:manage')) or
  (r.name in ('Staff','Volunteer','Contractor','Viewer') and p.key in ('organizations:view','people:view'))
on conflict do nothing;

insert into public.organization_memberships (organization_id, profile_id, title, status)
select o.id, p.id, 'Owner', 'active' from public.organizations o join public.profiles p on p.id = o.owner_id where o.owner_id is not null
on conflict (organization_id, profile_id) do nothing;

alter table public.organization_memberships enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permission_mappings enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.invitations enable row level security;

drop policy if exists "authenticated manage organization_memberships" on public.organization_memberships;
create policy "authenticated manage organization_memberships" on public.organization_memberships for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage roles" on public.roles;
create policy "authenticated manage roles" on public.roles for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage permissions" on public.permissions;
create policy "authenticated manage permissions" on public.permissions for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage role_permission_mappings" on public.role_permission_mappings;
create policy "authenticated manage role_permission_mappings" on public.role_permission_mappings for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage user_roles" on public.user_roles;
create policy "authenticated manage user_roles" on public.user_roles for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage user_preferences" on public.user_preferences;
create policy "authenticated manage user_preferences" on public.user_preferences for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage invitations" on public.invitations;
create policy "authenticated manage invitations" on public.invitations for all to authenticated using (true) with check (true);
