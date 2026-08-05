# Final Revised Prompt

Act as an expert **Full-Stack Developer, Frontend Developer, Backend Developer, UI/UX Designer, UX Researcher, Product Designer, and AI Systems Architect**.

I want to significantly improve the **Driving Session** experience in the **Moove** application by making it function as an intelligent preventive health companion for drivers rather than just a driving timer. The feature should focus on reducing prolonged sedentary behavior while ensuring that **driver safety is always the highest priority**. At no point should the application encourage users to perform exercises while the vehicle is moving.

---

# Driving Session Workflow

When a user starts a driving session, the application should begin tracking the total driving duration and sedentary time.

## Start Driving Session

When the user taps **Start Driving Session**, the system should:

* Start a real-time driving timer.
* Display:

  * Current driving duration
  * Today's total driving time
  * Number of completed exercises
  * Estimated calories burned (optional)
  * Current trip status
* Continue tracking even if the user navigates to another page within the application.
* Automatically save the session in the database in real time.
* Restore the session if the application is refreshed or reopened.

---

# Preventive Health Reminder System

Instead of functioning only as a timer, I want an intelligent recommendation engine that periodically suggests preventive health exercises based on prolonged sitting time.

Allow users to configure reminder intervals, such as:

* Every 15 minutes
* Every 20 minutes (Default Recommendation)
* Every 30 minutes
* Every 45 minutes
* Every 60 minutes
* Custom Interval (5–120 minutes)

The selected interval should be stored in the user's preferences and automatically applied to future driving sessions.

---

# Safety First

Exercise recommendations must **only be performed when the user is safely stationary**, such as:

* Heavy traffic
* Parked vehicle
* Gas station
* Rest stop
* Waiting area
* Before driving
* After arriving

Every recommendation must clearly display a safety notice.

Example:

> **You've been seated for 20 minutes.**
>
> **If you're safely stationary, consider performing a 30-second preventive health exercise. Never perform exercises while your vehicle is moving.**

---

# "I'm Safely Stopped" Button

During every driving session, display a large, highly visible action button.

Example:

**I'm Safely Stopped**

When pressed:

* The sedentary reminder countdown pauses.
* The overall driving session timer **continues running**.
* The Preventive Exercise Recommendation modal opens.
* The recommendation engine intelligently suggests exercises based on:

  * Current sedentary duration
  * Total driving duration
  * Previous exercise history
  * Recently completed exercises
  * Exercise rotation (avoid recommending the same exercise repeatedly)

---

# Preventive Health Recommendation Popup

Example:

---

## Preventive Health Recommendation

You've been seated for **60 minutes.**

If you're safely stationary, consider performing a **30-second exercise.**

### Recommended Exercise

**Shoulder Rolls**

### Benefits

* Reduce shoulder stiffness
* Improve blood circulation
* Reduce neck tension

Estimated Time:

**30 seconds**

Buttons:

* **Continue Driving**
* **Perform Exercise**

---

If the user selects **Continue Driving**, simply dismiss the recommendation while the driving timer continues uninterrupted.

If the user selects **Perform Exercise**, launch the complete exercise workflow.

---

# Exercise Workflow

When the user chooses **Perform Exercise**, the application should guide them through the following flow:

Exercise Recommendation

↓

Exercise Details

↓

Animated Exercise Demonstration

↓

Step-by-Step Instructions

↓

30-Second Exercise Timer

↓

Exercise Completed

↓

Save Exercise History

↓

Resume Driving Session

Automatically record:

* Exercise Name
* Exercise Category
* Duration
* Timestamp
* Associated Driving Session
* Completion Status

---

# Exercise Animation

Every exercise should include:

* Animated Moo mascot demonstrating the movement
* Step-by-step visual instructions
* Progress indicator
* Countdown timer
* Optional voice guidance (future-ready architecture)
* Skip button
* Complete button

Example:

### Shoulder Rolls

Instructions

1. Sit upright.
2. Roll your shoulders forward.
3. Roll them backward.
4. Repeat slowly.
5. Breathe normally.

Time Remaining

00:30

---

# Resume Trip

After completing an exercise, display a success screen.

Example

## Great Job!

You completed:

**Shoulder Rolls**

Duration:

30 seconds

Benefit:

Reduced upper-body stiffness.

Button:

**Continue Trip**

The driving session timer should continue uninterrupted.

---

# End Driving Session

When the user reaches their destination, they can end the session.

Display a confirmation dialog.

**End Driving Session?**

Buttons:

* Cancel
* End Session

If confirmed, save:

* Start Time
* End Time
* Total Driving Duration
* Total Sedentary Duration
* Number of Exercises Completed
* Number of Recommendations Received
* Number of Recommendations Skipped

---

# AI Health Summary

Immediately after ending the session, automatically generate an AI-powered preventive health summary.

Example

## Today's Driving Summary

Driving Duration

2 Hours 15 Minutes

Exercises Completed

3

Sedentary Breaks

3

Longest Sitting Period

55 Minutes

Preventive Health Score

92 / 100

### AI Insights

Excellent job taking movement breaks.

You successfully reduced prolonged sitting by completing three preventive exercises.

For your next trip, consider taking a movement break every 20–30 minutes for even better posture and circulation.

---

# Dashboard Updates

After every completed session, automatically update the driver's dashboard.

## Daily Dashboard

* Driving Time
* Exercise Count
* Sedentary Time
* Preventive Health Score
* Break Frequency

## Weekly Dashboard

* Weekly Driving Hours
* Weekly Exercises Completed
* Most Performed Exercise
* Weekly Health Trend
* Improvement Percentage

## Monthly Dashboard

* Total Trips
* Average Driving Duration
* Exercise Compliance Rate
* Preventive Health Score Trend
* Sedentary Time Reduction

---

# Preventive Health Education

After viewing the AI Health Summary, recommend educational resources that promote healthier driving habits.

Examples:

* Why prolonged sitting affects drivers
* Proper driving posture
* Shoulder mobility exercises
* Neck pain prevention
* Lower back stretching
* Breathing techniques while waiting in traffic

Each educational card should include:

* Thumbnail image
* Estimated reading time
* Difficulty level
* Bookmark option
* Read More button

---

# Feedback & Validation Integration (Revised)

**Do not display a feedback form immediately after ending the driving session.**

Instead, after the AI Health Summary is generated, display a simple success message such as:

> **Your driving session has been successfully completed.**
>
> **If you'd like to share your experience, you can visit the "Feedback & Validation" tab anytime from the dashboard.**

Since the **Feedback & Validation** module has already been created, the application should simply provide a navigation option such as:

* **Go to Feedback & Validation**
* **Maybe Later**

Selecting **Go to Feedback & Validation** should navigate the user to the existing **Feedback & Validation** page where they can complete surveys, usability evaluations, validation forms, ratings, and comments.

This avoids duplicating the feedback functionality and keeps all user evaluation activities centralized within the dedicated **Feedback & Validation** module.

---

# Complete User Flow

```text
Login

↓

Start Driving Session

↓

Driving Timer Starts

↓

Reminder Interval Reached (e.g., 20 Minutes)

↓

Preventive Health Recommendation Appears

↓

"You've been seated for 20 minutes.
If you're safely stationary,
consider performing a 30-second exercise."

↓

Continue Driving
OR
Perform Exercise

↓

Exercise Recommendation

↓

Exercise Animation

↓

30-Second Timer

↓

Exercise Completed

↓

Save Exercise History

↓

Continue Trip

↓

Another Reminder Interval Reached

↓

Recommend New Exercise

↓

Exercise Completed

↓

Resume Driving

↓

Destination Reached

↓

End Driving Session

↓

Save Driving Session Data

↓

Generate AI Health Summary

↓

Dashboard Statistics Updated

↓

Recommend Preventive Health Education

↓

Display:

"Your session has been completed successfully."

↓

Go to Feedback & Validation
OR
Maybe Later

↓

Done
```

---

# Example User Scenario

**8:00 AM**

↓

User logs into Moove.

↓

Starts a Driving Session.

↓

Drives for 50 minutes.

↓

Encounters heavy traffic for 10 minutes.

↓

Moove detects 60 minutes of sedentary driving.

↓

Notification appears:

> "You've been seated for 60 minutes.
> If you're safely stationary, consider performing a 30-second breathing exercise."

↓

User taps **I'm Safely Stopped**.

↓

Breathing exercise animation begins.

↓

User completes the exercise.

↓

Exercise history is saved.

↓

Driving session continues.

↓

After another 30 minutes, the user parks at a gas station.

↓

Moove recommends a **Shoulder Mobility Exercise**.

↓

User performs the exercise.

↓

Exercise completion is saved.

↓

User resumes driving.

↓

Arrives at the office.

↓

Ends Driving Session.

↓

Driving session data is stored.

↓

AI generates a personalized preventive health summary.

↓

Dashboard statistics update automatically.

↓

User reads recommended preventive health education.

↓

User optionally navigates to the existing **Feedback & Validation** tab to complete evaluation forms and provide feedback.

↓

Session completed successfully.

---

# UI/UX Requirements

* Design a modern, clean, and responsive mobile-first interface.
* Use large, touch-friendly buttons that are easy to interact with while safely stopped.
* Use the Moo mascot for all exercise demonstrations and preventive health guidance.
* Provide smooth animations and transitions between timers, reminders, exercises, AI summaries, and educational content.
* Include progress indicators and subtle micro-interactions throughout the experience.
* Support accessibility through readable typography, sufficient color contrast, and future-ready voice guidance.
* Ensure reminders are non-intrusive and always reinforce that exercises should only be performed while safely stationary.
* Persist the driving session, timer state, reminder intervals, and exercise history even after refreshes or temporary network interruptions.
* **Reuse the existing "Feedback & Validation" page instead of creating a new feedback screen**, ensuring a consistent information architecture and avoiding duplicate functionality within the application.
