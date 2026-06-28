-- Milestone 3.2: Executive Intelligence Layer notification readiness.
create extension if not exists pgcrypto;

alter table public.notifications add column if not exists status text not null default 'unread';
alter table public.notifications add column if not exists priority text not null default 'medium';
alter table public.notifications add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.notifications add column if not exists updated_by uuid references public.profiles(id) on delete set null;
alter table public.notifications add column if not exists updated_at timestamptz not null default now();

alter table public.notifications drop constraint if exists notifications_status_check;
alter table public.notifications add constraint notifications_status_check check (status in ('unread','read','dismissed'));
alter table public.notifications drop constraint if exists notifications_priority_check;
alter table public.notifications add constraint notifications_priority_check check (priority in ('low','medium','high','urgent'));

create index if not exists notifications_user_status_idx on public.notifications(user_id, status, created_at desc);
create index if not exists notifications_organization_idx on public.notifications(organization_id, created_at desc);
create index if not exists tasks_organization_status_due_idx on public.tasks(organization_id, status, due_at);
create index if not exists approvals_organization_status_idx on public.approvals(organization_id, status, created_at desc);
create index if not exists agent_activity_organization_created_idx on public.agent_activity(organization_id, created_at desc);
