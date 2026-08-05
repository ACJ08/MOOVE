Here's a significantly expanded, structured, and much more professional version of your prompt that is suitable for Cursor AI, Claude Code, GPT-5.5, Lovable, Bolt, Windsurf, or any senior full-stack AI coding assistant.

---

# MOOVE MVP V2 DEVELOPMENT PROMPT

## ROLE

Act as a world-class Software Architect, Senior Full-Stack Engineer, Frontend Engineer, Backend Engineer, Mobile-First UI/UX Designer, Product Designer, Database Architect, and AI Product Engineer with over 20 years of experience building production-ready healthcare, wellness, and startup applications.

Your goal is **NOT** simply to change the UI.

Your goal is to transform the current Moove prototype into a polished, production-quality MVP that is suitable for:

* UNLEASH Innovation Lab
* Startup Demo Day
* Investor Presentation
* Research Prototype Testing
* Academic Thesis
* Real Driver User Testing

Everything should feel like a complete application instead of a prototype.

---

# PROJECT

## MOOVE

**Tagline**

> Small Movements. Healthier Journeys.

The application helps private vehicle drivers reduce prolonged sedentary behavior through personalized exercise interventions integrated naturally into their daily driving routines.

---

# GENERAL REQUIREMENTS

## Update Copyright

Replace every occurrence of

> © 2025 MOOVE. All rights reserved.

with

> © 2026 MOOVE. All rights reserved.

Search the entire project and ensure there are no remaining references to 2025 unless intentionally required.

---

# BRANDING IMPROVEMENTS

For authentication pages:

## Sign In

## Create Account

The right-side illustration section currently has a background color that clashes with:

* the Moove logo
* the Moo mascot

Use these assets:

* **[REMOVE BG] MOOVE.png**
* **[MASCOT REMOVE BG] MOOVE CHARACTER.png**

Redesign the authentication layout using a warm, modern wellness-inspired palette that complements the brand.

Suggested color palette:

* Soft Cream
* Warm Ivory
* Light Beige
* Soft Orange
* Sunset Orange
* Light Amber
* Warm Gray

Avoid harsh contrast.

The page should feel:

* welcoming
* modern
* calming
* energetic
* healthcare-oriented
* startup-quality

Include subtle gradients, soft shadows, rounded cards, and floating decorative elements while maintaining accessibility.

---

# AI RECOMMENDATIONS MODULE

The current AI Recommendations section appears static.

Convert it into an intelligent recommendation engine.

Recommendations should consider:

* current sedentary duration
* total driving time today
* previous exercise history
* skipped interventions
* completed interventions
* current stress level
* selected goal
* preferred exercise intensity
* current session duration

Example recommendations:

> You've been sitting for 92 minutes.

> We recommend Shoulder Rolls (30 seconds) to reduce neck stiffness.

> Estimated fatigue risk: Moderate.

> Next recommended intervention in 25 minutes.

Display recommendation confidence levels and explain *why* each recommendation is generated to improve transparency.

---

# NEXT BREAK CALCULATION

The "Next Break" section must no longer display a fixed value.

Instead, dynamically calculate it based on:

* user-defined driving schedule
* estimated driving duration
* current session timer
* recommended intervention frequency
* completed interventions
* skipped reminders

Example:

Current Drive:
2 hours

Exercise Interval:
Every 45 minutes

Completed:
1

Next Break:
15 minutes remaining

If no schedule exists, allow users to configure:

* preferred reminder interval
* maximum continuous sitting time
* preferred exercise frequency

Store these preferences in the database.

---

# SEDENTARY RISK INDICATOR

Create a dynamic sedentary risk engine.

Risk Levels:

🟢 Low

0–30 minutes

Minimal health risk.

---

🟡 Moderate

31–60 minutes

Light intervention recommended.

---

🟠 High

61–90 minutes

Exercise should be performed soon.

---

🔴 Very High

91+ minutes

Immediate movement strongly recommended.

Display:

* colored badge
* progress bar
* icon
* explanation
* AI recommendation

The risk level should update automatically in real time.

---

# SESSION HISTORY

Currently, ending a driving session loses all information.

This must be changed.

Whenever the user presses:

End Session

Automatically save:

* session ID
* date
* start time
* end time
* total driving duration
* sedentary duration
* interventions completed
* interventions skipped
* calories (estimated)
* stretches completed
* AI recommendations received
* stress level before
* stress level after
* average sedentary risk
* notes (optional)

Display these in a dedicated **Session History** page.

Each session card should show:

* date
* duration
* completed exercises
* average risk
* stress improvement
* button to view full report

---

# GUIDED EXERCISES IMPROVEMENT

Each exercise currently only displays basic information.

Expand every exercise page.

Each exercise should include:

* animation
* GIF/Lottie
* illustration
* target muscle
* benefits
* when to perform
* safety reminders
* duration
* repetitions
* sets

Example:

### Chin Tucks

Duration:
30 seconds

Repetitions:
10

Sets:
2

Rest:
15 seconds

Difficulty:
Easy

Body Area:
Neck

Benefits:

* reduces neck tension
* improves posture
* decreases stiffness

Buttons:

Start Exercise

Pause

Restart

Mark Complete

Skip Exercise

Exercise timer should automatically count down.

---

# USER FEEDBACK & VALIDATION MODULE

Create a fully integrated research-grade evaluation module.

This module will support prototype validation during user testing.

---

## DEMOGRAPHIC INFORMATION

Collect:

* Age

* Gender (optional)

* Location

* NCR

* CALABARZON

Occupation

Average Daily Driving Duration

Driving Frequency

Vehicle Type

Years of Driving Experience

---

## USABILITY SURVEY

Use a 5-point Likert Scale.

Questions:

* The application is easy to use.
* The interface is intuitive.
* Exercise animations are easy to understand.
* Notifications are useful.
* Dashboard information is clear.
* AI recommendations are understandable.
* Navigation is simple.
* Overall experience is satisfying.

---

## PERCEIVED STRESS ASSESSMENT

Before intervention:

Stress Level

1–5

After intervention:

Stress Level

1–5

Automatically calculate:

Stress Reduction

Display:

Before:
4

After:
2

Improvement:
50%

---

## INTERVENTION USEFULNESS

Rate:

* exercise usefulness
* recommendation quality
* practicality
* timing accuracy

---

## FUTURE ADOPTION

Questions:

Would you continue using Moove?

Yes

Maybe

No

Would you recommend Moove?

Yes

Maybe

No

Would you install this application?

Yes

Maybe

No

---

## OPEN FEEDBACK

Large text fields.

Questions:

What did you like most?

What confused you?

What should be improved?

Additional features?

General comments?

---

# THINK-ALOUD TESTING MODULE

Create a moderator mode for usability testing.

Display one question at a time.

Examples:

What are your first impressions?

Is the interface understandable?

What feature do you like most?

Was anything confusing?

Why did the AI recommend that exercise?

Would you realistically use this application?

Responses should be stored in the database.

---

# IN-APP RESEARCH DASHBOARD

Create an admin-only dashboard.

Display analytics such as:

Total Participants

Completed Surveys

Average Usability Score

Average Stress Reduction

Average Satisfaction

Average Intervention Rating

Behavioral Intention Score

Completion Rate

Feature Preferences

Word Cloud of Feedback

Charts:

* Pie Charts
* Bar Charts
* Line Charts
* Radar Charts
* Heatmaps

---

# AUTOMATIC METRICS COLLECTION

Automatically collect:

* survey responses
* usability scores
* stress ratings
* intervention ratings
* recommendation ratings
* behavioral intention
* participant completion time
* timestamps
* device type
* browser
* completed testing sessions

---

# SUPABASE DATABASE

Create normalized database tables.

Suggested tables:

profiles

driver_sessions

exercise_history

exercise_completion

exercise_recommendations

stress_assessments

feedback_surveys

think_aloud_notes

participant_demographics

feature_preferences

testing_sessions

session_history

user_preferences

notification_settings

analytics_summary

Use proper:

* foreign keys
* indexes
* timestamps
* row-level security (RLS)
* role-based access

---

# FEEDBACK SYNTHESIS FRAMEWORK

Do **NOT** fabricate findings.

Instead, build a dynamic feedback synthesis page that automatically populates once participant testing data exists.

Include:

## Top 5 Insights

Frequency

Category

Observation

Priority

---

## Desirability

Automatically summarize:

* usefulness
* satisfaction
* recommendation scores
* willingness to continue

---

## Feasibility

Analyze:

* navigation issues
* onboarding issues
* loading problems
* task completion

---

## Viability

Analyze:

* long-term adoption
* retention intention
* future features
* scalability

---

# PROTOTYPE IMPROVEMENT BOARD

Generate a Kanban-style improvement tracker.

Columns:

High Priority

Medium Priority

Low Priority

Each improvement should include:

* issue
* source
* frequency
* suggested solution
* implementation status

---

# ITERATION PLANNER

Create an iteration planning page.

Display:

Prototype Component

Feedback Received

Improvement

Testing Method

Success Criteria

Status

Target Version

---

# NEXT TESTING CYCLE

Generate a planning dashboard for future testing rounds.

Track:

* participants
* completion
* usability goals
* stress reduction goals
* feature validation
* unresolved issues

---

# DASHBOARD ENHANCEMENTS

Improve the Driver Dashboard with modern widgets:

* Today's Driving Summary
* Current Session
* Sedentary Risk Meter
* AI Health Insights
* Exercise Streak
* Weekly Progress
* Monthly Activity
* Calories Burned (Estimated)
* Stretch Completion Rate
* Reminder Compliance
* Stress Trend
* Personalized Goals
* Recent Sessions
* Upcoming Break
* Achievement Badges
* Health Score
* Daily Wellness Score

Use beautiful cards, charts, progress indicators, and responsive layouts optimized for desktop, tablet, and mobile.

---

# USER EXPERIENCE

Ensure every interaction includes:

* smooth animations
* loading skeletons
* toast notifications
* confirmation dialogs
* empty states
* success states
* error handling
* offline support where appropriate
* accessibility compliance (WCAG)
* responsive design
* dark/light mode compatibility
* intuitive navigation

---

# FINAL EXPECTATION

Refactor the application into a polished, production-ready MVP that feels like a commercial wellness platform rather than a prototype. Every button, form, survey, AI recommendation, dashboard widget, exercise flow, session history, analytics page, and research module must be fully functional, interconnected, and backed by Supabase with proper database design, authentication, role-based access control, and persistent data storage. The resulting application should be suitable for live user testing with 5–10 drivers, academic evaluation, UNLEASH submission, and investor demonstrations while maintaining clean architecture, scalability, maintainability, accessibility, and a cohesive Moove brand identity.
