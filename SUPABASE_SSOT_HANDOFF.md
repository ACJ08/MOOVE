# MOOVE Supabase SSOT handoff

## What changed

The durable data model is now Supabase-first for onboarding and the core driving-session lifecycle. The new migration creates `driver_profiles` for normalized onboarding attributes and `session_events` for an append-only timeline. `driving_sessions` now records lifecycle status, driving and sedentary time, reminder behavior, AI summary, and update time. `driver_daily_metrics` is a queryable derived view for dashboard aggregates.

The frontend saves onboarding answers to `profiles`, `user_preferences`, and `driver_profiles`; redirects use `profiles.onboarding_complete`, not local storage. Session creation, exercise completion, and session completion write timeline events. Session completion writes its derived totals to the session row.

## Migration order

1. Back up the Supabase project/database.
2. Run [`src/lib/migrations.sql`](src/lib/migrations.sql) if the base schema is not installed.
3. Run [`supabase/migrations/20260805_security_and_data_integrity.sql`](supabase/migrations/20260805_security_and_data_integrity.sql).
4. Run [`supabase/migrations/20260805_ssot_sessions_and_onboarding.sql`](supabase/migrations/20260805_ssot_sessions_and_onboarding.sql).
5. In the SQL Editor, review then execute the commented administrator promotion statement for `admin@moove.app`.

Both later migrations are additive. They preserve existing rows. Test them first on a Supabase branch or staging project, then take a fresh production backup before execution.

## Architecture review

Previously, important data was split between React state, localStorage, mock data, and partial Supabase rows. The primary risks were lost onboarding/session state after refresh or device change, admin reports calculated from a browser's local history, and local cache being treated as successful persistence. Authentication also includes demo/local fallback paths; those should remain explicitly demo-only and must never be enabled for production credentials.

The target entity graph is:

`auth.users -> profiles -> driver_profiles / user_preferences`

`profiles -> driving_sessions -> session_events / exercise_history / sedentary_logs`

`profiles -> feedback_submissions`; the admin dashboard reads these same tables under admin RLS.

Existing hardening already provides profile ownership, admin authorization, foreign keys, checks, and session/exercise indexes. The SSOT migration adds the missing timeline relationships, lifecycle constraints, profile normalization, RLS, and composite indexes. `driver_daily_metrics` replaces manually maintained dashboard rollups with a database-derived projection.

## Remaining rollout work

Several secondary pages still contain legacy localStorage readers (`AdminFeedback`, `ThinkAloud`, analytics/demo pages, and some driver dashboards). Migrate each to a dedicated normalized table or the existing session/feedback tables before claiming total SSOT compliance. Do not delete local data automatically: provide a one-time authenticated import flow with an idempotency key, clear only after server acknowledgement, and retain a user-visible export.

For production, replace client-side aggregate loops with RPCs/views and pagination, subscribe to user-scoped changes only where live updates matter, and send AI generation through an authenticated Edge Function that validates curated exercise IDs. Keep service-role keys exclusively on the server. Add integration coverage for RLS ownership/admin access, onboarding save/reload, session interruption/reload, duplicate event idempotency, and concurrent browser tabs.
