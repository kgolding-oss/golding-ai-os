create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  status text not null default 'active',
  description text,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'planning',
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  business_id uuid references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'open',
  priority text not null default 'medium',
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'pending',
  priority text not null default 'medium',
  requested_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.agent_memory (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  agent_name text not null,
  memory_key text not null,
  memory_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (owner_id, agent_name, memory_key)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  entity_type text,
  entity_id uuid,
  action text not null,
  created_at timestamptz not null default now()
);

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

create policy "profiles own rows" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "organizations own rows" on public.organizations for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "businesses own rows" on public.businesses for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "projects own rows" on public.projects for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "tasks own rows" on public.tasks for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "approvals own rows" on public.approvals for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "documents own rows" on public.documents for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "knowledge own rows" on public.knowledge for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "agent_memory own rows" on public.agent_memory for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "audit_logs own rows" on public.audit_logs for select using (owner_id = auth.uid());
