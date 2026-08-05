Act as an expert Full-Stack Developer, Frontend Developer, Backend Developer, UI/UX Designer, Software Architect, Product Designer, and QA Engineer.

Carefully analyze the entire codebase before making any modifications. Do not implement quick fixes. Instead, identify the root cause of every issue, preserve existing functionality, maintain clean architecture, and ensure consistency across the frontend, backend, database, state management, and user experience.

====================================================
1. STANDARDIZE ALL EXERCISES USING THE OFFICIAL EXERCISE LIBRARY
====================================================

The application currently has four exercise categories:

• Before Driving Warm-Up
• During Break Exercises
• Stop Exercises
• After Driving Cool-Down

All exercises shown throughout the application MUST ONLY come from the official Exercise Library below.

DO NOT CREATE, GENERATE, OR DISPLAY ANY OTHER EXERCISES.

DO NOT use placeholders.
DO NOT use AI-generated exercises.
DO NOT substitute exercises with similar names.
DO NOT duplicate exercises under different names.

The application must strictly reference this single source of truth.

====================================================
OFFICIAL EXERCISE LIBRARY (ONLY THESE 10)
====================================================

1. Chin Tucks

Targets:
Deep cervical flexors (longus capitis, longus colli), suboccipital complex.

Purpose:
Mitigates forward head posture and neck extensor fatigue caused by concentrating on the road ahead.

Duration:
5–8 repetitions (~45 seconds)

Contexts:
✔ Traffic
✔ Parked
✔ Before Driving
✔ After Driving

Instruction:
Draw your chin straight backward while keeping your gaze straight ahead.

----------------------------------------------------

2. Upper Trapezius Stretch

Targets:
Upper trapezius
Levator scapulae

Purpose:
Relieves shoulder tension and neck stiffness.

Duration:
15 seconds per side

Contexts:
✔ Traffic
✔ Parked
✔ Before Driving
✔ After Driving

Instruction:
Lower one ear toward the shoulder until a gentle stretch is felt.

----------------------------------------------------

3. Shoulder Rolls

Targets:
Scapular retractors
Middle trapezius
Rhomboids
Pectoralis minor

Purpose:
Promotes circulation and relieves shoulder slouching.

Duration:
10 rolls

Contexts:
✔ Traffic
✔ Parked
✔ Before Driving
✔ After Driving

Instruction:
Roll shoulders smoothly up, back, down, and forward.

----------------------------------------------------

4. Wrist Flexor Stretch

Targets:
Forearm flexors
Palmar fascia

Purpose:
Reduces wrist and forearm fatigue from gripping the steering wheel.

Duration:
15 seconds per arm

Contexts:
✔ Parked
✔ Before Driving
✔ After Driving

NOT allowed during Traffic.

Instruction:
Extend the arm and gently pull fingers backward.

----------------------------------------------------

5. Seated Figure-4 Glute Stretch

Targets:
Glutes
Piriformis
Hip rotators

Purpose:
Relieves buttock pain and piriformis tightness after prolonged sitting.

Duration:
15–20 seconds per leg

Contexts:
✔ Parked
✔ Before Driving
✔ After Driving

STRICTLY PROHIBITED during Traffic.

Instruction:
Cross one ankle over the opposite knee and lean slightly forward.

----------------------------------------------------

6. Seated Heel Raise and Toe Raise

Targets:
Calves
Tibialis anterior
Foot muscles

Purpose:
Improves circulation and reduces ankle stiffness.

Duration:
10–15 repetitions

Contexts:
✔ Traffic (with caution)
✔ Parked
✔ Before Driving
✔ After Driving

Instruction:
Alternate heel raises and toe raises slowly while seated.

----------------------------------------------------

7. Standing Hip Flexor & Calf Stretch

Targets:
Hip flexors
Calves

Purpose:
Lengthens shortened hip flexors after prolonged driving.

Duration:
20 seconds per side

Contexts:
✔ Parked
✔ Before Driving
✔ After Driving

STRICTLY PROHIBITED inside a moving vehicle.

Instruction:
Stand beside the vehicle and stretch one leg backward.

----------------------------------------------------

8. Seated Lateral Lumbar Side Stretch

Targets:
Quadratus lumborum
Lower back
Thoracolumbar fascia

Purpose:
Relieves lower back compression and side stiffness.

Duration:
3–4 side leans

Contexts:
✔ Traffic
✔ Parked
✔ Before Driving
✔ After Driving

Instruction:
Sit tall and lean gently to one side.

----------------------------------------------------

9. 20-20-20 Ocular Reset & Eye Blink

Targets:
Eyes
Ciliary muscles
Tear film

Purpose:
Reduces eye strain and dry eyes.

Duration:
30 seconds

Contexts:
✔ Traffic (with caution)
✔ Parked
✔ Before Driving
✔ After Driving

Instruction:
Look 20 feet away for 20 seconds while blinking intentionally.

----------------------------------------------------

10. Seated Knee Extension & Quad Squeeze

Targets:
Quadriceps
Knee joint

Purpose:
Reduces knee stiffness and improves circulation.

Duration:
5 repetitions per leg

Contexts:
✔ Traffic (with caution)
✔ Parked
✔ Before Driving
✔ After Driving

Instruction:
Extend one leg, hold for three seconds, then lower slowly.

====================================================
2. AUTOMATIC EXERCISE FILTERING
====================================================

The application should intelligently filter exercises based on the user's current session.

For example:

BEFORE DRIVING
Only show exercises whose contexts include:
• Before Driving

BREAK TIMER
Only show exercises that are safe in Traffic.

STOP SESSION
Only show Parked exercises.

AFTER DRIVING
Only show exercises marked for After Driving.

Never display an exercise outside its approved context.

====================================================
3. SINGLE SOURCE OF TRUTH
====================================================

Create one centralized Exercise Library that stores:

• Exercise ID
• Name
• Category
• Target Muscles
• Benefits
• Contexts
• Duration
• Difficulty
• Timer
• Safety Notes
• Instructions
• Completion State

Every screen must read from this centralized dataset instead of hardcoded exercise lists.

====================================================
4. FIX WARM-UP AND COOL-DOWN COMPLETION BUG
====================================================

There is currently a bug where completed exercises are not properly reflected.

Please identify the root cause and resolve it.

Expected behavior:

When a user taps "Do It"

↓

Timer starts

↓

User finishes timer

↓

Exercise automatically becomes completed

↓

Exercise card updates immediately

↓

Progress updates immediately

↓

Exercise is disabled

↓

User cannot repeat the same exercise during the same session

↓

Completed badge appears

↓

Checkmark appears

↓

Progress ring updates

↓

Completion persists until the session ends or is reset.

If the user returns to the page, the completed exercise must still appear as completed.

====================================================
5. DISABLE COMPLETED EXERCISES
====================================================

Once completed, the exercise card should:

✔ Show a green check icon
✔ Display "Completed"
✔ Disable the "Do It" button
✔ Prevent multiple completion submissions
✔ Prevent duplicate analytics entries
✔ Prevent duplicate XP or rewards
✔ Prevent duplicate progress updates

Instead of "Do It", display:

✓ Completed

with a disabled state.

====================================================
6. FIX SESSION STATE MANAGEMENT
====================================================

Ensure exercise completion state is synchronized across:

• Exercise Library
• Driving Session
• Warm-Up
• Break Exercises
• Stop Exercises
• Cool-Down
• Dashboard
• Analytics
• Feedback
• Progress Indicators

Avoid stale UI states.

Use proper state management rather than local component-only state.

====================================================
7. IMPROVE USER EXPERIENCE
====================================================

Each exercise card should include:

• Exercise Name
• Target Area
• Duration
• Difficulty
• Safety Label
• Context Badge
• Expand Details
• Instructions
• Benefits
• Animated Timer
• Completion Badge

Completed cards should be visually different:

• Muted appearance
• Green accent
• Checkmark
• Disabled action button

====================================================
8. FEEDBACK MODULE REDESIGN FOR TRL 4
====================================================

Redesign the Feedback Module so it supports Technology Readiness Level (TRL) 4 validation. The goal is to collect structured, measurable, and research-ready data rather than only general comments.

The module should clearly separate Driver-side data collection from Admin-side analysis.

----------------------------------------------------
DRIVER SIDE
----------------------------------------------------

Create a structured testing workflow where every feedback submission is tied to a documented testing session.

Before users begin testing, capture:

• Testing Session Name
• Testing Date
• Driver Identifier (anonymous ID if required)
• Vehicle Type
• Testing Environment
  - Classroom
  - Simulated Driving
  - Parked Vehicle
  - Controlled Road Test
• Tester Role
• Device Used
• App Version

Display a short explanation that the session is part of a structured prototype evaluation.

----------------------------------------------------
Predefined Metrics
----------------------------------------------------

Collect measurable metrics before and during testing, such as:

Usability
• Task Completion Rate (%)
• Time-on-Task
• Number of Errors
• Exercise Completion Rate
• Navigation Success Rate

Engagement
• Number of Exercises Completed
• Time Spent
• Session Duration
• Feedback Completion Rate

Performance
• Timer Accuracy
• App Responsiveness
• Loading Time
• Crash Count
• Sync Success Rate

User Perception
• Ease of Use (1–5)
• Clarity of Instructions (1–5)
• Exercise Relevance (1–5)
• Satisfaction (1–5)
• Confidence in Using the App (1–5)

Health Perception
• Reduced Neck Stiffness
• Reduced Shoulder Fatigue
• Reduced Lower Back Discomfort
• Improved Comfort While Driving

Use sliders, Likert scales, checkboxes, and optional comments instead of large free-text fields.

====================================================
9. ADMIN DASHBOARD FOR TRL 4
====================================================

Create a dedicated Validation Dashboard where administrators can monitor testing outcomes.

Include:

Testing Overview

• Number of Participants
• Number of Sessions
• Completion Rate
• Average Ratings
• Average Time-on-Task
• Exercise Completion Statistics
• Error Rate
• User Success Rate

----------------------------------------------------

Results Table

Each row should include:

• Participant ID
• Test Session
• Date
• Completed Tasks
• Time-on-Task
• Success Rate
• Errors
• Overall Rating

----------------------------------------------------

Analytics

Display visualizations such as:

• Completion Rate by Exercise
• Most Frequently Completed Exercises
• Average Feedback Ratings
• Task Success Rate
• Error Distribution
• Average Session Duration
• User Satisfaction Trends
• Driver Comfort Improvements

----------------------------------------------------

Evidence Repository

Allow administrators to upload and organize validation evidence, including:

• Screenshots
• Photos
• Short Videos
• Performance Logs
• Observation Notes
• Supporting Documents

These should be associated with individual testing sessions.

====================================================
10. TRL 4 LEARNING & REFLECTION MODULE
====================================================

Provide an admin-only section for documenting lessons learned after testing.

Organize findings into four categories:

What Worked
• Successful features
• Positive usability findings
• High-performing exercises

What Didn't Work
• Pain points
• Errors
• Bugs
• Confusing workflows

Unexpected Findings
• User behaviors
• Surprising observations
• New insights

Planned Improvements
• UX enhancements
• Technical fixes
• New features
• Future iterations

This section should support structured text entries and be exportable for documentation.

====================================================
11. EXPORTABLE TRL 4 REPORTS
====================================================

Enable administrators to export testing data into formats suitable for research and reporting.

Include:

• Testing Setup
• Participant Summary
• Selected Metrics
• Measurable Results
• Charts
• Feedback Summary
• Lessons Learned
• Attached Evidence

Support exporting as PDF and CSV where appropriate.

====================================================
12. QUALITY ASSURANCE
====================================================

Before completing the implementation:

• Analyze all related frontend and backend files.
• Remove duplicated logic.
• Ensure all exercise flows use the centralized Exercise Library.
• Verify that only the 10 approved exercises can appear anywhere in the application.
• Confirm that completed exercises remain completed throughout the active session.
• Verify that completion states synchronize correctly across all screens.
• Prevent duplicate submissions and inconsistent UI states.
• Ensure analytics, dashboards, progress indicators, and feedback modules all use the same source of truth.
• Confirm the Feedback Module aligns with TRL 4 validation requirements and produces structured, measurable, and exportable results suitable for documentation.