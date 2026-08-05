Act as an expert Full-Stack Developer, Frontend Developer, Backend Developer, UI/UX Designer, Product Designer, and Software Architect.

Analyze my entire codebase, project architecture, frontend, backend, database schema, APIs, authentication, user flow, state management, and all related files before making any modifications.

Implement the following changes while maintaining clean architecture, reusable components, responsive UI, consistent design, and preserving all existing functionalities. Do not break any existing features.

1. Admin Dashboard Changes
Remove Think-Aloud Data

Since this prototype will not use the Think-Aloud testing method, completely remove all Think-Aloud-related functionality from the Admin Dashboard.

This includes removing:

Think-Aloud data collection
Think-Aloud analytics
Think-Aloud charts
Think-Aloud reports
Think-Aloud tables
Think-Aloud database fields
Think-Aloud UI components
Think-Aloud navigation items
Think-Aloud exports
Any unused backend logic related to Think-Aloud

Ensure that removing these components does not affect the remaining analytics and user feedback modules.

The Admin Dashboard should only display:

User Feedback
Usability Ratings
Ease of Use
Perceived Stress
Exercise Helpfulness
User Suggestions
Session Analytics
Exercise Completion Analytics
Dashboard Statistics
2. Improve User Personalization Integration

The personalization questions answered by the user on the Home page should be fully integrated into every driving session.

Currently, the personalization information should not remain isolated.

Instead:

Save the user's personalization preferences.
Load them automatically whenever a driving session starts.
Use them throughout the session.

Examples include:

Driver type
Driving frequency
Preferred reminders
Health goals
Areas of discomfort
Existing pain points
Preferred exercise intensity
Mobility limitations
Session preferences

These answers should dynamically influence:

Warm-up exercise recommendations
Break exercise recommendations
Stop exercise recommendations
Cool-down exercise recommendations
AI health insights
AI health summaries
Dashboard statistics
Exercise prioritization
Session recommendations

The personalization should feel like a continuous user profile instead of a one-time questionnaire.

3. Exercise Flow Improvements

Improve the exercise experience across all exercise categories:

Warm-Up
Break Exercises
Stop Exercises
Cool-Down Exercises

Each exercise should follow the same interaction flow.

Exercise Flow

When a user opens an exercise:

Display:

Exercise illustration/animation
Exercise description
Target muscles
Why drivers need it
Safety reminders
Estimated duration
Instructions

Then after pressing "Do Exercise", display repetition choices.

Example:

Choose repetitions:

5 repetitions
8 repetitions
10 repetitions
12 repetitions
15 repetitions

or whatever repetition values are appropriate for that exercise.

The repetition options should be intelligently aligned with the recommended duration.

For example:

If the exercise duration is approximately 30 seconds,

do not allow 30 repetitions.

Instead choose repetitions that realistically fit within the expected duration.

Maintain consistency between:

exercise duration
repetition count
estimated completion time
Exercise Completion

After completing the selected repetitions:

Automatically mark the exercise as:

✓ Completed

Display:

Completed badge
Timestamp
Repetitions performed
Time spent

Update the session progress immediately.

4. Session Progress Tracking

Every completed exercise should immediately update the active driving session.

Store:

Exercise ID
Exercise Name
Category
Repetitions
Time completed
Duration
Whether completed
Whether skipped

The session should accurately record all completed activities.

5. Improve Driving Session Ending Flow

Currently the session processes immediately.

Instead redesign the flow.

New Flow

When the user ends a driving session:

Show the Cool-Down recommendation screen first.

Display:

"Would you like to perform the recommended cool-down exercises before ending your driving session?"

Buttons:

Start Cool-Down Exercises
Skip Cool-Down

If the user chooses:

Option A

Start Cool-Down

The user performs the cool-down exercises.

Once completed,

return to the session ending screen.

Option B

Skip Cool-Down

Proceed directly to session processing.

After either option,

display a final confirmation screen.

Buttons:

Process Session
Save Driving Session

During processing:

Save driving session data
Save completed exercises
Save skipped exercises
Save repetitions
Save duration
Save warm-up completion
Save break exercise completion
Save stop exercise completion
Save cool-down completion (if completed)
Generate AI Health Summary
Update Dashboard Statistics
Update Exercise History
Update Progress Tracking
Refresh User Analytics

This ensures the cool-down exercise is included in the final session data whenever completed.

6. Exercise History Improvements

Under the Exercises tab,

create a guided exercise progress interface.

Users should immediately see what they have accomplished throughout their driving sessions.

Examples:

Completed Today

✓ Neck Stretch

✓ Shoulder Rolls

✓ Heel Raise & Toe Raise

Completed This Week

Progress:

Warm-Up

■■■■□□

67%

Break Exercises

■■■■■□

83%

Stop Exercises

■■■□□□

50%

Cool-Down

■■■■□□

70%

Display:

Completion history
Total repetitions
Total exercises completed
Current streak
Weekly progress
Monthly progress
Most frequently completed exercises
Recently completed exercises
7. Exercise Consistency

Ensure every exercise category uses exactly the same UX pattern.

Warm-Up

Exercise details
Repetition selection
Start Exercise
Complete Exercise
Update Progress

Break Exercises

Exercise details
Repetition selection
Start Exercise
Complete Exercise
Update Progress

Stop Exercises

Exercise details
Repetition selection
Start Exercise
Complete Exercise
Update Progress

Cool-Down

Exercise details
Repetition selection
Start Exercise
Complete Exercise
Update Progress

All exercise modules should behave consistently.

8. Database & Backend Updates

Update the backend and database schema to support the new functionality.

Ensure the driving session stores:

User Personalization
Driver Profile
Health Goals
Pain Areas
Preferred Exercise Types
Reminder Preferences
Exercise Data
Exercise ID
Category
Completion Status
Repetitions
Duration
Timestamp
Skipped Status
Session Summary
Warm-Up Completed
Break Exercises Completed
Stop Exercises Completed
Cool-Down Completed
Total Exercises Completed
Total Repetitions
Total Exercise Duration
AI Health Summary
Dashboard Metrics

Ensure all analytics, reports, dashboard statistics, and AI-generated health summaries use this updated session data.

9. UI/UX Requirements

Maintain a modern, accessible, and mobile-first interface.

Ensure:

Responsive layouts across all devices.
Consistent spacing, typography, icons, and color system.
Smooth animations and transitions.
Clear progress indicators for exercise completion.
Intuitive navigation between exercise categories.
Visual badges for completed exercises.
Progress bars for each exercise category.
Confirmation dialogs before ending sessions.
Loading indicators while processing sessions and generating AI summaries.
Empty states, success states, and error states are handled gracefully.
Accessibility best practices (keyboard navigation, ARIA labels, sufficient color contrast).
10. Technical Requirements
Preserve all existing functionality unless explicitly removed.
Refactor duplicated code into reusable components where appropriate.
Maintain clean architecture and separation of concerns.
Ensure backend APIs, frontend state management, and database updates remain synchronized.
Validate all user inputs and repetition selections.
Handle edge cases such as skipped exercises, interrupted sessions, or partially completed routines.
Update documentation and comments where necessary.
Thoroughly test the new workflow to ensure accurate session tracking, exercise completion, AI summary generation, and dashboard analytics.

The final implementation should provide a seamless, personalized, and consistent user experience where personalization influences every driving session, all exercise categories follow a unified interaction pattern, completed exercises are accurately tracked, and session processing includes optional cool-down exercises before generating health insights and updating user statistics.