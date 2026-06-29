-- Milestone 4.1: Active organization wiring.
create extension if not exists pgcrypto;

create table if not exists public.user_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences
  add column if not exists active_organization_id uuid references public.organizations(id) on delete set null;
create index if not exists user_preferences_active_organization_id_idx on public.user_preferences(active_organization_id);

alter table public.agent_registry add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.agent_activity add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

update public.agent_registry set organization_id = (select id from public.organizations order by created_at asc limit 1) where organization_id is null;
update public.agent_activity set organization_id = (select id from public.organizations order by created_at asc limit 1) where organization_id is null;

create or replace function public.is_platform_super_admin(profile_uuid uuid default auth.uid())
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.profile_id = profile_uuid
      and ur.organization_id is null
      and r.name = 'Platform Super Admin'
  );
$$;

create or replace function public.is_org_member(target_organization_id uuid, profile_uuid uuid default auth.uid())
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_memberships om
    where om.organization_id = target_organization_id
      and om.profile_id = profile_uuid
      and coalesce(om.status, 'active') = 'active'
  ) or public.is_platform_super_admin(profile_uuid);
$$;

create or replace function public.get_active_organization(profile_uuid uuid)
returns setof public.organizations
language plpgsql security definer set search_path = public as $$
declare
  selected_org uuid;
begin
  if profile_uuid <> auth.uid() and not public.is_platform_super_admin(auth.uid()) then
    return;
  end if;

  select active_organization_id into selected_org from public.user_preferences where profile_id = profile_uuid;

  if selected_org is null or not public.is_org_member(selected_org, profile_uuid) then
    select om.organization_id into selected_org
    from public.organization_memberships om
    join public.organizations o on o.id = om.organization_id
    where om.profile_id = profile_uuid
      and coalesce(om.status, 'active') = 'active'
      and coalesce(o.status, 'active') = 'active'
    order by om.created_at asc
    limit 1;

    insert into public.user_preferences(profile_id, active_organization_id)
    values (profile_uuid, selected_org)
    on conflict (profile_id) do update set active_organization_id = excluded.active_organization_id, updated_at = now();
  end if;

  if selected_org is null or not public.is_org_member(selected_org, profile_uuid) then
    return;
  end if;

  return query select o.* from public.organizations o where o.id = selected_org;
end;
$$;

create or replace function public.switch_active_organization(profile_uuid uuid, organization_uuid uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if profile_uuid <> auth.uid() and not public.is_platform_super_admin(auth.uid()) then
    return jsonb_build_object('success', false, 'error', 'membership_required');
  end if;

  if not public.is_org_member(organization_uuid, profile_uuid) then
    return jsonb_build_object('success', false, 'error', 'membership_required');
  end if;

  insert into public.user_preferences(profile_id, active_organization_id)
  values (profile_uuid, organization_uuid)
  on conflict (profile_id) do update set active_organization_id = excluded.active_organization_id, updated_at = now();

  insert into public.audit_logs(organization_id, actor_id, action, entity_table, entity_id, metadata)
  values (organization_uuid, auth.uid(), 'organization.switched', 'organizations', organization_uuid, jsonb_build_object('active_organization_id', organization_uuid));

  return jsonb_build_object('success', true, 'active_organization_id', organization_uuid);
end;
$$;

alter table public.user_preferences enable row level security;
alter table public.organization_memberships enable row level security;

drop policy if exists "user preferences self select" on public.user_preferences;
drop policy if exists "user preferences self insert" on public.user_preferences;
drop policy if exists "user preferences self update" on public.user_preferences;
drop policy if exists "memberships are visible to fellow members" on public.organization_memberships;
drop policy if exists "organizations are membership scoped" on public.organizations;
drop policy if exists "projects are active organization scoped" on public.projects;
drop policy if exists "tasks are active organization scoped" on public.tasks;
drop policy if exists "approvals are active organization scoped" on public.approvals;
drop policy if exists "agent registry is active organization scoped" on public.agent_registry;
drop policy if exists "agent activity is active organization scoped" on public.agent_activity;
drop policy if exists "organization invitations are organization scoped" on public.organization_invitations;
drop policy if exists "user roles are organization scoped" on public.user_roles;

create policy "user preferences self select" on public.user_preferences for select to authenticated
  using (profile_id = auth.uid() or public.is_platform_super_admin(auth.uid()));
create policy "user preferences self insert" on public.user_preferences for insert to authenticated
  with check ((profile_id = auth.uid() or public.is_platform_super_admin(auth.uid())) and (active_organization_id is null or public.is_org_member(active_organization_id, profile_id)));
create policy "user preferences self update" on public.user_preferences for update to authenticated
  using (profile_id = auth.uid() or public.is_platform_super_admin(auth.uid()))
  with check ((profile_id = auth.uid() or public.is_platform_super_admin(auth.uid())) and (active_organization_id is null or public.is_org_member(active_organization_id, profile_id)));

create policy "memberships are visible to fellow members" on public.organization_memberships for select to authenticated
  using (public.is_org_member(organization_id, auth.uid()));

-- Replace broad milestone policies with membership-scoped access.
drop policy if exists "milestone 3 authenticated organizations" on public.organizations;
drop policy if exists "milestone 3 authenticated projects" on public.projects;
drop policy if exists "milestone 3 authenticated tasks" on public.tasks;
drop policy if exists "milestone 3 authenticated approvals" on public.approvals;
drop policy if exists "authenticated manage agent_registry" on public.agent_registry;
drop policy if exists "authenticated manage agent_activity" on public.agent_activity;

create policy "organizations are membership scoped" on public.organizations for all to authenticated using (public.is_org_member(id, auth.uid())) with check (public.is_org_member(id, auth.uid()));
create policy "projects are active organization scoped" on public.projects for all to authenticated using (public.is_org_member(organization_id, auth.uid())) with check (public.is_org_member(organization_id, auth.uid()));
create policy "tasks are active organization scoped" on public.tasks for all to authenticated using (public.is_org_member(organization_id, auth.uid())) with check (public.is_org_member(organization_id, auth.uid()));
create policy "approvals are active organization scoped" on public.approvals for all to authenticated using (public.is_org_member(organization_id, auth.uid())) with check (public.is_org_member(organization_id, auth.uid()));
create policy "agent registry is active organization scoped" on public.agent_registry for all to authenticated using (public.is_org_member(organization_id, auth.uid())) with check (public.is_org_member(organization_id, auth.uid()));
create policy "agent activity is active organization scoped" on public.agent_activity for all to authenticated using (public.is_org_member(organization_id, auth.uid())) with check (public.is_org_member(organization_id, auth.uid()));

create policy "organization invitations are organization scoped" on public.organization_invitations for all to authenticated using (public.is_org_member(organization_id, auth.uid())) with check (public.is_org_member(organization_id, auth.uid()));
create policy "user roles are organization scoped" on public.user_roles for all to authenticated using (public.is_org_member(organization_id, auth.uid()) or public.is_platform_super_admin(auth.uid())) with check (public.is_org_member(organization_id, auth.uid()) or public.is_platform_super_admin(auth.uid()));
