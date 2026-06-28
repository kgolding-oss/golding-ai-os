-- Milestone 2: Golding AI OS authentication and operating data foundation.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'operator' check (role in ('owner', 'admin', 'operator', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  lane text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  summary text,
  status text not null default 'planned' check (status in ('planned', 'active', 'blocked', 'complete', 'archived')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  details text,
  status text not null default 'todo' check (status in ('todo', 'doing', 'review', 'done', 'blocked')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  requested_by uuid references public.profiles(id) on delete set null,
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decision_notes text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  document_type text not null default 'note',
  storage_path text,
  content text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_document_id uuid references public.documents(id) on delete set null,
  topic text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_memory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  memory_key text not null,
  memory_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, memory_key)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organizations
    where id = target_organization_id and owner_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.businesses enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.approvals enable row level security;
alter table public.documents enable row level security;
alter table public.knowledge enable row level security;
alter table public.agent_memory enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles are self managed" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "organizations are owner managed" on public.organizations for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "businesses are organization scoped" on public.businesses for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "projects are organization scoped" on public.projects for all using (exists (select 1 from public.businesses b where b.id = business_id and public.is_org_member(b.organization_id))) with check (exists (select 1 from public.businesses b where b.id = business_id and public.is_org_member(b.organization_id)));
create policy "tasks are organization scoped" on public.tasks for all using (exists (select 1 from public.projects p join public.businesses b on b.id = p.business_id where p.id = project_id and public.is_org_member(b.organization_id))) with check (exists (select 1 from public.projects p join public.businesses b on b.id = p.business_id where p.id = project_id and public.is_org_member(b.organization_id)));
create policy "approvals are organization scoped" on public.approvals for all using (task_id is null or exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id join public.businesses b on b.id = p.business_id where t.id = task_id and public.is_org_member(b.organization_id))) with check (task_id is null or exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id join public.businesses b on b.id = p.business_id where t.id = task_id and public.is_org_member(b.organization_id)));
create policy "documents are organization scoped" on public.documents for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "knowledge is organization scoped" on public.knowledge for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "agent memory is organization scoped" on public.agent_memory for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "audit logs are organization scoped" on public.audit_logs for select using (organization_id is null or public.is_org_member(organization_id));
create policy "audit logs can be inserted by members" on public.audit_logs for insert with check (organization_id is null or public.is_org_member(organization_id));
