# MOOVE

<p align="center">
  <img src="src/imports/_REMOVE_BG__MOOVE.png" alt="MOOVE logo" width="220" />
</p>

<p align="center"><strong>Preventive wellness support for people who spend long hours driving.</strong></p>

MOOVE is a responsive web application for Filipino drivers that turns long sedentary driving periods into opportunities for safe, short movement breaks. It combines driving-session tracking, a context-rated exercise library, wellness summaries, reminder preferences, and a research-facing administration area for usability validation.

> **Scope notice:** MOOVE provides preventive wellness guidance only. It is not a diagnostic, treatment, or emergency service. Exercises and breaks must only be performed when it is safe to do so—typically while parked or stopped as indicated in the application.

## Overview

Long periods behind the wheel can make it difficult for drivers to notice or act on discomfort, fatigue, and prolonged inactivity. MOOVE is designed for private-car, ride-hailing, taxi, delivery, truck, bus, and van drivers who need practical movement prompts that fit around real driving routines.

The application guides a driver through onboarding, an optional pre-drive warm-up, an active session with configurable break reminders, and a post-session summary. It records completed sessions and exercise history in Supabase when configured, and surfaces personal activity, sedentary time, wellness engagement, and recommendations. Researchers and administrators have separate routes for participant, session, feedback, and testing configuration review.

## Problem statement

Drivers can experience prolonged static sitting, repetitive steering and pedal work, constrained posture, and limited opportunities to take a restorative break. These conditions can contribute to musculoskeletal discomfort and fatigue, while a conventional exercise program may not fit intermittent or extended work shifts. Preventive tools also need to respect a critical constraint: a wellness suggestion must never distract someone from driving.

MOOVE addresses this gap with brief, context-aware micro-movements and behavioral feedback. Rather than presenting a clinical diagnosis or requiring a long workout, it helps drivers track time in a session, recognize increasing sedentary exposure, and select exercises appropriate to traffic, a parked vehicle, before driving, or after driving. The research modules support structured feedback and think-aloud testing so the experience can be evaluated and improved.

## Proposed solution

MOOVE combines the following implemented elements:

- A timed driving-session workflow with pause/resume, break, warm-up, cooldown, and completion states.
- Ten exercise records with instructions, duration, target areas, safety notes, contextual safety ratings, and demonstration videos where available.
- Recommendation selection that considers the current context, recent exercises, completed exercises, and a driver's reported problem areas.
- Configurable movement-break intervals and delivery styles: browser pop-up, sound, vibration, or silent in-app reminder.
- Supabase-backed storage for profiles, preferences, driving sessions, exercise history, health metrics, feedback, administrator settings, onboarding profiles, and session events.
- An optional server-side Groq-powered weekly wellness summary with a deterministic safety-focused fallback when no API key is present or the provider is unavailable.

## Key features

### Driver application

| Area | What is implemented |
| --- | --- |
| Authentication | Email/password registration, sign-in, sign-out, password-reset request, Supabase session restoration, and local/demo fallback paths. |
| Onboarding | Eight-step setup captures vehicle/driver type, daily driving duration, schedule, problem areas, reminder interval/style, warm-up preference, and notification preference. It writes to `profiles`, `user_preferences`, and `driver_profiles`. |
| Driving sessions | Start, pause, resume, recover an active session after refresh, take context-specific breaks, complete or skip exercises, optionally do warm-up/cooldown exercises, add notes, and save a final session report. |
| Sedentary monitoring | Session elapsed and sedentary duration produce Low, Moderate, High, or Very High risk guidance in the session flow. A separate monitor summarizes sessions. |
| Exercise library | Ten guided micro-movements, grouped as Upper Body and Lower Body & Eyes, with filters/details, safety context ratings, instructions, repetitions, and video playback. |
| Health views | Dashboard and preventive health dashboard present activity, driving, sedentary, streak, exercise, and engagement summaries. Supabase-backed views are used for non-demo data where implemented; demo/mock states remain available. |
| AI insights | The recommendation page derives behavioral insights from completed sessions and onboarding preferences. The completed-session flow also creates a local heuristic summary; the weekly wellness API can produce a Groq summary. |
| Health education | Four built-in educational articles on prolonged sitting, micro-movements, safe stretching, and preventive wellness. |
| Feedback and testing | Structured feedback captures ratings, task success, feature impressions, improvement requests, device/browser information, and free text. Think-aloud testing offers ten moderated usability questions and stores responses locally. |
| Settings | Profile fields and notification/reminder preferences can be updated. |

### Research and administrator application

| Module | Data and behavior |
| --- | --- |
| Research Dashboard | Displays research KPIs, desirability/feasibility/viability indicators, feature feedback, intent, session, and bug summaries. It includes local testing-data support. |
| Participants | Lists feedback participants from Supabase where available, with local feedback fallback. |
| Analytics | Calculates session duration, exercise completion, session count, and participant metrics from administrator session queries. |
| Feedback Analytics | Reviews detailed feedback, ratings, bugs, action plans, and iteration notes. Some testing artifacts are intentionally local-browser data. |
| Demo Monitoring | Shows Supabase administrator session records and listens for saved-session events in the current browser. |
| Settings | Manages testing configuration through `admin_settings` and a local cache; database writes use an admin-checked RPC. |
| Think-Aloud | Reuses the moderated driver think-aloud component under an administrator route. |

### Safety and resilience

- Exercise context matrix: `traffic`, `parked`, `before`, and `after` ratings of `safe`, `caution`, or `unsafe`.
- Browser notifications degrade safely when the Notification, Audio, or Vibration API is unavailable.
- An error boundary supplies recovery and home actions for unexpected UI errors.
- Pages are route-level lazy loaded with a loading state.

## Screenshots

Add project screenshots to a `docs/screenshots/` directory and replace these placeholders when they are available.

| Screen | Placeholder |
| --- | --- |
| Landing page | `docs/screenshots/landing-page.png` |
| Login and registration | `docs/screenshots/authentication.png` |
| Driver dashboard | `docs/screenshots/driver-dashboard.png` |
| Driving session | `docs/screenshots/driving-session.png` |
| Exercise library | `docs/screenshots/exercise-library.png` |
| Preventive health dashboard | `docs/screenshots/health-dashboard.png` |
| AI insights | `docs/screenshots/ai-insights.png` |
| Research admin dashboard | `docs/screenshots/admin-dashboard.png` |

## Technology stack

| Category | Technology |
| --- | --- |
| Frontend | React 19, React DOM 19, TypeScript 5.7, React Router 8.3 |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` |
| Build and development | Vite 8, Node.js 22, pnpm 10.34.3, oxfmt 0.2 |
| Backend/API | Vercel serverless function at `api/ai/wellness-summary.ts`; an included Hono/Deno Supabase function scaffold for Figma Make data |
| Database and auth | Supabase (`@supabase/supabase-js` 2.112), Supabase Auth, PostgreSQL, Row Level Security |
| AI | Groq OpenAI-compatible Chat Completions API; default model `llama-3.3-70b-versatile` |
| Browser capabilities | Notifications API, Web Audio API, Vibration API, Supabase Realtime |
| Deployment | Vercel SPA rewrite configuration; Figma Make-compatible Vite configuration |

## Architecture

```mermaid
flowchart LR
  D[Driver browser] --> R[React + Vite application]
  A[Admin browser] --> R
  R -->|Auth, data, Realtime| S[Supabase Auth + PostgreSQL]
  R -->|POST weekly aggregates| V[Vercel wellness endpoint]
  V -->|server-only key, optional| G[Groq API]
  V -->|provider unavailable/no key| F[Safety-focused fallback summary]
  S --> P[Profiles, sessions, exercise history]
  S --> X[Feedback, preferences, admin settings]
```

The browser creates a singleton Supabase client only when `VITE_SUPABASE_URL` and an anon/publishable key are supplied. It uses a dedicated `moove-auth-token` storage key so Figma Make's client is not reused. Core session and onboarding helpers use Supabase first. The app deliberately includes demo accounts, mock data, and browser-local fallback paths so it can be explored without a configured backend; those fallbacks are not a multi-device source of truth.

The Vercel API route accepts aggregate weekly values only. It validates non-negative numeric inputs, limits generation to 150 tokens, applies a nine-second timeout, and returns a preventive-language fallback summary on failure.

## Database design

### Runtime data model

The active React data layer currently queries the following core tables. The base migration also contains additional legacy/research tables; see [Schema notes](#schema-notes) before relying on them.

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : creates
  PROFILES ||--o| DRIVER_PROFILES : configures
  PROFILES ||--o| USER_PREFERENCES : sets
  PROFILES ||--o{ DRIVING_SESSIONS : owns
  DRIVING_SESSIONS ||--o{ SESSION_EVENTS : records
  DRIVING_SESSIONS ||--o{ EXERCISE_HISTORY : includes
  PROFILES ||--o{ HEALTH_METRICS : records
  PROFILES ||--o{ FEEDBACK_SUBMISSIONS : submits
  ADMIN_SETTINGS }o--|| PROFILES : "admin RPC authorizes"
```

| Table/view | Key relationships and purpose |
| --- | --- |
| `profiles` | Primary key `id` references `auth.users(id)`; stores driver/admin role, user profile fields, onboarding state, and login timestamp. |
| `driver_profiles` | `user_id` is both primary key and foreign key to `profiles`; normalizes driver type, schedule, problem areas, and reminders. |
| `user_preferences` | Per-user preferences keyed by `user_id`; stores reminder and notification settings. |
| `driving_sessions` | UUID primary key; `user_id` references the profile. Stores lifecycle status, timing, reminders, exercise totals, score, calories, notes, and optional AI summary. |
| `session_events` | Append-only event timeline linked to both a session and user profile, with an event type, elapsed seconds, timestamp, and JSON payload. |
| `exercise_history` | Links a user and optional session to a catalog exercise ID and completion/skip details. A partial unique index prevents duplicate `(user, session, exercise, context)` history rows. |
| `health_metrics` | Per-user recorded wellness, stress, posture, and calorie fields. |
| `feedback_submissions` | Authenticated user feedback, test metadata, ratings, open responses, bug report, device/browser, and submission time. |
| `admin_settings` | Key/value settings for shared testing configuration; writes happen through `upsert_admin_setting`. |
| `driver_daily_metrics` | Security-invoker view derived from completed `driving_sessions`, grouped by user and date. |

### Security model

- A database trigger creates each new user's `profiles` row with the `driver` role; browser sign-up metadata cannot promote a role.
- `prevent_role_change` blocks client role escalation, and `is_admin()` is a security-definer authorization helper used by policies and the settings RPC.
- RLS limits normal users to their own profiles, sessions, exercise history, session events, driver profile, and feedback. Administrators can read permitted cross-user records.
- Administrator setting writes are authorized in the `upsert_admin_setting` database function, not merely hidden by the client UI.
- Indexes support user/session and admin-report queries. The Realtime migration adds `driving_sessions` to Supabase Realtime.

### Schema notes

`src/lib/migrations.sql` is the historical base schema. It defines additional tables such as `sedentary_logs`, `ai_insights`, `notifications`, learning, recommendation, analytics, survey, research, audit, and developer-simulation tables. The current React code does **not** query most of those tables. Keep or retire them only after checking any deployed service dependencies. `DATABASE_AUDIT.md` documents this distinction.

## Project structure

```text
MOOVE/
├── api/ai/wellness-summary.ts        # Vercel Groq/fallback wellness endpoint
├── src/
│   ├── assets/videos/                # Bundled exercise videos
│   ├── components/                   # Error boundary and reusable video player
│   ├── context/AuthContext.tsx       # Auth, demo accounts, local fallback
│   ├── data/                         # Exercise catalog, videos, mock data
│   ├── imports/                      # Logos, mascot, profiles, source media, reference notes
│   ├── layouts/                      # Protected driver and admin shells
│   ├── lib/                          # Supabase singleton, persistence helpers, base SQL
│   ├── pages/
│   │   ├── admin/                    # Research/admin routes
│   │   ├── auth/                     # Login, register, forgot password
│   │   └── driver/                   # Driver wellness and research-testing routes
│   ├── services/                     # Analytics, notifications, AI API client
│   ├── App.tsx                       # Error and auth providers
│   ├── index.css                     # Tailwind entry point and global theme
│   ├── main.tsx                      # React mount
│   └── routes.tsx                    # Lazy-loaded route map
├── supabase/
│   ├── functions/server/             # Figma Make Hono/KV function scaffold
│   └── migrations/                   # Security, SSOT, and Realtime migrations
├── utils/supabase/info.tsx           # Figma Make Supabase compatibility exports
├── .env.example                      # Development environment template
├── .env.production.example           # Production environment template
├── DATABASE_AUDIT.md                 # Database implementation and rollout audit
├── SUPABASE_SSOT_HANDOFF.md          # Supabase-first rollout guidance
├── package.json                      # Scripts and package versions
├── vite.config.ts                    # Vite, Tailwind, Figma Make, and server settings
└── vercel.json                       # SPA rewrite
```

The `src/imports/pasted_text/` files are project/reference notes imported with the design workspace; they are not runtime modules. `dist/` and `node_modules/` are generated directories and should not be treated as source.

## Installation and local development

### Prerequisites

- Git
- Node.js **22** (declared in `.mise.toml`)
- pnpm **10.34.3** or npm (both lockfiles are present)
- A Supabase project for persistent auth/data
- A Groq API key only if you want provider-generated weekly summaries

### Clone and install

```bash
git clone <repository-url>
cd MOOVE
npm install
```

You may use `pnpm install` instead if your team standardizes on the included `pnpm-lock.yaml`.

### Configure the environment

Copy `.env.example` to `.env` and populate values for your Supabase project. Never commit a populated `.env` file.

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes for Supabase | `https://your-project.supabase.co` | Browser Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Yes for Supabase | `eyJ...` | Browser-safe publishable/anon key protected by RLS. `VITE_SUPABASE_PUBLISHABLE_KEY` is supported temporarily as a compatibility fallback. |
| `VITE_APP_NAME` | No | `MOOVE` | Public app label/configuration. |
| `VITE_APP_ENV` | No | `development` | Public environment label. |
| `VITE_API_BASE_URL` | No | empty for same origin | Prefix for `/api/ai/wellness-summary`; leave blank for Vercel same-origin deployment. |
| `GROQ_API_KEY` | No | `gsk_...` | **Server-only** key used by the Vercel wellness endpoint. Do not prefix it with `VITE_`. |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Optional Groq model override. |
| `NODE_ENV` | No | `development` | Node/server environment. |
| `PORT` | No | `8443` | Vite dev/preview port; Vite defaults to 8443 in this project. |

Without Supabase configuration, the application still exposes the local/demo experience. Password-reset delivery and persistent cross-device data require Supabase.

### Set up Supabase

1. Create a Supabase project and obtain its Project URL and anon/publishable key.
2. Configure these values in `.env` using the table above.
3. Back up any existing project database before applying migrations.
4. In the Supabase SQL Editor (or via your migration workflow), apply migrations in this order:

   ```text
   src/lib/migrations.sql
   supabase/migrations/20260805_security_and_data_integrity.sql
   supabase/migrations/20260805_ssot_sessions_and_onboarding.sql
   supabase/migrations/20260805_enable_driving_sessions_realtime.sql
   ```

5. Review the administrator promotion statement in the security/SSOT migration, then promote only a reviewed account. The repository targets `admin@moove.app` in the included SQL.
6. In Supabase Auth, configure the site's redirect URL so the password-reset path resolves at `<your-origin>/auth/reset-password`. Note that this route is not presently defined in `routes.tsx`; add it before treating password reset completion as production ready.
7. Test sign-up, onboarding persistence, session creation/completion, feedback submission, an admin settings write, and a non-admin access attempt.

The migrations are additive and intended to preserve existing data. See `SUPABASE_SSOT_HANDOFF.md` and `DATABASE_AUDIT.md` for rollout cautions; do not modify existing migrations merely to run the setup.

### Run the application

```bash
npm run dev
```

This starts Vite on `http://localhost:8443` by default (`--host 0.0.0.0`). There is no `server` or `dev:full` script in this repository: the frontend runs through Vite, Supabase is external, and the AI endpoint is deployed as a Vercel serverless function.

Useful additional commands:

```bash
npm run build     # creates the production bundle in dist/
npm run preview   # serves the built bundle on PORT or 8443
npm run format    # runs oxfmt
```

### Demo accounts

These accounts are hard-coded for local exploration and do not authenticate against Supabase:

| Role | Email | Password |
| --- | --- | --- |
| Driver demo | `driver@moove.app` | `Driver123!` |
| Research admin demo | `admin@moove.app` | `Admin123!` |

Do not use these credentials as production accounts.

## AI integration

The client sends weekly aggregate activity data—driving minutes, completed exercises/sessions, exercise completion rate, and optional tired areas—to `POST /api/ai/wellness-summary`. The Vercel function validates the payload and, if `GROQ_API_KEY` is available, calls Groq's OpenAI-compatible chat-completions endpoint. Its system prompt constrains the output to a concise preventive wellness summary: no diagnosis, prescription, medical outcome claim, or advice to exercise while driving.

The endpoint returns `{ summary, source }`, where `source` is `groq` or `fallback`. A fallback means the client can remain usable without an AI credential or during provider failure. In-browser recommendations use deterministic session and preference logic; they do not send a full personal profile to Groq.

## Authentication and access control

```mermaid
flowchart TD
  L[Login/Register] --> SA[Supabase Auth]
  SA --> T[auth.users trigger creates profiles row]
  T --> P[Load profile and role]
  P -->|driver| D[/driver routes]
  P -->|admin| A[/admin routes]
  D --> O{Onboarding complete?}
  O -->|No| ON[Onboarding]
  O -->|Yes| DD[Driver dashboard]
```

- `AuthProvider` restores a Supabase session, listens for auth-state changes, and loads the matching profile.
- Driver and admin layouts redirect unauthenticated visitors to `/auth/login`; `AdminLayout` redirects non-admins to the driver dashboard.
- Drivers who have not completed onboarding are redirected to `/driver/onboarding`, except for the explicit demo and admin accounts.
- Supabase database role—not browser-controlled sign-up metadata—determines persistent administrator access.
- A local account store exists as a no-Supabase fallback. It is suitable for prototype/demo use only, not secure production authentication.

## Performance and reliability

- Every route page is loaded with `React.lazy` and `Suspense`.
- Supabase client construction is cached on `globalThis` across Vite HMR updates.
- Session, exercise, and feedback queries have indexes added by the security migration; the analytics service restricts history reads and session queries use limits.
- Realtime refresh is scoped to a driver's weekly completed sessions.
- Browser feature use is capability-checked and failure-tolerant.

## Deployment

The application is configured for Vercel. `vercel.json` rewrites all unknown routes to `index.html`, allowing React Router browser routes to load directly. Vercel automatically recognizes `api/ai/wellness-summary.ts` as a serverless API function.

1. Import the repository into Vercel.
2. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and any public API base URL in the Vercel project environment.
3. Set `GROQ_API_KEY` and optionally `GROQ_MODEL` as server-only environment variables.
4. Use build command `npm run build`; the output directory is `dist`.
5. Add the deployed origin to Supabase Auth redirect/allowed URL configuration.

## Troubleshooting

| Symptom | Checks |
| --- | --- |
| Blank screen or error view | Open browser devtools, confirm `.env` values are present at build time, and run `npm run build` to identify TypeScript/Vite errors. |
| Supabase requests fail | Verify project URL/key, project status, migration order, authenticated session, table grants, and RLS policies. The migrations must be applied before core writes. |
| Admin settings denied | Confirm the user has a `profiles.role` of `admin`, is signed in through Supabase rather than a demo session, and the latest `upsert_admin_setting` function is installed. |
| AI response is fallback | This is expected when `GROQ_API_KEY` is absent or Groq times out/fails. Check that the key is set only on the server and that `VITE_API_BASE_URL` points to the deployment if it is cross-origin. |
| Password reset link does not complete | Configure Supabase redirect URLs and add the currently missing `/auth/reset-password` route before production use. |
| Browser reminders do not appear | Check browser notification permissions, HTTPS/browser policy, enabled notification preferences, and whether the selected reminder style is silent. |

## Recommended developer workflow

1. Pull the latest changes and install dependencies.
2. Copy/configure the environment template.
3. Apply the SQL migrations to a Supabase staging project in the documented order.
4. Start `npm run dev` and test both a real Supabase account and the demo accounts.
5. Verify driver onboarding, session lifecycle, feedback, and admin authorization.
6. Run `npm run build` before deployment.

## Future improvements

- Move remaining local-browser research artifacts (feedback action plans, iterations, think-aloud responses, and legacy dashboard readers) into authenticated normalized Supabase tables.
- Add the missing password-reset completion route and integration tests for the full authentication flow.
- Replace browser aggregate loops with paginated RPCs/views for larger study cohorts.
- Add automated tests for session recovery, RLS ownership/admin boundaries, duplicate event handling, and multiple tabs.
- Require authentication/authorization at the wellness endpoint before sending any user-linked aggregate data.
- Add a documented, user-approved local-data export/import migration path.

## Contributors

The landing page identifies Anne Carol Jonson and Jean Abrey Serva as the people behind MOOVE. Add contributors here as the project grows:

- Anne Carol Jonson
- Jean Abrey Serva
- Contributors: please open an issue or pull request with a clear description and validation steps.

## License

No `LICENSE` file is currently included in this repository. Treat the project as **all rights reserved/proprietary until the maintainers add an explicit license**.

## Acknowledgements

Built with React, Vite, Tailwind CSS, React Router, Supabase, Vercel, Groq, and the browser platform APIs used for notifications, audio, and vibration. The exercise media and MOOVE logo/mascot assets are included in the repository.
