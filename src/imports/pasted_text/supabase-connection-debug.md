**Expanded Prompt:**

> **Act as an expert Full-Stack Software Engineer, Database Architect, PostgreSQL/Supabase Specialist, Backend Developer, Frontend Developer, UI/UX Designer, Figma Make Expert, Systems Analyst, QA Engineer, and DevOps Engineer.**
>
> Analyze **all of my project files**, the existing application architecture, the Figma Make project, the Supabase integration, and the SQL migration that I successfully executed in the Supabase SQL Editor. Do **not** make assumptions—inspect the entire project and determine why the application is not communicating with Supabase.
>
> I have already successfully executed the complete SQL migration in Supabase, which created all required tables, indexes, triggers, RLS policies, authentication triggers, and seed data. 
>
> ## Primary Goal
>
> I want my **Figma Make application to become fully connected to Supabase**, with real-time database operations working correctly. At the moment, even though Supabase is connected inside Figma Make, **no data is being stored in the Supabase database.**
>
> Perform a complete end-to-end diagnosis and fix every issue preventing the application from reading from and writing to Supabase.
>
> ---
>
> # 1. Analyze the Entire Project
>
> Inspect every file, including but not limited to:
>
> * Frontend
> * Backend
> * API integrations
> * Authentication flow
> * Environment variables
> * Supabase client initialization
> * Database queries
> * API routes
> * State management
> * Figma Make generated code
> * Component hierarchy
> * Event handlers
> * Form submissions
> * Navigation
> * Build configuration
> * Runtime errors
> * Console errors
> * Network requests
> * Authentication session handling
>
> Identify every reason why the app cannot communicate with Supabase.
>
> ---
>
> # 2. Verify Supabase Configuration
>
> Check whether:
>
> * Supabase URL is correct
> * Supabase Anon Key is correct
> * Environment variables are loaded properly
> * Client initialization is correct
> * API calls are executed
> * Authentication sessions are maintained
> * JWT tokens are sent correctly
> * RLS policies are blocking inserts
> * Missing INSERT policies exist
> * Missing UPDATE policies exist
> * Missing DELETE policies exist
> * Authentication listener works correctly
> * Database tables match frontend models
> * UUIDs are generated properly
> * Foreign keys are respected
> * Triggers execute correctly
> * Auto profile creation works
> * Storage permissions (if applicable)
> * Edge Functions (if used)
>
> If any configuration is incorrect, fix it completely.
>
> ---
>
> # 3. Diagnose Why Data Is Not Being Stored
>
> Even though Supabase is connected inside Figma Make, data is **not appearing in my database**.
>
> Determine exactly why.
>
> Check whether:
>
> * INSERT statements are executed
> * Requests reach Supabase
> * Requests fail silently
> * Errors are ignored
> * Authentication fails
> * Session is null
> * User ID is missing
> * Database rejects inserts
> * RLS blocks operations
> * API calls never execute
> * Form submit handlers never fire
> * Promises are not awaited
> * Exceptions are swallowed
> * Wrong table names are used
> * Wrong column names are used
> * Schema mismatches exist
> * Type mismatches occur
>
> Every identified issue must be fixed.
>
> ---
>
> # 4. Make Authentication Fully Functional
>
> I want the following features to work exactly like a production application.
>
> ## Create Account
>
> When a user creates an account:
>
> * Create the Auth user in Supabase Authentication.
> * Automatically create the corresponding profile.
> * Populate the Profiles table.
> * Save all required profile fields.
> * Automatically log the user in.
> * Redirect to the correct page.
> * Display proper success and error messages.
> * Handle duplicate email addresses.
> * Validate password strength.
> * Validate all inputs.
>
> ---
>
> ## Sign In
>
> Make Sign In fully functional.
>
> After login:
>
> * Authenticate using Supabase Auth
> * Maintain session persistence
> * Restore sessions after refresh
> * Redirect correctly
> * Load user profile
> * Load preferences
> * Load dashboard data
> * Load historical records
> * Handle invalid credentials gracefully
>
> ---
>
> ## Sign Out
>
> Ensure Sign Out:
>
> * Clears session
> * Removes cached data
> * Redirects correctly
> * Prevents unauthorized access
>
> ---
>
> # 5. Connect Every Feature to Supabase
>
> Every interactive feature in the application must:
>
> * Read from Supabase
> * Write to Supabase
> * Update Supabase
> * Delete from Supabase (where appropriate)
> * Refresh the UI immediately after changes
> * Handle loading states
> * Handle empty states
> * Handle errors gracefully
>
> No placeholder or mock data should remain.
>
> ---
>
> # 6. Home Dashboard
>
> Make the Home Dashboard completely dynamic using real database values.
>
> The following widgets must calculate automatically:
>
> * Today's Driving Time
> * Sedentary Time
> * Movement Streak
> * Exercises Completed
> * Calories Burned
> * Wellness Score
> * Stress Reduction
> * Weekly Driving
>
> Instead of displaying static placeholder values, every metric must:
>
> * Retrieve live data from Supabase.
> * Update automatically when new records are added.
> * Persist after refresh.
> * Be calculated from actual driving sessions, sedentary logs, exercise history, and health metrics.
>
> ---
>
> # 7. Stress Trend
>
> Make the Stress Trend graph fully functional.
>
> It should:
>
> * Save stress records.
> * Retrieve historical data.
> * Display trends over time.
> * Update after each session.
> * Support daily and weekly views.
> * Show meaningful charts instead of placeholders.
>
> ---
>
> # 8. Recent Sessions
>
> Make Recent Sessions fully functional.
>
> Each completed driving session should automatically save:
>
> * Start time
> * End time
> * Duration
> * Exercises completed
> * Breaks taken
> * Sedentary risk
> * Calories burned
> * Wellness score
> * Stress score
>
> Sessions must appear immediately in the Recent Sessions list after completion.
>
> ---
>
> # 9. Replace "Today's Exercise"
>
> Replace:
>
> **TODAY'S EXERCISE**
>
> Shoulder Rolls
>
> Upper Body · 30–45 seconds
>
> Start Exercise →
>
> with:
>
> **START DRIVING SESSION**
>
> Because all exercises should now occur **inside the Driving Session**, not directly from the Home Dashboard.
>
> The new button should:
>
> * Start a new driving session.
> * Create a driving session record in Supabase.
> * Navigate to the Driving Session page.
> * Initialize timers.
> * Track session duration.
> * Begin sedentary monitoring.
> * Trigger exercise reminders during the session.
>
> ---
>
> # 10. Driving Session Integration
>
> Ensure Driving Session is fully integrated with Supabase.
>
> During a session:
>
> * Save start time.
> * Save end time.
> * Save elapsed time.
> * Save exercise completion.
> * Save skipped exercises.
> * Save sedentary alerts.
> * Save reminder acknowledgements.
> * Save AI recommendations.
> * Save health statistics.
> * Update dashboard metrics in real time.
>
> ---
>
> # 11. Verify Database Integration
>
> Verify every table created by the SQL migration is actually used by the application, including:
>
> * profiles
> * user_preferences
> * driving_sessions
> * exercise_history
> * health_metrics
> * sedentary_logs
> * ai_insights
> * notifications
> * feedback_submissions
> * learn_modules
> * learn_progress
> * audit_logs
>
> No unused tables should remain if they are intended to support existing features.
>
> ---
>
> # 12. Improve Reliability
>
> Add:
>
> * Proper error handling
> * Retry mechanisms
> * Loading indicators
> * Empty states
> * Success notifications
> * Validation
> * Logging
> * Debug output
> * Transaction safety where applicable
>
> ---
>
> # 13. End-to-End Testing
>
> After implementing all fixes:
>
> Simulate the following workflow:
>
> 1. Create a new account.
> 2. Verify the user appears in Supabase Authentication.
> 3. Verify the profile is created.
> 4. Sign in.
> 5. Start a driving session.
> 6. Complete exercises.
> 7. Generate sedentary logs.
> 8. Save health metrics.
> 9. Finish the session.
> 10. Verify all data is stored correctly in Supabase.
> 11. Refresh the application.
> 12. Confirm all data persists and loads correctly.
> 13. Verify dashboard statistics update automatically.
> 14. Verify Recent Sessions displays the new session.
> 15. Verify Stress Trend reflects the saved data.
> 16. Verify all CRUD operations work without errors.
>
> ---
>
> # 14. Deliverables
>
> Provide:
>
> * A complete analysis of every issue found.
> * The root cause of why Supabase was not storing data.
> * All code changes required.
> * Database changes (if any).
> * Authentication fixes.
> * UI improvements.
> * Figma Make integration fixes.
> * Performance improvements.
> * Security improvements.
> * Any additional SQL migrations required.
> * A validation checklist confirming every feature is fully functional.
> * Confirmation that all application data is now correctly synchronized with Supabase and persists across sessions, with no remaining mock or placeholder data.
