-- Milestone 3.1: Executive Core Framework.
create extension if not exists pgcrypto;

alter table public.organizations alter column owner_id drop not null;
alter table public.organizations add column if not exists logo_url text;
alter table public.organizations add column if not exists mission text;
alter table public.organizations add column if not exists description text;
alter table public.organizations add column if not exists industry text;
alter table public.organizations add column if not exists status text not null default 'active';
alter table public.organizations add column if not exists primary_color text default '#103F35';
alter table public.organizations add column if not exists secondary_color text default '#C7A24A';
alter table public.organizations add column if not exists website text;
alter table public.organizations add column if not exists domain text;
alter table public.organizations add column if not exists executive text;
alter table public.organizations add column if not exists notes text;

alter table public.projects add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.projects alter column business_id drop not null;
alter table public.tasks add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.tasks add column if not exists description text;
update public.tasks set description = details where description is null;
alter table public.tasks alter column project_id drop not null;
alter table public.tasks add column if not exists assigned_user_id uuid references public.profiles(id) on delete set null;
alter table public.tasks add column if not exists assigned_agent_id uuid;
alter table public.tasks add column if not exists dependencies jsonb not null default '[]'::jsonb;
alter table public.tasks add column if not exists approval_required boolean not null default false;
alter table public.tasks add column if not exists completion_date timestamptz;
alter table public.approvals add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.approvals add column if not exists risk_score integer not null default 0;
alter table public.approvals add column if not exists reason text;
alter table public.approvals drop constraint if exists approvals_status_check;
alter table public.approvals add constraint approvals_status_check check (status in ('pending','approved','rejected','delegated'));

create table if not exists public.agent_registry (id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete set null, name text not null, role text not null, description text, prompt text, tools jsonb not null default '[]'::jsonb, permissions jsonb not null default '[]'::jsonb, approval_required boolean not null default true, memory_enabled boolean not null default false, status text not null default 'draft', version text not null default '1.0.0', health text not null default 'Healthy', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.organization_users (id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade, role text not null default 'Viewer', status text not null default 'active', created_at timestamptz not null default now(), unique(organization_id,user_id));
create table if not exists public.organization_branding (id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete cascade unique, primary_color text not null default '#103F35', secondary_color text not null default '#C7A24A', logo_url text, created_at timestamptz not null default now());
create table if not exists public.notifications (id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade, title text not null, body text, read_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.agent_activity (id uuid primary key default gen_random_uuid(), agent_id uuid references public.agent_registry(id) on delete set null, organization_id uuid references public.organizations(id) on delete cascade, activity_type text not null, summary text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.system_health (id uuid primary key default gen_random_uuid(), service_name text not null unique, connection_status text not null default 'Not Connected', health text not null default 'Healthy', notes text, checked_at timestamptz not null default now());
create table if not exists public.permission_groups (id uuid primary key default gen_random_uuid(), name text not null unique, description text, created_at timestamptz not null default now());
create table if not exists public.role_permissions (id uuid primary key default gen_random_uuid(), role text not null, permission_group_id uuid references public.permission_groups(id) on delete cascade, permission text not null, created_at timestamptz not null default now(), unique(role, permission));
create table if not exists public.approval_history (id uuid primary key default gen_random_uuid(), approval_id uuid references public.approvals(id) on delete cascade, action text not null, actor_id uuid references public.profiles(id) on delete set null, notes text, created_at timestamptz not null default now());

insert into public.organizations (name, slug, mission, description, industry, status, primary_color, secondary_color, website, domain, executive, notes) values
('The Law Library','the-law-library','Make legal education more accessible.','Legal education and research operating company.','Legal Education','active','#103F35','#C7A24A','https://thelawlibrary.example','thelawlibrary.example','Executive Director','Seeded for Milestone 3.1'),
('Golding Compound','golding-compound','Build a resilient executive compound.','Real estate, capital planning, and private operations.','Real Estate','active','#0C2E29','#D9BF72','https://goldingcompound.example','goldingcompound.example','Executive Director','Seeded for Milestone 3.1'),
('YouPassGo','youpassgo','Help learners pass and move forward.','Driving school and local services operations.','Education','active','#1C4F41','#B78A2D','https://youpassgo.example','youpassgo.example','Executive Director','Seeded for Milestone 3.1'),
('Relax With Me','relax-with-me','Create calm, restorative wellness experiences.','Wellness content, services, and customer experience.','Wellness','active','#103F35','#D9BF72','https://relaxwithme.example','relaxwithme.example','Executive Director','Seeded for Milestone 3.1')
on conflict (slug) do update set mission=excluded.mission, description=excluded.description, industry=excluded.industry, status=excluded.status;

insert into public.agent_registry (name, role, description, prompt, tools, permissions, approval_required, memory_enabled, status, version, health) values
('CEO Agent','Executive Strategy','Summarizes priorities, decisions, and risks.','Act as the executive operating partner for Golding OS.','["dashboard","approvals"]','["read_all","recommend"]',true,true,'active','1.0.0','Healthy'),
('Funding Agent','Capital Strategy','Tracks funding workflows and investor readiness.','Support funding strategy without external integrations.','["tasks","approvals"]','["read_finance","draft"]',true,false,'active','1.0.0','Healthy'),
('Legal Research Agent','Legal Research','Organizes legal research tasks and findings.','Support legal research management only.','["tasks","knowledge"]','["read_legal","draft"]',true,true,'active','1.0.0','Healthy'),
('Operations Agent','Operations','Coordinates execution queues and dependencies.','Support operational planning.','["tasks","projects"]','["task_manage"]',false,true,'active','1.0.0','Healthy'),
('Marketing Agent','Marketing','Plans campaigns and content operations.','Support marketing planning.','["tasks","organizations"]','["draft_marketing"]',true,false,'active','1.0.0','Healthy'),
('Finance Agent','Finance','Tracks finance tasks and approval needs.','Support finance planning.','["tasks","approvals"]','["read_finance","draft"]',true,false,'active','1.0.0','Healthy')
on conflict do nothing;

insert into public.system_health (service_name, connection_status, health, notes) values
('GitHub','Not Connected','Healthy','Repository workflow placeholder.'),('Vercel','Not Connected','Healthy','Deployment placeholder.'),('Supabase','Connected','Healthy','Primary database configured by environment.'),('Database','Connected','Healthy','Supabase Postgres schema present.'),('Authentication','Connected','Healthy','Supabase auth shell present.'),('Storage','Not Connected','Healthy','Storage integration deferred.'),('Environment Variables','Connected','Healthy','Runtime variables checked by app.'),('OpenAI','Not Connected','Healthy','Explicitly deferred for this milestone.'),('Google Drive','Not Connected','Healthy','Future integration placeholder.'),('Google Calendar','Not Connected','Healthy','Future integration placeholder.'),('Gmail','Not Connected','Healthy','Future integration placeholder.'),('Twilio','Not Connected','Healthy','Future integration placeholder.'),('Stripe','Not Connected','Healthy','Future integration placeholder.')
on conflict (service_name) do update set connection_status=excluded.connection_status, health=excluded.health, notes=excluded.notes;

alter table public.agent_registry enable row level security;
alter table public.organization_users enable row level security;
alter table public.organization_branding enable row level security;
alter table public.notifications enable row level security;
alter table public.agent_activity enable row level security;
alter table public.system_health enable row level security;
alter table public.permission_groups enable row level security;
alter table public.role_permissions enable row level security;
alter table public.approval_history enable row level security;

drop policy if exists "milestone 3 authenticated organizations" on public.organizations;
create policy "milestone 3 authenticated organizations" on public.organizations for all to authenticated using (public.is_org_member(id)) with check (public.can_manage_org(id));
drop policy if exists "milestone 3 authenticated projects" on public.projects;
create policy "milestone 3 authenticated projects" on public.projects for all to authenticated using (organization_id is not null and public.is_org_member(organization_id)) with check (organization_id is not null and public.is_org_member(organization_id));
drop policy if exists "milestone 3 authenticated tasks" on public.tasks;
create policy "milestone 3 authenticated tasks" on public.tasks for all to authenticated using (organization_id is not null and public.is_org_member(organization_id)) with check (organization_id is not null and public.is_org_member(organization_id));
drop policy if exists "milestone 3 authenticated approvals" on public.approvals;
create policy "milestone 3 authenticated approvals" on public.approvals for all to authenticated using (organization_id is not null and public.is_org_member(organization_id)) with check (organization_id is not null and public.is_org_member(organization_id));

drop policy if exists "authenticated manage agent_registry" on public.agent_registry;
create policy "authenticated manage agent_registry" on public.agent_registry for all to authenticated using (organization_id is not null and public.is_org_member(organization_id)) with check (organization_id is not null and public.is_org_member(organization_id));
drop policy if exists "authenticated manage organization_users" on public.organization_users;
create policy "authenticated manage organization_users" on public.organization_users for all to authenticated using (public.is_org_member(organization_id)) with check (public.can_manage_org(organization_id));
drop policy if exists "authenticated manage organization_branding" on public.organization_branding;
create policy "authenticated manage organization_branding" on public.organization_branding for all to authenticated using (public.is_org_member(organization_id)) with check (public.can_manage_org(organization_id));
drop policy if exists "authenticated manage notifications" on public.notifications;
create policy "authenticated manage notifications" on public.notifications for all to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
drop policy if exists "authenticated manage agent_activity" on public.agent_activity;
create policy "authenticated manage agent_activity" on public.agent_activity for all to authenticated using (organization_id is not null and public.is_org_member(organization_id)) with check (organization_id is not null and public.is_org_member(organization_id));
drop policy if exists "authenticated manage system_health" on public.system_health;
create policy "authenticated manage system_health" on public.system_health for select to authenticated using (auth.uid() is not null);
drop policy if exists "authenticated manage permission_groups" on public.permission_groups;
create policy "authenticated manage permission_groups" on public.permission_groups for select to authenticated using (auth.uid() is not null);
drop policy if exists "authenticated manage role_permissions" on public.role_permissions;
create policy "authenticated manage role_permissions" on public.role_permissions for select to authenticated using (auth.uid() is not null);
drop policy if exists "authenticated manage approval_history" on public.approval_history;
create policy "authenticated manage approval_history" on public.approval_history for select to authenticated using (exists (select 1 from public.approvals a where a.id = approval_id and public.is_org_member(a.organization_id)));

insert into public.permission_groups (name, description) values ('Executive Core','Milestone 3.1 dashboard, registry, task, approval, and health permissions') on conflict (name) do nothing;
insert into public.role_permissions (role, permission_group_id, permission)
select role_name, pg.id, permission from public.permission_groups pg cross join (values
('Super Admin','*'),('Organization Admin','organizations:manage'),('Organization Admin','agents:manage'),('Organization Admin','tasks:manage'),('Organization Admin','approvals:manage'),('Executive Director','approvals:manage'),('Manager','tasks:manage'),('Staff','tasks:manage'),('Viewer','health:view'),('Volunteer','tasks:view'),('Contractor','tasks:view')) as rp(role_name, permission)
where pg.name='Executive Core' on conflict (role, permission) do nothing;

insert into public.agent_activity (activity_type, summary) values
('brief.created','Executive brief generated from live operating records.'),('registry.seeded','Business and AI workforce registries seeded.'),('health.checked','System health placeholders loaded for deferred integrations.')
on conflict do nothing;

-- Milestone 4.1: Active organization context, identity RLS hardening, and org-scoped agents.
create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'Viewer',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'Viewer',
  invited_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'Viewer',
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, profile_id, role)
);

create table if not exists public.user_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  active_organization_id uuid references public.organizations(id) on delete set null,
  theme text not null default 'executive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences add column if not exists active_organization_id uuid references public.organizations(id) on delete set null;
create index if not exists user_preferences_active_organization_id_idx on public.user_preferences(active_organization_id);
create index if not exists organization_memberships_profile_id_idx on public.organization_memberships(profile_id);
create index if not exists organization_memberships_organization_id_idx on public.organization_memberships(organization_id);
create index if not exists organization_invitations_organization_id_idx on public.organization_invitations(organization_id);
create index if not exists user_roles_profile_organization_idx on public.user_roles(profile_id, organization_id);

insert into public.organization_memberships (organization_id, profile_id, role)
select id, owner_id, 'Organization Admin' from public.organizations where owner_id is not null
on conflict (organization_id, profile_id) do nothing;

insert into public.organization_memberships (organization_id, profile_id, role, status)
select organization_id, user_id, role, status from public.organization_users
where organization_id is not null and user_id is not null
on conflict (organization_id, profile_id) do update set role = excluded.role, status = excluded.status;

update public.agent_registry set organization_id = (select id from public.organizations order by created_at asc limit 1) where organization_id is null;
alter table public.agent_registry alter column organization_id set not null;
update public.agent_activity set organization_id = (select id from public.organizations order by created_at asc limit 1) where organization_id is null;
alter table public.agent_activity alter column organization_id set not null;

create or replace function public.is_platform_super_admin(profile_uuid uuid default auth.uid())
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where profile_id = profile_uuid and role = 'Super Admin' and organization_id is null);
$$;

create or replace function public.is_org_member(target_organization_id uuid, profile_uuid uuid default auth.uid())
returns boolean language sql security definer set search_path = public as $$
  select public.is_platform_super_admin(profile_uuid) or exists (
    select 1 from public.organization_memberships
    where organization_id = target_organization_id and profile_id = profile_uuid and status = 'active'
  );
$$;

create or replace function public.can_manage_org(target_organization_id uuid, profile_uuid uuid default auth.uid())
returns boolean language sql security definer set search_path = public as $$
  select public.is_platform_super_admin(profile_uuid) or exists (
    select 1 from public.organization_memberships
    where organization_id = target_organization_id and profile_id = profile_uuid and status = 'active'
      and role in ('Organization Admin','Executive Director')
  );
$$;

create or replace function public.get_active_organization(profile_uuid uuid)
returns public.organizations language plpgsql security definer set search_path = public as $$
declare org public.organizations%rowtype;
declare chosen uuid;
begin
  if profile_uuid <> auth.uid() and not public.is_platform_super_admin(auth.uid()) then raise exception 'unauthorized'; end if;
  select active_organization_id into chosen from public.user_preferences where profile_id = profile_uuid;
  if chosen is null or not public.is_org_member(chosen, profile_uuid) then
    select organization_id into chosen from public.organization_memberships where profile_id = profile_uuid and status = 'active' order by created_at asc limit 1;
    insert into public.user_preferences (profile_id, active_organization_id) values (profile_uuid, chosen)
    on conflict (profile_id) do update set active_organization_id = excluded.active_organization_id, updated_at = now();
  end if;
  select * into org from public.organizations where id = chosen;
  return org;
end; $$;

create or replace function public.switch_active_organization(profile_uuid uuid, organization_uuid uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if profile_uuid <> auth.uid() and not public.is_platform_super_admin(auth.uid()) then
    return jsonb_build_object('success', false, 'error', 'unauthorized');
  end if;
  if not public.is_org_member(organization_uuid, profile_uuid) then
    return jsonb_build_object('success', false, 'error', 'membership_required');
  end if;
  insert into public.user_preferences (profile_id, active_organization_id) values (profile_uuid, organization_uuid)
  on conflict (profile_id) do update set active_organization_id = excluded.active_organization_id, updated_at = now();
  insert into public.audit_logs (organization_id, actor_id, action, entity_table, entity_id)
  values (organization_uuid, profile_uuid, 'organization.switched', 'organizations', organization_uuid);
  return jsonb_build_object('success', true, 'active_organization_id', organization_uuid);
end; $$;

create or replace function public.validate_email(email text) returns boolean language sql immutable as $$ select email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'; $$;
create or replace function public.validate_invitation_expiration(expires_at timestamptz) returns boolean language sql stable as $$ select expires_at > now(); $$;
create or replace function public.validate_uuid(value uuid) returns boolean language sql immutable as $$ select value is not null; $$;

alter table public.organization_memberships enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "milestone 3 authenticated organizations" on public.organizations;
drop policy if exists "authenticated manage organization_users" on public.organization_users;
drop policy if exists "authenticated manage agent_registry" on public.agent_registry;
drop policy if exists "authenticated manage agent_activity" on public.agent_activity;
drop policy if exists "authenticated manage notifications" on public.notifications;
drop policy if exists "authenticated manage permission_groups" on public.permission_groups;
drop policy if exists "authenticated manage role_permissions" on public.role_permissions;
drop policy if exists "milestone 3 authenticated projects" on public.projects;
drop policy if exists "milestone 3 authenticated tasks" on public.tasks;
drop policy if exists "milestone 3 authenticated approvals" on public.approvals;

create policy "organizations are membership scoped" on public.organizations for select to authenticated using (public.is_org_member(id));
create policy "organization admins manage organizations" on public.organizations for all to authenticated using (public.can_manage_org(id)) with check (public.can_manage_org(id));
create policy "memberships visible to members" on public.organization_memberships for select to authenticated using (public.is_org_member(organization_id));
create policy "admins manage memberships" on public.organization_memberships for all to authenticated using (public.can_manage_org(organization_id)) with check (public.can_manage_org(organization_id));
create policy "invitations visible to members" on public.organization_invitations for select to authenticated using (public.is_org_member(organization_id));
create policy "admins manage invitations" on public.organization_invitations for all to authenticated using (public.can_manage_org(organization_id) and public.validate_email(email) and public.validate_invitation_expiration(expires_at)) with check (public.can_manage_org(organization_id) and public.validate_email(email) and public.validate_invitation_expiration(expires_at));
create policy "user roles visible to members" on public.user_roles for select to authenticated using (organization_id is null and public.is_platform_super_admin(auth.uid()) or public.is_org_member(organization_id));
create policy "admins assign organization roles" on public.user_roles for all to authenticated using (public.can_manage_org(organization_id)) with check (public.can_manage_org(organization_id));
create policy "users manage own preferences" on public.user_preferences for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid() and (active_organization_id is null or public.is_org_member(active_organization_id)));

create policy "projects are direct organization scoped" on public.projects for all to authenticated using (organization_id is not null and public.is_org_member(organization_id)) with check (organization_id is not null and public.is_org_member(organization_id));
create policy "tasks are direct organization scoped" on public.tasks for all to authenticated using (organization_id is not null and public.is_org_member(organization_id)) with check (organization_id is not null and public.is_org_member(organization_id));
create policy "approvals are direct organization scoped" on public.approvals for all to authenticated using (organization_id is not null and public.is_org_member(organization_id)) with check (organization_id is not null and public.is_org_member(organization_id));
create policy "agents are organization scoped" on public.agent_registry for all to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "agent activity is organization scoped" on public.agent_activity for all to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
