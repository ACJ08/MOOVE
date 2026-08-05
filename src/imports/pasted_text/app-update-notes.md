Here's an expanded, structured, and implementation-focused version of your prompt that provides clear requirements for both the UI/UX and the technical implementation.

---

**Expanded Prompt**

> **Act as an expert Full-Stack Developer, Frontend Developer, Backend Developer, Software Architect, and Senior UI/UX Designer.**
>
> Please improve, refactor, and update the application while maintaining a clean, modern, responsive, and user-friendly interface. Ensure that all frontend components, backend logic, database synchronization, and user experience remain consistent throughout the application.
>
> ## 1. Driving Session Personalization
>
> The Driving Session must dynamically reflect the user's personalization choices made during the Home onboarding/questions.
>
> Specifically:
>
> * The **Next Break Timer** should no longer use a fixed value.
> * Instead, it must automatically use the value selected by the user during the Home personalization.
>
> Example:
>
> * If the user selected **15 minutes**, the next break timer must trigger every **15 minutes**.
> * If the user selected **30 minutes**, the break timer must use **30 minutes**.
> * If the user changes their preference later in Settings or Home, all future driving sessions must automatically use the updated value.
>
> Ensure this value is:
>
> * Stored in the database.
> * Retrieved when a driving session begins.
> * Persisted between sessions.
> * Used consistently throughout the application.
>
> ---
>
> # 2. Replace Exercise Repetitions with Better Exercise Controls
>
> For all exercise types:
>
> * Warm-Up Exercises
> * Break Exercises
> * Stop Exercises
> * Cool-Down Exercises
>
> **Remove the existing "Repetitions (Reps)" interface completely.**
>
> Instead, redesign the exercise controls to include:
>
> ### Exercise Duration
>
> Allow users to select how long they want to perform the movement.
>
> Example options:
>
> * 15 sec
> * 30 sec
> * 45 sec
> * 60 sec
> * 90 sec
> * Custom
>
> ### Number of Sets
>
> Replace repetitions with:
>
> **Sets**
>
> Example:
>
> * 1 Set
> * 2 Sets
> * 3 Sets
> * 4 Sets
> * Custom
>
> ### Rest Between Sets
>
> Add a dedicated Rest Between Sets selector.
>
> Options:
>
> * 5 sec
> * 10 sec
> * 15 sec
> * 20 sec
> * 30 sec
> * Custom
>
> ### Recommended Sets
>
> Every exercise should display an evidence-based recommendation.
>
> Example:
>
> > Recommended:
> > 2 Sets × 30 seconds
> > Rest 10 seconds between sets.
>
> This recommendation should appear below the exercise description to guide users while still allowing customization.
>
> ---
>
> # 3. Exercise Completion State
>
> Improve the exercise tracking system.
>
> Once the user clicks **"Do Exercise"** and successfully completes an exercise:
>
> * The application must immediately update the UI.
> * The completed exercise should display a visual completion indicator.
> * The user should clearly know that this exercise has already been completed.
>
> Examples:
>
> * ✅ Completed
> * ✔ Done
> * Green checkmark
> * Completed badge
>
> Once completed:
>
> * Disable the "Start Exercise" button.
>
> * Prevent the same exercise from being completed multiple times within the same driving session.
>
> * Change the button into something like:
>
> > Completed
>
> or
>
> > Exercise Finished
>
> This applies to:
>
> * Warm-Up
> * Break
> * Stop
> * Cool-Down
>
> The completion status must:
>
> * Be stored in the current driving session.
> * Persist during page refresh.
> * Be reflected in the Driving Session Summary.
> * Be saved into Exercise History.
>
> ---
>
> # 4. Remove Duplicate Cool-Down Section
>
> Since users already choose whether to perform Cool-Down exercises before generating their results, remove the duplicate section:
>
> ```
> 🌆 After Driving Cool-Down
>
> Cooldown exercises help your body recover.
> Best done immediately after parking.
>
> Do Cool-Down Exercises (Optional)
> ```
>
> Remove this entire UI because it duplicates an existing workflow and may confuse users.
>
> The Cool-Down exercise flow should exist only once within the driving session.
>
> ---
>
> # 5. Redesign the "Exercises" Tab
>
> The current "Exercises" tab no longer matches its intended purpose.
>
> Since exercises are already performed inside the Driving Session (Warm-Up, Break, Stop, and Cool-Down), this tab should become an educational reference instead of another exercise execution page.
>
> ## Rename the Tab
>
> Change the tab name from:
>
> **Exercises**
>
> to a more appropriate name such as:
>
> * Exercise Library
> * Exercise Guide
> * Movement Library
> * Wellness Library
> * Stretch Guide
>
> Choose whichever best fits the application's design language.
>
> ## New Purpose
>
> When users open this page:
>
> They should be able to:
>
> * Browse available exercises.
> * View detailed instructions.
> * Learn proper posture.
> * Understand benefits.
> * Learn safety precautions.
> * View targeted muscle groups.
> * View estimated duration.
>
> The page should function as a knowledge base rather than an execution screen.
>
> ---
>
> ## Remove Exercise Actions
>
> Remove:
>
> * Customize
> * Start
> * Quick Start
>
> because exercise execution is already handled during Driving Sessions.
>
> Selecting an exercise card should simply open a detailed information page or modal that includes:
>
> * Exercise Name
> * Description
> * Benefits
> * Target Muscles
> * Proper Instructions
> * Safety Tips
> * Estimated Duration
> * Recommended Sets
> * Recommended Rest Time
>
> ---
>
> # 6. Update Today's Completion
>
> Remove the current generic **Today's Completion** widget.
>
> Replace it with a real completion summary based only on exercises completed during today's Driving Sessions.
>
> It should include:
>
> * Warm-Up Exercises Completed
> * Break Exercises Completed
> * Stop Exercises Completed
> * Cool-Down Exercises Completed
> * Total Exercises Completed Today
> * Total Active Exercise Time
> * Number of Driving Sessions Completed
>
> This information should automatically update after every completed driving session.
>
> ---
>
> # 7. Integrate Exercise History on the Same Page
>
> Instead of separating exercise history into another location, integrate it into the Exercise Library page.
>
> Below the Exercise Library, display:
>
> ## Exercise History
>
> Include:
>
> * Date
> * Driving Session
> * Exercise Name
> * Exercise Category
> * Duration
> * Number of Sets
> * Rest Between Sets
> * Completion Status
> * Total Exercise Time
>
> Allow users to:
>
> * Search history
> * Filter by date
> * Filter by exercise type
> * Filter by category
>
> This history should be automatically generated from completed Driving Sessions.
>
> ---
>
> # 8. Admin Dashboard Updates
>
> The Think-Aloud feature has been completely removed from the system.
>
> Therefore, update the Admin Dashboard accordingly.
>
> Under **Feedback Analytics**:
>
> Remove:
>
> * "Go to Think-Aloud" button
> * Think-Aloud navigation
> * Think-Aloud analytics
> * Think-Aloud data
> * Think-Aloud references
> * Think-Aloud routes
> * Think-Aloud API endpoints
> * Think-Aloud database collections/tables
> * Any unused Think-Aloud components
>
> Ensure no orphaned frontend or backend code related to Think-Aloud remains.
>
> ---
>
> # 9. Backend & Database Synchronization
>
> Ensure all new functionality is fully integrated across the application.
>
> This includes:
>
> * Saving user personalization preferences.
> * Loading personalization into each Driving Session.
> * Saving completed exercises.
> * Saving selected duration.
> * Saving selected sets.
> * Saving rest intervals.
> * Updating exercise history.
> * Updating today's completion statistics.
> * Synchronizing with admin analytics where applicable.
> * Preventing duplicate exercise completion within the same driving session.
> * Maintaining data consistency after refresh, logout/login, or future sessions.
>
> ---
>
> # 10. UI/UX Expectations
>
> Maintain a professional, modern, and accessible design throughout the application.
>
> Ensure:
>
> * Responsive layouts for desktop, tablet, and mobile.
> * Consistent spacing, typography, and color hierarchy.
> * Smooth animations and transitions.
> * Clear completion indicators.
> * Intuitive navigation.
> * Minimal visual clutter.
> * High usability and accessibility.
> * Consistent design language across all pages.
>
> The overall experience should feel cohesive, polished, and production-ready, with every personalization setting, exercise interaction, progress indicator, and history record accurately reflected throughout the system.
