-- Repair 403 / "permission denied for table" responses for the browser client.
-- Apply after the existing MOOVE migrations. This is intentionally idempotent.
--
-- PostgreSQL grants allow the authenticated JWT role to reach a table; RLS then
-- restricts every row to its owner (except the deliberately read-only settings
-- and administrator reporting access below). Both layers are required.

grant usage on schema public to authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, update, delete on public.driving_sessions to authenticated;
grant select, insert on public.feedback_submissions to authenticated;
grant select on public.admin_settings to authenticated;
grant execute on function public.upsert_admin_setting(text, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.driving_sessions enable row level security;
alter table public.feedback_submissions enable row level security;
alter table public.admin_settings enable row level security;

-- Remove the policy names used by the earlier schema and hardening migrations.
drop policy if exists "Users manage own preferences" on public.user_preferences;
drop policy if exists "Users manage their own preferences" on public.user_preferences;
drop policy if exists "user_preferences_owner" on public.user_preferences;
drop policy if exists "user_preferences_own" on public.user_preferences;
drop policy if exists "user_preferences_select_own" on public.user_preferences;
drop policy if exists "user_preferences_insert_own" on public.user_preferences;
drop policy if exists "user_preferences_update_own" on public.user_preferences;
drop policy if exists "user_preferences_delete_own" on public.user_preferences;

create policy "user_preferences_select_own"
on public.user_preferences for select to authenticated
using (user_id = auth.uid());

create policy "user_preferences_insert_own"
on public.user_preferences for insert to authenticated
with check (user_id = auth.uid());

create policy "user_preferences_update_own"
on public.user_preferences for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "user_preferences_delete_own"
on public.user_preferences for delete to authenticated
using (user_id = auth.uid());

-- Recreate the other affected policies so an older permissive or missing policy
-- cannot conflict with the intended ownership rules.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own"
on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "sessions_owner_or_admin" on public.driving_sessions;
drop policy if exists "sessions_owner_write" on public.driving_sessions;
drop policy if exists "sessions_owner_update" on public.driving_sessions;
drop policy if exists "sessions_owner_delete" on public.driving_sessions;
create policy "sessions_owner_or_admin"
on public.driving_sessions for select to authenticated
using (user_id = auth.uid() or public.is_admin());
create policy "sessions_owner_write"
on public.driving_sessions for insert to authenticated
with check (user_id = auth.uid());
create policy "sessions_owner_update"
on public.driving_sessions for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "sessions_owner_delete"
on public.driving_sessions for delete to authenticated
using (user_id = auth.uid());

drop policy if exists "feedback_insert_own" on public.feedback_submissions;
drop policy if exists "feedback_select_own_or_admin" on public.feedback_submissions;
create policy "feedback_insert_own"
on public.feedback_submissions for insert to authenticated
with check (user_id = auth.uid());
create policy "feedback_select_own_or_admin"
on public.feedback_submissions for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin_settings_select_authenticated" on public.admin_settings;
create policy "admin_settings_select_authenticated"
on public.admin_settings for select to authenticated
using (true);
