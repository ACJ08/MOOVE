Act as an expert Full-Stack Developer, Frontend Developer, Backend Developer, and UI/UX Designer.

Analyze the entire application architecture (frontend, backend, database, business logic, and state management) before making any modifications. Ensure that every change follows clean architecture principles, maintains consistency across all screens, and does not introduce regressions or break existing functionality.

1. Improve Exercise Completion Logic

Currently, users are able to repeatedly perform the same exercise even after completing it. This should be changed to create a guided experience that clearly indicates which exercises have already been finished.

Before Driving Warm-Up

For the Before Driving Warm-Up section:

Before Driving Warm-Up
Optional warm-up exercises to prepare your body before driving.

💡 These take ~5–7 minutes and can be done seated.
Tap any exercise to expand, or press Do It to start the timer.

🧘 Chin Tucks
Neck · 45s · Easy
Do It

Target: Deep cervical flexors
Reps: 5–8 reps
Corrects forward head posture before road focus begins.

When the user taps Do It, completes the timer, finishes the selected repetitions, and the exercise is successfully completed:

Mark that specific exercise as Completed.
Save its completion status in the user's session (and persist it if appropriate).
Disable the Do It button for that exercise only.
Replace the button with a disabled completed state such as:
✅ Completed
or ✔ Already Completed
Prevent users from starting that same exercise again during the same warm-up session.
Visually indicate completion using:
a checkmark,
muted or success-colored button,
disabled interaction,
completed badge.
The exercise card should remain expandable so users can still review instructions, targets, and benefits.
Only the action button should become disabled.

If the user has not yet completed an exercise, the Do It button should remain active.

This completion logic must be applied consistently to every Warm-Up exercise, not just Chin Tucks.

2. Improve "I'm Safely Stopped → Get Exercise" Flow

After the user clicks:

I'm Safely Stopped

then

Get Exercise

the recommendation engine must check which exercises have already been completed.

Requirements:

Do not recommend exercises that have already been completed.
Hide completed exercises from the recommendation list or display them as disabled.
Recommend only exercises that are still available.
If all exercises within that category are completed:
show a friendly message such as:
🎉 Great job!
You've completed all available exercises for this session.

Optionally include:

Review Exercises
Return Home
Continue Driving

This logic should be consistent across the entire application so users cannot repeatedly complete the same exercise unless a new session begins.

3. After Driving Cool-Down Completion Logic

Apply the exact same behavior to the After Driving Cool-Down section.

Example:

After Driving Cool-Down
Cooldown exercises to help your body recover from the drive.

✅ 1 cooldown exercise completed

💡 Best performed immediately after parking.
Reduces next-day soreness and stiffness.
Estimated time: 8–10 min.

🧘 Neck Side Stretch
Neck · 60s · Easy
Do It

Target:
Sternocleidomastoid, scalenes

Reps:
20 seconds per side

Releases sustained neck tension from road watching.

Once a cooldown exercise has been successfully completed:

Mark it as completed.
Disable its Do It button.
Show a completed state.
Prevent replaying that exercise during the current cooldown session.
Keep the instructional content viewable.
Only disable the execution button.

Apply this behavior to every Cool-Down exercise, not only Neck Side Stretch.

4. Backend Requirements

Implement robust backend support for exercise completion tracking.

Ensure:

completion status is stored per user,
completion is tied to the current driving session,
duplicate completions cannot occur,
repeated submissions are prevented,
the frontend always reflects the latest completion state,
completion status is synchronized correctly after refresh or reopening the app,
state management remains consistent across devices if user accounts are supported.
5. UI/UX Improvements

Improve the overall exercise experience by providing clear visual feedback.

Completed exercises should include:

✅ Completed badge
disabled primary action button
subtle success styling
optional checkmark animation
progress indicator updates
accessibility-friendly disabled state

Users should instantly understand:

which exercises are available,
which have already been completed,
what remains to be done.
6. Expected Behavior

The final system should behave as follows:

Each exercise can only be completed once per applicable session.
Completed exercises become disabled immediately after completion.
The user can still expand completed exercise cards to review instructions and educational information.
"I'm Safely Stopped → Get Exercise" only recommends exercises that have not yet been completed.
Warm-Up and Cool-Down sections both follow identical completion logic.
Exercise completion is reliably persisted and synchronized between the frontend and backend.
The UI provides a clear, intuitive, and motivating guided workflow that prevents duplicate exercise completion while maintaining a seamless user experience.