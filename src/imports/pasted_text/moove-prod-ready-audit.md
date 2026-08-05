## **Revised Comprehensive Prompt**

Act as an **expert Senior Full-Stack Developer, Supabase Architect, PostgreSQL Database Administrator, Backend Engineer, Frontend Engineer, API Engineer, Security Engineer, Data Engineer, and UI/UX Designer**.

Analyze my entire **MOOVE** application, including the frontend, backend, Supabase database schema, authentication flow, API calls, React components, contexts, hooks, services, SQL migrations, Row Level Security (RLS) policies, PostgreSQL permissions, and all database interactions.

My objective is to make the application **fully production-ready** by fixing all authorization issues and ensuring **every important piece of application data is securely stored, retrieved, synchronized, and maintained in Supabase PostgreSQL**.

Do **not** provide generic advice. Perform a complete architectural audit and produce production-ready solutions.

---

# Primary Objectives

You must accomplish all of the following:

1. Fix every **HTTP 403 Forbidden** error.
2. Fix every **PostgreSQL permission denied** error.
3. Audit and correct all **Row Level Security (RLS)** policies.
4. Audit and correct all PostgreSQL **GRANT** permissions.
5. Verify the authentication flow and JWT propagation.
6. Ensure every authenticated user can access **only their own data**.
7. Ensure every important application feature persists its data in Supabase.
8. Remove any remaining mock, local-only, or temporary storage where database persistence is required.
9. Improve the application's security, maintainability, and performance following Supabase best practices.

---

# Current Errors

The following Supabase logs consistently return **403 Forbidden**.

Affected tables include:

* profiles
* feedback_submissions
* driving_sessions
* user_preferences
* admin_settings

The authenticated user is:

```text
auth.uid()

89a448bf-5b61-4188-bc70-e678f9e21f7d
```

The PostgreSQL logs contain:

```text
permission denied for table profiles

permission denied for table feedback_submissions

permission denied for table driving_sessions

permission denied for table user_preferences

permission denied for table admin_settings
```

These indicate that requests from authenticated users are being blocked by PostgreSQL permissions and/or Row Level Security policies.

---

# Existing Error Summary

## Profiles

Current request

```http
GET /rest/v1/profiles
```

returns

```text
HTTP 403 Forbidden
```

Verify:

* SELECT policy
* INSERT policy
* UPDATE policy
* DELETE policy (if needed)

Ensure users can:

* read only their own profile
* update only their own profile
* insert only their own profile

---

## Feedback Submissions

Current request

```http
POST /rest/v1/feedback_submissions
```

returns

```text
HTTP 403 Forbidden
```

Verify:

* INSERT policy
* SELECT policy

Ensure users can:

* submit their own feedback
* read only their own submissions

---

## Driving Sessions

Current request

```http
GET /rest/v1/driving_sessions
```

returns

```text
HTTP 403 Forbidden
```

Postgres also reports

```text
permission denied for table driving_sessions
```

Verify:

* SELECT
* INSERT
* UPDATE
* DELETE

Ensure policies use

```sql
user_id = auth.uid()
```

---

## User Preferences

Current request

```http
POST /rest/v1/user_preferences?on_conflict=user_id
```

returns

```text
HTTP 403 Forbidden
```

Verify:

* UPSERT
* INSERT
* UPDATE
* SELECT

Ensure

```sql
UNIQUE(user_id)
```

exists.

---

## Admin Settings

Current request

```http
GET /rest/v1/admin_settings
```

returns

```text
HTTP 403 Forbidden
```

Determine whether:

* this table should remain admin-only
* frontend should never query this table directly
* values should instead come from:

  * Edge Functions
  * RPC
  * Backend API
  * Service Role
  * Environment Variables

---

# Authentication Audit

Analyze the complete authentication flow.

Inspect:

* Supabase client initialization
* AuthContext
* Session handling
* JWT refresh
* Login
* Registration
* Logout
* Protected Routes
* Token persistence
* Browser refresh
* Session restoration

Verify

```typescript
supabase.auth.getSession()

supabase.auth.getUser()
```

Confirm every database request is sending the authenticated JWT.

Ensure the frontend is **not** making requests using only the anon key.

---

# Database Schema Audit

Inspect every table.

Verify:

* UUID primary keys
* auth.users foreign keys
* ownership columns
* constraints
* indexes
* timestamps
* nullable fields
* default values

Ensure every user-owned table consistently uses either:

```sql
user_id UUID REFERENCES auth.users(id)
```

or

```sql
id UUID REFERENCES auth.users(id)
```

Avoid inconsistent ownership implementations.

---

# Row Level Security Audit

For every table determine:

* Is RLS enabled?
* Are policies missing?
* Are policies duplicated?
* Are policies conflicting?
* Are policies using incorrect ownership columns?
* Are INSERT policies using WITH CHECK?
* Are UPDATE policies using USING and WITH CHECK correctly?
* Are DELETE policies secure?

Generate corrected production-ready policies.

---

# PostgreSQL Permissions Audit

Verify all required grants.

Check:

```sql
GRANT SELECT

GRANT INSERT

GRANT UPDATE

GRANT DELETE
```

for

* authenticated
* anon
* service_role

Only grant minimum required permissions.

---

# Complete Data Persistence Review

Analyze the **entire MOOVE application** and determine which data is **not currently stored in Supabase**.

Search the project for:

* React state
* Context state
* localStorage
* sessionStorage
* mock data
* hardcoded values
* temporary arrays
* dummy JSON
* placeholder objects

Identify every piece of application data that disappears after refreshing the page.

Replace temporary storage with proper Supabase persistence where appropriate.

---

# Persist All Application Data

Ensure the following entities are fully stored and synchronized with Supabase:

### User Profile

Persist:

* full name
* email
* age
* gender
* height
* weight
* BMI
* emergency contact
* profile photo
* onboarding status
* created_at
* updated_at
* last login

---

### User Preferences

Persist:

* reminder settings
* theme
* notification settings
* exercise preferences
* accessibility options
* preferred language
* reminder intervals
* rest durations

---

### Driving Sessions

Persist:

* session ID
* user ID
* start time
* end time
* duration
* sedentary duration
* driving duration
* break duration
* calories burned
* fatigue score
* health score
* exercises completed
* skipped exercises

---

### Exercise History

Persist:

* exercise name
* category
* duration
* repetitions
* sets
* completion status
* skipped status
* calories
* recommendation source
* timestamps

---

### AI Recommendations

Persist:

* recommendation ID
* generated time
* user ID
* reasoning
* driving context
* sedentary duration
* fatigue level
* accepted recommendation
* ignored recommendation
* completion status

---

### Dashboard Statistics

Persist:

* daily summaries
* weekly summaries
* monthly summaries
* total sessions
* calories
* exercise streaks
* sedentary summaries
* health score history

---

### Feedback

Persist:

* questionnaire responses
* ratings
* comments
* participant ID
* submission date
* study version

---

### Research Data

Persist:

* participant demographics
* intervention adherence
* feature usage
* usability metrics
* engagement metrics
* timestamps
* research session metadata

---

# CRUD Review

Ensure every table supports proper CRUD operations.

Verify:

* Create
* Read
* Update
* Delete

using properly typed Supabase client methods.

---

# Automatic Saving

Implement automatic persistence.

Examples:

* Save profile immediately after onboarding.
* Save user preferences whenever they change.
* Insert a driving session when it starts.
* Update the session when it ends.
* Save exercise history immediately after completion.
* Save AI recommendation history when generated.
* Save feedback immediately after submission.

Avoid unnecessary manual save buttons.

---

# Automatic Data Loading

After login, automatically retrieve:

* profile
* preferences
* dashboard data
* unfinished sessions
* exercise history
* AI recommendations
* feedback history
* research progress

Populate the UI directly from Supabase instead of mock or local data.

---

# Offline Synchronization

If offline:

* cache pending changes locally
* retry automatically when online
* prevent duplicate inserts
* preserve timestamps
* implement conflict resolution where appropriate

---

# Frontend Audit

Search the entire codebase for:

```typescript
.from("profiles")

.from("driving_sessions")

.from("feedback_submissions")

.from("user_preferences")

.from("admin_settings")
```

For each occurrence verify:

* authenticated user exists
* JWT is valid
* filters match RLS policies
* duplicate requests are eliminated
* race conditions are removed
* unnecessary queries are eliminated

---

# Security Review

Ensure users cannot:

* read another user's records
* modify another user's records
* delete another user's records
* bypass RLS
* elevate privileges
* access admin-only resources

Use the principle of least privilege throughout the application.

---

# Deliverables

Provide the following in order:

1. Complete root cause analysis for every 403 and `permission denied` error.
2. Exact explanation of why each request fails.
3. Authentication flow audit.
4. Database schema audit.
5. RLS audit.
6. PostgreSQL GRANT audit.
7. Security audit.
8. Data persistence audit identifying all data that is not currently stored in Supabase.
9. Mapping of every UI feature to its corresponding database table.
10. List of missing CRUD operations.
11. List of missing indexes, constraints, and foreign keys.
12. Updated SQL migration(s) to fix permissions, grants, RLS policies, indexes, and schema issues while preserving existing data.
13. Updated frontend and backend code to correctly save, retrieve, update, and synchronize all application data with Supabase.
14. Recommendations for performance optimization, including reducing duplicate queries, improving caching, batching operations where appropriate, and indexing frequently queried columns.
15. A comprehensive validation checklist demonstrating that:

    * all authenticated users can only access their own data,
    * all important application data is reliably stored in Supabase,
    * data is correctly restored across sessions, devices, and application restarts,
    * the application is secure, production-ready, and follows Supabase best practices.
