Here's an expanded, clearer, and more detailed version of your prompt that provides comprehensive functional, UI/UX, and implementation requirements.

---

**Expanded Prompt**

> **Act as an expert Full-Stack Developer, Frontend Developer, Backend Developer, Software Architect, and UI/UX Designer.**
>
> I want you to improve the entire **Driving Session** workflow of the Moove application to make it feel like a polished, production-ready health companion for drivers. Ensure every feature is fully functional, responsive, intuitive, and consistent with the existing design language of the application.
>
> ## 1. Before Driving Exercises (New Feature)
>
> Before the user starts a driving session, add a new screen or modal titled **"Before Driving Exercises."**
>
> This should be **optional**, allowing users to either:
>
> * Skip and Start Driving
> * Do Before Driving Exercises
>
> The exercises should be specifically designed for preparing the body before driving, improving posture, flexibility, blood circulation, alertness, and reducing muscle stiffness.
>
> Include appropriate exercises such as:
>
> * Chin Tucks
> * Neck Rotations
> * Shoulder Rolls
> * Shoulder Blade Squeezes
> * Chest Stretch
> * Upper Trapezius Stretch
> * Wrist Flexor Stretch
> * Wrist Extensor Stretch
> * Seated Spinal Twist
> * Deep Breathing Exercise
>
> For each exercise, display:
>
> * Exercise name
> * Target muscles
> * Short explanation
> * Why it helps drivers
> * Recommended duration
> * Recommended repetitions
> * Difficulty level
> * Estimated completion time
>
> The UI should encourage users but never force them to complete these exercises before driving.
>
> ---
>
> ## 2. Exercise Recommendation Customization
>
> Whenever the application recommends an exercise (during break reminders or after driving), do **not automatically start** the exercise.
>
> Instead, show an Exercise Recommendation panel where users can customize their session before beginning.
>
> Allow users to configure:
>
> * Exercise selection (choose one or multiple exercises)
> * Timer duration
> * Number of repetitions
> * Rest interval between repetitions
> * Total exercise duration
> * Skip exercise option
> * Save as preferred preset (optional)
>
> Each exercise card should include:
>
> * Illustration or animation
> * Exercise description
> * Why it is recommended
> * Target muscles
> * Expected benefits
> * Estimated calories burned (optional)
> * Recommended driving context (Traffic, Parked, Fuel Stop, Before Driving, After Driving)
>
> Users should also be able to create their own customized exercise duration and repetition instead of being limited to predefined values.
>
> ---
>
> ## 3. Exercise Session Controls
>
> While performing an exercise, include controls such as:
>
> * Start
> * Pause
> * Resume
> * Stop
> * Restart
> * Skip Exercise
> * Next Exercise
>
> If the user presses **Stop**, show a confirmation dialog:
>
> > "Do you want to stop this exercise session?"
>
> Options:
>
> * Continue Exercise
> * End Exercise
>
> If the session ends early, save partial completion in the session history.
>
> ---
>
> ## 4. Driving Session Completion Flow
>
> Once a driving session is completed, instead of ending immediately, present a **Session Completed Dashboard**.
>
> Congratulate the user and summarize:
>
> * Total driving duration
> * Number of breaks taken
> * Exercises completed
> * Total exercise duration
> * Sedentary time
> * Health score (if available)
> * Calories burned (optional)
> * Wellness summary
>
> Then present the following actions:
>
> ### Option 1
>
> **Do After Driving Exercises**
>
> Display all appropriate cooldown exercises, including:
>
> * Neck stretches
> * Upper trapezius stretch
> * Levator scapulae stretch
> * Shoulder rolls
> * Chest opener
> * Thoracic extension
> * Wrist stretches
> * Seated hamstring stretch
> * Hip flexor stretch
> * Deep breathing
>
> Again, allow customization of:
>
> * Timer
> * Repetitions
> * Duration
> * Exercise selection
>
> ---
>
> ### Option 2
>
> Continue exploring the application by navigating to:
>
> * Sedentary Monitoring
> * Health Dashboard
> * Health Education
> * Feedback & Validation
>
> Ensure the **Feedback & Validation** page remains fully accessible after every completed driving session.
>
> ---
>
> ## 5. Driving Session Break Scheduling
>
> Improve the driving session timer.
>
> During the demo, when the user changes the break interval, the **Next Break Time** should update immediately and correctly.
>
> For example:
>
> If the user changes:
>
> * Every 20 minutes
>
> to
>
> * Every 35 minutes
>
> then all upcoming break reminders should automatically recalculate based on the newly selected interval.
>
> Do not require restarting the driving session.
>
> ---
>
> ## 6. Next Break Configuration
>
> Add a settings section where users can configure how frequently they want exercise reminders.
>
> Provide preset options such as:
>
> * Every 15 minutes
> * Every 20 minutes
> * Every 25 minutes
> * Every 30 minutes
> * Every 35 minutes
> * Every 40 minutes
> * Every 45 minutes
> * Every 60 minutes
>
> Also include:
>
> * Custom interval (user-defined minutes)
> * Save as default preference
>
> The selected interval should immediately update:
>
> * Countdown timer
> * Next break indicator
> * Reminder notifications
> * Session timeline
>
> ---
>
> ## 7. Driving Timer vs Break Timer (Behavior Recommendation)
>
> Implement two separate timers:
>
> ### A. Driving Time
>
> This tracks the actual time spent driving.
>
> It should automatically **pause** whenever the user begins a confirmed safe break (for example, when parked or safely stopped).
>
> It resumes when the user continues driving.
>
> This represents the user's true driving duration.
>
> ### B. Session Time
>
> This measures the total journey from start to finish.
>
> It continues running even while the user is taking breaks.
>
> It includes:
>
> * Driving time
> * Breaks
> * Exercise sessions
> * Rest periods
>
> At the end of the session, display both metrics:
>
> * Total Session Time
> * Actual Driving Time
>
> This provides more accurate analytics and better reflects the user's overall trip while distinguishing between active driving and healthy rest periods.
>
> ---
>
> ## 8. Session Timeline
>
> Add a visual timeline showing:
>
> * Session Started
> * Driving Period
> * Break Reminder
> * Break Taken
> * Exercise Completed
> * Driving Resumed
> * Session Completed
>
> This timeline should update in real time throughout the journey.
>
> ---
>
> ## 9. UX and Visual Improvements
>
> Ensure the workflow feels smooth and guided:
>
> * Before Driving → Optional Warm-up
> * Start Driving
> * Live Driving Session
> * Break Reminder
> * Exercise Recommendation
> * Customized Exercise
> * Resume Driving
> * Session Completed
> * After Driving Exercises (Optional)
> * Health Dashboard / Sedentary Monitoring / Health Education / Feedback & Validation
>
> Use clean transitions, progress indicators, modern cards, subtle animations, and responsive layouts. Maintain consistency with the existing Moove branding, color palette, typography, and accessibility guidelines.
>
> ---
>
> ## 10. Technical Requirements
>
> * Implement all buttons, timers, reminders, and navigation as fully functional features rather than UI placeholders.
> * Persist user preferences (break intervals, preferred exercises, timer durations, repetitions, and presets) in the backend/database.
> * Ensure timers continue functioning correctly across navigation, page refreshes, and session state changes.
> * Recalculate the next break dynamically whenever the user updates the reminder interval during an active session.
> * Record exercise completion, skipped exercises, partial completions, and break history for display in the Health Dashboard and Sedentary Monitoring modules.
> * Keep the application modular, scalable, and maintainable using reusable components and clean architecture.

### Recommendation for the Timer Behavior

The better UX is to **maintain two separate timers**:

* **Driving Time** pauses whenever the user confirms they are safely stopped and taking a break. This accurately reflects the time spent actively driving.
* **Session Time** continues running throughout the entire journey, including breaks and exercise periods. This represents the total trip duration.

This approach is commonly used in fitness and navigation applications because it provides users with both meaningful metrics: how long they actually drove and how long the overall trip took, while still supporting accurate break reminders and health analytics.
