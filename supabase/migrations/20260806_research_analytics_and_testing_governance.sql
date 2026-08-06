-- MOOVE: Supabase-first research analytics and testing governance.
-- Additive, idempotent, and safe to run after the existing 20260805 migrations.

alter table public.feedback_submissions
  add column if not exists bug_experience text check (bug_experience in ('none', 'minor', 'moderate', 'major')),
  add column if not exists bug_description text;

create index if not exists feedback_submissions_user_submitted_idx
  on public.feedback_submissions (user_id, submitted_at desc);

-- One current configuration, including the editable validation framework.
create table if not exists public.testing_configurations (
  id text primary key default 'current' check (id = 'current'),
  session_id text not null,
  prototype_version text not null,
  user_group text not null default '',
  testing_environment text not null default '',
  study_start_date date,
  target_participants integer check (target_participants is null or target_participants > 0),
  testing_objective text not null default '',
  overall_success_criteria text not null default '',
  validation_assumptions jsonb not null default '[]'::jsonb,
  evaluation_metrics jsonb not null default '[]'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testing_action_plans (
  id uuid primary key default gen_random_uuid(),
  issue text not null,
  priority text not null default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  suggested_solution text not null default '',
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Done')),
  retest_required boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.testing_iterations (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  testing_cycle text not null default '',
  improvements_made text not null default '',
  retesting_status text not null default 'Pending' check (retesting_status in ('Pending', 'In Progress', 'Complete')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists testing_action_plans_active_idx on public.testing_action_plans (created_at desc) where deleted_at is null;
create index if not exists testing_iterations_active_idx on public.testing_iterations (created_at desc) where deleted_at is null;

-- The pre-existing update_updated_at() function is reused by every new record type.
drop trigger if exists testing_configurations_updated_at on public.testing_configurations;
create trigger testing_configurations_updated_at before update on public.testing_configurations for each row execute function public.update_updated_at();
drop trigger if exists testing_action_plans_updated_at on public.testing_action_plans;
create trigger testing_action_plans_updated_at before update on public.testing_action_plans for each row execute function public.update_updated_at();
drop trigger if exists testing_iterations_updated_at on public.testing_iterations;
create trigger testing_iterations_updated_at before update on public.testing_iterations for each row execute function public.update_updated_at();

alter table public.testing_configurations enable row level security;
alter table public.testing_action_plans enable row level security;
alter table public.testing_iterations enable row level security;

drop policy if exists "testing_config_select_authenticated" on public.testing_configurations;
create policy "testing_config_select_authenticated" on public.testing_configurations for select to authenticated using (true);
drop policy if exists "testing_config_admin_write" on public.testing_configurations;
create policy "testing_config_admin_write" on public.testing_configurations for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "testing_action_plans_admin_only" on public.testing_action_plans;
create policy "testing_action_plans_admin_only" on public.testing_action_plans for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "testing_iterations_admin_only" on public.testing_iterations;
create policy "testing_iterations_admin_only" on public.testing_iterations for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.testing_configurations to authenticated;
grant select, insert, update on public.testing_action_plans, public.testing_iterations to authenticated;

-- Publish feedback inserts/updates so dashboards can refresh without browser storage.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'feedback_submissions') then
    alter publication supabase_realtime add table public.feedback_submissions;
  end if;
end $$;
