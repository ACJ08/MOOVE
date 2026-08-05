-- MOOVE production hardening migration
-- Run through the Supabase CLI or SQL editor after backing up the project.
-- This migration intentionally preserves existing data.

create extension if not exists pgcrypto;

-- Keep the schema aligned with the columns the application actually writes.
alter table public.profiles
  add column if not exists gender text,
  add column if not exists height_cm numeric check (height_cm is null or height_cm between 50 and 300),
  add column if not exists weight_kg numeric check (weight_kg is null or weight_kg between 10 and 500),
  add column if not exists emergency_contact text,
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists last_login_at timestamptz;

alter table public.user_preferences
  add column if not exists exercise_reminders boolean not null default true,
  add column if not exists break_alerts boolean not null default true,
  add column if not exists health_insights boolean not null default true,
  add column if not exists session_summaries boolean not null default true;

alter table public.driving_sessions
  add column if not exists warmup_exercises integer not null default 0 check (warmup_exercises >= 0),
  add column if not exists cooldown_exercises integer not null default 0 check (cooldown_exercises >= 0),
  add column if not exists health_score integer check (health_score is null or health_score between 0 and 100),
  add column if not exists calories numeric not null default 0 check (calories >= 0),
  add column if not exists total_sets integer not null default 0 check (total_sets >= 0);

alter table public.health_metrics
  add column if not exists wellness_score integer check (wellness_score is null or wellness_score between 0 and 100),
  add column if not exists calories_burned numeric check (calories_burned is null or calories_burned >= 0);

create table if not exists public.admin_settings (
  setting_key text primary key,
  setting_value text not null default '',
  value_type text not null default 'string' check (value_type in ('string', 'number', 'boolean', 'json')),
  description text,
  updated_at timestamptz not null default now()
);

-- Backfill profiles for users created before the auth trigger existed. This fixes FK 23503.
insert into public.profiles (id, name, email, role)
select u.id,
       coalesce(nullif(u.raw_user_meta_data ->> 'name', ''), split_part(coalesce(u.email, ''), '@', 1), 'User'),
       coalesce(u.email, u.id::text || '@invalid.local'),
       'driver'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- New users always start as drivers. Promote administrators only from the service-role/SQL editor.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(coalesce(new.email, ''), '@', 1), 'User'),
    coalesce(new.email, new.id::text || '@invalid.local'),
    'driver'
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Prevent a client update from escalating its own profile role.
create or replace function public.prevent_role_change()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'profile role cannot be changed by clients';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles
for each row execute function public.prevent_role_change();

-- SECURITY DEFINER avoids recursive RLS evaluation on profiles.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Replace recursive and permissive legacy policies.
drop policy if exists "Admins read all profiles" on public.profiles;
drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;

-- ✅ IMPORTANT: drop the exact policies you're about to (re)create
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users manage own sessions" on public.driving_sessions;
drop policy if exists "Admins read all sessions" on public.driving_sessions;
create policy "sessions_owner_or_admin"
on public.driving_sessions for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "sessions_owner_write"
on public.driving_sessions for insert to authenticated
with check (user_id = auth.uid());

create policy "sessions_owner_update"
on public.driving_sessions for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "sessions_owner_delete"
on public.driving_sessions for delete to authenticated
using (user_id = auth.uid());

drop policy if exists "Users manage own exercise history" on public.exercise_history;
drop policy if exists "Admins read all exercise history" on public.exercise_history;
create policy "exercise_history_owner_or_admin"
on public.exercise_history for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "exercise_history_owner_write"
on public.exercise_history for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users insert feedback" on public.feedback_submissions;
drop policy if exists "Users read own feedback" on public.feedback_submissions;
drop policy if exists "Admins read all feedback" on public.feedback_submissions;

create policy "feedback_insert_own"
on public.feedback_submissions for insert to authenticated
with check (user_id = auth.uid());

create policy "feedback_select_own_or_admin"
on public.feedback_submissions for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin_settings_select_all_authenticated" on public.admin_settings;
drop policy if exists "admin_settings_write_admin" on public.admin_settings;
drop policy if exists "admin_settings_update_admin" on public.admin_settings;
drop policy if exists "admin_settings_delete_admin" on public.admin_settings;

create policy "admin_settings_select_authenticated"
on public.admin_settings for select to authenticated
using (true);

create or replace function public.upsert_admin_setting(p_key text, p_val text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'permission denied: admin role required' using errcode = '42501';
  end if;

  insert into public.admin_settings (setting_key, setting_value, updated_at)
  values (p_key, p_val, now())
  on conflict (setting_key) do update
    set setting_value = excluded.setting_value,
        updated_at = now();
end;
$$;

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.driving_sessions enable row level security;
alter table public.exercise_history enable row level security;
alter table public.health_metrics enable row level security;
alter table public.feedback_submissions enable row level security;
alter table public.admin_settings enable row level security;

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_preferences, public.driving_sessions, public.exercise_history, public.health_metrics, public.feedback_submissions to authenticated;
grant select on public.admin_settings to authenticated;
grant execute on function public.upsert_admin_setting(text, text) to authenticated;

revoke all on function public.handle_new_user() from public;
revoke all on function public.prevent_role_change() from public;

create index if not exists driving_sessions_user_started_idx
  on public.driving_sessions (user_id, started_at desc);

create index if not exists exercise_history_user_completed_idx
  on public.exercise_history (user_id, completed_at desc);

create index if not exists feedback_submissions_submitted_idx
  on public.feedback_submissions (submitted_at desc);

create unique index if not exists exercise_history_session_exercise_context_key
  on public.exercise_history (user_id, session_id, exercise_id, context)
  where session_id is not null;

-- Promote a reviewed account manually; do not derive this from browser-controlled metadata:
update public.profiles
set role = 'admin'
where email = 'admin@moove.app';