Here is a significantly expanded, detailed prompt that will guide an AI coding assistant (such as Claude Code, Codex, Cursor, or ChatGPT) to perform a comprehensive implementation rather than only making superficial changes.

---

**Expanded Prompt**

> **Act as a Senior Software Architect, Senior Full Stack Developer, Senior Backend Engineer, Senior Frontend Engineer, Database Architect (Supabase/PostgreSQL), UI/UX Designer, and Mobile/Web Application Engineer.**
>
> You are responsible for transforming my application into a **production-ready, fully functional, scalable, and maintainable system** without breaking any of the existing functionality.
>
> Before modifying any code:
>
> 1. Analyze the entire project architecture.
> 2. Identify every related component, page, hook, utility, API route, database call, service, context provider, and state management implementation.
> 3. Trace every dependency before making changes.
> 4. Do not remove existing functionality unless explicitly instructed.
> 5. Preserve existing UI styling and improve it where necessary.
> 6. Follow clean architecture, reusable components, SOLID principles, and production-ready coding practices.
> 7. Keep compatibility with both local development and production deployment.
> 8. Ensure everything remains compatible with my existing Supabase project named **MOOVE Project**.
>
> ---
>
> # PART 1 — Fully Functional Reminder Preferences
>
> The onboarding currently contains these options:
>
> **How would you like reminders?**
>
> Choose the style that works best for you while driving.
>
> * 📲 Pop-up notification
> * 🔊 Sound alert
> * 📳 Gentle vibration
> * 👁️ Silent (visual only)
>
> These options are currently only UI.
>
> I want you to convert them into a complete working feature.
>
> ### Requirements
>
> #### Database
>
> Store the user's reminder preferences in Supabase.
>
> Example fields:
>
> * reminder_type
> * notification_sound
> * vibration_enabled
> * visual_only
> * updated_at
>
> #### Frontend
>
> The selected option should:
>
> * highlight immediately
> * persist after refresh
> * reload correctly after login
> * sync with Supabase
> * allow editing later inside Settings
>
> #### Backend
>
> Create proper CRUD functions:
>
> * saveReminderPreference()
> * updateReminderPreference()
> * getReminderPreference()
>
> #### Notification Engine
>
> Connect the preference to the reminder system.
>
> Example:
>
> If Pop-up is selected:
>
> * display notification card
>
> If Sound Alert:
>
> * play alert audio
>
> If Gentle Vibration:
>
> * use browser vibration API when supported
>
> If Silent:
>
> * show only visual reminder
>
> Gracefully fallback when vibration or notifications are unavailable.
>
> ---
>
> # PART 2 — Smart Notifications
>
> Implement a fully working Smart Notification system.
>
> Current options:
>
> **Enable Smart Notifications?**
>
> Get timely nudges from Moo so you never miss a movement break.
>
> * 🔔 Yes, keep me on track!
> * 🔕 No thanks, I'll check manually.
>
> These should become fully functional.
>
> ## Requirements
>
> Save into Supabase:
>
> * smart_notifications_enabled
> * last_notification
> * next_notification
> * reminder_interval
>
> Create backend logic that:
>
> * tracks continuous driving time
> * automatically schedules reminders
> * avoids duplicate notifications
> * pauses notifications during exercise sessions
> * resumes afterward
> * respects user preference
>
> Create reusable services such as:
>
> NotificationScheduler
>
> ReminderEngine
>
> NotificationPreferences
>
> NotificationPermissionHandler
>
> The system should support:
>
> * browser notifications
> * in-app notifications
> * vibration
> * sound
> * future mobile support
>
> ---
>
> # PART 3 — Exercise Video Integration
>
> I am replacing the placeholder animation with my actual exercise video.
>
> The file is:
>
> **Chin Tucks Sample.mp4**
>
> I want this video integrated properly.
>
> Every exercise screen should use this MP4 as the exercise template until future exercise videos are added.
>
> This includes:
>
> * Warm-up exercises
> * Break exercises
> * Stop exercises
> * Cooldown exercises
>
> Every exercise should load this video automatically.
>
> ## Video Requirements
>
> The video must:
>
> * autoplay
> * preload
> * begin immediately
> * remain synchronized with the exercise timer
> * restart when restarting the exercise
> * pause when Pause is clicked
> * continue from paused position
> * stop after completion
> * replay correctly
> * work on desktop and mobile
> * gracefully handle autoplay restrictions
>
> If autoplay is blocked:
>
> * automatically mute
> * retry playback
> * display a play overlay only if required
>
> ---
>
> # PART 4 — Exercise Screen UI Redesign
>
> Completely redesign the Exercise Player screen while maintaining the application's design language.
>
> Target layout:
>
> ```
> 💪 EXERCISE IN PROGRESS
>
> Upper Trapezius Stretch
>
> Neck & Shoulders
>
> SET 1 OF 2
>
> Progress Bar
>
> [ Exercise Video ]
>
> -------------------------
> |                     |
> | Chin Tucks Sample   |
> | MP4                 |
> |                     |
> -------------------------
>
> 00:55
>
> ACTIVE
>
> Set 1 • 55s Remaining
>
> REMEMBER
>
> Exercise Instructions
>
> ------------------------
>
> ⏸ Pause
>
> ↺ Restart
>
> ■ Stop
>
> Skip Exercise
> ```
>
> ### UI Improvements
>
> Design a professional exercise player similar to modern fitness apps.
>
> Include:
>
> * animated progress ring
> * progress percentage
> * timer animation
> * glassmorphism cards where appropriate
> * responsive video container
> * rounded controls
> * smooth transitions
> * subtle motion effects
> * improved typography
> * accessibility improvements
> * dark/light mode compatibility
> * responsive layouts
>
> The exercise timer and video should appear as a single integrated experience.
>
> ---
>
> # PART 5 — Exercise Logic
>
> Refactor the exercise engine.
>
> Ensure:
>
> * video duration matches timer
> * pause pauses timer
> * restart restarts timer and video
> * skip moves correctly
> * cooldown begins automatically
> * session completion is detected
> * workout history updates
> * progress persists if page refreshes
> * user can resume unfinished exercise
>
> ---
>
> # PART 6 — Complete Supabase Integration Analysis
>
> I have already connected my Supabase project:
>
> **MOOVE Project**
>
> I want you to perform a full project audit.
>
> Analyze every page, feature, service, and component.
>
> Identify every feature that currently uses:
>
> * mock data
> * local state
> * local storage
> * placeholder logic
> * fake APIs
> * temporary arrays
> * demo services
> * hardcoded values
>
> For every one, explain:
>
> 1. Current implementation
> 2. Why it is incomplete
> 3. Required Supabase tables
> 4. Required API/service layer
> 5. Authentication requirements
> 6. Row Level Security (RLS) policies
> 7. Database relationships
> 8. Required indexes
> 9. Storage buckets (if applicable)
> 10. Migration scripts
>
> ---
>
> # PART 7 — Driver Side Database Integration
>
> Audit every driver feature.
>
> Determine which should persist to Supabase, including but not limited to:
>
> * User Profile
> * Driver Preferences
> * Reminder Settings
> * Smart Notifications
> * Exercise History
> * Session History
> * Daily Streak
> * Weekly Statistics
> * Monthly Statistics
> * Driving Sessions
> * Exercise Completion
> * Progress Tracking
> * Achievement Badges
> * XP or Reward System (if present)
> * Driver Settings
> * Device Preferences
> * Accessibility Preferences
> * Notification History
> * App Usage Analytics
> * Feedback
> * Bug Reports
>
> For each feature, identify:
>
> * required schema
> * relationships
> * CRUD operations
> * API functions
> * frontend integration
> * backend implementation
> * caching strategy
>
> ---
>
> # PART 8 — Admin Dashboard Integration
>
> Analyze the admin side completely.
>
> Determine what should be managed inside Supabase.
>
> Examples:
>
> * User Management
> * Driver Accounts
> * Exercise Library
> * Exercise Videos
> * Reminder Templates
> * Notifications
> * Analytics Dashboard
> * Reports
> * Feedback
> * Announcements
> * CMS Content
> * App Settings
> * Feature Flags
> * Activity Logs
> * Audit Logs
> * Admin Roles
> * Permissions
> * System Metrics
>
> Create a normalized relational database structure.
>
> ---
>
> # PART 9 — Code Quality Improvements
>
> While implementing everything:
>
> * remove duplicate logic
> * refactor repeated code
> * improve folder organization
> * optimize React rendering
> * improve loading states
> * improve error handling
> * add skeleton loaders
> * add toast notifications
> * improve accessibility
> * add TypeScript typings
> * improve reusable hooks
> * improve service abstraction
> * optimize Supabase queries
> * implement proper error boundaries
> * ensure production-level code quality
>
> ---
>
> # FINAL DELIVERABLES
>
> Do **not** immediately modify files.
>
> Instead, begin with a comprehensive audit and implementation plan that includes:
>
> 1. Complete project architecture overview.
> 2. List of every file requiring modification.
> 3. New files, hooks, services, and utilities to create.
> 4. Database schema changes and SQL migrations.
> 5. Supabase table designs, relationships, and RLS policies.
> 6. Backend API/service architecture.
> 7. Frontend integration flow.
> 8. Exercise engine redesign plan.
> 9. Notification system architecture.
> 10. Video playback architecture.
> 11. Driver-side integration checklist.
> 12. Admin-side integration checklist.
> 13. Potential bugs, edge cases, and performance concerns.
> 14. A phased implementation roadmap (Phase 1 → Final Phase), ensuring each phase is fully tested before moving to the next.
>
> The final solution should be production-ready, maintainable, responsive, scalable, fully integrated with Supabase, and compatible with both local development and deployment.
