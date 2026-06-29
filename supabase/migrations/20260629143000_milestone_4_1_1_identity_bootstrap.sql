-- Milestone 4.1.1: Identity bootstrap and release verification foundation.
-- Patch migration. Requires the clean identity baseline and active organization migration.

create extension if not exists pgcrypto;

-- Ensure every Supabase Auth user has a public profile row.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)), ''),
    'operator'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_user_profile();

-- Backfill profiles for existing authenticated users.
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  coalesce(u.email, ''),
  nullif(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', split_part(coalesce(u.email, ''), '@', 1)), ''),
  'operator'
from auth.users u
on conflict (id) do update
set email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();

-- If legacy organizations already exist without profile-backed owners, attach the first profile as owner.
with first_profile as (
  select id from public.profiles order by created_at asc limit 1
)
update public.organizations o
set owner_id = fp.id,
    updated_at = now()
from first_profile fp
where o.owner_id is null;

-- Ensure at least one organization exists for a fresh install.
insert into public.organizations (owner_id, name, slug, mission, description, industry, status, primary_color, secondary_color)
select
  p.id,
  'The Law Library',
  'the-law-library',
  'AI-assisted legal education and operating support.',
  'Default organization workspace for Golding AI OS.',
  'Legal education technology',
  'active',
  '#103F35',
  '#C7A24A'
from public.profiles p
where not exists (select 1 from public.organizations)
order by p.created_at asc
limit 1;

-- Ensure the first available profile is an active member of every owned organization.
insert into public.organization_memberships (organization_id, profile_id, role_id, status)
select
  o.id,
  o.owner_id,
  r.id,
  'active'
from public.organizations o
left join public.roles r on r.name = 'Organization Admin'
where o.owner_id is not null
on conflict (organization_id, profile_id) do update
set role_id = coalesce(public.organization_memberships.role_id, excluded.role_id),
    status = 'active',
    updated_at = now();

-- Ensure the first profile has platform super admin for the bootstrap install.
insert into public.user_roles (profile_id, organization_id, role_id, assigned_by)
select
  p.id,
  null,
  r.id,
  p.id
from public.profiles p
join public.roles r on r.name = 'Platform Super Admin'
where not exists (
  select 1
  from public.user_roles ur
  join public.roles existing_role on existing_role.id = ur.role_id
  where ur.organization_id is null
    and existing_role.name = 'Platform Super Admin'
)
order by p.created_at asc
limit 1
on conflict do nothing;

-- Create default preferences for every profile, using their first active membership where available.
insert into public.user_preferences (profile_id, active_organization_id)
select
  p.id,
  (
    select om.organization_id
    from public.organization_memberships om
    where om.profile_id = p.id
      and om.status = 'active'
    order by om.created_at asc
    limit 1
  ) as active_organization_id
from public.profiles p
on conflict (profile_id) do update
set active_organization_id = coalesce(public.user_preferences.active_organization_id, excluded.active_organization_id),
    updated_at = now();

-- Release verification helper: returns one row with counts needed before preview/merge.
create or replace view public.identity_bootstrap_health as
select
  (select count(*) from public.profiles) as profiles_count,
  (select count(*) from public.organizations) as organizations_count,
  (select count(*) from public.organization_memberships) as memberships_count,
  (select count(*) from public.user_roles) as user_roles_count,
  (select count(*) from public.user_preferences) as preferences_count,
  (select count(*) from public.profiles p where not exists (select 1 from public.user_preferences up where up.profile_id = p.id)) as profiles_missing_preferences,
  (select count(*) from public.profiles p where not exists (select 1 from public.organization_memberships om where om.profile_id = p.id and om.status = 'active')) as profiles_missing_membership;
