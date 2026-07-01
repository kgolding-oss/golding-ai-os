-- Milestone 10: Law Library OS production activation schema.
create table if not exists public.law_library_operational_records (
  id text primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  division text not null check (division in ('executive','legal','funding','education','partnership','knowledge')),
  record_type text not null,
  display_name text not null,
  workflow_state text not null check (workflow_state in ('intake','triage','active','waiting_on_client','waiting_on_agency','approval_required','submitted','closed')),
  owner_agent text not null,
  next_action text not null,
  approval_gate text check (approval_gate in ('legal_filing','financial_transaction','email','publishing','grant_submission','sponsor_outreach')),
  knowledge_sources text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists law_library_operational_records_org_division_idx
  on public.law_library_operational_records(organization_id, division, workflow_state);

comment on table public.law_library_operational_records is
  'Production Law Library OS records. Store operational metadata only; do not seed fabricated client information.';
