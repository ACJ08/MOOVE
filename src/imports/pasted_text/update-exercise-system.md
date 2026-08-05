Act as an expert Full-Stack Developer, Frontend Developer, Backend Developer, Supabase Developer, Database Architect, UI/UX Designer, Product Designer, Software Architect, QA Engineer, and Technical Lead.

I need you to improve the exercise system of my MOOVE application. Please implement the following changes while ensuring the codebase remains clean, modular, scalable, and follows best practices.

# 1. Remove the Warm-Up Progress Feature

Completely remove the following feature from the Warm-Up section:

* Warm-Up Progress
* "0 / 10 Completed"
* Progress bar
* Any completion percentage
* Any related UI components
* Any backend logic
* Any database fields that exist only for this progress indicator

The Warm-Up page should simply display:

* Before Driving Warm-Up
* Optional warm-up exercises to prepare your body before driving.
* Informational note:

> 💡 These take approximately 5–7 minutes and can be done while seated. Tap any exercise to expand its details, or press **Do It** to begin the exercise.

No progress bar or completion counter should appear anywhere on this page.

---

# 2. Remove the Cool-Down Progress Feature

Likewise, completely remove:

* Cooldown Progress
* "1 / 10 Completed"
* Progress bar
* Percentage
* Completion counter
* Backend logic
* Database fields that are only used for this feature

The Cool-Down page should simply display:

* After Driving Cool-Down
* Cooldown exercises to help your body recover after driving.
* Informational note:

> 💡 Best performed immediately after parking. Helps reduce stiffness and next-day soreness. Estimated duration: 8–10 minutes.

No progress indicator should appear.

---

# 3. Individual Exercise Completion Logic (Warm-Up)

The Warm-Up exercises should **NOT** behave as one large checklist.

Instead, each exercise must maintain its own completion status.

For example:

* Chin Tucks
* Upper Trapezius Stretch
* Shoulder Rolls
* Wrist Flexor Stretch
* Seated Figure-4 Glute Stretch
* Seated Heel Raise and Toe Raise
* Standing Hip Flexor & Calf Stretch
* Standing Side Stretch
* 20-20-20 Ocular Reset & Eye Blink
* Seated Knee Extension & Quad Squeeze

Each exercise should have an independent completion state.

Example:

If the user finishes:

✔ Chin Tucks

Only Chin Tucks becomes completed.

The remaining exercises remain available.

---

# 4. Disable Completed Warm-Up Exercises

After an exercise is successfully completed:

* Display a clear visual indicator such as:

  * ✓ Completed
  * Completed badge
  * Green check icon

* Disable the "Do It" button.

* Prevent the user from starting the same exercise again during the same warm-up session.

The disabled button should look something like:

Completed ✓

instead of

Do It

The button should:

* be disabled
* have reduced opacity
* use a success color
* no hover effect
* no click action

The exercise card should clearly communicate that this exercise has already been completed.

---

# 5. Persist Warm-Up Exercise Completion

The completion status must not disappear after:

* refreshing the page
* navigating away
* reopening the application

Store the completion state inside Supabase.

Suggested structure:

Warm-Up Session
→ Exercise Completion

Example fields:

* session_id
* exercise_id
* completed
* completed_at

Do not rely solely on React state.

---

# 6. Apply the Exact Same Logic to Cool-Down Exercises

The Cool-Down section must behave identically.

Each Cool-Down exercise should have its own completion status.

Example:

If the user finishes:

✔ Shoulder Rolls

Only Shoulder Rolls becomes completed.

Every other Cool-Down exercise remains available.

---

# 7. Disable Completed Cool-Down Exercises

Once a Cool-Down exercise is completed:

* show a Completed indicator
* disable the Do It button
* prevent the timer from launching again
* prevent duplicate completion records
* prevent accidental multiple submissions

---

# 8. Separate Warm-Up and Cool-Down Completion States

Warm-Up completion should never affect Cool-Down.

Example:

Warm-Up:
✔ Chin Tucks completed

Cool-Down:
Chin Tucks should still be available because it belongs to a different exercise session.

Likewise:

Completing Chin Tucks during Cool-Down must not automatically mark it completed during Warm-Up.

Warm-Up and Cool-Down should maintain separate completion records.

---

# 9. Database Requirements

Update the Supabase schema to support exercise completion correctly.

Requirements:

* Separate exercise completion records.
* Separate session types:

  * warmup
  * cooldown
* Prevent duplicate completion entries for the same exercise within the same session.
* Use proper foreign keys.
* Enable Row Level Security (RLS).
* Add appropriate indexes for efficient querying.
* Ensure the schema is scalable for future exercise categories (e.g., movement breaks, stop exercises).

---

# 10. Frontend Requirements

Update the UI so that:

* Completed exercises are visually distinct.
* Active exercises remain clickable.
* Disabled exercises cannot be clicked.
* Completed exercises display a success badge or checkmark.
* The interface clearly communicates which exercises are still available and which have already been finished.
* Remove all references to the old progress bar system.

---

# 11. Backend Requirements

Refactor the backend logic to:

* Check whether an exercise has already been completed before allowing it to start.
* Prevent duplicate completion records.
* Return the correct completion state from Supabase.
* Keep the UI synchronized with the database.
* Handle edge cases such as rapid repeated clicks or multiple browser tabs.

---

# 12. Expected Result

The final behavior should be:

* No Warm-Up progress bar.
* No Cool-Down progress bar.
* Each exercise tracks its own completion independently.
* Completed exercises display a clear "Completed" state.
* Completed exercises cannot be started again within the same session.
* Warm-Up and Cool-Down maintain independent completion records.
* Completion states persist across page refreshes and app restarts because they are stored in Supabase.
* The implementation should be clean, maintainable, scalable, and follow modern React, TypeScript, and Supabase best practices.
