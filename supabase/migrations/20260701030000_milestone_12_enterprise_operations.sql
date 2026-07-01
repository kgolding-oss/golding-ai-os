-- Milestone 12: Enterprise Operations & Autonomous Execution.
-- Extends the existing architecture with organization-scoped enterprise workspaces,
-- connected knowledge, approval-gated workflows, executive analytics, and AI workforce visibility.

alter table public.organizations add column if not exists workspace_type text not null default 'enterprise';
alter table public.organizations add column if not exists capabilities jsonb not null default '["Organizations","Projects","Tasks","Documents","Knowledge","CRM","Finance","Reporting","Users","Permissions"]'::jsonb;

create table if not exists public.enterprise_workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade unique,
  name text not null,
  capabilities jsonb not null default '[]'::jsonb,
  operational_modules jsonb not null default '[]'::jsonb,
  approval_policy jsonb not null default '{"external_actions":"human_approval_required","high_risk_actions":"human_approval_required"}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_graph_nodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  node_type text not null,
  source_table text,
  source_id uuid,
  label text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, node_type, source_table, source_id)
);

create table if not exists public.knowledge_graph_edges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  from_node_id uuid not null references public.knowledge_graph_nodes(id) on delete cascade,
  to_node_id uuid not null references public.knowledge_graph_nodes(id) on delete cascade,
  relationship_type text not null,
  confidence numeric(5,2) not null default 1.0,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, from_node_id, to_node_id, relationship_type)
);

create table if not exists public.enterprise_workflow_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  workflow_type text not null,
  coordinator_agent text not null default 'Chief of Staff',
  steps jsonb not null default '[]'::jsonb,
  approval_required boolean not null default true,
  external_action_policy text not null default 'approval_required',
  status text not null default 'ready',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, workflow_type)
);

create table if not exists public.executive_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  report_type text not null,
  reporting_period text not null,
  synthesis text not null,
  source_counts jsonb not null default '{}'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  approval_summary jsonb not null default '{}'::jsonb,
  generated_by text not null default 'Executive Intelligence Engine',
  created_at timestamptz not null default now()
);

create table if not exists public.enterprise_kpis (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  domain text not null,
  metric_name text not null,
  metric_value numeric not null default 0,
  status text not null default 'observed',
  source_table text,
  measured_at timestamptz not null default now(),
  unique (organization_id, domain, metric_name, measured_at)
);

create table if not exists public.ai_workforce_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.agent_registry(id) on delete set null,
  event_type text not null,
  delegation_chain jsonb not null default '[]'::jsonb,
  queue_name text,
  status text not null default 'queued',
  recommendation text,
  approval_id uuid references public.approvals(id) on delete set null,
  execution_history jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

insert into public.organizations (name, slug, mission, description, industry, status, capabilities)
values
('TLC Creations','tlc-creations','Produce creative services and products with accountable operations.','Creative production workspace.','Creative Services','active','["Organizations","Projects","Tasks","Documents","Knowledge","CRM","Finance","Reporting","Users","Permissions"]'),
('Musa Links','musa-links','Coordinate partnership and link-building operations.','Partnership and referral workspace.','Partnerships','active','["Organizations","Projects","Tasks","Documents","Knowledge","CRM","Finance","Reporting","Users","Permissions"]'),
('YardYank','yardyank','Operate property and yard-service workflows.','Property services workspace.','Property Services','active','["Organizations","Projects","Tasks","Documents","Knowledge","CRM","Finance","Reporting","Users","Permissions"]'),
('J&J Catering','j-and-j-catering','Run catering operations with finance and customer visibility.','Catering operations workspace.','Food Services','active','["Organizations","Projects","Tasks","Documents","Knowledge","CRM","Finance","Reporting","Users","Permissions"]')
on conflict (slug) do update set capabilities=excluded.capabilities, status='active', updated_at=now();

insert into public.enterprise_workspaces (organization_id, name, capabilities, operational_modules)
select id, name, capabilities, '["Organizations","Projects","Tasks","Documents","Knowledge","CRM","Finance","Reporting","Users","Permissions"]'::jsonb
from public.organizations
where slug in ('the-law-library','golding-compound','relax-with-me','youpassgo','tlc-creations','musa-links','yardyank','j-and-j-catering')
on conflict (organization_id) do update set capabilities=excluded.capabilities, operational_modules=excluded.operational_modules, updated_at=now();

insert into public.enterprise_workflow_templates (organization_id, name, workflow_type, steps)
select o.id, w.name, w.workflow_type, w.steps::jsonb
from public.organizations o
cross join (values
('Grant lifecycle','grant_lifecycle','["research","draft","finance_review","executive_approval","external_submission"]'),
('Sponsor lifecycle','sponsor_lifecycle','["crm_qualification","funding_strategy","executive_approval","external_outreach"]'),
('Case lifecycle','case_lifecycle','["intake","research","legal_review","approval","case_action"]'),
('Volunteer onboarding','volunteer_onboarding','["application","screening","approval","training","assignment"]'),
('Board meetings','board_meetings','["agenda","materials","approval","meeting","minutes"]'),
('Project approvals','project_approvals','["proposal","risk_review","finance_review","executive_approval"]'),
('Media production','media_production','["brief","production","legal_review","approval","publishing"]'),
('Course publishing','course_publishing','["curriculum","media","education_review","approval","publishing"]')
) as w(name, workflow_type, steps)
where o.slug in ('the-law-library','golding-compound','relax-with-me','youpassgo','tlc-creations','musa-links','yardyank','j-and-j-catering')
on conflict (organization_id, workflow_type) do update set steps=excluded.steps, approval_required=true, updated_at=now();

alter table public.enterprise_workspaces enable row level security;
alter table public.knowledge_graph_nodes enable row level security;
alter table public.knowledge_graph_edges enable row level security;
alter table public.enterprise_workflow_templates enable row level security;
alter table public.executive_reports enable row level security;
alter table public.enterprise_kpis enable row level security;
alter table public.ai_workforce_events enable row level security;

do $$
declare t text;
begin
  foreach t in array array['enterprise_workspaces','knowledge_graph_nodes','knowledge_graph_edges','enterprise_workflow_templates','executive_reports','enterprise_kpis','ai_workforce_events'] loop
    execute format('drop policy if exists %I_org_member_all on public.%I', t, t);
    execute format('create policy %I_org_member_all on public.%I for all to authenticated using (public.is_org_member(organization_id, auth.uid())) with check (organization_id is null or public.is_org_member(organization_id, auth.uid()))', t, t);
  end loop;
end $$;

create index if not exists enterprise_workspaces_organization_idx on public.enterprise_workspaces(organization_id);
create index if not exists knowledge_graph_nodes_organization_type_idx on public.knowledge_graph_nodes(organization_id, node_type);
create index if not exists knowledge_graph_edges_organization_type_idx on public.knowledge_graph_edges(organization_id, relationship_type);
create index if not exists enterprise_workflow_templates_organization_type_idx on public.enterprise_workflow_templates(organization_id, workflow_type);
create index if not exists executive_reports_organization_created_idx on public.executive_reports(organization_id, created_at desc);
create index if not exists enterprise_kpis_organization_domain_idx on public.enterprise_kpis(organization_id, domain, measured_at desc);
create index if not exists ai_workforce_events_organization_created_idx on public.ai_workforce_events(organization_id, created_at desc);
