Here's an expanded, structured, and more detailed version of your prompt that should produce significantly better results from an AI coding assistant.

---

# Expanded Prompt

Act as an **expert Senior Full-Stack Software Engineer, Frontend Engineer, Backend Engineer, Supabase Database Architect, PostgreSQL Expert, UI/UX Designer, Software Architect, System Designer, QA Engineer, Performance Optimization Engineer, and Technical Documentation Writer.**

Your goal is to analyze my entire codebase, identify the root causes of the issues, implement clean and scalable fixes, refactor where necessary, and ensure that all features work correctly without introducing regressions.

## Task 1 — Fix the "Recommended For You" Exercise Logic

There is a bug in the recommendation system.

Current behavior:

```
Time for a Movement Break!
🟠 High · 67 min seated

⚠️ Safety first. Only perform exercises when your vehicle is completely stationary.

RECOMMENDED FOR YOU
```

The application continues recommending exercises that the user has **already completed**, particularly for:

* Break Exercises
* Stop Exercises

This should never happen.

### Expected Behavior

The recommendation engine must only recommend exercises that:

* have NOT yet been completed
* belong to the current exercise category
* are still available for the user to perform

Once an exercise has been completed:

* it must immediately be excluded from future recommendations
* it must not appear under "Recommended For You"
* it should remain visible only inside its exercise library/category with a completed status

If all exercises in the category are completed:

Display a friendly message such as:

> 🎉 Great job! You have completed all available exercises for this category.

instead of recommending completed exercises again.

---

# Task 2 — Separate Exercise Completion Tracking

Currently, exercise completion appears to be shared across categories.

This is incorrect.

Each exercise category must maintain its own independent completion state.

Implement separate tracking for the following:

## 1. Warm-Up Exercises

Create a completely independent completion tracker.

Requirements:

* Each warm-up exercise has its own completion state.
* Completing a warm-up exercise should NOT affect:

  * Break exercises
  * Stop exercises
  * Cooldown exercises
* Completed warm-up exercises should:

  * become disabled
  * display a "Completed" badge
  * no longer be clickable
* Display progress, for example:

```
Warm-Up Progress

4 / 8 Completed
```

---

## 2. Break Exercises

Maintain an independent completion tracker.

Requirements:

* Break exercises should not share progress with any other category.
* Completed exercises:

  * become disabled
  * show Completed
  * cannot be recommended again
* Recommendation logic should only use incomplete break exercises.

Display progress:

```
Movement Break Progress

3 / 10 Completed
```

---

## 3. Stop Exercises

Maintain another separate completion tracker.

Requirements:

* Completion only affects Stop Exercises.
* Completed exercises:

  * disabled
  * marked completed
  * removed from recommendations.

Display progress:

```
Stop Session Progress

6 / 9 Completed
```

---

## 4. Cooldown Exercises

Implement an independent tracker.

Requirements:

* Completion is isolated from all other categories.
* Completed cooldown exercises:

  * disabled
  * marked completed
  * cannot be completed twice.
* Display progress.

Example:

```
Cooldown Progress

5 / 7 Completed
```

---

# Task 3 — Recommendation Engine Improvements

Refactor the recommendation engine so it follows these rules.

### Never recommend

* Completed exercises
* Disabled exercises
* Hidden exercises
* Invalid exercises
* Exercises outside the current category

### Always recommend

Only exercises that are:

* available
* incomplete
* appropriate for the current session
* appropriate for the current exercise category

If there are no remaining exercises:

Display an empty state rather than recycling completed ones.

---

# Task 4 — Persistent Completion State

Ensure that exercise completion is properly persisted.

If using Supabase:

Store completion records in the database.

Example schema:

```
exercise_completion

id
user_id
exercise_id
category
completed
completed_at
```

When the application reloads:

* fetch completion data
* restore completion state
* restore disabled buttons
* restore progress counters
* restore recommendation filtering

The user should never lose completed progress after refreshing the page or signing back in.

---

# Task 5 — UI/UX Improvements

Improve the exercise experience.

For every exercise card:

Completed:

* ✅ Completed badge
* Disabled button
* Greyed-out appearance
* Cannot be selected

Incomplete:

* Normal appearance
* Clickable
* Eligible for recommendations

Add category progress indicators.

Example:

```
Warm-Up

████████░░

8 / 10 Completed
```

Apply the same design consistently for:

* Warm-Up
* Break
* Stop
* Cooldown

---

# Task 6 — Code Quality

Refactor the implementation if necessary.

Ensure:

* reusable components
* reusable hooks
* reusable utility functions
* no duplicated logic
* clean TypeScript types
* scalable architecture
* maintainable folder structure
* proper separation of concerns
* optimized rendering
* minimal unnecessary re-renders
* robust error handling
* comprehensive inline comments for complex logic

---

# Task 7 — Testing

Verify all scenarios.

Warm-Up

* Complete one exercise
* Exercise becomes disabled
* Progress updates
* Recommendation updates

Break

* Complete one exercise
* Recommendation no longer shows it
* Progress updates

Stop

* Complete one exercise
* Recommendation updates correctly

Cooldown

* Complete one exercise
* Progress updates
* Disabled state restored after refresh

Persistence

* Refresh page
* Log out
* Log in
* Completion state remains accurate

Edge Cases

* All exercises completed
* No completed exercises
* Refresh during a session
* Multiple users with separate progress
* Invalid or missing exercise IDs
* Network failures while syncing with Supabase

---

# Task 8 — Produce Comprehensive Project Documentation

After implementing and verifying all fixes, create a **professional, comprehensive, and highly detailed `README.md`** for the project.

The README should serve as complete developer documentation for onboarding new contributors.

Include, at minimum:

## Project Overview

* Project name
* Purpose
* Features
* Technologies used
* Architecture overview
* Design philosophy

## Folder Structure

Provide the complete directory tree.

Example:

```text
src/
├── components/
├── pages/
├── hooks/
├── contexts/
├── services/
├── lib/
├── utils/
├── types/
├── assets/
├── styles/
└── ...
```

## File-by-File Documentation

For **every file in the project**, document:

* File path
* Purpose
* Responsibilities
* Main exported functions/classes/components
* Props and interfaces
* Dependencies
* Data flow
* Relationships with other files
* Important implementation details

No source file should be omitted.

## Supabase Documentation

Document:

* Database schema
* Tables
* Relationships
* Foreign keys
* Row Level Security (RLS) policies
* Authentication flow
* Storage buckets (if any)
* Database functions, triggers, and views
* Data synchronization process
* Exercise completion persistence logic

## Frontend Documentation

Explain:

* Routing
* State management
* Component hierarchy
* Hooks
* Context providers
* Styling approach
* Responsive design
* UI components
* Theme architecture

## Backend Documentation

Explain:

* APIs
* Services
* Business logic
* Validation
* Authentication
* Error handling
* Database interactions

## Exercise Recommendation Engine

Describe in detail:

* Recommendation algorithm
* Filtering logic
* Completion tracking
* Progress computation
* Category isolation
* Persistence mechanism

## Application Flow

Document the end-to-end workflow:

* User authentication
* Session creation
* Warm-up
* Driving session
* Movement break detection
* Stop exercises
* Cooldown
* Dashboard updates
* Exercise history
* Supabase synchronization

## Developer Guide

Include:

* Installation
* Environment variables
* Running locally
* Running with Supabase
* Database migrations
* Deployment
* Production build
* Troubleshooting
* Common issues and fixes

## Future Improvements

Provide recommendations for:

* Performance optimization
* Scalability
* Accessibility
* Security enhancements
* Code maintainability
* Potential new features

---

## Expected Deliverables

By the end of this task, I expect:

1. All exercise recommendation bugs fixed.
2. Separate completion tracking for Warm-Up, Break, Stop, and Cooldown exercises.
3. Completed exercises automatically disabled and marked as completed within their respective categories.
4. Recommendation engine that never suggests completed exercises.
5. Progress tracking for each exercise category.
6. Persistent exercise completion data stored and restored using Supabase.
7. Clean, refactored, maintainable, and scalable code with no regressions.
8. A comprehensive `README.md` documenting the entire project structure, architecture, every file, every function, and the complete system workflow in a professional standard suitable for future developers and maintainers.
