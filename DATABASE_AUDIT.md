# MOOVE database and Supabase audit

## Implemented fixes

- The Supabase client now fails closed when Vite environment variables are absent; there are no in-source credentials.
- New authenticated users receive a `profiles` row from a database trigger before application data is written.
- Roles are no longer read from sign-up metadata or written by the browser.
- Feedback submissions verify the active Supabase user; demo submissions remain local.
- The new migration adds the columns the React code currently writes, secure RLS policies, grants, and query indexes.

## Tables required by current Supabase calls

| Table | Why it exists |
| --- | --- |
| `profiles` | App identity, role, onboarding and profile fields for `auth.users`. |
| `user_preferences` | Notification preferences persisted by settings. |
| `driving_sessions` | Session lifecycle and dashboard/admin aggregates. |
| `exercise_history` | Per-session exercise completions. |
| `health_metrics` | Daily health score, stress and calories. |
| `feedback_submissions` | In-app usability feedback collected from drivers. |
| `admin_settings` | Shared testing configuration read by drivers and changed by admins. |

The current React code does not query `sedentary_logs`, `ai_insights`, `notifications`, learning, analytics, research, audit, developer, or survey tables. Keep them only if another deployed service uses them; otherwise retire them after a backup and dependency check.

## Log correlation

| Logs | Root cause | Exact remediation |
| --- | --- | --- |
| 31–48 | `driving_sessions` and `exercise_history` reference `profiles`, but the profile was missing for the authenticated UUID. | Run the migration: it backfills profiles and installs `handle_new_user()`. The client no longer attempts profile upserts that can race with sign-up. |
| 29–30 | The same missing-profile condition affected `feedback_submissions`. | Backfill plus the authenticated-user check in `FeedbackValidation.tsx` resolves the FK violation. |
| 17–28 | Requests were made without a valid authenticated session and/or required grants/RLS policies did not exist. | The migration grants authenticated access and applies RLS. `saveTestingConfig` now skips RPC calls without a real session. |
| 1–16 | The RPC correctly rejected an unauthenticated/non-admin caller. The client sent repeated fire-and-forget requests, including from demo mode. | Keep the server-side check; run the documented one-time admin promotion and only call from an authenticated admin account. |

`23503` FK errors protected data integrity; no invalid child row was stored. `42501`/401 errors also did not expose data. The repeated failed requests are operational noise, not data corruption.

## Deployment order

1. Backup the Supabase database and inspect existing `profiles` rows.
2. Run `supabase/migrations/20260805_security_and_data_integrity.sql` once.
3. Promote reviewed admins with the commented SQL at the end of that migration.
4. Deploy this frontend with the renamed environment variable.
5. Test sign-up, session creation, feedback submission, admin settings, and a non-admin access attempt.

Do not place `VITE_GROQ_API_KEY` in the frontend: every `VITE_*` value is bundled to the browser. Store `GROQ_API_KEY` only in an Edge Function/server secret.
