# Expert Full-Stack Development Task – Integrate Exercise Videos into MOOVE

Act as an expert **Full-Stack Developer**, **Frontend Developer**, **Backend Developer**, **Supabase Developer**, **UI/UX Designer**, **Software Architect**, **React/TypeScript Developer**, and **Product Designer**.

I have uploaded the following exercise videos that will be used throughout the MOOVE application:

| Video File                   | Exercise Name                        |
| ---------------------------- | ------------------------------------ |
| Chin Tucks.mp4               | Chin Tucks                           |
| Figure-4 Glute Stretch.mp4   | Seated Figure-4 Glute Stretch        |
| Heel Raise and Toe Raise.mp4 | Seated Heel Raise and Toe Raise      |
| Quad Squeeze.mp4             | Seated Knee Extension & Quad Squeeze |
| Shoulder Rolls.mp4           | Shoulder Rolls                       |
| Standing Calf Stretch.mp4    | Standing Hip Flexor & Calf Stretch   |
| Standing Side Stretch.mp4    | Standing Side Stretch                |
| Upper Trapezius Stretch.mp4  | Upper Trapezius Stretch              |
| Wrist Flexor Stretch.mp4     | Wrist Flexor Stretch                 |

## Objective

Properly integrate every uploaded video into the MOOVE application so that each exercise displays the correct video everywhere it is referenced.

## Requirements

### 1. Exercise Library

Update the Exercise Library so that each exercise card displays its corresponding video.

Each exercise should:

* Display the correct preview thumbnail or poster.
* Play the correct video when the exercise is opened.
* Have functional Play, Pause, Restart, and Replay controls.
* Load smoothly without broken links or missing assets.
* Be responsive across desktop, tablet, and mobile devices.

---

### 2. Exercise Categories

Ensure the correct videos are assigned to exercises in all categories.

These include:

* Warm-Up Exercises
* Break Exercises
* Stop Exercises
* Cooldown Exercises

Wherever an exercise appears, it must always use its matching video.

For example:

* Chin Tucks → Chin Tucks.mp4
* Shoulder Rolls → Shoulder Rolls.mp4
* Upper Trapezius Stretch → Upper Trapezius Stretch.mp4
* Wrist Flexor Stretch → Wrist Flexor Stretch.mp4
* Standing Side Stretch → Standing Side Stretch.mp4
* Standing Hip Flexor & Calf Stretch → Standing Calf Stretch.mp4
* Seated Knee Extension & Quad Squeeze → Quad Squeeze.mp4
* Seated Heel Raise & Toe Raise → Heel Raise and Toe Raise.mp4
* Seated Figure-4 Glute Stretch → Figure-4 Glute Stretch.mp4

---

### 3. Exercise Configuration Preview

Before the driver starts a Driving Session, they configure their exercises.

During this configuration flow:

* Every exercise card must display its corresponding preview video.
* The preview should autoplay silently (muted) or display a clear play button depending on the current UX.
* The user should be able to preview the exercise before selecting it.
* The preview video should accurately represent the selected exercise.

No placeholder videos should remain.

---

### 4. Driving Session Flow

When an exercise is recommended during a driving session:

* Display the correct exercise video.
* Display the correct exercise title.
* Display the correct duration.
* Display the correct instructions.
* Ensure the timer and video remain synchronized.
* Prevent mismatched videos from appearing.

---

### 5. Consistency Across the Entire Application

Search the entire codebase and replace any remaining placeholder videos.

Ensure every location that references an exercise uses the correct video, including:

* Exercise Library
* Home recommendations
* Warm-Up sequence
* Break sequence
* Stop sequence
* Cooldown sequence
* Exercise preview screen
* Exercise details modal/page
* AI-recommended exercises
* Driving Session exercise player
* Recently completed exercises
* Favorite exercises (if applicable)

---

### 6. Code Quality

Refactor the code if necessary to avoid duplicated mappings.

Instead of hardcoding video paths in multiple files:

* Create a centralized exercise asset mapping.
* Associate each exercise with:

  * Title
  * Description
  * Category
  * Duration
  * Difficulty
  * Target muscle group
  * Video path
  * Thumbnail/poster (if applicable)

Every component should consume this centralized mapping to ensure consistency and simplify future maintenance.

---

### 7. File Organization

Organize the video assets using a clean project structure, for example:

```
src/
 └── assets/
      └── videos/
           Chin Tucks.mp4
           Figure-4 Glute Stretch.mp4
           Heel Raise and Toe Raise.mp4
           Quad Squeeze.mp4
           Shoulder Rolls.mp4
           Standing Calf Stretch.mp4
           Standing Side Stretch.mp4
           Upper Trapezius Stretch.mp4
           Upper Trapezius Stretch.mp4
           Wrist Flexor Stretch.mp4
```

Update all imports and asset references accordingly.

---

### 8. Validation

Verify that:

* No exercise uses the wrong video.
* No exercise has a missing video.
* No broken imports exist.
* No placeholder videos remain.
* No console errors occur.
* All video paths resolve correctly in development and production builds.
* Videos preload efficiently without causing unnecessary performance issues.

---

### 9. UI/UX Improvements

Improve the overall user experience by:

* Showing a loading indicator while videos are loading.
* Displaying a fallback poster image if the video fails to load.
* Preserving the video's aspect ratio.
* Using rounded corners consistent with the MOOVE design system.
* Ensuring smooth playback across all supported browsers.
* Maintaining responsive layouts for all screen sizes.

---

### 10. Expected Deliverables

After implementing the changes:

1. Update all exercise video mappings.
2. Remove all placeholder videos.
3. Integrate the correct videos throughout the application.
4. Refactor duplicated logic into a centralized configuration.
5. Verify every exercise category uses the correct media.
6. Ensure the preview screen, Exercise Library, and Driving Session player all display the appropriate videos.
7. Confirm there are no broken video links, missing assets, or console errors.
8. Provide a summary of the files modified, the changes made, and any additional recommendations to improve maintainability and performance.
