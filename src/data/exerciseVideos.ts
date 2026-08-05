/**
 * exerciseVideos.ts — Centralized exercise video asset map.
 *
 * Exercise ID → video source. Every component that displays an exercise
 * video must call getExerciseVideo(exerciseId) rather than hard-coding paths.
 *
 * To add a new exercise video:
 *   1. Drop the .mp4 into src/assets/videos/
 *   2. Add an import below
 *   3. Add exerciseId → import to VIDEO_MAP
 */

// ─── Video imports ────────────────────────────────────────────────────────────
import video1  from '@/assets/videos/Chin_Tucks.mp4'
import video2  from '@/assets/videos/Upper_Trapezius_Stretch.mp4'
import video3  from '@/assets/videos/Shoulder_Rolls.mp4'
import video4  from '@/assets/videos/Wrist_Flexor_Stretch.mp4'
import video5  from '@/assets/videos/Figure-4_Glute_Stretch.mp4'
import video6  from '@/assets/videos/Heel_Raise_and_Toe_Raise.mp4'
import video7  from '@/assets/videos/Standing_Calf_Stretch.mp4'
import video8  from '@/assets/videos/Standing_Side_Stretch.mp4'
import video9  from '@/assets/videos/20-20-20_Eye_Reset.mp4'
import video10 from '@/assets/videos/Quad_Squeeze.mp4'

// ─── Exercise ID → video source ───────────────────────────────────────────────
// IDs match exercises array in src/data/exercises.ts
// 1  Chin Tucks
// 2  Upper Trapezius Stretch
// 3  Shoulder Rolls
// 4  Wrist Flexor Stretch
// 5  Seated Figure-4 Glute Stretch
// 6  Seated Heel Raise and Toe Raise
// 7  Standing Hip Flexor & Calf Stretch
// 8  Standing Side Stretch
// 9  20-20-20 Ocular Reset & Eye Blink
// 10 Seated Knee Extension & Quad Squeeze

const VIDEO_MAP: Record<number, string> = {
  1:  video1,
  2:  video2,
  3:  video3,
  4:  video4,
  5:  video5,
  6:  video6,
  7:  video7,
  8:  video8,
  9:  video9,
  10: video10,
}

/** Returns the video src for a given exercise ID. Falls back to Chin Tucks. */
export function getExerciseVideo(exerciseId: number): string {
  return VIDEO_MAP[exerciseId] ?? video1
}

/** Returns all exercise IDs that have a dedicated video. */
export function hasExerciseVideo(exerciseId: number): boolean {
  return exerciseId in VIDEO_MAP
}
