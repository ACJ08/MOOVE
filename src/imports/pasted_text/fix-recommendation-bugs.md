Expanded Prompt
Act as an expert Full-Stack Software Engineer, Senior Supabase Database Architect, PostgreSQL Database Engineer, Backend Engineer, Frontend Engineer, React/TypeScript Developer, UI/UX Designer, Software Architect, QA Engineer, and Performance Optimization Specialist.
Analyze all of my project files thoroughly before making any modifications. Identify the root cause of every issue instead of applying temporary fixes. Ensure that every solution follows best practices, maintains clean architecture, prevents regressions, and keeps the application scalable and maintainable.
________________________________________
Issue 1: Exercise Recommendation Logic Bug
There is a critical bug in the Exercise Recommendation System.
Currently, exercises that the user has already completed are still being recommended again inside the "RECOMMENDED FOR YOU" section.
Example:
RECOMMENDED FOR YOU

🧘 Chin Tucks
Neck · 45s · Easy

Perform →

• Reduces neck tension
• Improves cervical posture

🤸 View More Recommended Exercises
Even after completing Chin Tucks, it is still recommended again.
This should never happen.
________________________________________
Required Logic
The recommendation engine must intelligently filter exercises depending on their category.
Categories include:
•	Warm-up Exercises
•	Break Exercises
•	Stop Exercises
•	Cooldown Exercises
Each category must maintain its own completion history.
For example:
Warm-up
If the user already completed:
•	Chin Tucks
•	Shoulder Rolls
These exercises must never appear again in the Warm-up recommendations during the same applicable session or until the intended reset condition (e.g., a new session/day, according to the application's design).
Instead, recommend only the remaining unfinished Warm-up exercises.
________________________________________
Break Exercises
If the user already completed a Break Exercise, it should no longer be recommended under Break recommendations.
Only unfinished Break exercises should appear.
________________________________________
Stop Exercises
The same logic applies.
Completed Stop exercises should automatically disappear from recommendations.
________________________________________
Cooldown Exercises
Completed Cooldown exercises must never be recommended again once completed for the applicable session.
________________________________________
Recommendation Requirements
The recommendation engine must:
•	Detect completed exercises.
•	Exclude completed exercises.
•	Recommend only unfinished exercises.
•	Never display duplicate completed exercises.
•	Refresh immediately after an exercise is completed.
•	Update the UI without requiring a page refresh.
•	Remain synchronized with Supabase.
•	Continue working correctly after logout/login.
•	Continue working correctly after refreshing the browser.
•	Continue working across different devices for the same account.
________________________________________
Data Persistence
Exercise completion must be stored permanently in Supabase.
Do not rely on:
•	localStorage
•	sessionStorage
•	temporary React state
•	cached variables
The source of truth must be Supabase.
Every recommendation should be generated using the latest database state.
________________________________________
Issue 2: Weekly Driving Activity Bug
There is a bug in the Driving Session page.
The Weekly Driving Activity chart does not properly reflect completed driving sessions.
It should automatically update whenever a driving session is completed and successfully saved.
Current expected workflow:
User starts session
        ↓
User ends session
        ↓
Driving session saved to Supabase
        ↓
Weekly Driving Activity updates immediately
________________________________________
Requirements
After every completed driving session:
•	Save the session into Supabase.
•	Update Weekly Driving Activity automatically.
•	No manual refresh required.
•	Persist after logout/login.
•	Persist after browser refresh.
•	Persist across devices.
Ensure the chart is populated entirely from Supabase instead of temporary frontend state.
________________________________________
Issue 3: Weekly Exercise Consistency Bug
The Weekly Exercise Consistency widget currently has incorrect or missing data.
It should display:
Exercises completed per day this week
This data must come directly from exercises completed during Driving Sessions.
________________________________________
Required Workflow
Driving Session
        ↓
User performs exercises
        ↓
Exercises completed
        ↓
Completion stored in Supabase
        ↓
Weekly Exercise Consistency updates
________________________________________
Requirements
The chart must:
•	Count completed exercises.
•	Group them by day.
•	Display only the current week.
•	Refresh immediately after completion.
•	Persist after page refresh.
•	Persist after logout/login.
•	Persist across devices.
•	Always retrieve data from Supabase.
Avoid storing chart data solely in React state.
________________________________________
Issue 4: Analytics Tab Bug
Inside the Analytics tab there is a bug affecting the:
Exercise Completion Rate
The completion rate is currently inaccurate.
It must be calculated using actual completed exercises from Driving Sessions.
________________________________________
Required Formula
Exercise Completion Rate

=

Completed Exercises
────────────────────────
Assigned/Recommended Exercises

× 100
or, if your application defines completion differently, use the most appropriate formula consistently throughout the application.
The calculation must be derived from the exercise completion records stored in Supabase.
________________________________________
Requirements
The Analytics page should:
•	Load data directly from Supabase.
•	Calculate completion rate dynamically.
•	Update immediately after a Driving Session ends.
•	Update immediately after exercises are completed.
•	Persist after browser refresh.
•	Persist after logout/login.
•	Never reset unexpectedly.
________________________________________
Database Requirements
Analyze the current Supabase schema and verify that the necessary tables and relationships exist.
Validate or create appropriate tables (if missing), such as:
•	Users
•	Driving Sessions
•	Exercise Library
•	Exercise Recommendations
•	Exercise Completions
•	Weekly Analytics
•	User Exercise History
Ensure:
•	Proper foreign keys
•	Referential integrity
•	Cascading rules where appropriate
•	Indexed frequently queried columns
•	Efficient queries
•	Row Level Security (RLS) policies
•	Authenticated-user access only to their own records
________________________________________
Backend Requirements
Review and fix:
•	Recommendation service
•	Exercise completion service
•	Driving session service
•	Analytics service
•	Weekly aggregation logic
•	API endpoints
•	Supabase queries
•	Database transactions
•	Error handling
•	Race conditions
•	Duplicate insertions
•	Optimistic UI synchronization
•	Cache invalidation (if applicable)
Ensure all database writes are atomic and consistent.
________________________________________
Frontend Requirements
Review and fix:
•	React state management
•	Data fetching
•	Query invalidation
•	Component lifecycle
•	useEffect dependencies
•	Async loading states
•	Error states
•	Real-time UI updates
•	Chart rendering
•	Recommendation cards
•	Analytics widgets
The UI should update immediately after successful database operations without requiring a page refresh.
________________________________________
Performance Requirements
Optimize all database queries to avoid:
•	Duplicate requests
•	N+1 query problems
•	Unnecessary re-renders
•	Excessive API calls
•	Redundant state updates
Where appropriate, use efficient filtering, aggregation, memoization, and database indexing to maintain good performance.
________________________________________
Deliverables
Provide a complete implementation that includes:
1.	Root cause analysis for each reported bug.
2.	A detailed explanation of why the bug occurred.
3.	The exact files, components, services, hooks, and database objects that require modification.
4.	Updated frontend logic.
5.	Updated backend logic.
6.	Updated Supabase schema and migrations (if required).
7.	Updated SQL queries and RLS policies (if required).
8.	Fixed recommendation algorithm.
9.	Fixed Weekly Driving Activity synchronization.
10.	Fixed Weekly Exercise Consistency synchronization.
11.	Fixed Exercise Completion Rate calculation.
12.	Proper persistence across browser refreshes, logout/login, and multiple devices.
13.	Validation that no completed exercise is recommended again within its applicable category according to the intended recommendation rules.
14.	Verification that all charts, analytics, and recommendations accurately reflect the latest data stored in Supabase.
15.	Ensure the entire application builds successfully, runs without runtime errors, is fully type-safe, and does not introduce regressions into existing functionality.

PART 9 — Persistent Database Architecture
Implement complete Supabase persistence.
Refreshing the browser must never erase information.
Every authenticated user must recover their complete application state.
________________________________________
Store all Driver data including:
Home
Driving Sessions
Exercise History
Dashboard
Sedentary Monitor
AI Insights
Achievements
Health Engagement
Weekly Driving
Recent Sessions
Daily Wellness
Recommendations
Session History
Exercise Completion
Break Compliance
Charts
Graphs
AI Behavioral Summaries
Weekly Trends
Notifications
Progress
Achievements
Badges
Personalization
Exercise Preferences
Activity Timeline
Feedback
Analytics
Everything currently shown in the Driver interface.
________________________________________
PART 10 — Home Page Persistence
Persist every generated metric, including:
Driving Time
Sedentary Time
Movement Streak
Exercises Completed
Calories Burned
Wellness Score
Weekly Driving
Recommendations
Driving Activity
Recent Sessions
Daily Wellness
Achievements
Health Engagement
Preventive Tips
________________________________________
Metric Computation Requirements
Where calculations are currently undefined, implement documented formulas.
Examples:
Calories Burned
Estimate using:
•	exercise duration
•	exercise intensity
•	MET values
•	user profile
Wellness Score
Compute from weighted components such as:
•	driving duration
•	sedentary compliance
•	exercise completion
•	streak
•	preventive engagement
Document every formula.
________________________________________
PART 11 — Driving Session Persistence
Persist:
Session History
Driving Duration
Weekly Driving Activity
Driving Analytics
Completed Sessions
Session Metadata
________________________________________
PART 12 — Exercise Library
Persist:
Exercise History
Completion Time
Exercise Type
Duration
Category
Associated Session
Completion Status
________________________________________
PART 13 — Preventive Health Dashboard
Every statistic must originate from Supabase.
Never use hardcoded values.
Persist:
Total Sedentary Time
Movement Streak
Weekly Activities
Weekly Driving
Exercises Completed
Health Engagement
Exercise Breakdown
Weekly Exercise Activity
Driving Statistics
AI Health Summary
AI Recommendations
Behavioral Summary
Recommendations
Personalized Insights
Sedentary Risk
Progress Insights
Weekly Charts
Historical Comparisons
________________________________________
PART 14 — Sedentary Monitor
Persist:
Today's Sedentary Time
Weekly Total
Daily Average
Goal Exceeded
Exercise Breakdown
Daily Sedentary Duration
Exercise Completion
Activity Timeline
Preventive Health Engagement
Provide clear definitions for every metric.
________________________________________
PART 15 — Admin Synchronization
Testing Session Configuration must become the single source of truth.
When administrators modify:
Session ID
Prototype Version
User Group
Testing Environment
Start Date
Target Participants
Testing Objective
Overall Success Criteria
the updated configuration must automatically propagate to every Driver Feedback screen.
________________________________________
PART 16 — Admin Database Persistence
Persist every Admin module inside Supabase.
Including:
Research Dashboard
Participants
Analytics
Feedback Analytics
Demo Monitoring
Settings
Configuration
Validation Framework
Reports
Charts
Exports
Refreshing the browser must never lose administrative data.
________________________________________
PART 17 — Supabase Database Design
Review the existing database and create or update the schema where necessary.
Normalize tables and relationships.
Implement:
•	Primary Keys
•	Foreign Keys
•	Constraints
•	Indexes
•	Cascading Deletes where appropriate
•	Row Level Security (RLS)
•	Policies
•	Views
•	Triggers
•	Database Functions
•	Materialized Views where beneficial
Every user record must be linked through auth.users.id.
________________________________________
PART 18 — Performance Optimization
Ensure the implementation remains production-ready.
Optimize:
•	SQL queries
•	React rendering
•	Database indexing
•	Network requests
•	Lazy loading
•	Memoization
•	Pagination
•	Caching where appropriate
Avoid unnecessary database reads and duplicate API calls.
________________________________________
PART 19 — Testing
After implementation, verify:
•	Every feature works after browser refresh.
•	Every authenticated user only accesses their own data.
•	The Admin account (admin@moove.app) correctly aggregates driver data.
•	Driver-generated data is immediately reflected in Admin dashboards.
•	Demo Mode behaves independently of Production Mode.
•	Session simulations trigger the exact same business logic as real driving sessions.
•	All analytics, KPIs, charts, and AI insights are computed from persisted database records rather than hardcoded values.
•	No regressions are introduced into the existing application.
________________________________________
Expected Deliverables
1.	Analyze the complete project before modifying code.
2.	Identify architectural issues and propose improvements.
3.	Design or update the Supabase schema as needed.
4.	Implement every requested feature using production-quality code.
5.	Migrate any mock or local state to persistent Supabase storage.
6.	Ensure every dashboard and visualization is database-driven.
7.	Preserve the application's current UI/UX design language while enhancing consistency and usability.
8.	Verify all functionality through end-to-end testing.
9.	Fix any discovered bugs or inconsistencies.
10.	Produce a comprehensive implementation report summarizing:
o	Files modified
o	Database changes
o	New tables, views, functions, and policies
o	Performance optimizations
o	Bug fixes
o	Security improvements
o	Testing results
o	Any assumptions made during implementation
o	Recommendations for future scalability and maintainability
Important Constraints
•	Do not remove existing functionality unless explicitly instructed (except the Stress Trend/Stress Reduction components).
•	Preserve backward compatibility wherever possible.
•	Follow React, TypeScript, Supabase, PostgreSQL, and UI/UX best practices.
•	Ensure all calculations are deterministic, documented, and reproducible.
•	Maintain a clean, modular, production-ready codebase with no placeholder logic or hardcoded values.

MOOVE_PUBLIC_SUPABASE_URL=https://zgthueozpynxuggjtpmw.supabase.co

MOOVE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Y4unxjKVs0Lsya1fNyIqbQ_PGQstI3S
