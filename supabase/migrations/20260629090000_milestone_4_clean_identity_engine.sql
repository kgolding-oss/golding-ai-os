-- Milestone 4: clean identity and organization engine.
create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_system boolean not null default true,
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
  unique (role_id, permission_id)
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid references public.roles(id) on delete set null,
  status text not null default 'active' check (status in ('active','invited','suspended','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (profile_id, organization_id, role_id)
);

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role_id uuid references public.roles(id) on delete set null,
  invited_by uuid references public.profiles(id) on delete set null,
  token_hash text not null,
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email, status)
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade unique,
  active_organization_id uuid references public.organizations(id) on delete set null,
  theme text not null default 'system' check (theme in ('system','dark','light')),
  notification_settings jsonb not null default '{}'::jsonb,
  dashboard_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.roles (name, description) values
('Platform Super Admin','Can administer the full platform.'),
('Organization Admin','Can manage organization settings, memberships, roles, and invitations.'),
('Executive Director','Can manage executive organization operations.'),
('Manager','Can manage assigned operating work.'),
('Staff','Can contribute to organization work.'),
('Viewer','Can view organization work.'),
('Volunteer','Can view and complete volunteer work.'),
('Contractor','Can view and complete contracted work.')
on conflict (name) do update set description = excluded.description;

insert into public.permissions (key, description) values
('platform.manage','Manage all platform data.'),
('organizations.view','View organization records.'),
('organizations.manage','Manage organization records.'),
('memberships.manage','Manage organization memberships.'),
('roles.assign','Assign roles.'),
('invitations.manage','Create and manage invitations.'),
('preferences.manage_own','Manage own preferences.'),
('rbac.view','View roles and permissions.')
on conflict (key) do update set description = excluded.description;

insert into public.role_permission_mappings (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on
  r.name = 'Platform Super Admin' or
  (r.name in ('Organization Admin','Executive Director') and p.key in ('organizations.view','organizations.manage','memberships.manage','roles.assign','invitations.manage','preferences.manage_own','rbac.view')) or
  (r.name in ('Manager','Staff','Viewer','Volunteer','Contractor') and p.key in ('organizations.view','preferences.manage_own','rbac.view'))
on conflict do nothing;

insert into public.organization_memberships (organization_id, profile_id, role_id, status)
select o.id, o.owner_id, r.id, 'active'
from public.organizations o cross join public.roles r
where o.owner_id is not null and r.name = 'Organization Admin'
on conflict (organization_id, profile_id) do update set role_id = coalesce(public.organization_memberships.role_id, excluded.role_id), status = 'active';

insert into public.organization_memberships (organization_id, profile_id, role_id, status)
select ou.organization_id, ou.user_id, r.id, coalesce(ou.status, 'active')
from public.organization_users ou
left join public.roles r on r.name = ou.role
where ou.organization_id is not null and ou.user_id is not null
on conflict (organization_id, profile_id) do update set role_id = coalesce(public.organization_memberships.role_id, excluded.role_id), status = excluded.status;

create or replace function public.validate_required_uuid(value uuid, field_name text) returns uuid language plpgsql immutable as $$
begin
  if value is null then raise exception '% is required', field_name using errcode = '23502'; end if;
  return value;
end; $$;

create or replace function public.validate_email(value text) returns text language plpgsql immutable as $$
begin
  if value is null or value !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then raise exception 'valid email is required' using errcode = '22000'; end if;
  return lower(trim(value));
end; $$;

create or replace function public.validate_identity_inputs() returns trigger language plpgsql as $$
begin
  if tg_table_name in ('organization_memberships','organization_invitations') then perform public.validate_required_uuid(new.organization_id, 'organization_id'); end if;
  if tg_table_name in ('organization_memberships','user_roles','user_preferences') then perform public.validate_required_uuid(new.profile_id, 'profile_id'); end if;
  if tg_table_name in ('user_roles') then perform public.validate_required_uuid(new.role_id, 'role_id'); end if;
  if tg_table_name = 'organization_invitations' then new.email := public.validate_email(new.email); end if;
  return new;
end; $$;

drop trigger if exists validate_organization_memberships on public.organization_memberships;
create trigger validate_organization_memberships before insert or update on public.organization_memberships for each row execute function public.validate_identity_inputs();
drop trigger if exists validate_organization_invitations on public.organization_invitations;
create trigger validate_organization_invitations before insert or update on public.organization_invitations for each row execute function public.validate_identity_inputs();
drop trigger if exists validate_user_roles on public.user_roles;
create trigger validate_user_roles before insert or update on public.user_roles for each row execute function public.validate_identity_inputs();
drop trigger if exists validate_user_preferences on public.user_preferences;
create trigger validate_user_preferences before insert or update on public.user_preferences for each row execute function public.validate_identity_inputs();

create or replace function public.is_platform_super_admin() returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.user_roles ur join public.roles r on r.id = ur.role_id where ur.profile_id = auth.uid() and ur.organization_id is null and r.name = 'Platform Super Admin');
$$;

create or replace function public.is_org_member(target_organization_id uuid) returns boolean language sql security definer set search_path = public as $$
  select public.is_platform_super_admin() or exists (select 1 from public.organization_memberships om where om.organization_id = target_organization_id and om.profile_id = auth.uid() and om.status = 'active');
$$;

create or replace function public.has_permission(target_organization_id uuid, permission_key text) returns boolean language sql security definer set search_path = public as $$
  select public.is_platform_super_admin() or exists (
    select 1 from public.user_roles ur join public.role_permission_mappings rpm on rpm.role_id = ur.role_id join public.permissions p on p.id = rpm.permission_id
    where ur.profile_id = auth.uid() and (ur.organization_id = target_organization_id or ur.organization_id is null) and p.key in (permission_key, 'platform.manage')
  ) or exists (
    select 1 from public.organization_memberships om join public.role_permission_mappings rpm on rpm.role_id = om.role_id join public.permissions p on p.id = rpm.permission_id
    where om.profile_id = auth.uid() and om.organization_id = target_organization_id and om.status = 'active' and p.key in (permission_key, 'platform.manage')
  );
$$;

create or replace function public.can_manage_org(target_organization_id uuid) returns boolean language sql security definer set search_path = public as $$
  select public.has_permission(target_organization_id, 'organizations.manage') or exists (
    select 1 from public.organization_memberships om join public.roles r on r.id = om.role_id
    where om.organization_id = target_organization_id and om.profile_id = auth.uid() and om.status = 'active' and r.name in ('Organization Admin','Executive Director')
  );
$$;

create or replace view public.safe_organization_invitations as
select oi.id, oi.organization_id, oi.email, oi.role_id, r.name as role_name, oi.invited_by, oi.status, oi.expires_at, oi.created_at, oi.updated_at
from public.organization_invitations oi left join public.roles r on r.id = oi.role_id;

create or replace function public.audit_identity_change() returns trigger language plpgsql security definer set search_path = public as $$
declare action_name text; org_id uuid; entity uuid; actor uuid;
begin
  actor := auth.uid();
  if tg_table_name = 'organizations' and tg_op = 'INSERT' then action_name := 'organization.created'; org_id := new.id; entity := new.id;
  elsif tg_table_name = 'organization_memberships' and tg_op = 'INSERT' then action_name := 'membership.created'; org_id := new.organization_id; entity := new.id;
  elsif tg_table_name = 'user_roles' and tg_op = 'INSERT' then action_name := 'role.assigned'; org_id := new.organization_id; entity := new.id;
  elsif tg_table_name = 'organization_invitations' and tg_op = 'INSERT' then action_name := 'invitation.created'; org_id := new.organization_id; entity := new.id;
  elsif tg_table_name = 'user_preferences' and tg_op in ('INSERT','UPDATE') then action_name := 'preferences.updated'; org_id := new.active_organization_id; entity := new.id;
  else return new;
  end if;
  insert into public.audit_logs (organization_id, actor_id, action, entity_table, entity_id, metadata) values (org_id, actor, action_name, tg_table_name, entity, jsonb_build_object('operation', tg_op));
  return new;
end; $$;

drop trigger if exists audit_organizations_created on public.organizations;
create trigger audit_organizations_created after insert on public.organizations for each row execute function public.audit_identity_change();
drop trigger if exists audit_membership_created on public.organization_memberships;
create trigger audit_membership_created after insert on public.organization_memberships for each row execute function public.audit_identity_change();
drop trigger if exists audit_role_assigned on public.user_roles;
create trigger audit_role_assigned after insert on public.user_roles for each row execute function public.audit_identity_change();
drop trigger if exists audit_invitation_created on public.organization_invitations;
create trigger audit_invitation_created after insert on public.organization_invitations for each row execute function public.audit_identity_change();
drop trigger if exists audit_preferences_updated on public.user_preferences;
create trigger audit_preferences_updated after insert or update on public.user_preferences for each row execute function public.audit_identity_change();

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permission_mappings enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.user_roles enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "milestone 3 authenticated organizations" on public.organizations;
drop policy if exists "milestone 3 authenticated projects" on public.projects;
drop policy if exists "milestone 3 authenticated tasks" on public.tasks;
drop policy if exists "milestone 3 authenticated approvals" on public.approvals;
drop policy if exists "authenticated manage organization_users" on public.organization_users;
drop policy if exists "authenticated manage permission_groups" on public.permission_groups;
drop policy if exists "authenticated manage role_permissions" on public.role_permissions;

drop policy if exists "organizations are owner managed" on public.organizations;
drop policy if exists "organizations are member visible" on public.organizations;
drop policy if exists "organizations are manager writable" on public.organizations;
drop policy if exists "memberships are member visible" on public.organization_memberships;
drop policy if exists "memberships are manager writable" on public.organization_memberships;
drop policy if exists "invitations are manager visible" on public.organization_invitations;
drop policy if exists "invitations are manager writable" on public.organization_invitations;
drop policy if exists "roles are readable" on public.roles;
drop policy if exists "roles are super admin writable" on public.roles;
drop policy if exists "permissions are readable" on public.permissions;
drop policy if exists "permissions are super admin writable" on public.permissions;
drop policy if exists "role mappings are readable" on public.role_permission_mappings;
drop policy if exists "role mappings are super admin writable" on public.role_permission_mappings;
drop policy if exists "user roles are org scoped" on public.user_roles;
drop policy if exists "user roles are manager writable" on public.user_roles;
drop policy if exists "preferences are self managed" on public.user_preferences;
drop policy if exists "organization users disabled read" on public.organization_users;
drop policy if exists "permission groups disabled read" on public.permission_groups;
drop policy if exists "role permissions disabled read" on public.role_permissions;
create policy "organizations are member visible" on public.organizations for select to authenticated using (public.is_org_member(id));
create policy "organizations are manager writable" on public.organizations for all to authenticated using (public.can_manage_org(id)) with check (public.is_platform_super_admin() or owner_id = auth.uid() or public.can_manage_org(id));

create policy "memberships are member visible" on public.organization_memberships for select to authenticated using (public.is_org_member(organization_id));
create policy "memberships are manager writable" on public.organization_memberships for all to authenticated using (public.can_manage_org(organization_id)) with check (public.can_manage_org(organization_id));
create policy "invitations are manager visible" on public.organization_invitations for select to authenticated using (public.can_manage_org(organization_id));
create policy "invitations are manager writable" on public.organization_invitations for all to authenticated using (public.can_manage_org(organization_id)) with check (public.can_manage_org(organization_id));
create policy "roles are readable" on public.roles for select to authenticated using (true);
create policy "roles are super admin writable" on public.roles for all to authenticated using (public.is_platform_super_admin()) with check (public.is_platform_super_admin());
create policy "permissions are readable" on public.permissions for select to authenticated using (true);
create policy "permissions are super admin writable" on public.permissions for all to authenticated using (public.is_platform_super_admin()) with check (public.is_platform_super_admin());
create policy "role mappings are readable" on public.role_permission_mappings for select to authenticated using (true);
create policy "role mappings are super admin writable" on public.role_permission_mappings for all to authenticated using (public.is_platform_super_admin()) with check (public.is_platform_super_admin());
create policy "user roles are org scoped" on public.user_roles for select to authenticated using (organization_id is null and profile_id = auth.uid() or organization_id is not null and public.is_org_member(organization_id));
create policy "user roles are manager writable" on public.user_roles for all to authenticated using (public.is_platform_super_admin() or public.can_manage_org(organization_id)) with check (public.is_platform_super_admin() or public.can_manage_org(organization_id));
create policy "preferences are self managed" on public.user_preferences for all to authenticated using (profile_id = auth.uid() or public.is_platform_super_admin()) with check (profile_id = auth.uid() or public.is_platform_super_admin());

create policy "organization users disabled read" on public.organization_users for select to authenticated using (false);
create policy "permission groups disabled read" on public.permission_groups for select to authenticated using (false);
create policy "role permissions disabled read" on public.role_permissions for select to authenticated using (false);
