-- MOOVE SSOT migration. Run after 20260805_security_and_data_integrity.sql.
-- It is additive and safe to run more than once.

create table if not exists public.driver_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  driver_type text, daily_driving_hours text, driving_schedule text[] not null default '{}',
  problem_areas text[] not null default '{}',
  reminder_interval_minutes integer check (reminder_interval_minutes between 5 and 240),
  reminder_style text check (reminder_style in ('popup', 'sound', 'vibration', 'silent')),
  warmup_preference text check (warmup_preference in ('always', 'sometimes', 'skip')),
  smart_notifications_enabled boolean not null default true, completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.driving_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in ('started','paused','resumed','stopped','completed','warmup_completed','reminder_triggered','reminder_acknowledged','break_started','break_ended','exercise_completed','exercise_skipped')),
  occurred_at timestamptz not null default now(),
  elapsed_seconds integer check (elapsed_seconds is null or elapsed_seconds >= 0),
  payload jsonb not null default '{}'::jsonb
);

alter table public.driving_sessions
  add column if not exists status text not null default 'active' check (status in ('active','paused','completed','abandoned')),
  add column if not exists driving_seconds integer not null default 0 check (driving_seconds >= 0),
  add column if not exists sedentary_seconds integer not null default 0 check (sedentary_seconds >= 0),
  add column if not exists reminder_interval_minutes integer check (reminder_interval_minutes between 5 and 240),
  add column if not exists reminders_sent integer not null default 0 check (reminders_sent >= 0),
  add column if not exists reminders_acknowledged integer not null default 0 check (reminders_acknowledged >= 0),
  add column if not exists ai_summary text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists session_events_session_occurred_idx on public.session_events (session_id, occurred_at);
create index if not exists session_events_user_occurred_idx on public.session_events (user_id, occurred_at desc);
create index if not exists driving_sessions_user_status_started_idx on public.driving_sessions (user_id, status, started_at desc);

drop trigger if exists driver_profiles_updated_at on public.driver_profiles;
create trigger driver_profiles_updated_at
before update on public.driver_profiles
for each row execute function public.update_updated_at();

drop trigger if exists driving_sessions_updated_at on public.driving_sessions;
create trigger driving_sessions_updated_at
before update on public.driving_sessions
for each row execute function public.update_updated_at();

alter table public.driver_profiles enable row level security;
alter table public.session_events enable row level security;

-- ✅ Make policy creation idempotent
drop policy if exists "driver_profiles_own_or_admin" on public.driver_profiles;
drop policy if exists "driver_profiles_own_write" on public.driver_profiles;
drop policy if exists "session_events_own_or_admin" on public.session_events;
drop policy if exists "session_events_own_insert" on public.session_events;

create policy "driver_profiles_own_or_admin"
on public.driver_profiles for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "driver_profiles_own_write"
on public.driver_profiles for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "session_events_own_or_admin"
on public.session_events for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "session_events_own_insert"
on public.session_events for insert to authenticated
with check (user_id = auth.uid());

grant select, insert, update on public.driver_profiles to authenticated;
grant select, insert on public.session_events to authenticated;

create or replace view public.driver_daily_metrics
with (security_invoker = true) as
select user_id,
       started_at::date as activity_date,
       sum(driving_seconds)::bigint as driving_seconds,
       sum(sedentary_seconds)::bigint as sedentary_seconds,
       sum(exercises_completed)::bigint as exercises_completed,
       sum(calories)::numeric as calories_burned,
       round(avg(health_score))::integer as wellness_score
from public.driving_sessions
where status = 'completed'
group by user_id, started_at::date;

-- Assign the reviewed administrator once in SQL Editor:
update public.profiles
set role = 'admin'
where email = 'admin@moove.app';