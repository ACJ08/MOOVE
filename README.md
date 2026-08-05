# MOOVE — Driver Preventive Health & Wellness App

> **"Move a little. Drive a lot."**

MOOVE is a Progressive Web App designed for Filipino professional drivers. It monitors sedentary driving time, prompts micro-movement exercise breaks, tracks driving sessions, and delivers an AI-powered coaching engine — all within a research-grade prototype built for the **UNLEASH 2026** hackathon (Technology Readiness Level 4).

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Application Architecture](#application-architecture)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Exercise System](#exercise-system)
- [Driving Session](#driving-session)
- [AI Recommendation Engine](#ai-recommendation-engine)
- [Admin Portal](#admin-portal)
- [Research Tools](#research-tools)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Screenshots](#screenshots)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

### Problem Statement

Professional drivers in the Philippines spend 8–12+ hours per day seated behind the wheel. Prolonged sedentary driving is directly linked to musculoskeletal disorders, cardiovascular disease, chronic fatigue, and impaired concentration — yet no accessible, driver-specific wellness tool exists in the local market.

### Solution

MOOVE provides:

- **Sedentary monitoring** with real-time risk alerts
- **Context-aware exercise recommendations** (safe to do in traffic vs. parked)
- **Guided micro-movement breaks** with video demonstrations and timed exercise sessions
- **Health tracking** across sessions, exercises, and wellness scores
- **An AI coaching engine ("Moo")** that delivers personalized insights based on driving patterns and body preferences
- **A research administration portal** for collecting structured usability evidence during controlled testing

### Target Users

- **Primary:** Filipino professional drivers (ride-hailing, taxi, delivery, truck, bus, van, private)
- **Secondary:** Occupational health researchers and study administrators (UNLEASH-2026 evaluation team)

---

## Features

### Implemented Features

**Driver App**
- Email/password authentication via Supabase Auth with protected routes
- 7-step onboarding wizard capturing driver type, hours, tired body areas, and reminder preferences
- Real-time driving session timer with sedentary risk level tracking
- Context-aware exercise recommendation engine (traffic-safe vs. parked-only)
- Before-Driving Warm-Up: 10 exercises with independent per-exercise completion tracking
- After-Driving Cool-Down: 10 exercises with independent per-exercise completion tracking
- Movement Break system: mid-drive exercise prompts with configurable reminder intervals (15 / 30 / 45 / 60 min)
- Exercise configuration screen: customizable sets, duration per set, and rest between sets
- Video-guided exercise player with timed set/rest phases and audio cues
- Per-exercise immediate persistence to Supabase (`exercise_history`) during sessions
- Session history saved locally and synced to Supabase (`driving_sessions`)
- Health dashboard with wellness scores and trend metrics
- AI Insights engine ("Moo") — rule-based, personalized, no external API required
- Exercise Library with 10 exercises, video demonstrations, and category filters
- Health Education: 8 pre-seeded learn modules covering posture, fatigue, eye care, and more
- In-app TRL-4 usability survey (4-step feedback form, synced to Supabase)
- Think-Aloud protocol tool for moderated research sessions
- Research KPI dashboard showing live UNLEASH validation metrics
- Settings: notification style (popup / sound / vibration / silent), accessibility options, profile fields
- Responsive layout with warm MOOVE brand palette

**Admin Portal**
- Participant list from Supabase profiles
- Aggregated feedback analytics (ratings, distributions, feature mentions)
- Time-series analytics (sessions/day, exercises/day, DAU)
- Demo session monitoring for live showcase events
- Study configuration (participant quota, study phase, alert thresholds)
- Testing session configuration synced to Supabase via secure RPC
- Think-Aloud response aggregation across all participants

**Infrastructure**
- Supabase-first with localStorage fallback for every read and write
- Partial session record created at session START for crash recovery (updated at END)
- Immediate per-exercise Supabase writes during sessions
- Unique dedup index on `exercise_history` prevents duplicate records
- `SECURITY DEFINER` RPC (`upsert_admin_setting`) for privileged writes without broad table GRANTs
- `get_my_role()` SECURITY DEFINER function eliminates RLS recursion on admin policies

### Planned / Partially Implemented Features

- Supabase Realtime subscriptions for live dashboard updates
- Materialized view refresh automation (`mv_weekly_exercise_stats`)
- Web Push API for background break reminders when the app is minimized
- Avatar upload to Supabase Storage
- Password reset flow (UI exists; requires Supabase SMTP configuration)
- Expanded exercise library beyond the current 10 exercises
- Multi-language support (`preferred_language` field exists in `user_preferences`)
- High-contrast accessibility mode (`high_contrast` field exists; UI not fully wired)

---

## Technology Stack

| Category | Technology |
|---|---|
| **UI Framework** | React 19 |
| **Language** | TypeScript 5.7 |
| **Build Tool** | Vite 8 |
| **Routing** | React Router v8 (lazy-loaded, code-split pages) |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| **Backend / Database** | Supabase (PostgreSQL 15, Row Level Security) |
| **Authentication** | Supabase Auth (email/password, JWT sessions) |
| **State Management** | React Context (`AuthContext`), `useState` / `useEffect` per page |
| **Persistence Fallback** | `localStorage` (all reads/writes mirrored) |
| **AI Engine** | Client-side rule engine (no external LLM API) |
| **Media** | Bundled MP4 exercise videos via Vite asset imports |
| **Notifications** | Web Notifications API + Web Audio API + Vibration API |
| **Formatting** | oxfmt |
| **Platform** | Figma Make (Vite dev server on `$PORT`, default 8443) |
| **Package Manager** | pnpm |
| **Toolchain Manager** | mise (`.mise.toml`) |

---

## Project Structure

```text
/
├── index.html                          Vite HTML shell (#root mount point)
├── vite.config.ts                      Vite + React + Tailwind CSS v4 config
├── package.json                        Dependencies and scripts
├── .mise.toml                          Node.js and pnpm version pins
└── src/
    ├── main.tsx                        React entrypoint; imports index.css, mounts App
    ├── App.tsx                         ErrorBoundary → AuthProvider → RouterProvider
    ├── routes.tsx                      createBrowserRouter with all route definitions
    ├── index.css                       Tailwind v4 import, design tokens, global styles
    │
    ├── context/
    │   └── AuthContext.tsx             Auth state, login, register, updateUser, demo mode
    │
    ├── lib/
    │   ├── supabase.ts                 Singleton Supabase client + Database type stubs
    │   ├── db.ts                       All DB operations (sessions, exercises, health, admin)
    │   ├── migrations.sql              Complete PostgreSQL schema, RLS policies, seeds, grants
    │   └── hotfix_admin_settings_permissions.sql  Standalone admin_settings patch
    │
    ├── data/
    │   ├── exercises.ts                10 exercise definitions with full metadata
    │   ├── exerciseVideos.ts           Exercise ID → bundled mp4 URL mapping
    │   └── mockData.ts                 Static mock data for the demo account
    │
    ├── services/
    │   └── notificationService.ts      Web Notifications, Web Audio, Vibration APIs
    │
    ├── components/
    │   ├── ErrorBoundary.tsx           React class error boundary with fallback UI
    │   └── ExerciseVideo.tsx           Muted, looping video player for exercise demos
    │
    ├── layouts/
    │   ├── DriverLayout.tsx            Sidebar nav + outlet for /driver/* routes
    │   └── AdminLayout.tsx             Sidebar nav + outlet for /admin/* routes
    │
    ├── pages/
    │   ├── LandingPage.tsx             Public marketing / hero page
    │   ├── auth/
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   └── ForgotPasswordPage.tsx
    │   ├── driver/
    │   │   ├── Dashboard.tsx           Home: stat cards, badges, weekly activity chart
    │   │   ├── DrivingSessions.tsx     Session timer, exercise flows, real-time DB writes
    │   │   ├── GuidedExercises.tsx     Browsable exercise library with video player
    │   │   ├── AIRecommendations.tsx   "Moo" coaching engine, personalized insights
    │   │   ├── SedentaryMonitoring.tsx Sedentary risk display and historical data
    │   │   ├── HealthDashboard.tsx     Health metrics charts and trend view
    │   │   ├── HealthEducation.tsx     8 pre-seeded learn modules
    │   │   ├── FeedbackValidation.tsx  4-step TRL-4 usability survey
    │   │   ├── Settings.tsx            Notification prefs, profile, accessibility
    │   │   ├── OnboardingSetup.tsx     7-question onboarding wizard
    │   │   ├── ResearchDashboard.tsx   UNLEASH KPI tracker with live validation scores
    │   │   └── ThinkAloud.tsx          Moderated think-aloud protocol (10 questions)
    │   └── admin/
    │       ├── AdminDashboard.tsx      Aggregated research KPIs and rating summaries
    │       ├── AdminParticipants.tsx   Participant list from Supabase profiles
    │       ├── AdminAnalytics.tsx      Time-series session and exercise charts
    │       ├── AdminFeedback.tsx       All feedback submissions with distributions
    │       ├── AdminDemoMonitoring.tsx Live demo session monitoring
    │       ├── AdminSettings.tsx       Study config + testing session config
    │       └── AdminThinkAloud.tsx     Aggregated think-aloud responses
    │
    └── assets/
        └── videos/
            ├── Chin_Tucks.mp4
            ├── Upper_Trapezius_Stretch.mp4
            ├── Shoulder_Rolls.mp4
            ├── Wrist_Flexor_Stretch.mp4
            ├── Figure-4_Glute_Stretch.mp4
            ├── Heel_Raise_and_Toe_Raise.mp4
            ├── Standing_Calf_Stretch.mp4
            ├── Standing_Side_Stretch.mp4
            ├── 20-20-20_Eye_Reset.mp4
            └── Quad_Squeeze.mp4
```

**Key folder purposes:**

| Folder | Purpose |
|---|---|
| `context/` | Global React Context providers (Auth state) |
| `lib/` | Supabase client, all database operations, SQL schema |
| `data/` | Static exercise definitions, video mappings, mock data |
| `services/` | Browser API wrappers (notifications, audio, vibration) |
| `components/` | Reusable UI components shared across pages |
| `layouts/` | Page shells with navigation sidebars |
| `pages/driver/` | All driver-facing feature pages |
| `pages/admin/` | All admin/research portal pages |
| `assets/videos/` | Bundled exercise demonstration MP4 files |

---

## Application Architecture

### Frontend

React 19 with TypeScript. All pages are code-split via `React.lazy` and wrapped in `Suspense` with an `ErrorBoundary` fallback on each route group. Navigation is handled by React Router v8 with a `createBrowserRouter` configuration.

Two layout shells — `DriverLayout` and `AdminLayout` — provide the sidebar navigation and `<Outlet>` for their respective page trees. Route guards redirect unauthenticated or wrong-role users to `/`.

### State Management

Auth state is managed in `AuthContext` (React Context + Provider pattern). All other state is local to each page using `useState` / `useEffect`. There is no global store. Cross-component data sharing happens through `localStorage` and the custom `moove:session-saved` DOM event dispatched at session end.

### Backend

Supabase provides PostgreSQL (with full RLS), Auth (JWT), and the PostgREST API. There is no custom server or API layer — all data access goes through the `@supabase/supabase-js` client in `src/lib/db.ts`. Privileged operations use `SECURITY DEFINER` PostgreSQL functions called via `supabase.rpc()`.

### Data Flow

```
User action
  → React component state update
  → supabase.from(...) or supabase.rpc(...)   [primary]
  → localStorage.setItem(...)                 [mirror / fallback]
  → UI re-render
```

On app load:
```
supabase.auth.onAuthStateChange
  → INITIAL_SESSION / SIGNED_IN
  → fetchProfile(user.id) from Supabase profiles
  → Populate AuthContext
  → Protected routes become accessible
```

### Routing

```
/ (LandingPage)
├── /auth/login
├── /auth/register
├── /auth/forgot-password
├── /driver/* (DriverLayout — requires role: driver)
│   ├── dashboard
│   ├── sessions
│   ├── exercises
│   ├── ai-recommendations
│   ├── sedentary
│   ├── health-dashboard
│   ├── education
│   ├── feedback
│   ├── settings
│   ├── onboarding
│   ├── research
│   └── thinkaloud
└── /admin/* (AdminLayout — requires role: admin)
    ├── dashboard
    ├── participants
    ├── analytics
    ├── feedback
    ├── demo-monitoring
    ├── settings
    └── thinkaloud
```

---

## Database Schema

All 21 tables use `uuid_generate_v4()` primary keys and have Row Level Security enabled. The `authenticated` role is granted table-level privileges; policies restrict row access by user ID or admin role.

### Core Tables

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users`. Stores display name, role, driving goal, height, weight, BMI (generated column), onboarding status, last login. |
| `user_preferences` | Per-user notification and accessibility settings. One row per user (auto-seeded on profile creation). |
| `driving_sessions` | One row per driving session. Inserted (partial) at session start; updated with final stats at end. |
| `exercise_history` | One row per exercise completion. Written immediately when an exercise finishes. Unique dedup index prevents duplicates. |
| `health_metrics` | Daily health snapshot (pain, energy, stress, posture, wellness score, calories). One row per user per day. |
| `sedentary_logs` | Records each sedentary risk alert triggered during a session. |
| `ai_insights` | Stored AI coaching insight records. |
| `notifications` | Break reminder and system notification records. |
| `learn_modules` | Health education content. 8 modules pre-seeded. Publicly readable. |
| `learn_progress` | Tracks which modules each user has started and completed. |
| `feedback_submissions` | TRL-4 usability survey submissions from drivers. Tagged with study session ID. |
| `admin_settings` | Key-value store for study configuration. Written via `upsert_admin_setting` RPC. |
| `exercise_categories` | Exercise taxonomy. Publicly readable. |
| `exercise_progress` | Cumulative per-user per-exercise stats and streak tracking. |
| `exercise_recommendations` | Stored exercise recommendation records. |
| `reminders` | Scheduled reminder records. |
| `analytics_events` | Client-side event tracking. |
| `audit_logs` | Admin action audit trail. |
| `developer_simulations` | Admin-only test data payloads. |
| `survey_responses` | Granular per-question survey answers. |
| `research_metrics` | Computed UNLEASH KPI metrics. |

### Database Functions

| Function | Type | Purpose |
|---|---|---|
| `handle_new_user()` | Trigger | Auto-creates a `profiles` row on Supabase Auth signup |
| `handle_new_profile()` | Trigger | Auto-seeds `user_preferences` when a profile is created |
| `update_updated_at()` | Trigger | Keeps `updated_at` columns current |
| `get_my_role()` | SECURITY DEFINER | Returns current user's role without triggering RLS recursion |
| `get_testing_config()` | SQL | Returns testing config JSON |
| `upsert_admin_setting(p_key, p_val)` | SECURITY DEFINER | Admin-only write to `admin_settings`; enforces role check inside function body |

### Views

| View | Purpose |
|---|---|
| `v_weekly_driving_by_user` | Daily session aggregates per user (completed sessions only) |
| `mv_weekly_exercise_stats` | Materialized: weekly exercise stats per user — requires manual `REFRESH` |

---

## Authentication

### Flow

1. User submits credentials on `/auth/login`
2. `supabase.auth.signInWithPassword` authenticates against Supabase Auth
3. `onAuthStateChange` fires `SIGNED_IN`; `fetchProfile(uid)` loads the `profiles` row and stamps `last_login_at`
4. User object stored in `AuthContext` and mirrored to `localStorage`
5. React Router guards redirect to `/driver/dashboard` or `/admin/dashboard` based on role

### Registration

1. `supabase.auth.signUp` creates the `auth.users` record
2. `handle_new_user` database trigger automatically creates the `profiles` row
3. `handle_new_profile` trigger auto-seeds `user_preferences`
4. User is redirected to the onboarding wizard

### Roles

| Role | Access |
|---|---|
| `driver` | All `/driver/*` routes; read-only on shared tables |
| `admin` | All `/admin/*` routes; read/write on all tables via RLS + `get_my_role()` |

### Demo Accounts

Demo accounts bypass Supabase entirely and use static mock data from `src/data/mockData.ts`.

| Email | Password | Role |
|---|---|---|
| `driver@moove.app` | `Driver123!` | driver |
| `admin@moove.app` | `Admin123!` | admin |

---

## Exercise System

### The 10 Exercises

| ID | Name | Body Area | Traffic Safe |
|---|---|---|---|
| 1 | Chin Tucks | Neck | Yes |
| 2 | Upper Trapezius Stretch | Neck & Shoulders | Yes |
| 3 | Shoulder Rolls | Shoulders & Upper Back | Yes |
| 4 | Wrist Flexor Stretch | Wrists & Forearms | No |
| 5 | Seated Figure-4 Glute Stretch | Hips & Glutes | No |
| 6 | Seated Heel Raise and Toe Raise | Ankles & Feet | Caution |
| 7 | Standing Hip Flexor & Calf Stretch | Hips & Calves | No |
| 8 | Standing Side Stretch | Lower Back & Flanks | No |
| 9 | 20-20-20 Ocular Reset & Eye Blink | Eyes | Caution |
| 10 | Seated Knee Extension & Quad Squeeze | Knees & Quadriceps | Caution |

Each exercise has a bundled MP4 demonstration video, step-by-step instructions, target muscle descriptions, a "why drivers need it" explanation, configurable sets/duration/rest, and a safety context rating.

### Context Safety Ratings

- `safe` — can be performed while stationary in traffic
- `caution` — vehicle must be completely stopped and in park
- `unsafe` — must be performed outside the vehicle or while parked

### Exercise Categories and Completion Logic

**Before Driving (Warm-Up):** All exercises with `contexts.before === 'safe'`. Each exercise has its own independent completion state. Completed exercises show a green "Done" badge; the "Do It" button is disabled for the remainder of the session.

**Movement Breaks (mid-drive):** Recommends traffic-safe exercises first; falls back to parked-only when all traffic exercises are completed for the session.

**After Driving (Cool-Down):** All exercises with `contexts.after === 'safe'`. Same independent per-exercise completion logic as Warm-Up.

When all exercises in a category are done, a success banner appears: "Great job! You have completed all Warm-Up / Cool-Down exercises."

### Completion Persistence

- Completion state stored in `completedBeforeIds` / `completedBreakIds` / `completedAfterIds` (React `Set` state)
- Persisted to `moove_active_session` localStorage across page navigations
- Each completion immediately written to Supabase `exercise_history` with the current `session_id`
- Unique index `(user_id, session_id, exercise_id, context)` prevents duplicate submissions

### Recommendation Algorithm

1. Filters exercises by context (traffic vs. parked safety rating)
2. Excludes all exercises already completed this session
3. Prefers exercises matching the user's tired body areas from onboarding
4. Avoids repeating the most recently used exercise
5. Returns `null` (no recommendation) when all eligible exercises are exhausted — never falls back to completed exercises

---

## Driving Session

### Lifecycle

```
1. Tap "Start Driving"
   → createDrivingSession() inserts partial row (ended_at = null)
   → Session UUID stored in state + localStorage

2. Per-second interval
   → sessionSeconds++, sedentarySeconds++
   → getSedentaryRisk() updates risk indicator

3. At reminder interval (15 / 30 / 45 / 60 min, user-configured)
   → triggerBreakReminder() fires notification (popup / sound / vibration / silent)
   → Exercise recommendation modal appears

4. User completes an exercise
   → recordExerciseCompletion() writes to exercise_history immediately
   → completedBreakIds updated; recommendation engine excludes this exercise

5. Tap "End Session"
   → saveSessionToSupabase() UPDATEs the existing row with final stats
   → Health metrics upserted for today
   → Session saved to moove_session_history localStorage
   → moove:session-saved event dispatched (Dashboard listens)
   → activeDbSessionId cleared
```

### Sedentary Risk Levels

| Level | Threshold | Color |
|---|---|---|
| Low | 0–30 min | Green |
| Moderate | 31–60 min | Amber |
| High | 61–90 min | Orange |
| Very High | >90 min | Red |

### Session View State Machine

`main` → `before_driving` → `exercise_preview` → `rep_select` → `exercise_active` → `exercise_complete` → `main` → `cooldown_prompt` → `after_driving` → `session_processing` → `session_summary`

---

## AI Recommendation Engine

The "Moo" engine (`AIRecommendations.tsx`) is a **client-side rule engine** — no external AI API is used. All logic runs in the browser using session history from localStorage and onboarding preferences.

### Insight Types

| # | Insight | Trigger |
|---|---|---|
| 1 | Weekly Behavioral Summary | Always shown |
| 2 | Today's Personalized Recommendation | Based on today's driving accumulation |
| 3 | Streak & Encouragement | ≥3-day streak or 0-session reconnect |
| 4 | Tired Area Insight | Maps onboarding body area to a specific exercise |
| 5 | Long-Session Safety Insight | Users logging 5+ hours/day |
| 6 | Time-of-Day Tip | Early morning, midday, evening, or late-night |
| 7 | Exercise Variety Nudge | Repetitive exercise selection detected |
| 8 | 30-Day Milestone | On reaching 30 completed sessions |

### Body Area → Exercise Mapping

| Tired Area | Recommended Exercises |
|---|---|
| Neck | Chin Tucks, Upper Trapezius Stretch |
| Shoulders | Shoulder Rolls, Upper Trapezius Stretch |
| Upper Back | Shoulder Rolls, 20-20-20 Eye Reset |
| Lower Back | Seated Figure-4 Glute Stretch, 20-20-20 Eye Reset |
| Hips | Seated Figure-4 Glute Stretch, Standing Hip Flexor Stretch |
| Knees | Quad Squeeze, Standing Hip Flexor Stretch |
| Calves / Ankles | Heel Raise and Toe Raise |
| Wrists | Wrist Flexor Stretch |
| Eyes | 20-20-20 Ocular Reset |

---

## Admin Portal

Accessible to users with `role: admin`. Demo admin uses static mock data.

| Page | Path | Purpose |
|---|---|---|
| Dashboard | `/admin/dashboard` | Aggregated KPIs: avg ratings, would-use-again %, bug-free rate, feature mentions |
| Participants | `/admin/participants` | Live list of driver profiles from Supabase |
| Analytics | `/admin/analytics` | Time-series: sessions/day, exercises/day, DAU |
| Feedback | `/admin/feedback` | All `feedback_submissions` rows with rating distributions |
| Demo Monitoring | `/admin/demo-monitoring` | Real-time session monitoring during live showcase events |
| Settings | `/admin/settings` | Study config (quota, phase, thresholds) + Testing session config |
| Think-Aloud | `/admin/thinkaloud` | Aggregated think-aloud responses from all participants |

---

## Research Tools

MOOVE includes structured research instruments for the UNLEASH-2026 TRL-4 evaluation.

### ResearchDashboard (`/driver/research`)

Displays 11 KPIs across three UNLEASH dimensions:

- **Desirability:** Usability satisfaction, perceived usefulness, feature adoption, user retention intent
- **Feasibility:** Technical reliability, exercise completion rate, session completion rate, data accuracy
- **Viability:** Would-use-again rate, would-recommend rate, willingness to pay (future)

### ThinkAloud (`/driver/thinkaloud`)

10-question structured think-aloud protocol with per-question response timer. Responses saved to `moove_thinkaloud_responses` localStorage and viewable in AdminThinkAloud.

### FeedbackValidation (`/driver/feedback`)

4-step TRL-4 usability survey covering ratings, usability metrics, bug experience, and open-ended feedback. Each submission is tagged with the current `testing_session_id` and `prototype_version` from `admin_settings`.

---

## Installation

### Prerequisites

- Node.js 20+ (managed via [mise](https://mise.jdx.dev/))
- pnpm 9+
- A [Supabase](https://supabase.com/) project

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd moove

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Supabase URL and publishable key

# 4. Apply the database schema
# Open your Supabase project → SQL Editor
# Paste and run the full contents of: src/lib/migrations.sql

# 5. Start the development server
pnpm dev
```

The app will be available at `http://localhost:8443` (or the port in `$PORT`).

> **If you see `permission denied for table admin_settings` errors**, run `src/lib/hotfix_admin_settings_permissions.sql` in the Supabase SQL editor as well.

---

## Environment Variables

```env
# Required — your Supabase project credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here

# Optional — set automatically by the Figma Make platform
PORT=8443
FIGMA_PUBLIC_URL=
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (Project Settings → API) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key — safe to include in client builds |
| `PORT` | Dev server port. Defaults to `8443`. |
| `FIGMA_PUBLIC_URL` | Base URL prefix injected by Figma Make at deploy time |

> **Never expose your Supabase service-role key.** Only the publishable (anon) key is used in this application.

---

## Available Scripts

```bash
pnpm dev        # Start the Vite development server with hot reload
pnpm build      # Production build — outputs to dist/
pnpm preview    # Serve the production build locally for verification
pnpm format     # Format all source files with oxfmt
```

---

## Screenshots

| Screen | Description |
|---|---|
| Landing Page | Marketing hero with MOOVE mascot "Moo" |
| Driver Dashboard | Stat cards, weekly activity chart, achievement badges |
| Driving Session | Live session timer, sedentary risk level, exercise prompts |
| Before Driving Warm-Up | Exercise list with per-exercise completion tracking |
| Exercise Player | Video demo, timed sets/rest phases, audio cues |
| After Driving Cool-Down | Independent per-exercise completion, success banner |
| AI Recommendations | Personalized "Moo" coaching cards |
| Health Dashboard | Wellness trend charts and daily health metrics |
| Exercise Library | Full catalog with video previews and category filters |
| Admin Dashboard | Aggregated research KPIs from all participants |

---

## Known Limitations

- **No real-time sync:** Dashboard statistics update on page reload or after a session ends via a custom DOM event. Supabase Realtime subscriptions are not implemented.
- **Client-side AI only:** The "AI" engine is a deterministic rule engine. Insights are pattern-matched, not generated by an LLM.
- **localStorage dependency:** Offline reliability depends on `localStorage`. Clearing browser storage loses session history for demo users.
- **No avatar upload:** The `avatar_url` field exists in the schema and user model but file upload to Supabase Storage is not implemented.
- **Email delivery not guaranteed:** Password reset requires Supabase SMTP configuration; the UI flow exists but will silently fail without it.
- **Materialized view refresh:** `mv_weekly_exercise_stats` must be refreshed manually or via a Supabase scheduled function — it is not refreshed automatically.
- **10 exercises only:** The exercise library is fixed at 10 exercises. Adding new ones requires changes to `exercises.ts`, a new video asset, and an updated `exerciseVideos.ts` mapping.
- **English only:** The UI is English-only. The `preferred_language` field exists in `user_preferences` but multi-language support is not implemented.

---

## Future Improvements

- Supabase Realtime subscriptions for live admin monitoring and dashboard auto-refresh
- Web Push API for background break reminders when the app is not in focus
- Expanded exercise library with additional exercises and categories
- Dynamic AI insights powered by Claude API using session history as context
- Supabase Storage integration for avatar and profile photo uploads
- Multi-language support (Filipino / Tagalog as primary addition)
- Full accessibility mode (high contrast, scalable font, screen reader optimization)
- Offline-first architecture with Service Worker and background sync
- Research data export (CSV / PDF from the admin portal)
- Gamification: leaderboard, community challenges, extended achievement system
- Wearable device integration for passive sedentary detection

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the existing code conventions
4. Format your code: `pnpm format`
5. Commit: `git commit -m "feat: description"`
6. Push: `git push origin feature/your-feature-name`
7. Open a Pull Request against `main`

### Code Conventions

- TypeScript — no `any` types; prefer explicit interfaces
- Tailwind CSS v4 utility classes only; avoid inline styles except for dynamic values
- Default exports for all page and layout components
- Double quotes for strings containing apostrophes (`"We're here"`)
- All DB calls must guard against demo user IDs: `if (userId === 'demo' || userId === 'admin-demo') return`
- No comments unless the reason (not the what) is non-obvious

---

## License

This project does not currently have a defined open-source license. All rights reserved by the MOOVE development team. For research and evaluation use only during the UNLEASH-2026 study period.

---

## Acknowledgements

- [React](https://react.dev/) — UI framework
- [Vite](https://vitejs.dev/) — build tooling
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling
- [Supabase](https://supabase.com/) — backend, database, and authentication
- [React Router](https://reactrouter.com/) — client-side routing
- [TypeScript](https://www.typescriptlang.org/) — type safety
- [oxfmt](https://github.com/nicolo-ribaudo/oxfmt) — code formatting
- [Figma Make](https://www.figma.com/) — deployment platform
- WHO physical activity and sedentary behaviour guidelines — basis for risk thresholds
- Filipino driver health research literature — basis for exercise selection and session structure

---

> **MOOVE** · v0.49-TRL4 · UNLEASH-2026 · Built for Filipino drivers
