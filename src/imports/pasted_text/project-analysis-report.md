Here's your **fully revised prompt**, incorporating your clarification that the **Prototype Version** is simply a manually editable label (not something the AI should "fix" automatically).

---

**Act as an expert Senior Full-Stack Software Engineer, Database Architect, Backend Engineer, Frontend Engineer, DevOps Engineer, Supabase Expert, Figma Make Expert, UI/UX Designer, Software QA Engineer, and Product Designer.**

Perform a **complete end-to-end analysis** of my entire project, including **every file, folder, configuration, dependency, database requirement, API integration, frontend, backend, and Figma Make integration**.

Do **not** make assumptions without verifying the existing implementation. First analyze all files, identify the root causes of any issues, explain each issue, and then implement the appropriate fixes while preserving my current UI/UX unless changes are necessary.

---

# Part 1 — User Feedback Validation

Analyze the **Feedback** tab that I already created.

Based on the questionnaires and fields that currently exist in the Feedback tab:

* Create appropriate validation assumptions for each questionnaire.
* Create measurable predefined evaluation metrics.
* Ensure the assumptions are realistic and directly aligned with each questionnaire.
* Define:

  * Validation Assumptions
  * Success Metrics
  * Acceptance Criteria
  * Evaluation Metrics
  * Key Performance Indicators (KPIs)
  * Target Values
  * Pass/Fail Thresholds
  * Rating Interpretation
  * Overall User Satisfaction computation
* Ensure these metrics are appropriate for prototype testing and user validation.
* Do not invent unnecessary questionnaires.
* Use only the questionnaires that already exist inside my Feedback tab unless a critical improvement is needed.
* Preserve the existing UI while improving the validation logic where necessary.

---

# Part 2 — Prototype Version Label

The application currently displays:

```text
Prototype Version
1.0.0-TRL4
```

I want you to analyze my project's current maturity and recommend a more appropriate prototype version label.

Since this is already my **49th prototype iteration**, recommend a version naming convention that accurately reflects the project's development stage.

For example, consider formats such as:

* Prototype Version v49 (TRL 4)
* Prototype Build 49
* Prototype Iteration 49
* Prototype Version v0.49.0
* or another professional versioning format that best represents the current prototype.

**Important:**

* Do **not** attempt to retrieve, generate, or automatically fix the prototype version from Figma, Git, Supabase, or any external source.
* This is simply a manually editable text label within my application.
* Replace the existing label:

  ```
  Prototype Version
  1.0.0-TRL4
  ```

  with the most appropriate version label throughout the project wherever it appears.
* Explain why your recommended versioning format is the most suitable for a TRL 4 prototype while allowing future iterations to follow a consistent versioning strategy.

---

# Part 3 — Supabase Integration Analysis

I have already connected Supabase inside Figma Make.

It currently displays:

```text
Supabase
Your backend integration
Peace Review's project
Connected

Peace Review's organization
Disconnect
```

Although it says **Connected**, my application still cannot communicate with the database.

Perform a complete investigation.

Analyze:

* every project file
* Supabase client initialization
* authentication
* database connection
* API requests
* frontend integration
* backend integration
* environment configuration
* network requests
* import statements
* package versions
* dependency conflicts
* generated code
* build configuration
* deployment configuration
* Figma Make limitations
* project settings

Determine the exact root cause.

Explain why Figma Make indicates the project is connected while database communication still fails.

Implement the proper fixes.

---

# Part 4 — Figma Make Environment Variables

Figma Make does not appear to support a traditional `.env` file.

The intended public configuration is:

```env
MOOVE_PUBLIC_SUPABASE_URL=https://zgthueozpynxuggjtpmw.supabase.co

MOOVE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Y4unxjKVs0Lsya1fNyIqbQ_PGQstI3S
```

Analyze how Figma Make manages environment variables.

Determine:

* whether `.env` files are supported
* whether project secrets should be used
* whether Integrations automatically inject configuration
* whether the generated code ignores `.env`
* whether my configuration is actually being loaded
* whether another configuration approach is required

If `.env` files are unsupported:

* implement the recommended Figma Make approach
* configure Supabase correctly
* if necessary, hardcode only the **public Supabase URL** and **public publishable key** into the correct configuration file
* never expose service-role keys or other sensitive credentials
* centralize configuration for easy maintenance
* follow Supabase best practices

---

# Part 5 — Database Architecture

Analyze every feature throughout my application.

Determine which files require persistent storage.

Design and implement a complete Supabase PostgreSQL database that supports every feature.

Include:

* normalized schema
* relationships
* foreign keys
* indexes
* constraints
* default values
* enums
* triggers (if required)
* Row Level Security (RLS)
* authentication integration
* storage buckets (if required)
* security policies
* views
* reusable SQL migrations

For every table:

* explain its purpose
* identify which application files use it
* map frontend components to backend tables
* map backend functions to SQL operations

Generate:

* complete SQL schema
* migration scripts
* RLS policies
* indexes
* helper functions
* seed data where appropriate

---

# Part 6 — Full Supabase Integration

After creating the database:

* integrate every applicable page with Supabase
* replace mock data with live database queries
* implement complete CRUD functionality
* implement loading states
* implement proper error handling
* add retry mechanisms where appropriate
* ensure authentication functions correctly
* verify data synchronization
* remove duplicate database logic
* remove unused code
* ensure consistent typing throughout the project

---

# Part 7 — Debugging & Verification

Perform a comprehensive debugging pass.

Verify there are:

* no runtime errors
* no TypeScript errors
* no build errors
* no import errors
* no Supabase initialization issues
* no missing configuration variables
* no broken API requests
* no authentication issues
* no failed database queries
* no infinite loading states
* no blank screens
* no unnecessary console warnings

---

# Part 8 — Final Deliverables

Provide:

1. Executive summary of all issues discovered.
2. Root cause analysis for each issue.
3. Detailed explanation of every implemented fix.
4. Database architecture diagram (Markdown/text format).
5. Complete SQL migration scripts.
6. Updated Supabase configuration.
7. Updated project structure (if modified).
8. List of created, modified, and removed files.
9. Remaining limitations, if any.
10. Final verification checklist confirming:

    * Feedback validation assumptions and predefined metrics have been implemented.
    * The prototype version label has been updated to the recommended version format.
    * Supabase connects successfully within Figma Make.
    * Environment configuration is implemented correctly.
    * All required database tables have been created.
    * All applicable frontend pages use the live Supabase database.
    * The project builds and runs successfully without errors.

## Important Constraints

* Analyze every project file before making changes.
* Preserve the existing UI/UX unless modifications are required to resolve functional issues.
* Follow Figma Make, Supabase, PostgreSQL, and software engineering best practices.
* Never expose or hardcode sensitive credentials such as the Supabase service-role key. Only public configuration values (URL and publishable key) may be embedded if required.
* Produce production-ready, maintainable, scalable, and well-documented code.
* Explain every significant design and implementation decision before making changes.
