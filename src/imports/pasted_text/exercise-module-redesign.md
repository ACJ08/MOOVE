Final Expanded Prompt
Act as an expert Full Stack Developer, Frontend Developer, Backend Developer, Mobile Application Architect, UI/UX Designer, and Product Designer.
Carefully redesign and improve the user experience, exercise flow, session management, and post-driving experience for the Warm-Up, Break, Stop, and Cooldown Exercise modules. The implementation should follow modern mobile application design principles, provide a seamless user journey, and ensure consistency between the frontend, backend, and database.
________________________________________
1. Exercise Execution Screen
For every exercise category:
•	Warm-Up Exercises
•	Break Exercises
•	Stop Exercises
•	Cooldown Exercises
When the user taps "Do It", the application should navigate to a dedicated Exercise Execution Screen instead of simply starting the timer inside the exercise card.
The execution screen should include the following information:
________________________________________
Before Driving Warm-Up
Optional warm-up exercises to prepare your body before driving.
✅ 1 Exercise Completed
💡 These take approximately 5–7 minutes and can be done while seated.
________________________________________
🧘 Chin Tucks
Neck • Easy
Target:
Deep cervical flexors
Selected Duration:
45 seconds
Selected Sets:
2 Sets
Rest Between Sets:
10 seconds
Benefits:
Corrects forward head posture before road focus begins.
Instructions:
•	Sit upright.
•	Slowly tuck your chin backward.
•	Hold briefly.
•	Return to the starting position.
•	Repeat slowly.
Illustration or animation of the exercise
Primary Button:
Start Exercise
________________________________________
The execution screen should clearly separate:
•	Exercise information
•	Target muscles
•	Exercise instructions
•	Selected duration
•	Selected number of sets
•	Rest interval
•	Exercise progress
•	Active timer
•	Completion status
instead of displaying everything inside the exercise card.
________________________________________
2. Exercise Completion Logic
Once the user successfully completes an exercise:
•	Mark the exercise as Completed.
•	Display a green checkmark or completion badge.
•	Disable the Do It button.
•	Prevent the user from repeating the same exercise within the current driving session.
Example:
Instead of:
Do It
display:
✅ Completed
If the user attempts to perform the same exercise again, display an informational message such as:
"This exercise has already been completed for this driving session."
The completion state should remain until the driving session ends.
This behavior must apply consistently to:
•	Warm-Up Exercises
•	Break Exercises
•	Stop Exercises
•	Cooldown Exercises
________________________________________
3. Remove Duplicate Timer Customization
Currently, timer customization exists in multiple locations.
Remove the standalone Customize Timer section completely.
Timer configuration should only exist inside the Exercise Details page.
There should be only one source of truth for configuring:
•	Exercise duration
•	Number of sets
•	Rest interval
________________________________________
4. Rename Incorrect Button Labels
Several button labels no longer match the application's timer-based exercise workflow.
Rename them appropriately.
Instead of:
•	Do Exercise
Use:
•	Configure Exercise
•	Start Exercise
•	Begin Exercise
Instead of:
•	Choose Reps
Use:
•	Choose Duration
•	Exercise Duration
•	Timer Length
Since the application now uses time-based exercises, avoid any terminology related to repetitions.
________________________________________
5. Proper Multi-Set Exercise Flow
Currently, multiple sets are combined into one long timer.
This is incorrect.
Each set must execute independently.
Example:
User Configuration:
Duration:
30 seconds
Sets:
2
Rest Between Sets:
10 seconds
The exercise flow should become:
________________________________________
Set 1
30-second timer
↓
Rest
10-second countdown
↓
Set 2
30-second timer
↓
Exercise Completed
________________________________________
Do not merge all sets into a single continuous timer.
Instead, clearly separate:
•	Current Set
•	Exercise Timer
•	Rest Timer
•	Remaining Sets
Display information such as:
Current Set:
1 of 2
↓
Exercise Timer
↓
Rest
10 seconds
↓
Current Set:
2 of 2
↓
Exercise Timer
↓
Exercise Completed
This behavior must apply consistently to:
•	Warm-Up
•	Break
•	Stop
•	Cooldown
________________________________________
6. Exercise Progress Indicator
During exercise execution, display clear progress indicators.
Examples:
Exercise Progress
Set 1 of 3
■■□□□□
or
67% Complete
The user should always know:
•	Current set
•	Remaining sets
•	Overall exercise progress
________________________________________
7. Exercise Completion Summary
After completing an exercise, display a completion screen.
Example:
✅ Exercise Completed
Great job!
You completed:
Chin Tucks
Duration:
45 seconds
Sets Completed:
2
Total Time:
1 minute 40 seconds
Provide a single primary button:
Continue
This returns the user to the exercise list.
________________________________________
8. Exercise List Behavior
After returning to the exercise list:
Completed exercises should display:
✅ Completed
instead of
Do It
Completed exercise cards should appear visually disabled or dimmed.
Incomplete exercises remain selectable.
This provides users with a clear understanding of which exercises have already been completed during the current driving session.
________________________________________
9. Redesign the "What's Next?" Section (Post-Driving Session Only)
The current "What's Next?" section is not organized and does not provide a meaningful post-session experience.
Current options:
•	Read Preventive Health Education
•	Submit User Feedback
•	Sedentary Monitoring
•	Health Dashboard
Instead of displaying this section throughout the exercise flow, only display the "What's Next?" section after the user has fully completed the entire driving session.
The driving session is considered complete after the user has finished all applicable activities, including:
•	Warm-Up (if performed)
•	Driving Session
•	Break Exercise(s), if applicable
•	Stop Exercise
•	Cooldown Exercise
The purpose of this screen is to guide users toward the most relevant next actions after successfully completing their session.
Priority Order
⭐ 1. Submit User Feedback (Primary Call-to-Action)
This should always be the most visually prominent option.
Supporting text:
Help us improve your experience by sharing feedback about today's driving session, guided exercises, AI recommendations, and overall usability. Your input helps us continuously improve future recommendations and enhance the application's effectiveness.
Use:
•	Primary filled button
•	Highlighted card
•	Accent color
•	Highest visual emphasis
________________________________________
📊 2. View Health Dashboard
After submitting feedback (or choosing to skip it), users can review their personalized health summary, including:
•	Daily activity overview
•	Completed exercises
•	Wellness trends
•	Personalized health insights
•	Driving session statistics
________________________________________
💺 3. View Sedentary Monitoring
Allow users to review sedentary behavior collected during the driving session, such as:
•	Total driving duration
•	Continuous sitting time
•	Break history
•	Sedentary risk indicators
•	Posture and movement summaries
________________________________________
📚 4. Read Preventive Health Education
Provide optional educational resources covering:
•	Sedentary health risks
•	Proper driving posture
•	Vehicle ergonomics
•	Stretching techniques
•	Safe driving habits
•	Preventive wellness practices
This should be presented as optional learning content after users have completed their primary post-session activities.
________________________________________
Complete User Flow
The overall application flow should be:
Home
    ↓
Personalization Questions
    ↓
Warm-Up (Optional)
    ↓
Driving Session
    ↓
Break Exercise(s) (if applicable)
    ↓
Continue Driving
    ↓
Stop Exercise
    ↓
Cooldown Exercise
    ↓
Driving Session Completed
    ↓
Driving Session Summary
    ↓
⭐ What's Next?
        ├── Submit User Feedback (Primary)
        ├── View Health Dashboard
        ├── View Sedentary Monitoring
        └── Read Preventive Health Education
Additional Behavior
•	The What's Next? section must only appear once the user has completed the full driving session, never after individual exercises.
•	If the user has already submitted feedback for the completed driving session:
o	Replace the Submit User Feedback button with a "Thank You for Your Feedback" confirmation card.
o	Automatically make View Health Dashboard the next recommended primary action.
•	Celebrate the user's completion before transitioning into the What's Next? screen to provide a satisfying end-of-session experience.
________________________________________
10. UI/UX Expectations
Ensure the redesigned experience follows modern mobile application and accessibility best practices by:
•	Creating a dedicated, distraction-free Exercise Execution Screen.
•	Separating exercise information from active timers.
•	Providing smooth transitions between exercise sets and rest periods.
•	Clearly displaying exercise progress and completion status.
•	Preventing duplicate exercise completion within the same driving session.
•	Removing redundant timer configuration options.
•	Using consistent timer-based terminology throughout the application.
•	Displaying clear visual feedback for completed exercises.
•	Making the post-driving Submit User Feedback action the primary call-to-action.
•	Showing the What's Next? section only after the entire driving session has been completed.
•	Maintaining consistent behavior across Warm-Up, Break, Stop, and Cooldown exercise modules.
•	Synchronizing all exercise states—including selected duration, number of sets, rest intervals, progress, completion status, and session data—between the frontend, backend, and database to ensure data integrity and a seamless user experience.

