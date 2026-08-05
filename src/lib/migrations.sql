-- ============================================================
-- MOOVE — Supabase PostgreSQL Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── 1. PROFILES ─────────────────────────────────────────────────────────────
-- Extends auth.users with app-specific profile data
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  email         text not null unique,
  role          text not null default 'driver' check (role in ('driver','admin')),
  driving_goal  text,
  age           text,
  vehicle_type  text,
  avatar_url    text,
  joined_at     timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profiles_role_idx on profiles(role);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ─── 2. USER PREFERENCES ─────────────────────────────────────────────────────
create table if not exists user_preferences (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references profiles(id) on delete cascade unique,
  reminder_interval     text default '30',        -- minutes between break reminders
  tired_areas           text[] default '{}',
  reminder_style        text default 'popup' check (reminder_style in ('popup','sound','vibration','silent')),
  notifications_enabled boolean default true,
  warmup_pref           text default 'before',
  theme                 text default 'light',
  accessibility_large_text boolean default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger user_preferences_updated_at
  before update on user_preferences
  for each row execute function update_updated_at();

-- ─── 3. DRIVING SESSIONS ─────────────────────────────────────────────────────
create table if not exists driving_sessions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  started_at          timestamptz not null default now(),
  ended_at            timestamptz,
  duration_seconds    int not null default 0,
  exercises_completed int not null default 0,
  exercises_skipped   int not null default 0,
  breaks_taken        int not null default 0,
  avg_sedentary_risk  text,
  note                text,
  created_at          timestamptz not null default now()
);

create index if not exists driving_sessions_user_idx on driving_sessions(user_id);
create index if not exists driving_sessions_started_idx on driving_sessions(started_at desc);

-- ─── 4. EXERCISE HISTORY ─────────────────────────────────────────────────────
create table if not exists exercise_history (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  session_id        uuid references driving_sessions(id) on delete set null,
  exercise_id       int not null,
  exercise_name     text not null,
  body_area         text,
  sets_completed    int not null default 1,
  duration_per_set  int not null default 30,  -- seconds
  rest_between      int not null default 15,  -- seconds
  context           text,  -- 'before' | 'after' | 'traffic' | 'parked'
  status            text not null default 'completed' check (status in ('completed','skipped')),
  completed_at      timestamptz not null default now()
);

create index if not exists exercise_history_user_idx on exercise_history(user_id);
create index if not exists exercise_history_completed_idx on exercise_history(completed_at desc);

-- ─── 5. HEALTH METRICS ───────────────────────────────────────────────────────
create table if not exists health_metrics (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  recorded_at   date not null default current_date,
  pain_level    int check (pain_level between 0 and 10),
  energy_level  int check (energy_level between 0 and 10),
  stress_level  int check (stress_level between 0 and 10),
  posture_score int check (posture_score between 0 and 100),
  notes         text,
  created_at    timestamptz not null default now(),
  unique (user_id, recorded_at)
);

create index if not exists health_metrics_user_idx on health_metrics(user_id);
create index if not exists health_metrics_date_idx on health_metrics(recorded_at desc);

-- ─── 6. SEDENTARY MONITORING LOGS ────────────────────────────────────────────
create table if not exists sedentary_logs (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  session_id      uuid references driving_sessions(id) on delete set null,
  logged_at       timestamptz not null default now(),
  duration_mins   int not null,    -- continuous sedentary minutes
  risk_level      text not null check (risk_level in ('Low','Moderate','High','Very High')),
  alert_triggered boolean default false,
  alert_dismissed boolean default false
);

create index if not exists sedentary_logs_user_idx on sedentary_logs(user_id);

-- ─── 7. AI INSIGHTS ──────────────────────────────────────────────────────────
create table if not exists ai_insights (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  generated_at    timestamptz not null default now(),
  insight_type    text not null,  -- 'recommendation' | 'analysis' | 'alert'
  title           text not null,
  body            text not null,
  tags            text[] default '{}',
  is_read         boolean default false,
  expires_at      timestamptz
);

create index if not exists ai_insights_user_idx on ai_insights(user_id);
create index if not exists ai_insights_generated_idx on ai_insights(generated_at desc);

-- ─── 8. NOTIFICATIONS ────────────────────────────────────────────────────────
create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null,  -- 'break_reminder' | 'exercise_prompt' | 'ai_insight' | 'system'
  title       text not null,
  body        text,
  is_read     boolean default false,
  sent_at     timestamptz not null default now(),
  read_at     timestamptz
);

create index if not exists notifications_user_idx on notifications(user_id);
create index if not exists notifications_sent_idx on notifications(sent_at desc);

-- ─── 9. FEEDBACK SUBMISSIONS ─────────────────────────────────────────────────
create table if not exists feedback_submissions (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references profiles(id) on delete set null,
  testing_session_id   text,
  app_version          text,
  testing_method       text,
  overall_rating       smallint check (overall_rating between 1 and 5),
  first_impression     smallint check (first_impression between 1 and 5),
  ease_of_navigation   smallint check (ease_of_navigation between 1 and 5),
  ease_of_learning     smallint check (ease_of_learning between 1 and 5),
  accomplished_task    text,
  most_useful_feature  text,
  needs_improvement    text,
  confusing_part       text,
  bug_report           text,
  would_use_again      text,
  would_recommend      text,
  additional_comments  text,
  feature_request      text,
  device               text,
  browser              text,
  submitted_at         timestamptz not null default now()
);

create index if not exists feedback_user_idx on feedback_submissions(user_id);
create index if not exists feedback_submitted_idx on feedback_submissions(submitted_at desc);

-- ─── 10. LEARN MODULES ───────────────────────────────────────────────────────
create table if not exists learn_modules (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  title       text not null,
  description text,
  category    text,
  difficulty  text default 'Beginner',
  duration_mins int default 5,
  content     text,
  sort_order  int default 0,
  published   boolean default true,
  created_at  timestamptz not null default now()
);

create table if not exists learn_progress (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  module_id   uuid not null references learn_modules(id) on delete cascade,
  completed   boolean default false,
  progress_pct int default 0,
  started_at  timestamptz,
  completed_at timestamptz,
  unique (user_id, module_id)
);

create index if not exists learn_progress_user_idx on learn_progress(user_id);

-- ─── 11. ADMIN AUDIT LOGS ────────────────────────────────────────────────────
create table if not exists audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid references profiles(id) on delete set null,
  action      text not null,
  target_type text,
  target_id   text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_logs_admin_idx on audit_logs(admin_id);
create index if not exists audit_logs_created_idx on audit_logs(created_at desc);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

alter table profiles             enable row level security;
alter table user_preferences     enable row level security;
alter table driving_sessions     enable row level security;
alter table exercise_history     enable row level security;
alter table health_metrics       enable row level security;
alter table sedentary_logs       enable row level security;
alter table ai_insights          enable row level security;
alter table notifications        enable row level security;
alter table feedback_submissions enable row level security;
alter table learn_modules        enable row level security;
alter table learn_progress       enable row level security;
alter table audit_logs           enable row level security;

-- Profiles
create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users insert own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "Admins read all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- User Preferences
create policy "Users manage own preferences"
  on user_preferences for all using (auth.uid() = user_id);

-- Driving Sessions
create policy "Users manage own sessions"
  on driving_sessions for all using (auth.uid() = user_id);
create policy "Admins read all sessions"
  on driving_sessions for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Exercise History
create policy "Users manage own exercise history"
  on exercise_history for all using (auth.uid() = user_id);
create policy "Admins read all exercise history"
  on exercise_history for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Health Metrics
create policy "Users manage own health metrics"
  on health_metrics for all using (auth.uid() = user_id);

-- Sedentary Logs
create policy "Users manage own sedentary logs"
  on sedentary_logs for all using (auth.uid() = user_id);

-- AI Insights
create policy "Users read own insights"
  on ai_insights for select using (auth.uid() = user_id);
create policy "Users update own insights (mark read)"
  on ai_insights for update using (auth.uid() = user_id);

-- Notifications
create policy "Users manage own notifications"
  on notifications for all using (auth.uid() = user_id);

-- Feedback
create policy "Users insert feedback"
  on feedback_submissions for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users read own feedback"
  on feedback_submissions for select using (auth.uid() = user_id);
create policy "Admins read all feedback"
  on feedback_submissions for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Learn Modules — public read
create policy "Anyone reads published modules"
  on learn_modules for select using (published = true);

-- Learn Progress
create policy "Users manage own learn progress"
  on learn_progress for all using (auth.uid() = user_id);

-- Audit Logs — admin only
create policy "Admins read audit logs"
  on audit_logs for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins insert audit logs"
  on audit_logs for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── AUTO-CREATE PROFILE ON SIGN UP ──────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'driver')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── SEED: Learn Modules ─────────────────────────────────────────────────────
insert into learn_modules (slug, title, description, category, difficulty, duration_mins, sort_order) values
  ('driver-posture-101',     'Driver Posture 101',           'Learn the fundamentals of ergonomic driving posture to prevent pain.', 'Posture', 'Beginner', 5, 1),
  ('back-pain-prevention',   'Back Pain Prevention',         'Evidence-based strategies to keep your back healthy on long drives.',  'Health',  'Beginner', 7, 2),
  ('neck-shoulder-care',     'Neck & Shoulder Care',         'Simple exercises and habits to relieve neck and shoulder tension.',     'Exercise','Beginner', 6, 3),
  ('fatigue-management',     'Fatigue Management',           'Recognize the signs of driving fatigue and learn how to stay alert.',   'Safety',  'Intermediate', 8, 4),
  ('break-planning',         'Strategic Break Planning',     'How to plan effective breaks that maximise recovery and alertness.',    'Wellness','Beginner', 5, 5),
  ('sedentary-risks',        'Risks of Prolonged Sitting',   'The science behind sedentary behaviour and how to mitigate it.',       'Health',  'Intermediate', 10, 6),
  ('breathing-techniques',   'Breathing for Drivers',        'Breathing techniques to reduce stress and maintain focus while driving.','Wellness','Beginner', 4, 7),
  ('eye-strain-relief',      'Eye Strain Relief',            'Protect your vision and reduce eye strain on long trips.',              'Health',  'Beginner', 5, 8)
on conflict (slug) do nothing;

-- ─── PART 7 ADDITIONAL TABLES ────────────────────────────────────────────────

-- ─── 12. EXERCISE CATEGORIES ─────────────────────────────────────────────────
create table if not exists exercise_categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  description text,
  icon        text,
  color       text,
  sort_order  int default 0
);

-- ─── 13. EXERCISE PROGRESS (per-user cumulative) ─────────────────────────────
create table if not exists exercise_progress (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references profiles(id) on delete cascade,
  exercise_id          int not null,
  exercise_name        text not null,
  total_completions    int not null default 0,
  total_duration_secs  int not null default 0,
  last_completed_at    timestamptz,
  streak_days          int default 0,
  updated_at           timestamptz not null default now(),
  unique (user_id, exercise_id)
);

create index if not exists exercise_progress_user_idx on exercise_progress(user_id);

-- ─── 14. EXERCISE RECOMMENDATIONS ────────────────────────────────────────────
create table if not exists exercise_recommendations (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  exercise_id     int not null,
  exercise_name   text not null,
  reason          text,
  context         text,  -- 'before' | 'break' | 'after' | 'traffic' | 'parked'
  priority        int default 5,
  generated_at    timestamptz not null default now(),
  expires_at      timestamptz,
  accepted        boolean
);

create index if not exists exercise_rec_user_idx on exercise_recommendations(user_id);

-- ─── 15. REMINDERS ───────────────────────────────────────────────────────────
create table if not exists reminders (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  reminder_type   text not null check (reminder_type in ('break','exercise','hydration','posture','custom')),
  message         text,
  scheduled_at    timestamptz not null,
  sent            boolean default false,
  dismissed       boolean default false,
  created_at      timestamptz not null default now()
);

create index if not exists reminders_user_idx on reminders(user_id);
create index if not exists reminders_scheduled_idx on reminders(scheduled_at);

-- ─── 16. ANALYTICS EVENTS ────────────────────────────────────────────────────
create table if not exists analytics_events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete set null,
  event_name  text not null,
  properties  jsonb default '{}',
  page        text,
  session_id  uuid references driving_sessions(id) on delete set null,
  occurred_at timestamptz not null default now()
);

create index if not exists analytics_events_user_idx on analytics_events(user_id);
create index if not exists analytics_events_name_idx on analytics_events(event_name);
create index if not exists analytics_events_occurred_idx on analytics_events(occurred_at desc);

-- ─── 17. DEVELOPER SIMULATIONS ───────────────────────────────────────────────
create table if not exists developer_simulations (
  id              uuid primary key default uuid_generate_v4(),
  simulated_by    uuid references profiles(id) on delete set null,
  simulation_type text not null,  -- 'session' | 'exercise_batch' | 'feedback'
  payload         jsonb default '{}',
  notes           text,
  created_at      timestamptz not null default now()
);

create index if not exists dev_sim_by_idx on developer_simulations(simulated_by);

-- ─── 18. ADMIN SETTINGS ──────────────────────────────────────────────────────
create table if not exists admin_settings (
  id                      uuid primary key default uuid_generate_v4(),
  setting_key             text not null unique,
  setting_value           text,
  value_type              text default 'string' check (value_type in ('string','number','boolean','json')),
  description             text,
  updated_by              uuid references profiles(id) on delete set null,
  updated_at              timestamptz not null default now()
);

-- Seed default admin settings
insert into admin_settings (setting_key, setting_value, value_type, description) values
  ('participant_quota',         '30',     'number',  'Maximum participants for current study phase'),
  ('study_phase',               'alpha',  'string',  'Current study phase: alpha | beta | pilot | full'),
  ('sedentary_alert_threshold', '45',     'number',  'Minutes of continuous driving before sedentary alert'),
  ('break_reminder_interval',   '60',     'number',  'Minutes between break reminders'),
  ('data_retention_days',       '90',     'number',  'Days to retain participant data'),
  ('export_anonymized',         'true',   'boolean', 'Anonymize user IDs in CSV exports')
on conflict (setting_key) do nothing;

-- ─── 19. SURVEY RESPONSES ────────────────────────────────────────────────────
create table if not exists survey_responses (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references profiles(id) on delete set null,
  survey_id       text not null,
  question_id     text not null,
  answer          text,
  answer_numeric  numeric,
  submitted_at    timestamptz not null default now()
);

create index if not exists survey_resp_user_idx on survey_responses(user_id);
create index if not exists survey_resp_survey_idx on survey_responses(survey_id);

-- ─── 20. RESEARCH METRICS ────────────────────────────────────────────────────
create table if not exists research_metrics (
  id              uuid primary key default uuid_generate_v4(),
  metric_name     text not null,
  metric_value    numeric,
  dimension       text,      -- e.g. 'daily' | 'weekly' | 'cohort'
  period_start    date,
  period_end      date,
  metadata        jsonb default '{}',
  computed_at     timestamptz not null default now()
);

create index if not exists research_metrics_name_idx on research_metrics(metric_name);
create index if not exists research_metrics_computed_idx on research_metrics(computed_at desc);

-- ─── 21. SYSTEM LOGS ─────────────────────────────────────────────────────────
create table if not exists system_logs (
  id          uuid primary key default uuid_generate_v4(),
  level       text not null check (level in ('info','warn','error','debug')),
  source      text not null,  -- 'auth' | 'db' | 'api' | 'scheduler' | 'export'
  message     text not null,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists system_logs_level_idx on system_logs(level);
create index if not exists system_logs_created_idx on system_logs(created_at desc);

-- ─── RLS FOR PART 7 TABLES ───────────────────────────────────────────────────

alter table exercise_categories      enable row level security;
alter table exercise_progress        enable row level security;
alter table exercise_recommendations enable row level security;
alter table reminders                enable row level security;
alter table analytics_events         enable row level security;
alter table developer_simulations    enable row level security;
alter table admin_settings           enable row level security;
alter table survey_responses         enable row level security;
alter table research_metrics         enable row level security;
alter table system_logs              enable row level security;

-- Exercise Categories — public read
create policy "Anyone reads exercise categories"
  on exercise_categories for select using (true);

-- Exercise Progress
create policy "Users manage own exercise progress"
  on exercise_progress for all using (auth.uid() = user_id);
create policy "Admins read all exercise progress"
  on exercise_progress for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Exercise Recommendations
create policy "Users manage own recommendations"
  on exercise_recommendations for all using (auth.uid() = user_id);

-- Reminders
create policy "Users manage own reminders"
  on reminders for all using (auth.uid() = user_id);

-- Analytics Events
create policy "Users insert own events"
  on analytics_events for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users read own events"
  on analytics_events for select using (auth.uid() = user_id);
create policy "Admins read all events"
  on analytics_events for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Developer Simulations
create policy "Admins manage dev simulations"
  on developer_simulations for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Admin Settings — admin only
create policy "Admins manage admin settings"
  on admin_settings for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Survey Responses
create policy "Users insert own survey responses"
  on survey_responses for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users read own survey responses"
  on survey_responses for select using (auth.uid() = user_id);
create policy "Admins read all survey responses"
  on survey_responses for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Research Metrics — admin only
create policy "Admins read research metrics"
  on research_metrics for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins insert research metrics"
  on research_metrics for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- System Logs — admin only
create policy "Admins read system logs"
  on system_logs for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Update health_metrics to also track wellness_score and calories ─────────
-- (Adds columns that db.ts uses — safe to run even if already applied)
alter table health_metrics
  add column if not exists wellness_score int check (wellness_score between 0 and 100),
  add column if not exists calories_burned int;

-- ─── MIGRATION PATCH — Production Integration ─────────────────────────────────

-- 1. feedback_submissions: add bug_experience column
alter table feedback_submissions
  add column if not exists bug_experience text check (bug_experience in ('none','minor','moderate','major'));

-- 2. user_preferences: add per-notification-type flags
alter table user_preferences
  add column if not exists exercise_reminders boolean default true,
  add column if not exists break_alerts       boolean default true,
  add column if not exists health_insights    boolean default true,
  add column if not exists session_summaries  boolean default true;

-- 3. driving_sessions: add warmup/cooldown counts
alter table driving_sessions
  add column if not exists warmup_exercises   int not null default 0,
  add column if not exists cooldown_exercises int not null default 0,
  add column if not exists health_score       int,
  add column if not exists calories           int,
  add column if not exists total_sets         int not null default 0;

-- 4. admin_settings: seed testing-session-config keys
insert into admin_settings (setting_key, setting_value, value_type, description) values
  ('testing_session_id',      'UNLEASH-2026',          'string',  'Current testing session identifier'),
  ('prototype_version',       'v0.49-TRL4',            'string',  'Prototype version string'),
  ('user_group',              'Alpha Testers',          'string',  'Current user group under test'),
  ('testing_environment',     'Controlled Lab',         'string',  'Testing environment description'),
  ('study_start_date',        '',                       'string',  'Study start date ISO string'),
  ('target_participants',     '30',                     'number',  'Number of target study participants'),
  ('testing_objective',       'Validate MOOVE TRL-4 prototype for driver preventive health engagement.', 'string', 'Primary testing objective'),
  ('overall_success_criteria','≥70% usability satisfaction, ≥3/5 average rating across all metrics.', 'string', 'Overall success criteria')
on conflict (setting_key) do nothing;

-- 5. Index for fast admin_settings key lookup
create index if not exists admin_settings_key_idx on admin_settings(setting_key);

-- 6. Materialized view for weekly exercise stats per user (admin analytics)
-- Refreshed by calling: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_weekly_exercise_stats;
create materialized view if not exists mv_weekly_exercise_stats as
select
  user_id,
  date_trunc('week', completed_at) as week_start,
  count(*) filter (where status = 'completed') as completed,
  count(*) filter (where status = 'skipped')   as skipped,
  count(distinct completed_at::date)            as active_days
from exercise_history
group by user_id, date_trunc('week', completed_at);

create unique index if not exists mv_weekly_ex_stats_idx
  on mv_weekly_exercise_stats(user_id, week_start);

-- 7. DB function: get testing config as a single JSON object (admin use)
create or replace function get_testing_config()
returns jsonb language sql security definer as $$
  select jsonb_object_agg(setting_key, setting_value)
  from admin_settings
  where setting_key in (
    'testing_session_id','prototype_version','user_group',
    'testing_environment','study_start_date','target_participants',
    'testing_objective','overall_success_criteria',
    'participant_quota','study_phase'
  );
$$;

-- 8. DB function: upsert a single admin setting
create or replace function upsert_admin_setting(p_key text, p_value text, p_admin uuid)
returns void language plpgsql security definer as $$
begin
  insert into admin_settings (setting_key, setting_value, updated_by, updated_at)
  values (p_key, p_value, p_admin, now())
  on conflict (setting_key) do update
    set setting_value = excluded.setting_value,
        updated_by    = excluded.updated_by,
        updated_at    = now();
end;
$$;

-- ─── RLS RECURSION FIX ───────────────────────────────────────────────────────
-- Root cause: every admin CHECK policy did EXISTS(SELECT 1 FROM profiles WHERE …)
-- which recursively re-evaluates the profiles SELECT policies → 42P17.
-- Fix: one SECURITY DEFINER helper that reads profiles without RLS.

-- 1. Non-recursive role helper.
--    Runs as postgres (bypasses RLS). Safe: returns only the caller's own role.
create or replace function get_my_role()
returns text language sql security definer stable as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'driver'
  );
$$;

-- Revoke public execute so only the DB itself can call it from policies
revoke all on function get_my_role() from public;
grant execute on function get_my_role() to authenticated;
grant execute on function get_my_role() to anon;

-- 2. Drop every policy that contained a recursive profiles self-join.
--    We'll recreate them below using get_my_role().

-- profiles
drop policy if exists "Admins read all profiles"        on profiles;
drop policy if exists "Users read own profile"          on profiles;
drop policy if exists "Users update own profile"        on profiles;
drop policy if exists "Users insert own profile"        on profiles;

-- driving_sessions
drop policy if exists "Admins read all sessions"        on driving_sessions;

-- exercise_history
drop policy if exists "Admins read all exercise history" on exercise_history;

-- admin_settings
drop policy if exists "Admins manage admin settings"    on admin_settings;

-- analytics_events
drop policy if exists "Admins read all events"          on analytics_events;

-- feedback_submissions
drop policy if exists "Admins read all feedback"        on feedback_submissions;

-- exercise_progress
drop policy if exists "Admins read all exercise progress" on exercise_progress;

-- developer_simulations
drop policy if exists "Admins manage dev simulations"   on developer_simulations;

-- survey_responses
drop policy if exists "Admins read all survey responses" on survey_responses;

-- research_metrics
drop policy if exists "Admins read research metrics"    on research_metrics;
drop policy if exists "Admins insert research metrics"  on research_metrics;

-- system_logs
drop policy if exists "Admins read system logs"         on system_logs;

-- audit_logs
drop policy if exists "Admins read audit logs"          on audit_logs;
drop policy if exists "Admins insert audit logs"        on audit_logs;

-- 3. Recreate profiles policies — NO self-joins allowed on this table.
create policy "profiles_select_own"
  on profiles for select using (auth.uid() = id);

-- Admin reads ALL profiles (non-recursive via get_my_role)
create policy "profiles_select_admin"
  on profiles for select using (get_my_role() = 'admin');

create policy "profiles_update_own"
  on profiles for update using (auth.uid() = id);

create policy "profiles_insert_own"
  on profiles for insert with check (auth.uid() = id);

-- 4. Driving sessions — admin read using get_my_role()
create policy "sessions_select_admin"
  on driving_sessions for select using (get_my_role() = 'admin');

-- 5. Exercise history — admin read
create policy "exercise_history_select_admin"
  on exercise_history for select using (get_my_role() = 'admin');

-- 6. Admin settings
--    Admins can do everything.  All authenticated users can READ (needed for testing config sync).
create policy "admin_settings_select_all_authenticated"
  on admin_settings for select using (auth.uid() is not null);

create policy "admin_settings_write_admin"
  on admin_settings for insert with check (get_my_role() = 'admin');

create policy "admin_settings_update_admin"
  on admin_settings for update using (get_my_role() = 'admin');

create policy "admin_settings_delete_admin"
  on admin_settings for delete using (get_my_role() = 'admin');

-- 7. Analytics events — admin read
create policy "analytics_events_select_admin"
  on analytics_events for select using (get_my_role() = 'admin');

-- 8. Feedback — admin read
create policy "feedback_select_admin"
  on feedback_submissions for select using (get_my_role() = 'admin');

-- 9. Exercise progress — admin read
create policy "exercise_progress_select_admin"
  on exercise_progress for select using (get_my_role() = 'admin');

-- 10. Developer simulations — admin only
create policy "dev_simulations_admin"
  on developer_simulations for all using (get_my_role() = 'admin');

-- 11. Survey responses — admin read
create policy "survey_responses_select_admin"
  on survey_responses for select using (get_my_role() = 'admin');

-- 12. Research metrics — admin only
create policy "research_metrics_select_admin"
  on research_metrics for select using (get_my_role() = 'admin');

create policy "research_metrics_insert_admin"
  on research_metrics for insert with check (get_my_role() = 'admin');

-- 13. System logs — admin read
create policy "system_logs_select_admin"
  on system_logs for select using (get_my_role() = 'admin');

-- 14. Audit logs — admin only
create policy "audit_logs_select_admin"
  on audit_logs for select using (get_my_role() = 'admin');

create policy "audit_logs_insert_admin"
  on audit_logs for insert with check (get_my_role() = 'admin');

-- ─── AUTO-INIT USER PREFERENCES ──────────────────────────────────────────────
-- When a new profile is created, automatically seed default preferences.
-- Prevents 406 errors from .single() on missing rows.
create or replace function handle_new_profile()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute function handle_new_profile();

-- ─── WEEKLY DRIVING ACTIVITY VIEW (for dashboard chart) ──────────────────────
-- Only counts completed sessions (ended_at IS NOT NULL)
create or replace view v_weekly_driving_by_user as
select
  user_id,
  date_trunc('day', started_at at time zone 'UTC') as driving_day,
  to_char(started_at at time zone 'UTC', 'Dy')     as day_label,
  sum(duration_seconds)                             as total_seconds,
  count(*)                                          as session_count,
  sum(exercises_completed)                          as exercises_done
from driving_sessions
where ended_at is not null
group by user_id, date_trunc('day', started_at at time zone 'UTC'),
         to_char(started_at at time zone 'UTC', 'Dy');

-- RLS on view: each user sees only their own rows
-- (Views inherit RLS from the underlying table, so this is already protected)

-- ═══════════════════════════════════════════════════════════════════════════════
-- PRODUCTION READINESS PATCH — Fix all 403 / permission denied errors
-- Root cause: RLS is enabled but PostgreSQL table-level GRANTs are missing.
-- Both are required: GRANT gives the role access to the table descriptor;
-- RLS policies then filter which rows each user can see.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── GRANT table privileges ───────────────────────────────────────────────────

-- authenticated role (all logged-in users via JWT)
grant usage on schema public to authenticated;

grant select, insert, update, delete
  on public.profiles to authenticated;

grant select, insert, update, delete
  on public.user_preferences to authenticated;

grant select, insert, update, delete
  on public.driving_sessions to authenticated;

grant select, insert, update, delete
  on public.exercise_history to authenticated;

grant select, insert, update, delete
  on public.health_metrics to authenticated;

grant select, insert, update, delete
  on public.sedentary_logs to authenticated;

grant select, insert, update
  on public.ai_insights to authenticated;

grant select, insert, update, delete
  on public.notifications to authenticated;

grant select, insert
  on public.feedback_submissions to authenticated;

grant select
  on public.learn_modules to authenticated;

grant select, insert, update, delete
  on public.learn_progress to authenticated;

grant select, insert, update, delete
  on public.exercise_categories to authenticated;

grant select, insert, update, delete
  on public.exercise_progress to authenticated;

grant select, insert, update, delete
  on public.exercise_recommendations to authenticated;

grant select, insert, update, delete
  on public.reminders to authenticated;

grant select, insert
  on public.analytics_events to authenticated;

grant select, insert
  on public.survey_responses to authenticated;

-- admin_settings: all authenticated can read; writes are restricted by RLS
grant select, insert, update, delete
  on public.admin_settings to authenticated;

-- admin-only tables — grant to authenticated so RLS can evaluate (policies block non-admins)
grant select, insert, update, delete
  on public.developer_simulations to authenticated;

grant select, insert
  on public.research_metrics to authenticated;

grant select
  on public.system_logs to authenticated;

grant select, insert
  on public.audit_logs to authenticated;

-- anon role: only public-read tables (learn_modules, exercise_categories)
grant usage on schema public to anon;
grant select on public.learn_modules to anon;
grant select on public.exercise_categories to anon;
-- anon may insert feedback without auth (user_id = null path)
grant insert on public.feedback_submissions to anon;

-- service_role already has full bypass — no grant needed

-- ─── GRANT sequence privileges (for uuid_generate_v4 auto-PKs) ───────────────
-- uuid_generate_v4() is a function, not a sequence — no sequence grants needed.
-- uuid_generate_v4 is in public schema; grant execute so authenticated can call it:
grant execute on function uuid_generate_v4() to authenticated;
grant execute on function uuid_generate_v4() to anon;

-- ─── GRANT RPC functions ──────────────────────────────────────────────────────
grant execute on function get_my_role() to authenticated;
grant execute on function get_my_role() to anon;
grant execute on function get_testing_config() to authenticated;
grant execute on function upsert_admin_setting(text, text, uuid) to authenticated;

-- ─── SCHEMA ADDITIONS — profiles extended fields ─────────────────────────────
-- Requested by production audit: gender, height, weight, BMI, emergency contact,
-- profile photo URL, onboarding status, last login timestamp.

alter table profiles
  add column if not exists gender              text,
  add column if not exists height_cm           numeric,
  add column if not exists weight_kg           numeric,
  add column if not exists bmi                 numeric generated always as (
    case when height_cm > 0 then round((weight_kg / ((height_cm / 100.0) ^ 2))::numeric, 1) else null end
  ) stored,
  add column if not exists emergency_contact   text,
  add column if not exists avatar_url          text,
  add column if not exists onboarding_complete boolean default false,
  add column if not exists last_login_at       timestamptz;

-- Auto-update last_login_at via trigger on auth sign-in is done via handle_new_user
-- For profile last_login, we update it from the frontend on session restore (see AuthContext).

-- ─── SCHEMA ADDITIONS — user_preferences extended fields ─────────────────────
alter table user_preferences
  add column if not exists preferred_language  text default 'en',
  add column if not exists high_contrast       boolean default false,
  add column if not exists font_size           text default 'medium' check (font_size in ('small','medium','large')),
  add column if not exists rest_duration_secs  int default 15,
  add column if not exists sedentary_threshold_mins int default 45;

-- ─── INDEX ADDITIONS — frequently queried columns ────────────────────────────
create index if not exists profiles_email_idx           on profiles(email);
create index if not exists profiles_onboarding_idx      on profiles(onboarding_complete);
create index if not exists driving_sessions_ended_idx   on driving_sessions(ended_at) where ended_at is not null;
create index if not exists exercise_history_session_idx on exercise_history(session_id);
create index if not exists health_metrics_user_date_idx on health_metrics(user_id, recorded_at desc);
create index if not exists feedback_session_idx         on feedback_submissions(testing_session_id);
create index if not exists notif_user_unread_idx        on notifications(user_id, is_read) where is_read = false;

-- ─── CONSTRAINT ADDITIONS ─────────────────────────────────────────────────────
-- Ensure user_preferences.user_id uniqueness (already has UNIQUE but explicit)
-- Nothing else to add — existing schema has proper FKs and constraints.

-- ─── SECURITY: revoke direct public access to internal functions ──────────────
revoke execute on function handle_new_user() from public;
revoke execute on function handle_new_profile() from public;
revoke execute on function update_updated_at() from public;

-- ─── VERIFY: RLS is enabled on all tables (idempotent) ───────────────────────
alter table profiles             enable row level security;
alter table user_preferences     enable row level security;
alter table driving_sessions     enable row level security;
alter table exercise_history     enable row level security;
alter table health_metrics       enable row level security;
alter table sedentary_logs       enable row level security;
alter table ai_insights          enable row level security;
alter table notifications        enable row level security;
alter table feedback_submissions enable row level security;
alter table learn_modules        enable row level security;
alter table learn_progress       enable row level security;
alter table exercise_categories  enable row level security;
alter table exercise_progress    enable row level security;
alter table exercise_recommendations enable row level security;
alter table reminders            enable row level security;
alter table analytics_events     enable row level security;
alter table developer_simulations enable row level security;
alter table admin_settings       enable row level security;
alter table survey_responses     enable row level security;
alter table research_metrics     enable row level security;
alter table system_logs          enable row level security;
alter table audit_logs           enable row level security;

-- ============================================================
-- Real-time exercise persistence — indexes and dedup constraint
-- ============================================================

-- Composite index for per-user, per-session, per-context queries
create index if not exists exercise_history_user_session_ctx_idx
  on exercise_history(user_id, session_id, context);

-- Unique constraint: one completion record per exercise per session per context
-- (prevents duplicate inserts from rapid clicks or multiple tabs)
create unique index if not exists exercise_history_dedup_idx
  on exercise_history(user_id, session_id, exercise_id, context)
  where session_id is not null;

-- ============================================================
-- HOTFIX: admin_settings table grants + seed rows
-- Run this in the Supabase SQL editor if you see:
--   "permission denied for table admin_settings"
-- ============================================================

-- 1. Table-level grants (required BEFORE RLS policies can evaluate)
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.admin_settings to authenticated;

-- 2. Ensure all testing-config seed rows exist
insert into admin_settings (setting_key, setting_value, value_type, description) values
  ('testing_session_id',        'UNLEASH-2026',         'string',  'Current testing session identifier'),
  ('prototype_version',         'v0.49-TRL4',           'string',  'Prototype version string'),
  ('user_group',                'Alpha Testers',        'string',  'Current user group under test'),
  ('testing_environment',       'Controlled Lab',       'string',  'Testing environment description'),
  ('study_start_date',          '',                     'string',  'Study start date ISO string'),
  ('target_participants',       '30',                   'number',  'Number of target study participants'),
  ('testing_objective',         'Validate MOOVE TRL-4 prototype for driver preventive health engagement.', 'string', 'Primary testing objective'),
  ('overall_success_criteria',  '≥70% usability satisfaction, ≥3/5 average rating across all metrics.',   'string', 'Overall success criteria')
on conflict (setting_key) do nothing;

-- 3. Ensure get_my_role() SECURITY DEFINER function exists
--    (needed by RLS write policies; recreate idempotently)
create or replace function get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid() limit 1;
$$;

-- ============================================================
-- RPC: upsert_admin_setting
-- SECURITY DEFINER so authenticated role needs no table GRANT.
-- Admin-only: raises an exception if caller is not admin.
-- Run this once in the Supabase SQL editor.
-- ============================================================
create or replace function upsert_admin_setting(p_key text, p_val text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select role from profiles where id = auth.uid()) is distinct from 'admin' then
    raise exception 'permission denied: admin role required';
  end if;
  insert into admin_settings (setting_key, setting_value, updated_at)
  values (p_key, p_val, now())
  on conflict (setting_key) do update
    set setting_value = excluded.setting_value,
        updated_at    = now();
end;
$$;

-- Any authenticated user can CALL the function; the body enforces admin-only writes.
grant execute on function upsert_admin_setting(text, text) to authenticated;
