-- Schema reconciliation for persistence tables missing from prior persistence migrations.
create extension if not exists pgcrypto;

create table if not exists public.executive_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid null references public.profiles(id) on delete set null,
  agent_id text null,
  workflow_id text null,
  correlation_id text null,
  status text not null,
  snapshot_type text null,
  subject_id text null,
  payload jsonb not null default '{}'::jsonb,
  result jsonb null,
  error_details jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists public.autonomous_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid null references public.profiles(id) on delete set null,
  agent_id text null,
  workflow_id text null,
  correlation_id text null,
  status text not null,
  plan_id text null,
  session_id text null,
  event_type text null,
  payload jsonb not null default '{}'::jsonb,
  result jsonb null,
  error_details jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists executive_snapshots_organization_created_idx on public.executive_snapshots(organization_id, created_at desc);
create index if not exists autonomous_history_organization_created_idx on public.autonomous_history(organization_id, created_at desc);

alter table public.executive_snapshots enable row level security;
alter table public.autonomous_history enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['executive_snapshots', 'autonomous_history'] loop
    execute format('drop policy if exists %I_org_member_select on public.%I', t, t);
    execute format('create policy %I_org_member_select on public.%I for select using (public.is_org_member(organization_id, auth.uid()))', t, t);
    execute format('drop policy if exists %I_org_member_insert on public.%I', t, t);
    execute format('create policy %I_org_member_insert on public.%I for insert with check (public.is_org_member(organization_id, auth.uid()))', t, t);
    execute format('drop policy if exists %I_org_member_update on public.%I', t, t);
    execute format('create policy %I_org_member_update on public.%I for update using (public.is_org_member(organization_id, auth.uid())) with check (public.is_org_member(organization_id, auth.uid()))', t, t);
  end loop;
end $$;
