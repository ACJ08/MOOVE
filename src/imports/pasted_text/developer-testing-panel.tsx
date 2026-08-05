Here's a significantly expanded, structured, and professional version of your prompt that will produce much better results from an AI coding agent (such as Codex, Claude Code, Cursor, Windsurf, or ChatGPT with repository access).

---

# Expanded Prompt

**Act as an expert Full Stack Software Engineer, Senior Supabase Database Architect, PostgreSQL Database Engineer, Frontend Engineer, Backend Engineer, React/Vite Developer, TypeScript Engineer, UI/UX Designer, Software Architect, QA Engineer, and Code Refactoring Specialist.**

Carefully **analyze my entire project first before making any modifications.** Do not make assumptions. Inspect every file, folder, component, page, route, hook, utility, context, database integration, Supabase client, storage implementation, services, types, constants, JSON data, and assets to understand how the application currently works.

Before making any changes:

* Identify every location where the affected features are implemented.
* Detect duplicated logic.
* Preserve the existing architecture.
* Avoid breaking existing functionality.
* Ensure the project compiles without errors.
* Ensure TypeScript has zero type errors.
* Ensure there are no runtime errors.
* Ensure there are no unused imports or dead code after the refactoring.

---

# Part 1 — Replace "Seated Lateral Lumbar Side Stretch"

Completely replace the exercise:

> **Seated Lateral Lumbar Side Stretch**

with the new exercise:

## 8. Standing Side Stretch

### Targets

* Quadratus lumborum (QL)
* Latissimus dorsi
* External obliques
* Intercostal muscles
* Erector spinae

### Why Drivers Need It

Helps relieve stiffness and compression along the sides of the lower back and torso caused by prolonged sitting and maintaining one position while driving. It also improves lateral trunk mobility and posture.

### Recommended Duration

* 2–3 stretches per side
* Hold 10–15 seconds each
* Approximately 45–60 seconds total

### Recommended Context

✅ Parked

✅ Before Driving

✅ After Driving

❌ Not Recommended While Driving

❌ Not Recommended During Traffic

### Key Instructions

1. Stand with your feet shoulder-width apart.
2. Raise your right arm overhead.
3. Keep your shoulders relaxed and your hips facing forward.
4. Gently lean your upper body to the left until you feel a comfortable stretch along your right side.
5. Hold for 10–15 seconds while breathing normally.
6. Return to the starting position.
7. Repeat on the opposite side.
8. Avoid twisting your torso or leaning forward.

### Safety Notes

* Stretch only to a comfortable range.
* Never force the movement.
* Keep both feet firmly planted.
* Stop immediately if sharp pain, dizziness, or loss of balance occurs.
* Perform only when the vehicle is safely parked or before/after driving.

---

## Important

Search the **entire codebase** and replace every occurrence of **Seated Lateral Lumbar Side Stretch**.

This includes, but is not limited to:

* Exercise Library
* Before Driving Exercises
* Break Exercises
* Stop Exercises
* Cooldown Exercises
* Home recommendations
* AI Insights
* Suggested Exercises
* Exercise Cards
* Exercise Detail Pages
* Progress Tracking
* History
* Exercise Metadata
* Exercise IDs
* Exercise JSON
* Constants
* Type Definitions
* Icons
* Images
* Video References
* Database Seeds
* Database Tables
* Supabase Records
* Analytics
* Research Dashboard
* Anywhere the old exercise is referenced

Ensure **all references remain consistent** after the replacement.

---

# Part 2 — Replace Exercise Video

I will upload a new video named:

> **20-20-20 Exercise Number 9.mp4**

Analyze how videos are currently managed.

Then:

Replace every video currently used for

> **20-20-20 Ocular Reset & Eye Blink**

with the uploaded video.

The replacement must apply everywhere, including:

* Warm-up Exercise
* Break Exercise
* Stop Exercise
* Cooldown Exercise
* Exercise Library
* Exercise Preview
* Exercise Details
* Exercise Recommendations
* Exercise Playback

Requirements:

* Automatically mute the video.
* Enable autoplay.
* Restart automatically when replayed.
* Preserve the current responsive video player.
* Ensure no broken references remain.
* Update Supabase Storage references if videos are stored there.
* Update local assets if videos are stored locally.

---

# Part 3 — Developer Testing Panel

When a user successfully signs in or creates an account, enable a **Developer Testing Panel** that is visible **only in Demo Mode**.

The panel must appear inside the **Driving Session** tab.

Design it professionally using the application's existing design system.

Display:

```
🧪 Developer Testing Panel

Simulate driving time.
Break triggers immediately if interval threshold is crossed.

+20 min
+30 min
+45 min
+60 min
+90 min
+120 min

⚠️ Visible in Demo Mode only.
For research testing purposes.
```

---

## Functional Requirements

Each button must immediately simulate elapsed driving time.

Examples:

+20 min

* Add 20 minutes to the current driving session.
* Update the driving timer.
* Update sedentary duration.
* Trigger any reminder that should have occurred.

+30 min

Same behavior using 30 minutes.

+45 min

Same behavior.

+60 min

Same behavior.

+90 min

Same behavior.

+120 min

Same behavior.

---

The simulation must update every related feature, including:

* Driving Session Timer
* Sedentary Monitor
* Break Reminder Engine
* Exercise Recommendation Engine
* Dashboard Statistics
* AI Insights
* Session History
* Research Dashboard
* Analytics
* Notification Queue
* Feedback Eligibility
* Demo Monitoring

The simulation should behave exactly as if the user had actually been driving for that amount of time.

---

# Part 4 — Authentication

Completely implement production-ready authentication using Supabase.

The following must work correctly:

* Sign Up
* Sign In
* Sign Out
* Remember Session
* Forgot Password
* Session Persistence
* Protected Routes
* Authentication Guards
* Email Validation (if enabled)
* Duplicate Email Validation
* Password Validation
* Error Handling

Store all user accounts in Supabase Authentication and persist the corresponding user profile in appropriate database tables.

Ensure authentication remains active even after refreshing the application.

---

# Part 5 — Database Integration

Fully integrate Supabase throughout the application.

Replace temporary state, mock data, demo arrays, local storage, and placeholder data with real database operations wherever appropriate.

All user-generated data must persist after refresh.

---

## Driver Side

Make every feature fully functional and backed by Supabase.

Including:

### Home

* Welcome information
* User summary
* Recent activity
* Personalized recommendations

### Driving Session

* Driving sessions
* Timer
* Pause
* Resume
* Stop
* Break reminders
* Exercise reminders
* Session history

### Exercise Library

* Exercise catalog
* Categories
* Exercise completion
* Favorites (if available)
* Exercise history
* Progress tracking
* Video playback metadata

### Dashboard

* Driving statistics
* Daily metrics
* Weekly metrics
* Monthly metrics
* Charts
* Progress indicators

### AI Insights

Persist:

* Personalized recommendations
* AI summaries
* Behavioral insights
* Historical recommendations
* Risk indicators

### Sedentary Monitor

Store:

* Sedentary duration
* Alerts
* Warning history
* Break history

### Learn

Persist:

* Viewed resources
* Reading progress
* Completed educational materials

### Feedback

Store:

* Ratings
* Comments
* Survey responses
* Submission timestamps

---

# Part 6 — Admin Portal

Make every admin feature fully functional using Supabase.

Including:

## Research Dashboard

Display real data.

## Participants

* Registered users
* Demographics
* Driving statistics
* Research participation

## Analytics

Generate statistics directly from the database.

Examples:

* Daily users
* Active users
* Driving duration
* Exercise completion
* Break compliance
* User engagement
* Session trends
* Feedback statistics

## Feedback Analysis

Display:

* Average ratings
* Response distributions
* Comment analysis
* Trends
* Export-ready data

## Demo Monitoring

Display:

* Demo users
* Simulated sessions
* Developer testing usage
* Simulation timestamps
* Triggered reminders
* Exercise completion during simulations

## Settings

Persist all settings inside Supabase.

---

# Part 7 — Database Architecture

Design a scalable PostgreSQL schema following best practices.

Normalize the database appropriately and define proper relationships.

Create or update tables as needed, including (where applicable):

* profiles
* user_preferences
* driving_sessions
* sedentary_records
* exercise_categories
* exercises
* exercise_history
* exercise_progress
* exercise_recommendations
* ai_insights
* notifications
* reminders
* dashboard_statistics
* learning_resources
* learning_progress
* feedback
* survey_responses
* analytics_events
* developer_simulations
* admin_settings
* research_metrics
* system_logs

Implement:

* Primary Keys
* Foreign Keys
* Indexes
* Constraints
* Cascading Rules
* Row Level Security (RLS)
* Secure Storage Policies
* Timestamp fields
* Created/Updated tracking
* Soft deletes where appropriate

---

# Part 8 — Code Quality

After implementation:

* Remove obsolete code.
* Remove duplicated logic.
* Refactor where appropriate.
* Maintain a modular architecture.
* Follow React and TypeScript best practices.
* Follow Supabase best practices.
* Preserve responsiveness.
* Preserve the current UI/UX.
* Ensure accessibility.
* Ensure mobile responsiveness.
* Ensure all pages compile successfully.
* Ensure no TypeScript, ESLint, or runtime errors remain.

---

# Part 9 — Final Validation Checklist

Before completing the task, verify that:

* ✅ Every occurrence of **Seated Lateral Lumbar Side Stretch** has been replaced with **Standing Side Stretch**.
* ✅ Every **20-20-20 Ocular Reset & Eye Blink** video has been replaced with **20-20-20 Exercise Number 9.mp4**, with autoplay, mute, and replay enabled.
* ✅ The **Developer Testing Panel** is fully functional and visible only in Demo Mode.
* ✅ Authentication is fully integrated with Supabase Authentication.
* ✅ User profiles and application data persist after refresh.
* ✅ Every driver feature is backed by Supabase.
* ✅ Every admin feature is backed by Supabase.
* ✅ All data is stored and retrieved from PostgreSQL instead of temporary state or mock data.
* ✅ Database schema, relationships, indexes, and RLS policies are correctly implemented.
* ✅ No UI regressions were introduced.
* ✅ No broken routes, missing assets, or invalid references remain.
* ✅ The application builds successfully with zero TypeScript, ESLint, and runtime errors.
* ✅ Provide a concise implementation summary listing every modified file, every created database table or migration, every updated Supabase Storage asset, and any assumptions made during the implementation.
