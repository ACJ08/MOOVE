# **FINAL IMPLEMENTATION PROMPT — Moove Intelligent Driving Session & Preventive Health Recommendation System (Evidence-Based Driver Exercise Workflow)**

**Act as an expert Full-Stack Software Engineer, Frontend Engineer, Backend Engineer, UI/UX Designer, Product Designer, Health Informatics Specialist, Human-Computer Interaction (HCI) Designer, and Software Architect.**

Develop a **production-ready, intelligent Driving Session system** for **Moove – Small Movements. Healthier Journeys.**

This feature is the **core of the application** and should provide personalized, evidence-based preventive health recommendations to drivers based on **elapsed sedentary driving time** while **prioritizing driver safety above all else**.

The experience should feel comparable to a commercial wellness application rather than a prototype.

---

# PRIMARY OBJECTIVE

During every Driving Session, Moove continuously tracks the driver's sedentary time.

After a configurable interval (default **20 minutes**), the application should evaluate whether the user may benefit from a preventive exercise.

However, **Moove must NEVER encourage exercises while the vehicle is moving.**

Every recommendation must include a safety reminder.

Example:

> **You've been seated for 20 minutes.**
>
> If you're **safely stationary** (traffic at a complete stop, parked, gas station, rest stop, before driving, or after driving), consider performing a **30–60 second preventive exercise.**
>
> Your safety always comes first.

---

# COMPLETE USER FLOW

```text
Login

↓

Dashboard

↓

Start Driving Session

↓

Driving Timer Starts

↓

Driving Duration Tracking

↓

20 Minutes Elapsed

↓

Preventive Health Recommendation Generated

↓

Safety Evaluation

↓

Exercise Recommendation Modal

↓

User chooses

[ Continue Driving ]
or
[ Perform Exercise ]
```

---

# EXERCISE RECOMMENDATION MODAL

The modal should contain:

## Current Sedentary Time

Example

> You've been driving for **60 minutes**.

---

## Safety Reminder

Always display:

> Only perform this exercise if your vehicle is completely stationary and it is safe to do so.

---

## Recommended Exercise

Display:

* Exercise Name
* Target Body Area
* Purpose
* Duration
* Safety Context
* Why it helps drivers

Example

**Shoulder Rolls**

Helps relieve shoulder stiffness caused by prolonged steering wheel use.

Duration

30–45 seconds

Recommended when

Traffic (Stopped)

Parked

Before Driving

After Driving

---

Buttons

Continue Driving

Perform Exercise

---

# OPTION 1 — CONTINUE DRIVING

If the user selects Continue Driving:

* close the modal
* continue the driving timer
* preserve the current session
* schedule the next recommendation after another configurable interval
* do not record an exercise

---

# OPTION 2 — PERFORM EXERCISE

Navigate to the Exercise Screen.

Each exercise page must display:

## Exercise Name

## Illustration / Animated Moo Character

Use the Moo mascot to demonstrate the exercise.

Support:

* Lottie
* GIF
* SVG
* CSS Animation
* Framer Motion

The animation loops while the timer counts down.

---

## Exercise Purpose

Explain:

Why this exercise is beneficial specifically for drivers.

---

## Target Muscles

Display affected muscles.

---

## Why Drivers Need It

Explain the health rationale.

---

## Duration

Display:

30–60 seconds

depending on the exercise.

---

## Step-by-Step Instructions

Display concise numbered instructions.

---

## Countdown Timer

Example

00:45

When complete

Show

✅ Exercise Completed

---

# EXERCISE COMPLETION

Automatically save:

* exercise
* timestamp
* duration
* session ID
* completion status

Display

Great job!

Small movements today help prevent long-term health risks.

Buttons

Continue Trip

Finish Driving Session

---

# CONTINUE TRIP

Resume:

Driving timer

Sedentary monitoring

Future recommendation intervals

---

# END DRIVING SESSION

When selected:

Stop timer

Calculate:

* Total Driving Duration
* Sedentary Duration
* Exercises Completed
* Exercises Skipped
* Total Movement Time
* Session Start
* Session End

Store everything.

---

# AI HEALTH SUMMARY

Generate a personalized summary.

Example

Today's Driving Summary

Driving Time

1h 42m

Sedentary Time

1h 35m

Exercises Completed

3

Exercises Skipped

1

Movement Time

2m

Health Score

89/100

AI Recommendation

Excellent work.

You completed three preventive exercises.

Consider taking a short walk after reaching your destination.

---

# DASHBOARD AUTOMATICALLY UPDATES

Update:

Today's Driving Time

Today's Exercises

Weekly Driving Hours

Weekly Exercise Count

Current Streak

Monthly Health Score

Average Session Duration

Exercise Compliance Rate

Preventive Health Progress

---

# EVIDENCE-BASED EXERCISE LIBRARY

Implement the following **10 approved driver exercises**. These are the only exercises available in the MVP.

Each exercise must include:

* Name
* Target Muscles
* Why Drivers Need It
* Duration
* Safe Contexts
* Key Instruction
* Animation
* Completion Timer

---

## 1. Chin Tucks

**Targets**

* Deep cervical flexors
* Longus capitis
* Longus colli
* Suboccipital complex

**Purpose**

Mitigates forward head posture and neck extensor fatigue caused by prolonged road focus.

**Duration**

5–8 repetitions (~45 seconds)

**Recommended Context**

* ✅ Traffic (Stopped)
* ✅ Parked
* ✅ Before Driving
* ✅ After Driving

**Instruction**

Draw your chin straight backward (creating a double chin) while keeping your gaze forward.

---

## 2. Upper Trapezius Stretch

Targets

Upper trapezius

Levator scapulae

Purpose

Relieves neck and shoulder tension from continuous steering.

Duration

15 seconds per side

60 seconds total

Recommended Context

* ✅ Traffic (Stopped)
* ✅ Parked
* ✅ Before Driving
* ✅ After Driving

---

## 3. Shoulder Rolls

Targets

Middle trapezius

Rhomboids

Scapular stabilizers

Purpose

Improves upper thoracic circulation and reduces shoulder slouching.

Duration

10 rolls

30–45 seconds

Recommended Context

* ✅ Traffic (Stopped)
* ✅ Parked
* ✅ Before Driving
* ✅ After Driving

---

## 4. Wrist Flexor Stretch

Targets

Forearm flexors

Purpose

Reduces wrist fatigue from gripping the steering wheel.

Duration

30–45 seconds

Recommended Context

* ❌ Traffic
* ✅ Parked
* ✅ Before Driving
* ✅ After Driving

---

## 5. Seated Figure-4 Glute Stretch

Targets

Gluteus

Piriformis

Deep hip rotators

Purpose

Reduces buttock pain and sciatic irritation caused by prolonged sitting.

Duration

45–60 seconds

Recommended Context

* ❌ Traffic
* ✅ Parked
* ✅ Before Driving
* ✅ After Driving

---

## 6. Seated Heel Raise and Toe Raise

Targets

Gastrocnemius, soleus, tibialis anterior, ankle stabilizers, intrinsic foot muscles

Purpose

Reduces foot and calf fatigue caused by prolonged pedal use, improves ankle mobility, enhances blood circulation in the lower legs, and helps prevent stiffness during long drives.

Duration

45–60 seconds (10–15 repetitions)

Recommended Context

* ⚠️ Traffic (Complete Stop Only)
* ✅ Parked
* ✅ Before Driving
* ✅ After Driving

---

## 7. Standing Hip Flexor & Calf Stretch

Targets

Hip flexors

Calf muscles

Purpose

Lengthens shortened hip flexors after prolonged sitting.

Duration

45–60 seconds

Recommended Context

* ❌ Traffic
* ✅ Parked
* ✅ Before Driving
* ✅ After Driving

---

## 8. Seated Lateral Lumbar Side Stretch

Targets

Quadratus lumborum

Erector spinae

Purpose

Relieves lower back compression and lateral stiffness.

Duration

45 seconds

Recommended Context

* ✅ Traffic (Stopped)
* ✅ Parked
* ✅ Before Driving
* ✅ After Driving

---

## 9. 20-20-20 Ocular Reset & Eye Blink

Targets

Eye muscles

Ciliary muscles

Purpose

Reduces visual fatigue and dry eyes.

Duration

30 seconds

Recommended Context

* ⚠️ Traffic (Complete Stop Only)
* ✅ Parked
* ✅ Before Driving
* ✅ After Driving

---

## 10. Seated Knee Extension & Quad Squeeze

Targets

Quadriceps

Knee joint

Purpose

Relieves knee strain and improves synovial fluid movement after prolonged knee flexion.

Duration

45 seconds

Recommended Context

* ⚠️ Traffic (Complete Stop Only)
* ✅ Parked
* ✅ Before Driving
* ✅ After Driving

---

# SAFETY CONTEXT MATRIX

The recommendation engine **must enforce** the following safety rules:

### ✅ Recommended

Safe to perform in the specified context.

### ⚠️ Use With Caution

Only recommend when the vehicle is **completely stopped**, the transmission is secured, and the driver's foot is clear of active pedal operation.

### ❌ Not Recommended

Never recommend while in traffic or while the vehicle is actively moving. These exercises should only be suggested when parked, before driving, or after driving.

The AI recommendation engine **must filter exercises** based on the user's current driving context so that unsafe exercises are never presented at inappropriate times.

---

# INTELLIGENT RECOMMENDATION ENGINE

Recommendations should **not** be random.

The engine should consider:

* Elapsed sedentary time
* Exercise completion history
* Previously recommended exercises
* Driving context (traffic, parked, before driving, after driving)
* Safety restrictions
* Muscle groups recently exercised

Avoid recommending the same exercise consecutively.

Rotate exercises across:

* Neck
* Shoulders
* Wrists
* Lower back
* Glutes
* Legs
* Feet
* Knees
* Eyes

to provide balanced preventive health interventions throughout long driving sessions.

---

# PREVENTIVE HEALTH EDUCATION

After each driving session, recommend educational cards such as:

* Benefits of Stretching During Long Drives
* Preventing Neck Pain
* Correct Driving Posture
* Lower Back Health for Drivers
* Healthy Habits Before Driving
* Healthy Habits After Driving
* Why Microbreaks Improve Circulation
* Reducing Fatigue Through Small Movements

---

# USER FEEDBACK

At the end of each session, allow users to submit:

* ★★★★★ Rating
* Was the recommendation helpful?
* Was the timing appropriate?
* Was the exercise easy to follow?
* Optional comments

Persist all feedback for future research and analytics.

---

# DATABASE STRUCTURE

Implement persistent storage for:

### Driving Sessions

* session_id
* user_id
* start_time
* end_time
* total_duration
* sedentary_duration
* exercises_completed
* exercises_skipped
* movement_time
* health_score

### Exercise History

* exercise_history_id
* session_id
* user_id
* exercise_name
* target_body_area
* duration
* driving_context
* completed
* completed_at

### AI Health Summary

* summary_id
* session_id
* sedentary_score
* movement_score
* ai_recommendation
* generated_at

### User Feedback

* feedback_id
* session_id
* rating
* comments
* submitted_at

---

# UI/UX REQUIREMENTS

Design the feature as a polished, production-ready experience using the existing **Moove** branding.

Include:

* Large real-time driving timer
* Friendly Moo mascot animations
* Glassmorphism cards
* Smooth transitions
* Responsive layouts
* Progress indicators
* Countdown animations
* Success celebrations after completing exercises
* Accessible typography and color contrast
* Mobile-first, tablet, and desktop support

The recommendation modal should feel encouraging rather than intrusive, reinforcing that exercises are **optional** and should only be performed when the driver is safely stationary.

---

# TECHNICAL REQUIREMENTS

* Maintain the existing **Driver** role for the main application, while keeping the separate **Admin Research Dashboard** isolated and inaccessible to drivers.
* Use configurable reminder intervals (default **20 minutes**) for testing and future customization.
* Ensure timers remain accurate even if the app is minimized or refreshed (where supported).
* Implement clean, modular architecture with reusable components, hooks, services, and APIs.
* Persist all driving sessions, exercise history, AI summaries, educational interactions, and user feedback.
* Handle loading, success, empty, and error states gracefully.
* Follow production-ready coding standards with robust validation, accessibility, responsiveness, and maintainable state management.

The final result should deliver a **research-backed, safety-first preventive health system** that intelligently combines real-time driving session tracking, context-aware exercise recommendations, AI-generated health insights, educational content, and longitudinal analytics into a cohesive MVP suitable for both end users (drivers) and research evaluation through the separate Admin dashboard.
