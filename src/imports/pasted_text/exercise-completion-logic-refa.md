Act as an expert Full-Stack Developer, Frontend Developer, React/TypeScript Engineer, Supabase Developer, Backend Engineer, UI/UX Designer, Software Architect, QA Engineer, and State Management Expert.

I need you to fix the exercise completion logic and UI behavior throughout the MOOVE application. The current implementation is not working correctly. Carefully analyze the existing codebase and refactor the logic instead of applying temporary fixes.

Issue 1 – Warm-Up Exercise Completion State is Not Updating

Under the Before Driving Warm-Up section, the exercises are listed correctly.

Example:

Chin Tucks
Upper Trapezius Stretch
Shoulder Rolls
Wrist Flexor Stretch
Seated Figure-4 Glute Stretch
Seated Heel Raise and Toe Raise
Standing Hip Flexor & Calf Stretch
Standing Side Stretch
20-20-20 Ocular Reset & Eye Blink
Seated Knee Extension & Quad Squeeze

Current Bug

User clicks Do It on Chin Tucks.
User configures the exercise.
User completes the timer.
User clicks Continue.
User clicks Do Another Warm-up Exercise.

When the exercise list appears again, Chin Tucks is still displayed as if it has never been completed.

The exercise should immediately update its state to Completed.

Expected Behavior

After completing an exercise:

The exercise must immediately change its status.
Replace the Do It button with a visual Completed indicator.
Show a completed badge/checkmark.
Prevent the same exercise from being recommended again in the current warm-up session.
Prevent users from accidentally repeating the same exercise unless they intentionally restart the entire warm-up session.
The completion state must persist while the warm-up session is active.
If completion data is stored in Supabase, synchronize the state correctly with the database.
If using local application state, ensure React state updates immediately without requiring a page refresh.

The completion status should remain visible when:

returning from the exercise player
navigating back
expanding/collapsing cards
opening another exercise

until the warm-up session ends or is explicitly reset.

Apply the Same Logic to Every Warm-Up Exercise

This should NOT only work for Chin Tucks.

It must work for all exercises:

Chin Tucks
Upper Trapezius Stretch
Shoulder Rolls
Wrist Flexor Stretch
Seated Figure-4 Glute Stretch
Seated Heel Raise and Toe Raise
Standing Hip Flexor & Calf Stretch
Standing Side Stretch
20-20-20 Ocular Reset & Eye Blink
Seated Knee Extension & Quad Squeeze

Every exercise must independently maintain its own completion state.

Do not use a single shared boolean.

Each exercise should have its own completion status keyed by its exercise ID.

Issue 2 – Missing Preview Video Before Starting Chin Tucks

The Warm-Up → Chin Tucks configuration page is missing the preview exercise video.

Currently, before the user starts the exercise, there is no video displayed.

I have already uploaded the appropriate exercise video.

Please integrate the Chin Tucks preview video into the exercise configuration screen.

The video should appear:

before the timer starts
before clicking Start Exercise
inside the exercise configuration page
using the same video component as the other exercise pages

The preview video should:

autoplay if appropriate
be muted
loop continuously
preserve aspect ratio
display correctly on desktop and mobile
gracefully handle loading and fallback states

Ensure the correct video asset is mapped to the Chin Tucks exercise.

Issue 3 – Cool-Down Completion Logic Has the Same Bug

The After Driving Cool-Down section suffers from the exact same issue.

Example:

User starts Chin Tucks.
Completes the timer.
Clicks Continue.
Clicks Do Another Cool-down Exercise.

The completed exercise still appears as unfinished.

This is incorrect.

Expected Cool-Down Behavior

After an exercise is completed:

Immediately mark it as completed.
Update the exercise card.
Replace "Do It" with "Completed."
Disable repeating it during the same cool-down session.
Keep completion state while the session remains active.
Exclude completed exercises from future recommendations.
Maintain independent completion status for every cool-down exercise.
Apply This to Every Cool-Down Exercise

Ensure identical behavior for:

Chin Tucks
Upper Trapezius Stretch
Shoulder Rolls
Wrist Flexor Stretch
Seated Figure-4 Glute Stretch
Seated Heel Raise and Toe Raise
Standing Hip Flexor & Calf Stretch
Standing Side Stretch
20-20-20 Ocular Reset & Eye Blink
Seated Knee Extension & Quad Squeeze

Every exercise should maintain its own completion state independently.

State Management Requirements

Refactor the exercise state management to ensure:

No duplicated logic between Warm-Up and Cool-Down.
Shared reusable hooks or utility functions where appropriate.
Exercise completion is tracked using a unique exercise ID.
UI reacts immediately after state changes.
No stale React state.
No race conditions.
No need to refresh the page.
No inconsistent completion state after navigation.
Supabase Integration

If exercise completion is stored in Supabase:

Update the completion record immediately after finishing an exercise.
Optimistically update the UI while the request is in progress.
Roll back if the database update fails.
Prevent duplicate completion records.
Ensure the correct user ID and exercise ID are associated with each completion.
Maintain synchronization between the client cache and the database.
UI/UX Improvements

After an exercise is completed:

Replace Do It with a green Completed ✓ badge or button.
Add a subtle completion animation.
Grey out or visually distinguish completed exercise cards.
Display a checkmark icon.
Ensure completed exercises remain expandable for review but cannot be started again unless the session is reset.
If all exercises are completed, display a success message such as "Great job! You've completed all Warm-Up exercises." or "Great job! You've completed all Cool-Down exercises."
Acceptance Criteria

The implementation will only be considered complete when:

✅ Completing an exercise immediately updates its card.
✅ The completed state persists throughout the current session.
✅ Warm-Up logic works for every warm-up exercise.
✅ Cool-Down logic works for every cool-down exercise.
✅ Completed exercises are excluded from recommendations.
✅ "Do It" changes to "Completed."
✅ Chin Tucks displays its preview video before the exercise starts.
✅ No page refresh is required.
✅ State remains correct after navigation.
✅ No duplicate completion records are created.
✅ The implementation is clean, reusable, scalable, and follows React, TypeScript, and Supabase best practices.