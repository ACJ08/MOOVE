# Comprehensive Full-Stack Supabase Persistence, Database Architecture Review, and Production Integration Prompt

Act as an expert **Senior Full-Stack Software Engineer, Database Architect, PostgreSQL Expert, Supabase Expert, Backend Engineer, Frontend Engineer, React + TypeScript Developer, Software Architect, UI/UX Engineer, DevOps Engineer, Performance Engineer, Security Engineer, QA Engineer, and Technical Documentation Specialist.**

## Primary Objective

Perform a complete architectural analysis of my entire MOOVE project before making any modifications.

I have already created my initial Supabase PostgreSQL database schema. Analyze both:

* my complete application
* my existing Supabase schema

to determine whether the current database design fully supports every feature implemented in my application.

Do **not** assume the current schema is correct simply because the tables already exist.

Instead, verify whether every feature in my application is properly represented, normalized, scalable, secure, and production-ready.

If additional tables, columns, relationships, indexes, constraints, triggers, policies, views, materialized views, or database functions are required, create or modify them appropriately.

The final architecture must follow production-grade software engineering practices.

---

# Existing Database

My current Supabase schema has already been created.

Review every table, relationship, trigger, policy, function, index, and constraint before making changes.

Do **not** recreate existing tables unnecessarily.

Instead:

* analyze them
* compare them with the application
* identify missing fields
* identify redundant fields
* identify normalization issues
* identify scalability concerns
* identify security concerns
* identify performance bottlenecks

Then update the schema only where necessary.

---

# Existing Project Analysis

Analyze the complete project first.

Review every file including:

* React components
* Pages
* Hooks
* Contexts
* Stores
* Services
* Utilities
* Types
* APIs
* Authentication
* Routing
* Dashboard logic
* Charts
* Analytics
* AI modules
* Exercise Library
* Home
* Driving Session
* Sedentary Monitor
* Health Dashboard
* AI Insights
* Notifications
* Feedback
* Admin Portal
* Research Dashboard
* Reports
* Settings
* Profile
* Theme
* Demo Mode
* Validation Module

Create a dependency map showing how each page interacts with data.

Identify:

* duplicated logic
* local state that should become persistent
* mock data
* hardcoded values
* missing APIs
* missing services
* missing repositories
* missing hooks
* missing database synchronization

before implementing any modifications.

---

# Complete Supabase Persistence

Implement complete persistent storage using Supabase.

Refreshing the browser must never erase information.

Every authenticated user must recover their complete application state after login.

No important application state should exist only inside React state if it should persist across sessions.

Replace any mock data, temporary state, or hardcoded dashboard values with real Supabase data.

---

# Persist Every Driver Module

Persist every piece of information generated throughout the Driver interface.

Including but not limited to:

## Home

Persist:

* Driving Time
* Sedentary Time
* Movement Streak
* Exercises Completed
* Calories Burned
* Wellness Score
* Health Engagement
* Weekly Driving
* Recent Sessions
* Recommendations
* AI Summary
* Preventive Tips
* Daily Wellness
* Activity Timeline
* Achievements
* Badges
* Progress

---

## Driving Sessions

Persist:

* Session lifecycle
* Start time
* End time
* Duration
* Distance (if applicable)
* Session metadata
* Break history
* Exercises completed
* Exercises skipped
* Driving analytics
* Weekly driving history
* Monthly driving history
* Session summaries

---

## Exercise Library

Persist:

* Exercise history
* Exercise completion
* Duration
* Sets
* Rest interval
* Exercise category
* Exercise context
* Session association
* Completion status
* Skipped exercises
* Exercise preferences
* Exercise recommendations
* Progress
* Streaks

---

## Preventive Health Dashboard

Every statistic displayed on the dashboard must originate from Supabase.

Never use:

* hardcoded values
* placeholder values
* randomly generated metrics

Persist and compute:

* Total sedentary time
* Weekly sedentary time
* Weekly exercise completion
* Health engagement
* Wellness score
* Calories burned
* Movement streak
* AI health summary
* Behavioral summary
* Personalized recommendations
* Exercise breakdown
* Weekly activity
* Historical comparisons
* Charts
* Graphs
* KPIs

---

## Sedentary Monitor

Persist:

* Daily sedentary duration
* Weekly sedentary duration
* Risk history
* Risk trends
* Goal exceeded
* Alert history
* Activity timeline
* Preventive interventions
* Exercise compliance
* Daily averages

Provide documented definitions for every metric.

---

## AI Insights

Persist:

* Recommendations
* Behavioral summaries
* Preventive insights
* Health summaries
* AI-generated explanations
* Recommendation history
* Read/unread status
* Expiration logic

---

## Notifications

Persist:

* Break reminders
* Exercise reminders
* AI notifications
* System notifications
* Read status
* Delivery history

---

## Feedback

Persist every submitted survey permanently.

Include:

* Testing Session ID
* Prototype Version
* User Group
* Environment
* Ratings
* Feature requests
* Comments
* Device information
* Browser information
* Submission timestamps

---

## Analytics

Persist application analytics including:

* Navigation events
* Feature usage
* Exercise usage
* Session statistics
* Dashboard interactions
* Engagement metrics

---

# Home Page Metric Computation

Where formulas do not currently exist, design deterministic production-ready formulas.

Examples include:

## Calories Burned

Estimate using:

* MET values
* exercise duration
* user age
* exercise intensity
* exercise category

Document every equation.

---

## Wellness Score

Compute using weighted components including:

* sedentary compliance
* driving duration
* exercise completion
* preventive engagement
* streak
* health metrics

Document every formula.

---

# Administrative Synchronization

Testing Session Configuration must become the single source of truth.

Whenever an administrator changes:

* Session ID
* Prototype Version
* User Group
* Testing Environment
* Start Date
* Target Participants
* Testing Objective
* Success Criteria

every Driver Feedback page must automatically display the updated configuration without requiring manual changes.

---

# Database Review

Review my existing schema carefully.

Determine whether it fully supports the application's current implementation.

If needed:

* modify tables
* split tables
* merge tables
* normalize relationships
* introduce lookup tables
* improve indexing

Implement:

* Primary Keys
* Foreign Keys
* Unique Constraints
* Check Constraints
* Composite Keys
* Cascading Deletes
* Cascading Updates
* Views
* Materialized Views
* Database Functions
* Triggers
* Stored Procedures where appropriate
* RLS
* Secure Policies

Every user record must ultimately relate to `auth.users.id`.

---

# Security

Review security thoroughly.

Ensure:

* RLS is enabled everywhere appropriate.
* Policies prevent unauthorized access.
* Drivers can only access their own data.
* Administrators can access aggregated data where appropriate.
* Sensitive operations are protected.

Do not weaken security.

---

# Performance Optimization

Ensure production readiness.

Optimize:

* SQL queries
* React rendering
* Memoization
* Pagination
* Database indexing
* Lazy loading
* Batch writes
* Batch reads
* Caching
* Network requests
* API efficiency
* Query planning
* N+1 query prevention

Avoid duplicate API calls and unnecessary database reads.

---

# Code Quality

Refactor where appropriate.

Ensure:

* modular architecture
* reusable services
* reusable hooks
* reusable repositories
* reusable utility functions
* consistent naming conventions
* strict TypeScript typing
* production-ready error handling
* loading states
* retry mechanisms
* optimistic updates where beneficial

---

# Validation

Verify that:

* every feature works after browser refresh
* every authenticated user retrieves their complete application state
* Driver data is immediately reflected in Admin dashboards
* Demo Mode remains isolated from Production Mode
* Session simulations execute identical business logic as real sessions
* every chart is database-driven
* every KPI is computed from persisted records
* every AI insight is generated from stored data
* no regression is introduced

---

# Deliverables

Produce:

1. Complete architectural analysis.
2. Database schema review.
3. List of required schema modifications.
4. Updated Supabase migration scripts.
5. Updated TypeScript types.
6. Required frontend changes.
7. Required backend/service changes.
8. Required React hooks.
9. Required API integrations.
10. Complete persistence implementation.
11. Performance improvements.
12. Security improvements.
13. Testing report.
14. Bug fixes.
15. Documentation of all deterministic formulas.
16. Explanation of every assumption made.
17. Future scalability recommendations.

---

# Important Instructions

* Analyze before modifying.
* Reuse existing database objects whenever appropriate.
* Do not recreate tables that already satisfy application requirements.
* Only introduce schema changes when they improve correctness, normalization, scalability, maintainability, or performance.
* Preserve all existing functionality unless explicitly instructed otherwise.
* Remove all mock data and placeholder logic.
* Ensure every displayed metric originates from persisted Supabase data.
* Follow React, TypeScript, PostgreSQL, and Supabase best practices.
* Produce production-quality, maintainable, secure, and well-documented code.
* If my existing schema is insufficient, explain **why** each modification is required before implementing it.
* **Do not expose or hardcode Supabase credentials in source code, prompts, logs, or generated files.** Treat all project URLs and publishable/anonymous keys as configuration values loaded securely from environment variables (e.g., `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`). Never embed secrets or publishable keys directly in the implementation.
