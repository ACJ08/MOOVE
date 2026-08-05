import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import { exercises } from '@/data/exercises'
import { mockSessions, mockWeeklyActivity } from '@/data/mockData'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'
import { triggerBreakReminder, playExerciseStartSound, playRestStartSound, playCompleteSound } from '@/services/notificationService'
import ExerciseVideo from '@/components/ExerciseVideo'
import { saveSessionToSupabase, createDrivingSession, recordExerciseCompletion, recordSessionEvent, fetchRecentSessionsFromDB } from '@/lib/db'
import { fetchWeeklyDriving, type WeeklyDriving } from '@/services/analyticsService'
import { getExerciseVideo } from '@/data/exerciseVideos'
import { supabase } from '@/lib/supabase'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatMins(seconds: number) {
  const m = Math.round(seconds / 60)
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`
}

type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High'

function getSedentaryRisk(seconds: number) {
  const mins = Math.floor(seconds / 60)
  if (mins <= 30) return { level: 'Low' as RiskLevel, color: '#22C55E', bg: '#F0FDF4', icon: '🟢', explanation: 'Minimal health risk — within a safe sedentary window.', recommendation: 'Keep it up! A quick shoulder roll at the next stop goes a long way.' }
  if (mins <= 60) return { level: 'Moderate' as RiskLevel, color: '#FBBF24', bg: '#FFFBEB', icon: '🟡', explanation: 'Circulation is beginning to slow. Light intervention recommended.', recommendation: 'Try Chin Tucks or Shoulder Rolls at the next traffic stop.' }
  if (mins <= 90) return { level: 'High' as RiskLevel, color: '#F97316', bg: '#FFF7ED', icon: '🟠', explanation: 'Sustained sitting is increasing musculoskeletal strain.', recommendation: 'Perform a break exercise immediately when safe to stop.' }
  return { level: 'Very High' as RiskLevel, color: '#EF4444', bg: '#FEF2F2', icon: '🔴', explanation: 'Extended sedentary period poses significant health risk.', recommendation: 'Pull over safely and perform a 2-minute exercise break now.' }
}

const EXERCISE_STEPS: Record<number, string[]> = {
  1: ['Sit tall and look straight ahead.', 'Draw your chin straight backward — creating a "double chin".', 'Hold 2 seconds, feeling a stretch at the base of your skull.', 'Release slowly. Repeat 5–8 times.'],
  2: ['Sit upright with both hands relaxed in your lap.', 'Slowly tilt your right ear toward your right shoulder.', 'Hold 15 seconds, feeling the stretch on the left side of your neck.', 'Return to center, then repeat on the other side.'],
  3: ['Sit comfortably with hands resting in your lap.', 'Roll both shoulders upward toward your ears.', 'Roll them backward and gently squeeze your shoulder blades.', 'Roll them downward then forward. Repeat 10 times.'],
  4: ['Ensure your vehicle is fully parked.', 'Extend your right arm forward, palm up.', 'Gently pull your fingers back with your left hand until you feel the forearm stretch.', 'Hold 15 seconds. Repeat with the other arm.'],
  5: ['Park fully and set the handbrake.', 'Cross your left ankle over your right knee — "figure 4" shape.', 'Lean slightly forward until you feel a deep stretch in your left glute.', 'Hold 15–20 seconds. Switch sides.'],
  6: ['Sit upright with both feet flat on the floor, knees at 90°.', 'Slowly lift both heels as high as possible while keeping your toes on the ground. Hold 1 second.', 'Lower your heels, then lift your toes toward your shins while keeping heels on the floor. Hold 1 second.', 'Alternate between heel raises and toe raises for 10–15 repetitions in a slow, controlled motion.'],
  7: ['Park safely and step outside the vehicle.', 'Step your right foot back, keeping your heel flat.', 'Tuck your pelvis and bend your front knee until you feel the hip and calf stretch.', 'Hold 20 seconds. Switch sides.'],
  8: ['Stand with your feet shoulder-width apart beside the vehicle.', 'Raise your right arm overhead and keep your shoulders relaxed, hips facing forward.', 'Gently lean your upper body to the left until you feel a comfortable stretch along your right side.', 'Hold for 10–15 seconds while breathing normally. Return to start.', 'Repeat on the opposite side. Avoid twisting your torso or leaning forward.'],
  9: ['Ensure your vehicle is completely stopped.', 'Focus your gaze on an object at least 20 feet away.', 'Hold your gaze for 20 seconds as your eye muscles relax.', 'Perform 10 slow, deliberate full blinks to rehydrate your eyes.'],
  10: ['Sit back comfortably against the seat with brake held.', 'Slowly lift your right lower leg forward until knee is nearly straight.', 'Squeeze your quadriceps firmly for 3 seconds, then lower slowly.', 'Repeat 5 times on each leg.'],
}

const PREF_AREA_MAP: Record<string, string[]> = {
  neck: ['Neck', 'Neck & Shoulders'], shoulders: ['Shoulders', 'Neck & Shoulders', 'Upper Back'],
  lower_back: ['Lower Back', 'Hips & Glutes', 'Spine'], wrists: ['Wrists', 'Wrists & Forearms'],
  knees: ['Knees', 'Quadriceps', 'Legs'], ankles: ['Legs', 'Feet'], eyes: ['Eyes'],
  upper_back: ['Upper Back', 'Spine'], hips: ['Hips & Glutes', 'Spine'],
}

// Returns null when all eligible exercises for the context have been completed.
function recommendExercise(recentlyUsedIds: number[], context: 'traffic' | 'parked' = 'traffic', preferredAreas: string[] = [], excludeIds: Set<number> = new Set()): typeof exercises[number] | null {
  const eligible = exercises.filter(e => (context === 'traffic' ? e.contexts.traffic === 'safe' : e.contexts.parked === 'safe') && !excludeIds.has(e.id))
  if (!eligible.length) return null
  const lastId = recentlyUsedIds[recentlyUsedIds.length - 1]
  const candidates = eligible.filter(e => e.id !== lastId)
  if (!candidates.length) return eligible[0]
  if (preferredAreas.length > 0) {
    const targetAreas = preferredAreas.flatMap(a => PREF_AREA_MAP[a] ?? [])
    const preferred = candidates.filter(e => targetAreas.some(ta => e.bodyArea.toLowerCase().includes(ta.toLowerCase())))
    if (preferred.length > 0) return preferred[Math.floor(Math.random() * preferred.length)]
  }
  const recentAreas = new Set(recentlyUsedIds.map(id => exercises.find(e => e.id === id)?.bodyArea ?? ''))
  const varied = candidates.filter(e => !recentAreas.has(e.bodyArea))
  return varied.length ? varied[Math.floor(Math.random() * varied.length)] : candidates[Math.floor(Math.random() * candidates.length)]
}

// Picks the best available break exercise, falling back to parked-context when
// all traffic-safe exercises are completed.
function pickBreakExercise(recentlyUsedIds: number[], preferredAreas: string[], completedIds: Set<number>): typeof exercises[number] | null {
  return recommendExercise(recentlyUsedIds, 'traffic', preferredAreas, completedIds)
      ?? recommendExercise(recentlyUsedIds, 'parked', preferredAreas, completedIds)
}

function computeHealthScore(completed: number, skipped: number, cooldown = 0): number {
  const total = completed + skipped
  const compliance = total > 0 ? completed / total : 0
  const base = Math.round(compliance * 60) + Math.min(40, completed * 8)
  const cooldownBonus = cooldown >= 2 ? 8 : cooldown === 1 ? 4 : 0
  return Math.max(35, Math.min(100, base + (completed >= 3 ? 10 : completed >= 1 ? 5 : 0) + cooldownBonus))
}

function generateAiInsights(completed: number, totalSecs: number, skipped: number): string {
  const mins = Math.round(totalSecs / 60)
  if (completed === 0) return `You drove for ${mins} minutes without a movement break. Set a reminder every 20 minutes next trip and try to complete at least one preventive exercise when safely stopped.`
  if (completed >= 3) return `Excellent work! You completed ${completed} preventive exercises during a ${mins}-minute drive. Consistent movement breaks significantly reduce musculoskeletal strain and improve circulation.`
  if (skipped === 0) return `Great job completing ${completed} exercise${completed > 1 ? 's' : ''} on your ${mins}-minute drive. Aim for a movement break every 20–30 minutes on longer trips for even better results.`
  return `You completed ${completed} of ${completed + skipped} recommended exercises during your ${mins}-minute drive. Try to accept more breaks next session, especially at traffic stops.`
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVAL_PRESETS = [15, 20, 25, 30, 35, 40, 45, 60]

const BREAK_TYPES = [
  { id: 'traffic', label: 'Heavy Traffic', icon: '🚦' },
  { id: 'parked', label: 'Parked Vehicle', icon: '🅿️' },
  { id: 'gas', label: 'Gas Station', icon: '⛽' },
  { id: 'rest', label: 'Rest Stop', icon: '🛑' },
  { id: 'before', label: 'Before Driving', icon: '🌅' },
  { id: 'after', label: 'After Driving', icon: '🌆' },
  { id: 'manual', label: 'Manual Break', icon: '✋' },
]

const REMINDER_BEHAVIORS = [
  { id: 'auto', label: 'Auto-recommend', desc: 'Automatically show exercise popup' },
  { id: 'ask', label: 'Ask first', desc: 'Ask before showing recommendations' },
  { id: 'notify', label: 'Notification only', desc: 'Show notification, no popup' },
  { id: 'silent', label: 'Silent', desc: 'Manual check only' },
]

interface ContextExData {
  id: string; name: string; emoji: string; bodyArea: string
  targetMuscles: string; why: string; duration: string; reps: string; difficulty: string
}

const BEFORE_DRIVING_EX: ContextExData[] = exercises
  .filter(e => e.contexts.before === 'safe')
  .map(e => ({
    id: String(e.id),
    name: e.name,
    emoji: e.emoji,
    bodyArea: e.bodyArea,
    targetMuscles: e.targetMuscles.split(',')[0].trim(),
    why: e.whyDriversNeedIt,
    duration: e.duration,
    reps: String(e.reps),
    difficulty: e.difficulty,
  }))

const AFTER_DRIVING_EX: ContextExData[] = exercises
  .filter(e => e.contexts.after === 'safe')
  .map(e => ({
    id: String(e.id),
    name: e.name,
    emoji: e.emoji,
    bodyArea: e.bodyArea,
    targetMuscles: e.targetMuscles.split(',')[0].trim(),
    why: e.whyDriversNeedIt,
    duration: e.duration,
    reps: String(e.reps),
    difficulty: e.difficulty,
  }))

// ─── Types ────────────────────────────────────────────────────────────────────

type ExerciseContext = 'before_driving' | 'break' | 'cooldown'
type SessionState = 'idle' | 'running' | 'paused'
type ViewMode = 'main' | 'before_driving' | 'exercise_preview' | 'rep_select' | 'exercise_active' | 'exercise_complete' | 'after_driving' | 'cooldown_prompt' | 'session_processing' | 'session_summary'

interface CompletedExercise {
  exerciseId: number; name: string; bodyArea: string
  durationSeconds: number; completedAt: string; status: 'completed' | 'skipped' | 'partial'
  sets: number; durationPerSet: number; restBetween: number
  context?: string
}

interface TimelineEvent {
  type: 'started' | 'break_reminder' | 'safely_stopped' | 'exercise_completed' | 'exercise_skipped' | 'driving_resumed' | 'paused' | 'resumed' | 'completed'
  label: string; sessionTimeLabel: string
}

interface SavedSession {
  id: string; date: string; dateISO: string; startTime: string; endTime: string
  duration: string; durationSeconds: number; drivingSeconds: number
  sedentarySeconds: number; exercisesCompleted: number; exercisesSkipped: number
  warmupExercises: number; breakExercises: number; cooldownExercises: number
  calories: number; avgRisk: RiskLevel; notes: string; healthScore: number
  totalSets: number
}

interface ActiveSessionPersist {
  startedAt: string; savedAt: string; sessionElapsedAtSave: number; drivingElapsedAtSave: number
  inBreak: boolean; exercisesCompleted: number; exercisesSkipped: number
  exerciseHistory: CompletedExercise[]; timeline: TimelineEvent[]; lastReminderAt: number
  intervalMins: number; note: string; sessionState: 'running' | 'paused'
  completedBeforeIds?: string[]; completedAfterIds?: string[]; completedBreakIds?: number[]
  activeDbSessionId?: string | null
}

// ─── ContextExerciseCard ──────────────────────────────────────────────────────

function ContextExerciseCard({ ex, completed, onSelect }: {
  ex: ContextExData; completed?: boolean; onSelect?: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${completed ? 'border-green-200 bg-green-50' : 'border-moove-border bg-white'}`}>
      <div role="button" tabIndex={0} onClick={() => setOpen(o => !o)} onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-moove-cream transition-colors cursor-pointer">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 ${completed ? 'bg-green-100' : 'bg-orange-100'}`}>
          {completed ? '✅' : ex.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-moove-brown flex items-center gap-2">
            {ex.name}
            {completed && <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Done</span>}
          </div>
          <div className="text-xs text-moove-muted">{ex.bodyArea} · {ex.duration} · {ex.difficulty}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {completed ? (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-green-100 text-green-700">✅ Done</span>
          ) : onSelect && (
            <button onClick={e => { e.stopPropagation(); onSelect() }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-moove-orange text-white hover:bg-orange-600 transition-all active:scale-95">
              Do It
            </button>
          )}
          <span className="text-xs text-moove-muted">{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 border-t border-moove-border pt-3">
          <div className="text-xs text-moove-muted mb-1"><strong className="text-moove-brown">Target:</strong> {ex.targetMuscles}</div>
          <div className="text-xs text-moove-muted mb-1"><strong className="text-moove-brown">Reps:</strong> {ex.reps}</div>
          <div className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2 mt-1.5">{ex.why}</div>
        </div>
      )}
    </div>
  )
}

// ─── BeforeDrivingScreen ──────────────────────────────────────────────────────

function BeforeDrivingScreen({ completedIds, onSkip, onSelectExercise }: {
  completedIds: Set<string>; onSkip: () => void; onSelectExercise: (ex: ContextExData) => void
}) {
  const doneCount = completedIds.size
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-5">
        <div className="text-4xl mb-3">🌅</div>
        <h1 className="font-display font-black text-2xl text-moove-brown mb-2">Before Driving Warm-Up</h1>
        <p className="text-sm text-moove-muted leading-relaxed">Optional warm-up exercises to prepare your body before driving.</p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-700 flex gap-2">
        <span className="shrink-0">💡</span>
        <span>These take approximately 5–7 minutes and can be done while seated. Tap any exercise to expand its details, or press <strong>Do It</strong> to begin the exercise.</span>
      </div>
      {doneCount === BEFORE_DRIVING_EX.length && doneCount > 0 && (
        <div className="bg-green-50 border border-green-300 rounded-2xl p-4 mb-4 text-center">
          <div className="text-2xl mb-1">🎉</div>
          <p className="font-bold text-green-700 text-sm">Great job! You have completed all Warm-Up exercises.</p>
        </div>
      )}
      <div className="flex flex-col gap-2 mb-6">
        {BEFORE_DRIVING_EX.map(ex => (
          <ContextExerciseCard key={ex.id} ex={ex} completed={completedIds.has(ex.id)} onSelect={completedIds.has(ex.id) ? undefined : () => onSelectExercise(ex)} />
        ))}
      </div>
      <div className="sticky bottom-4 flex flex-col gap-3">
        <button onClick={onSkip}
          className="w-full py-4 rounded-2xl font-display font-black text-base text-white shadow-lg active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
          {doneCount > 0 ? '🚗 Start Driving Session' : '▶ Skip & Start Driving'}
        </button>
        {doneCount === 0 && <p className="text-center text-xs text-moove-muted">These exercises are optional — you can skip anytime.</p>}
      </div>
    </div>
  )
}

// ─── CooldownPromptScreen ────────────────────────────────────────────────────

function CooldownPromptScreen({ exercisesCompleted, onStartCooldown, onSkip }: {
  exercisesCompleted: number; onStartCooldown: () => void; onSkip: () => void
}) {
  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50 via-teal-50 to-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-sm w-full mx-auto text-center">
        <div className="text-6xl mb-4">🏁</div>
        <h2 className="font-display font-black text-2xl text-moove-brown mb-2">Great Drive!</h2>
        <p className="text-sm text-moove-muted mb-6 leading-relaxed">
          Would you like to perform cool-down exercises before ending your session?
        </p>
        {exercisesCompleted > 0 && (
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 mb-5">
            ✅ {exercisesCompleted} exercise{exercisesCompleted > 1 ? 's' : ''} completed this session
          </div>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-left">
          <div className="text-xs font-bold text-blue-600 mb-2">💡 Why cool down?</div>
          <ul className="text-xs text-blue-700 space-y-1.5">
            <li className="flex items-start gap-2"><span className="shrink-0">✓</span><span>Reduces muscle tension from sustained driving posture</span></li>
            <li className="flex items-start gap-2"><span className="shrink-0">✓</span><span>Improves circulation after extended sitting</span></li>
            <li className="flex items-start gap-2"><span className="shrink-0">✓</span><span>Earns up to <strong>+8 health score bonus</strong></span></li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={onStartCooldown}
            className="w-full py-4 rounded-2xl font-display font-black text-base text-white shadow-lg active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #0EA5E9, #22C55E)' }}>
            🌆 Start Cool-Down Exercises
          </button>
          <button onClick={onSkip}
            className="w-full py-3 rounded-xl border-2 border-moove-border text-sm font-bold text-moove-muted hover:bg-moove-cream transition-all">
            Skip Cool-Down & End Session
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AfterDrivingScreen ───────────────────────────────────────────────────────

function AfterDrivingScreen({ completedIds, onFinish, onSelectExercise }: {
  completedIds: Set<string>; onFinish: () => void; onSelectExercise: (ex: ContextExData) => void
}) {
  const doneCount = completedIds.size
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-5">
        <div className="text-4xl mb-3">🌆</div>
        <h1 className="font-display font-black text-2xl text-moove-brown mb-2">After Driving Cool-Down</h1>
        <p className="text-sm text-moove-muted leading-relaxed">Cooldown exercises to help your body recover after driving.</p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-xs text-blue-700 flex gap-2">
        <span className="shrink-0">💡</span>
        <span>Best performed immediately after parking. Helps reduce stiffness and next-day soreness. Estimated duration: <strong>8–10 minutes</strong>.</span>
      </div>
      {doneCount === AFTER_DRIVING_EX.length && doneCount > 0 && (
        <div className="bg-green-50 border border-green-300 rounded-2xl p-4 mb-4 text-center">
          <div className="text-2xl mb-1">🎉</div>
          <p className="font-bold text-green-700 text-sm">Great job! You have completed all Cool-Down exercises.</p>
        </div>
      )}
      <div className="flex flex-col gap-2 mb-6">
        {AFTER_DRIVING_EX.map(ex => (
          <ContextExerciseCard key={ex.id} ex={ex} completed={completedIds.has(ex.id)} onSelect={completedIds.has(ex.id) ? undefined : () => onSelectExercise(ex)} />
        ))}
      </div>
      <div className="sticky bottom-4">
        <button onClick={onFinish}
          className="w-full py-4 rounded-2xl font-display font-black text-base text-white shadow-lg active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #F97316, #FBBF24)' }}>
          🏁 Finish Driving Session
        </button>
      </div>
    </div>
  )
}

// ─── ExerciseSetupScreen ──────────────────────────────────────────────────────

const DURATION_OPTS = [15, 30, 45, 60, 90]
const SETS_OPTS = [1, 2, 3, 4]
const REST_OPTS = [0, 5, 10, 15, 20, 30]

function ChipSelector({ label, options, value, onChange, unit }: {
  label: string; options: number[]; value: number; onChange: (v: number) => void; unit: string
}) {
  return (
    <div className="mb-4">
      <div className="text-xs font-bold text-moove-muted tracking-wide mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 ${value === o ? 'bg-moove-orange text-white border-moove-orange shadow-sm' : 'bg-white text-moove-muted border-moove-border hover:border-orange-200 hover:text-moove-brown'}`}>
            {o === 0 ? 'No Rest' : `${o}${unit}`}
          </button>
        ))}
      </div>
    </div>
  )
}

function ExerciseSetupScreen({ exerciseId, defaultDuration, onConfirm, onBack }: {
  exerciseId: number; defaultDuration: number
  onConfirm: (sets: number, durationPerSet: number, restBetween: number, totalDuration: number) => void
  onBack: () => void
}) {
  const ex = exercises.find(e => e.id === exerciseId) ?? exercises[0]
  const recDuration = DURATION_OPTS.reduce((prev, cur) => Math.abs(cur - defaultDuration) < Math.abs(prev - defaultDuration) ? cur : prev)
  const [sets, setSets] = useState(ex.sets ?? 2)
  const [durPerSet, setDurPerSet] = useState(recDuration)
  const [rest, setRest] = useState(10)
  const totalDuration = sets * durPerSet + Math.max(0, sets - 1) * rest

  return (
    <div className="min-h-full bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-lg mx-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-moove-muted hover:text-moove-brown transition-colors mb-5">
          ← Back to Exercise Details
        </button>

        {/* Preview video */}
        <div className="bg-white rounded-3xl card-shadow overflow-hidden mb-5">
          <div className="relative">
            <ExerciseVideo exerciseEmoji={ex.emoji} playing={true} className="rounded-none rounded-t-3xl" src={getExerciseVideo(ex.id)} />
            <div className="absolute bottom-0 inset-x-0 px-4 pb-3 pt-8" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}>
              <h2 className="font-display font-black text-xl text-white leading-tight">{ex.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">{ex.bodyArea}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">{ex.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-green-500 text-lg shrink-0">💡</span>
          <div>
            <div className="text-xs font-bold text-green-700 mb-0.5">RECOMMENDED</div>
            <div className="text-sm text-green-800 font-semibold">{ex.sets ?? 2} Sets × {ex.durationSeconds}s · Rest {ex.rest ?? 10}s between sets</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl card-shadow p-6 mb-5">
          <ChipSelector label="EXERCISE DURATION (PER SET)" options={DURATION_OPTS} value={durPerSet} onChange={setDurPerSet} unit=" sec" />
          <ChipSelector label="NUMBER OF SETS" options={SETS_OPTS} value={sets} onChange={setSets} unit=" set" />
          <ChipSelector label="REST BETWEEN SETS" options={REST_OPTS} value={rest} onChange={setRest} unit=" sec" />

          <div className="grid grid-cols-3 gap-3 bg-orange-50 rounded-2xl p-4 mb-5 mt-2">
            <div className="text-center">
              <div className="font-display font-black text-xl text-moove-orange">{sets}</div>
              <div className="text-xs text-moove-muted">{sets === 1 ? 'Set' : 'Sets'}</div>
            </div>
            <div className="text-center">
              <div className="font-display font-black text-xl text-moove-brown">{durPerSet}s</div>
              <div className="text-xs text-moove-muted">Per Set</div>
            </div>
            <div className="text-center">
              <div className="font-display font-black text-xl text-blue-600">{totalDuration}s</div>
              <div className="text-xs text-moove-muted">Total Time</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex gap-2 mb-4">
            <span className="shrink-0">⚠️</span>
            <span>Ensure your vehicle is <strong>completely stationary</strong> before starting.</span>
          </div>
          <button onClick={() => onConfirm(sets, durPerSet, rest, totalDuration)}
            className="w-full py-4 rounded-2xl font-display font-black text-lg text-white shadow-lg active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #F97316, #FBBF24)' }}>
            Start · {sets} Set{sets > 1 ? 's' : ''} × {durPerSet}s
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ExercisePreviewScreen ────────────────────────────────────────────────────

function ExercisePreviewScreen({ exerciseId, onStart, onBack }: {
  exerciseId: number; onStart: (dur: number) => void; onBack: () => void; // onStart → go to rep_select
}) {
  const ex = exercises.find(e => e.id === exerciseId) ?? exercises[0]
  const steps = EXERCISE_STEPS[ex.id] ?? []
  const [customDuration] = useState(ex.durationSeconds)

  return (
    <div className="min-h-full bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-lg mx-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-moove-muted hover:text-moove-brown transition-colors mb-5">
          ← Back
        </button>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex gap-2 mb-5">
          <span className="shrink-0 text-base">⚠️</span>
          <span><strong>Before you begin:</strong> Ensure your vehicle is <strong>completely stationary</strong>. Never perform exercises while driving.</span>
        </div>
        <div className="bg-white rounded-3xl card-shadow overflow-hidden mb-5">
          {/* Video demonstration */}
          <div className="relative">
            <ExerciseVideo exerciseEmoji={ex.emoji} playing={true} className="rounded-none rounded-t-3xl" src={getExerciseVideo(ex.id)} />
            <div className="absolute bottom-0 inset-x-0 px-4 pb-3 pt-8" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}>
              <h2 className="font-display font-black text-xl text-white leading-tight">{ex.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">{ex.bodyArea}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">{ex.difficulty}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">{customDuration}s</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <div className="text-xs font-bold text-moove-muted tracking-wide mb-1.5">TARGET MUSCLES</div>
              <p className="text-sm text-moove-brown leading-relaxed">{ex.targetMuscles}</p>
            </div>
            <div className="mb-4 bg-orange-50 rounded-xl p-3.5">
              <div className="text-xs font-bold text-moove-orange tracking-wide mb-1.5">WHY DRIVERS NEED IT</div>
              <p className="text-sm text-moove-brown leading-relaxed">{ex.whyDriversNeedIt}</p>
            </div>
            <div className="mb-4">
              <div className="text-xs font-bold text-moove-muted tracking-wide mb-2">BENEFITS</div>
              {ex.benefits.map(b => (
                <div key={b} className="flex items-start gap-2 text-sm text-moove-brown mb-1">
                  <span className="text-moove-green shrink-0">✓</span>{b}
                </div>
              ))}
            </div>
            {steps.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-bold text-moove-muted tracking-wide mb-2">STEP-BY-STEP</div>
                <ol className="flex flex-col gap-2">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-moove-brown">
                      <span className="w-6 h-6 rounded-full bg-moove-orange text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {ex.safetyNote && (
              <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">
                🚫 <strong>Note:</strong> {ex.safetyNote}
              </div>
            )}
            <button onClick={() => onStart(customDuration)} className="w-full py-4 rounded-2xl font-display font-black text-lg text-white shadow-lg active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #F97316, #FBBF24)' }}>
              ⚙️ Configure Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ExerciseTimerScreen ──────────────────────────────────────────────────────

function ExerciseTimerScreen({ exerciseId, sets, durationPerSet, restBetween, onDone, onSkip }: {
  exerciseId: number; sets: number; durationPerSet: number; restBetween: number
  onDone: () => void; onSkip: () => void
}) {
  const ex = exercises.find(e => e.id === exerciseId) ?? exercises[0]
  const videoSrc = getExerciseVideo(exerciseId)
  const [currentSet, setCurrentSet] = useState(1)
  const [phase, setPhase] = useState<'exercise' | 'rest' | 'done'>('exercise')
  const [timeLeft, setTimeLeft] = useState(durationPerSet)
  const [isPaused, setIsPaused] = useState(false)
  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Timer countdown
  useEffect(() => {
    if (isPaused || phase === 'done') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isPaused, phase])

  // Phase transitions
  useEffect(() => {
    if (timeLeft > 0 || phase === 'done') return
    if (phase === 'exercise') {
      if (currentSet < sets) {
        if (restBetween > 0) { playRestStartSound(); setPhase('rest'); setTimeLeft(restBetween) }
        else { setCurrentSet(s => s + 1); setTimeLeft(durationPerSet) }
      } else { playCompleteSound(); setPhase('done') }
    } else if (phase === 'rest') {
      playExerciseStartSound(); setCurrentSet(s => s + 1); setPhase('exercise'); setTimeLeft(durationPerSet)
    }
  }, [timeLeft, phase, currentSet, sets, restBetween, durationPerSet])

  // Sync video with timer state
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (phase === 'done' || isPaused) {
      v.pause()
    } else if (phase === 'exercise') {
      v.play().catch(() => { v.muted = true; v.play().catch(() => setVideoError(true)) })
    } else {
      v.pause()
    }
  }, [isPaused, phase])

  const handleRestart = () => {
    setCurrentSet(1); setPhase('exercise'); setTimeLeft(durationPerSet); setIsPaused(false)
    const v = videoRef.current
    if (v) { v.currentTime = 0; v.play().catch(() => { v.muted = true; v.play().catch(() => {}) }) }
    playExerciseStartSound()
  }

  const totalDuration = sets * durationPerSet + Math.max(0, sets - 1) * restBetween
  const setsCompleted = currentSet - 1
  const phaseDuration = phase === 'exercise' ? durationPerSet : (restBetween > 0 ? restBetween : 1)
  const phaseElapsed = phaseDuration - timeLeft
  const elapsed = setsCompleted * (durationPerSet + restBetween) + (phase === 'rest' ? durationPerSet + phaseElapsed : phaseElapsed)
  const overallPct = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0
  const phasePct = phaseDuration > 0 ? ((phaseDuration - timeLeft) / phaseDuration) * 100 : 100
  const circ = 2 * Math.PI * 48
  const offset = circ * (1 - phasePct / 100)

  const phaseColor = phase === 'rest' ? '#22C55E' : isPaused ? '#9E8B7D' : '#F97316'
  const phaseLabel = phase === 'rest' ? '😮‍💨 REST PERIOD' : isPaused ? '⏸ PAUSED' : '💪 EXERCISE IN PROGRESS'

  if (phase === 'done') {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #fff 60%)' }}>
        <div className="max-w-sm w-full mx-auto text-center">
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h2 className="font-display font-black text-3xl text-moove-brown mb-1">All Sets Complete!</h2>
          <div className="text-sm text-moove-muted mb-5">{ex.emoji} {ex.name} · {sets} set{sets > 1 ? 's' : ''} done</div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Sets Finished', value: String(sets), color: '#F97316' },
              { label: 'Total Time', value: `${totalDuration}s`, color: '#22C55E' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 card-shadow text-center">
                <div className="font-display font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-moove-muted">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm text-green-800 font-semibold">🌟 {ex.benefits[0]}</p>
          </div>
          <button onClick={onDone} className="w-full py-4 rounded-2xl font-display font-black text-lg text-white shadow-lg active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            ✅ Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col" style={{ background: 'linear-gradient(160deg, #fff7ed 0%, #fff 50%)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 text-center">
        <div className="text-xs font-black tracking-widest mb-1 transition-colors duration-300" style={{ color: phaseColor }}>
          {phaseLabel}
        </div>
        <h2 className="font-display font-black text-2xl text-moove-brown leading-tight">{ex.name}</h2>
        <p className="text-sm text-moove-muted">{ex.bodyArea}</p>
      </div>

      {/* Set progress */}
      <div className="px-5 mb-3">
        <div className="bg-white rounded-2xl px-4 py-3 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-moove-brown">SET {currentSet} OF {sets}</span>
            <span className="text-xs font-black" style={{ color: phaseColor }}>{Math.round(overallPct)}% COMPLETE</span>
          </div>
          <div className="flex gap-1.5 mb-1">
            {Array.from({ length: sets }, (_, i) => (
              <div key={i} className="h-3 flex-1 rounded-full transition-all duration-300 overflow-hidden bg-gray-100">
                <div className="h-full rounded-full transition-all duration-300" style={{
                  width: i < currentSet - 1 ? '100%' : i === currentSet - 1 ? `${phasePct}%` : '0%',
                  background: i < currentSet - 1 ? '#22C55E' : phaseColor,
                }} />
              </div>
            ))}
          </div>
          {/* Overall progress bar */}
          <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallPct}%`, background: overallPct > 80 ? '#22C55E' : '#F97316' }} />
          </div>
        </div>
      </div>

      {/* Video player */}
      <div className="px-5 mb-3">
        <div className="relative rounded-3xl overflow-hidden bg-black shadow-xl" style={{ aspectRatio: '16/9' }}>
          {!videoError ? (
            <video
              ref={videoRef}
              src={videoSrc}
              loop
              muted
              autoPlay
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              onError={() => setVideoError(true)}
              onCanPlay={e => {
                const v = e.currentTarget
                if (phase === 'exercise' && !isPaused) {
                  v.play().catch(() => {})
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-orange-900 to-orange-800">
              <div className="text-5xl mb-2">{ex.emoji}</div>
              <img src={mascotImg} alt="Moo" className="w-16 h-16 object-contain opacity-80" />
            </div>
          )}

          {/* Overlay during rest or pause */}
          {(isPaused || phase === 'rest') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
              {isPaused ? (
                <>
                  <div className="text-5xl mb-2">⏸</div>
                  <div className="text-white font-black text-lg">PAUSED</div>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-2">😮‍💨</div>
                  <div className="text-white font-black text-lg">REST</div>
                  <div className="text-white/70 text-sm mt-1">Set {currentSet + 1} starts in {timeLeft}s</div>
                </>
              )}
            </div>
          )}

          {/* Safety note badge */}
          {ex.safetyNote && (
            <div className="absolute top-2 left-2 bg-yellow-400/90 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
              ⚠️ Parked Only
            </div>
          )}
        </div>
      </div>

      {/* Timer circle + status */}
      <div className="px-5 mb-3">
        <div className="bg-white rounded-3xl p-4 card-shadow flex items-center gap-4">
          {/* Ring timer */}
          <div className="shrink-0">
            <svg width="100" height="100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#F3F4F6" strokeWidth="8" />
              <circle cx="50" cy="50" r="48" fill="none"
                stroke={phaseColor}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s' }} />
              <text x="50" y="44" textAnchor="middle" fontSize="20" fontWeight="900" fill="#3E1F0D">
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </text>
              <text x="50" y="62" textAnchor="middle" fontSize="9" fontWeight="700" fill={phaseColor}>
                {phase === 'rest' ? 'REST' : isPaused ? 'PAUSED' : 'ACTIVE'}
              </text>
            </svg>
          </div>
          {/* Instructions */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black text-moove-muted tracking-widest mb-1">REMEMBER</div>
            <p className="text-xs text-moove-brown leading-relaxed line-clamp-4">{ex.keyInstruction}</p>
            <div className="mt-2 text-xs font-semibold" style={{ color: phaseColor }}>
              {phase === 'rest'
                ? `Rest · Set ${currentSet + 1} up next`
                : `Set ${currentSet} · ${timeLeft}s remaining`}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 pb-6 space-y-2">
        <div className="flex gap-2">
          {isPaused ? (
            <button
              onClick={() => {
                setIsPaused(false)
                const v = videoRef.current
                if (v && phase === 'exercise') v.play().catch(() => {})
              }}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              ▶ Resume
            </button>
          ) : (
            <button
              onClick={() => { setIsPaused(true); videoRef.current?.pause() }}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 border-2 border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100">
              ⏸ Pause
            </button>
          )}
          <button
            onClick={handleRestart}
            className="flex-1 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 border-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100">
            ↺ Restart
          </button>
          <button
            onClick={() => setShowStopConfirm(true)}
            className="px-4 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 border-2 border-red-200 text-red-500 bg-red-50 hover:bg-red-100">
            ■
          </button>
        </div>
        <button onClick={onSkip} className="w-full py-2.5 rounded-2xl border border-moove-border text-xs font-bold text-moove-muted hover:bg-moove-cream transition-all">
          Skip Exercise
        </button>
      </div>

      {showStopConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs card-shadow-lg text-center">
            <div className="text-3xl mb-3">⏹️</div>
            <h3 className="font-display font-black text-lg text-moove-brown mb-2">Stop this exercise?</h3>
            <p className="text-sm text-moove-muted mb-5">Partial progress will not be counted.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowStopConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-moove-border text-sm font-bold text-moove-muted hover:bg-moove-cream">Continue</button>
              <button onClick={onSkip} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95">Stop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ExerciseCompleteScreen ───────────────────────────────────────────────────

function ExerciseCompleteScreen({ exerciseName, emoji, benefit, context, sets, durationPerSet, totalDuration, completedAt, onDoAnother, onContinue }: {
  exerciseName: string; emoji: string; benefit: string; context: ExerciseContext
  sets: number; durationPerSet: number; totalDuration: number; completedAt: string
  onDoAnother: () => void; onContinue: () => void
}) {
  const cfg = {
    before_driving: { another: '🌅 Do Another Warm-Up Exercise', continue: '🚗 Start Driving Session', badge: 'Warm-Up Complete!' },
    break: { another: '🤸 Do Another Exercise', continue: '🚗 Continue Trip', badge: 'Break Exercise Done!' },
    cooldown: { another: '🌆 Do Another Cool-Down Exercise', continue: '🏁 Finish Driving Session', badge: 'Cool-Down Complete!' },
  }[context]
  const timeStr = new Date(completedAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-full bg-gradient-to-b from-green-50 to-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-sm w-full mx-auto text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="font-display font-black text-2xl text-moove-brown mb-1">{cfg.badge}</h2>
        <p className="text-sm text-moove-muted mb-4">
          You completed: <strong className="text-moove-brown">{emoji} {exerciseName}</strong>
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: sets === 1 ? 'Set' : 'Sets', value: String(sets), color: '#F97316' },
            { label: 'Total Time', value: `${totalDuration}s`, color: '#0EA5E9' },
            { label: 'At', value: timeStr, color: '#22C55E' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 card-shadow text-center border border-moove-border">
              <div className="font-display font-black text-lg" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-moove-muted">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 text-left">
          <p className="text-sm text-green-700 font-semibold">🌟 {benefit}</p>
          <p className="text-xs text-green-600 mt-1">Small movements today help prevent long-term health risks.</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={onDoAnother} className="w-full py-4 rounded-2xl font-display font-black text-base text-white shadow-lg active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #F97316, #FBBF24)' }}>
            {cfg.another}
          </button>
          <button onClick={onContinue} className="w-full py-4 rounded-2xl font-display font-black text-base text-white shadow-lg active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            {cfg.continue}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SessionProcessingScreen ──────────────────────────────────────────────────

function SessionProcessingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 700),
      setTimeout(() => setStep(2), 1700),
      setTimeout(() => setStep(3), 2700),
      setTimeout(() => onComplete(), 3500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const steps = [
    { icon: '💾', label: 'Saving Driving Session Data', desc: 'Storing duration, breaks, exercise history, and session metrics…' },
    { icon: '🤖', label: 'Generating AI Health Summary', desc: 'Analyzing driving patterns, body areas, and preventive health data…' },
    { icon: '📊', label: 'Updating Dashboard Statistics', desc: 'Refreshing weekly progress, streaks, health insights, and exercise counts…' },
  ]

  return (
    <div className="min-h-full bg-gradient-to-b from-orange-50 to-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-sm w-full mx-auto text-center">
        <img src={mascotImg} alt="Moo" className="w-24 h-24 object-contain mx-auto mb-5" style={{ animation: 'float 1.5s ease-in-out infinite' }} />
        <h2 className="font-display font-black text-2xl text-moove-brown mb-2">Processing Session…</h2>
        <p className="text-sm text-moove-muted mb-8">Just a moment while Moo saves your data.</p>
        <div className="flex flex-col gap-4">
          {steps.map((s, i) => {
            const done = step > i
            const active = step === i
            return (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all duration-500 ${done ? 'border-green-200 bg-green-50' : active ? 'border-orange-200 bg-orange-50' : 'border-moove-border bg-white opacity-40'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${done ? 'bg-green-100' : active ? 'bg-orange-100' : 'bg-gray-100'}`}>
                  {done ? '✅' : active ? '⏳' : s.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className={`text-sm font-bold ${done ? 'text-green-700' : active ? 'text-moove-brown' : 'text-moove-muted'}`}>{s.label}</div>
                  {(done || active) && <div className="text-xs text-moove-muted mt-0.5">{done ? '✓ Done' : s.desc}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── RecommendationModal ──────────────────────────────────────────────────────

function RecommendationModal({ elapsed, stagedExerciseId, completedBreakIds, onAccept, onContinue }: {
  elapsed: number; stagedExerciseId: number
  completedBreakIds: Set<number>
  onAccept: (exerciseId: number) => void; onContinue: () => void
}) {
  const mins = Math.floor(elapsed / 60)
  const risk = getSedentaryRisk(elapsed)
  const primary = exercises.find(e => e.id === stagedExerciseId) ?? exercises[0]
  const [showAll, setShowAll] = useState(false)
  // All exercises selectable during a break (traffic-safe or parked-safe)
  const allEligible = exercises.filter(e => e.contexts.traffic === 'safe' || e.contexts.parked === 'safe')
  const doneCount = allEligible.filter(e => completedBreakIds.has(e.id)).length
  const allDone = allEligible.length > 0 && doneCount >= allEligible.length

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md card-shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 border-b border-orange-100 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl">🪑</div>
            <div>
              <div className="font-display font-black text-moove-brown text-lg">Time for a Movement Break!</div>
              <div className="text-sm" style={{ color: risk.color }}>{risk.icon} {risk.level} · {mins} min seated</div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex gap-2">
            <span className="shrink-0">⚠️</span>
            <span><strong>Safety first.</strong> Only perform exercises when your vehicle is <strong>completely stationary</strong>.</span>
          </div>
        </div>

        {/* Per-category progress bar */}
        {doneCount > 0 && (
          <div className="px-5 py-3 border-b border-orange-100 bg-orange-50/60 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-moove-brown">Movement Break Progress</span>
              <span className="text-xs font-bold text-moove-orange">{doneCount} / {allEligible.length} Completed</span>
            </div>
            <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((doneCount / allEligible.length) * 100)}%`, background: 'linear-gradient(to right, #F97316, #22C55E)' }} />
            </div>
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1">
          {allDone ? (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">🎉</div>
                <div className="font-display font-black text-xl text-moove-brown mb-2">Great job!</div>
                <div className="text-sm text-moove-muted mb-4 leading-relaxed">You've completed all available exercises for this session. Keep driving and stay comfortable!</div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-5 text-xs text-green-700 font-semibold">
                  ✅ {completedBreakIds.size} exercise{completedBreakIds.size > 1 ? 's' : ''} completed this session
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => setShowAll(true)} className="w-full py-3 rounded-xl border-2 border-dashed border-moove-border text-sm font-bold text-moove-muted hover:border-orange-300 hover:text-moove-orange hover:bg-orange-50 transition-all">
                  📋 Review Completed Exercises
                </button>
                <button onClick={onContinue} className="w-full py-3 rounded-xl border-2 border-moove-border text-sm font-bold text-moove-muted hover:bg-moove-cream transition-all">
                  Continue Driving →
                </button>
              </div>
            </>
          ) : !showAll ? (
            <>
              <div className="text-xs font-bold text-moove-muted mb-3 tracking-wide">RECOMMENDED FOR YOU</div>
              <button onClick={() => onAccept(primary.id)}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-moove-orange hover:border-orange-400 transition-all text-left mb-4 group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">{primary.emoji}</div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-moove-brown">{primary.name}</div>
                    <div className="text-xs text-moove-muted">{primary.bodyArea} · {primary.durationSeconds}s · {primary.difficulty}</div>
                  </div>
                  <div className="text-xs font-bold text-moove-orange group-hover:translate-x-0.5 transition-transform shrink-0">Perform →</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {primary.benefits.slice(0, 2).map(b => (
                    <span key={b} className="text-xs bg-white px-2 py-0.5 rounded-full text-moove-brown border border-orange-100">{b}</span>
                  ))}
                </div>
              </button>
              <button onClick={() => setShowAll(true)}
                className="w-full py-3 mb-4 rounded-xl border-2 border-dashed border-moove-border text-sm font-bold text-moove-muted hover:border-orange-300 hover:text-moove-orange hover:bg-orange-50 transition-all">
                🤸 View More Recommended Exercises
              </button>
              <button onClick={onContinue} className="w-full py-3 rounded-xl border-2 border-moove-border text-sm font-bold text-moove-muted hover:bg-moove-cream transition-all">
                Continue Driving →
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-moove-muted tracking-wide">ALL RECOMMENDED EXERCISES</div>
                <button onClick={() => setShowAll(false)} className="text-xs font-bold text-moove-orange hover:underline">← Back</button>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {allEligible.map(ex => {
                  const isDone = completedBreakIds.has(ex.id)
                  return (
                    <button key={ex.id} onClick={() => !isDone && onAccept(ex.id)} disabled={isDone}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${isDone ? 'border-green-200 bg-green-50 opacity-70 cursor-not-allowed' : ex.id === primary.id ? 'border-orange-200 bg-orange-50' : 'border-moove-border bg-white hover:bg-orange-50 hover:border-orange-200'}`}>
                      <div className="text-2xl shrink-0">{isDone ? '✅' : ex.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-moove-brown flex items-center gap-2">
                          {ex.name}
                          {isDone && <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Done this session</span>}
                          {!isDone && ex.id === primary.id && <span className="text-xs font-bold text-moove-orange bg-orange-100 px-1.5 py-0.5 rounded-full">Suggested</span>}
                        </div>
                        <div className="text-xs text-moove-muted">{ex.bodyArea} · {ex.durationSeconds}s · {ex.difficulty}</div>
                      </div>
                      {!isDone && <span className="text-xs font-bold text-moove-orange opacity-0 group-hover:opacity-100 transition-opacity shrink-0">→</span>}
                    </button>
                  )
                })}
              </div>
              <button onClick={onContinue} className="w-full py-3 rounded-xl border-2 border-moove-border text-sm font-bold text-moove-muted hover:bg-moove-cream transition-all">
                Continue Driving →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function WhatsNextSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [feedbackDone] = useState(() => hasSubmittedFeedbackToday())

  return (
    <div className="mb-3">
      <div className="text-xs font-bold text-moove-muted mb-3 tracking-wide text-center">⭐ WHAT'S NEXT?</div>

      {feedbackDone ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-3 text-center">
          <div className="text-2xl mb-1">🙏</div>
          <div className="font-display font-bold text-green-700 mb-0.5">Thank you for your feedback!</div>
          <div className="text-xs text-green-600">Your input helps improve MOOVE for every driver.</div>
        </div>
      ) : (
        <div className="mb-3 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #F97316, #FBBF24)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
          <button onClick={() => onNavigate('/driver/feedback')} className="w-full p-5 text-left group active:scale-[0.98] transition-transform">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">📝</div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white/80 tracking-wide mb-0.5">PRIMARY ACTION</div>
                <div className="font-display font-black text-xl text-white mb-1">Submit Your Feedback</div>
                <div className="text-sm text-white/90 leading-relaxed">Help us improve by sharing your experience with today's exercises, AI recommendations, and session usability.</div>
              </div>
              <div className="text-white text-xl font-black mt-1 group-hover:translate-x-1 transition-transform">→</div>
            </div>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 mb-2">
        <button onClick={() => onNavigate(feedbackDone ? '/driver/health-dashboard' : '/driver/health-dashboard')}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left group ${feedbackDone ? 'border-moove-orange bg-orange-50 hover:border-orange-400' : 'border-moove-border bg-white hover:border-orange-200 hover:bg-orange-50'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${feedbackDone ? 'bg-moove-orange' : 'bg-blue-100'}`}>
            <span>📊</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-moove-brown flex items-center gap-2">
              View Health Dashboard
              {feedbackDone && <span className="text-xs font-bold text-moove-orange bg-orange-100 px-1.5 py-0.5 rounded-full">Recommended Next</span>}
            </div>
            <div className="text-xs text-moove-muted">Daily overview, wellness trends, health insights</div>
          </div>
          <span className="text-xs font-bold text-moove-orange opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </button>

        <button onClick={() => onNavigate('/driver/sedentary')}
          className="flex items-center gap-3 p-3.5 rounded-2xl border border-moove-border bg-white hover:border-orange-200 hover:bg-orange-50 transition-all text-left group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">💺</div>
          <div className="flex-1">
            <div className="text-sm font-bold text-moove-brown">Sedentary Monitoring</div>
            <div className="text-xs text-moove-muted">Sitting time, break history, risk indicators</div>
          </div>
          <span className="text-xs font-bold text-moove-orange opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </button>
      </div>

      <button onClick={() => onNavigate('/driver/education')}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-moove-cream hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all text-left group">
        <span className="text-lg">📚</span>
        <div className="flex-1 text-xs font-bold text-moove-muted group-hover:text-moove-brown transition-colors">Read Preventive Health Education</div>
        <span className="text-xs text-moove-orange opacity-0 group-hover:opacity-100 transition-opacity">→</span>
      </button>
    </div>
  )
}

function hasSubmittedFeedbackToday(): boolean {
  try {
    const data = JSON.parse(localStorage.getItem('moove_feedback_responses') || '[]')
    const todayISO = new Date().toISOString().slice(0, 10)
    return data.some((f: { submittedAt?: string }) => (f.submittedAt ?? '').startsWith(todayISO))
  } catch { return false }
}

// ─── SessionSummaryScreen ─────────────────────────────────────────────────────

function SessionSummaryScreen({ sessionSecs, drivingSecs, exercisesCompleted, exercisesSkipped, exerciseHistory, timeline, onAfterExercises, onNavigate, onDone }: {
  sessionSecs: number; drivingSecs: number; exercisesCompleted: number; exercisesSkipped: number
  exerciseHistory: CompletedExercise[]; timeline: TimelineEvent[]
  onAfterExercises: () => void; onNavigate: (path: string) => void; onDone: () => void
}) {
  const healthScore = computeHealthScore(exercisesCompleted, exercisesSkipped)
  const insights = generateAiInsights(exercisesCompleted, sessionSecs, exercisesSkipped)
  const breakCount = timeline.filter(e => e.type === 'safely_stopped').length
  const totalExSecs = exerciseHistory.filter(e => e.status === 'completed').reduce((sum, e) => sum + e.durationSeconds, 0)
  const scoreColor = healthScore >= 80 ? '#22C55E' : healthScore >= 60 ? '#FBBF24' : '#F97316'
  const circ = 2 * Math.PI * 44
  const scoreOffset = circ * (1 - healthScore / 100)
  const [showTimeline, setShowTimeline] = useState(false)

  return (
    <div className="min-h-full bg-gradient-to-b from-green-50 via-white to-white p-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="font-display font-black text-3xl text-moove-brown mb-1">Driving Session Completed!</h1>
          <p className="text-sm text-moove-muted">Your preventive health summary is ready.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 card-shadow mb-5 flex items-center gap-5">
          <div className="shrink-0">
            <svg width="112" height="112">
              <circle cx="56" cy="56" r="44" fill="none" stroke="#F3F4F6" strokeWidth="10" />
              <circle cx="56" cy="56" r="44" fill="none" stroke={scoreColor} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={scoreOffset} transform="rotate(-90 56 56)"
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
              <text x="56" y="52" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="900" fill="#3E1F0D">{healthScore}</text>
              <text x="56" y="70" textAnchor="middle" fontSize="10" fill="#9E8B7D">/100</text>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-moove-muted mb-1">PREVENTIVE HEALTH SCORE</div>
            <div className="font-display font-black text-2xl mb-1" style={{ color: scoreColor }}>
              {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Improvement'}
            </div>
            <p className="text-xs text-moove-muted">Based on exercise compliance and break frequency.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 card-shadow mb-4">
          <div className="text-xs font-bold text-moove-muted mb-3 tracking-wide">SESSION BREAKDOWN</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <div className="text-xs font-bold text-moove-orange mb-1">TOTAL SESSION TIME</div>
              <div className="font-display font-black text-2xl text-moove-brown">{formatMins(sessionSecs)}</div>
              <div className="text-xs text-moove-muted">Start to finish</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-xs font-bold text-blue-500 mb-1">ACTUAL DRIVING TIME</div>
              <div className="font-display font-black text-2xl text-moove-brown">{formatMins(drivingSecs)}</div>
              <div className="text-xs text-moove-muted">Excluding breaks</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Breaks Taken', value: String(breakCount), icon: '🛑', color: '#F97316' },
              { label: 'Exercises Done', value: String(exercisesCompleted), icon: '✅', color: '#22C55E' },
              { label: 'Exercise Time', value: `${totalExSecs}s`, icon: '⏱️', color: '#0EA5E9' },
            ].map(s => (
              <div key={s.label} className="bg-moove-cream rounded-xl p-2.5 text-center">
                <div className="text-lg mb-1">{s.icon}</div>
                <div className="font-display font-black text-lg" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-moove-muted leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-moove-orange flex items-center justify-center text-white text-xs font-black">AI</div>
            <div className="font-display font-bold text-moove-brown">Moo's Health Insights</div>
          </div>
          <p className="text-sm text-moove-brown leading-relaxed mb-3">{insights}</p>
          {exercisesCompleted > 0 && (
            <div className="text-xs text-moove-muted">
              Body areas exercised: <span className="font-semibold text-moove-brown">
                {[...new Set(exerciseHistory.filter(e => e.status === 'completed').map(e => e.bodyArea))].join(', ')}
              </span>
            </div>
          )}
        </div>

        {exerciseHistory.filter(e => e.status === 'completed').length > 0 && (
          <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
            <div className="text-xs font-bold text-moove-muted mb-3 tracking-wide">EXERCISES COMPLETED</div>
            {exerciseHistory.filter(e => e.status === 'completed').map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-sm mb-1.5">
                <span className="text-moove-green shrink-0">✓</span>
                <span className="text-moove-brown font-semibold flex-1">{e.name}</span>
                <span className="text-xs text-moove-muted">{e.bodyArea} · {e.durationSeconds}s</span>
              </div>
            ))}
          </div>
        )}

        {timeline.length > 0 && (
          <div className="bg-white rounded-2xl card-shadow mb-4 overflow-hidden">
            <button onClick={() => setShowTimeline(o => !o)} className="w-full flex items-center justify-between p-4 text-sm font-bold text-moove-brown hover:bg-moove-cream transition-colors">
              <span>📋 Session Timeline <span className="text-xs font-normal text-moove-muted">({timeline.length} events)</span></span>
              <span className="text-xs text-moove-muted">{showTimeline ? '▲' : '▼'}</span>
            </button>
            {showTimeline && (
              <div className="px-4 pb-4 border-t border-moove-border max-h-56 overflow-y-auto">
                <div className="pt-3 relative">
                  <div className="absolute left-3 top-3 bottom-3 w-px bg-orange-100" />
                  {timeline.map((e, i) => {
                    const icons: Record<string, string> = { started: '🟢', break_reminder: '💡', safely_stopped: '🛑', exercise_completed: '✅', exercise_skipped: '⏭️', driving_resumed: '🚗', paused: '⏸', resumed: '▶️', completed: '🏁' }
                    return (
                      <div key={i} className="flex items-start gap-3 mb-2.5 last:mb-0 relative">
                        <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center text-xs shrink-0 z-10">{icons[e.type] ?? '•'}</div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-xs font-semibold text-moove-brown">{e.label}</div>
                          <div className="text-xs text-moove-muted">{e.sessionTimeLabel}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <WhatsNextSection onNavigate={onNavigate} />

        <button onClick={onDone} className="w-full py-3 rounded-xl border border-moove-border text-sm font-bold text-moove-muted hover:bg-moove-cream transition-all">
          Return to Driving Sessions
        </button>
      </div>
    </div>
  )
}

// ─── TimelineWidget ───────────────────────────────────────────────────────────

function TimelineWidget({ timeline }: { timeline: TimelineEvent[] }) {
  const [open, setOpen] = useState(false)
  if (timeline.length === 0) return null
  const icons: Record<string, string> = { started: '🟢', break_reminder: '💡', safely_stopped: '🛑', exercise_completed: '✅', exercise_skipped: '⏭️', driving_resumed: '🚗', paused: '⏸', resumed: '▶️', completed: '🏁' }
  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden mt-4">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-4 text-sm font-bold text-moove-brown hover:bg-moove-cream transition-colors">
        <span>📋 Session Timeline <span className="text-xs font-normal text-moove-muted ml-1">({timeline.length} events)</span></span>
        <span className="text-xs text-moove-muted">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-moove-border max-h-48 overflow-y-auto">
          <div className="pt-3 relative">
            <div className="absolute left-3 top-3 bottom-3 w-px bg-orange-100" />
            {timeline.map((e, i) => (
              <div key={i} className="flex items-start gap-3 mb-2.5 last:mb-0 relative">
                <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center text-xs shrink-0 z-10">{icons[e.type] ?? '•'}</div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-xs font-semibold text-moove-brown">{e.label}</div>
                  <div className="text-xs text-moove-muted">{e.sessionTimeLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main DrivingSessions Component ──────────────────────────────────────────

export default function DrivingSessions() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isDemo = user?.id === 'demo'

  const [intervalMins, setIntervalMins] = useState(20)
  const [customInterval, setCustomInterval] = useState('')
  const [useCustomInterval, setUseCustomInterval] = useState(false)
  const [enabledBreakTypes, setEnabledBreakTypes] = useState<Set<string>>(new Set(['traffic', 'parked', 'manual']))
  const [reminderBehavior, setReminderBehavior] = useState<'auto' | 'ask' | 'notify' | 'silent'>('auto')
  const [showConfig, setShowConfig] = useState(false)
  const [showIntervalPicker, setShowIntervalPicker] = useState(false)

  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [sessionElapsed, setSessionElapsed] = useState(0)
  const [drivingElapsed, setDrivingElapsed] = useState(0)
  const [inBreak, setInBreak] = useState(false)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [note, setNote] = useState('')

  const [exercisesCompleted, setExercisesCompleted] = useState(0)
  const [exercisesSkipped, setExercisesSkipped] = useState(0)
  const [exerciseHistory, setExerciseHistory] = useState<CompletedExercise[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [lastReminderAt, setLastReminderAt] = useState(0)

  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([])
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [view, setView] = useState<ViewMode>('main')
  const [activeExerciseId, setActiveExerciseId] = useState<number | null>(null)
  const [exerciseContext, setExerciseContext] = useState<ExerciseContext>('break')
  const [customExerciseDuration, setCustomExerciseDuration] = useState(45)
  const [stagedExerciseId, setStagedExerciseId] = useState<number>(1)
  const [completedBeforeIds, setCompletedBeforeIds] = useState<Set<string>>(new Set())
  const [completedAfterIds, setCompletedAfterIds] = useState<Set<string>>(new Set())
  const [completedBreakIds, setCompletedBreakIds] = useState<Set<number>>(new Set())
  const [lastCompletedEx, setLastCompletedEx] = useState<{ name: string; emoji: string; benefit: string; sets: number; durationPerSet: number; totalDuration: number; completedAt: string } | null>(null)
  const [selectedSets, setSelectedSets] = useState(2)
  const [selectedDurPerSet, setSelectedDurPerSet] = useState(30)
  const [selectedRest, setSelectedRest] = useState(10)
  const [userPrefs, setUserPrefs] = useState<Record<string, string | string[]>>({})
  const [summaryData, setSummaryData] = useState<{
    sessionSecs: number; drivingSecs: number; exercisesCompleted: number
    exercisesSkipped: number; exerciseHistory: CompletedExercise[]; timeline: TimelineEvent[]
  } | null>(null)
  const [activeDbSessionId, setActiveDbSessionId] = useState<string | null>(null)
  const [weeklyDriving, setWeeklyDriving] = useState<WeeklyDriving | null>(null)
  const [weeklyError, setWeeklyError] = useState<string | null>(null)

  const refreshWeeklyDriving = useCallback(async () => {
    if (!user?.id) return
    try { setWeeklyError(null); setWeeklyDriving(await fetchWeeklyDriving(user.id)) } catch (error) { setWeeklyError(error instanceof Error ? error.message : 'Unable to load weekly activity.') }
  }, [user?.id])
  useEffect(() => { void refreshWeeklyDriving() }, [refreshWeeklyDriving])

  useEffect(() => {
    if (!supabase || !user?.id || isDemo) return
    const channel = supabase.channel(`weekly-driving-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driving_sessions', filter: `user_id=eq.${user.id}` }, () => void refreshWeeklyDriving())
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [user?.id, isDemo, refreshWeeklyDriving])

  useEffect(() => {
    if (!user?.id || isDemo) return
    const load = async () => {
      try { setSavedSessions(await fetchRecentSessionsFromDB(user.id, 100)) }
      catch (error) { console.warn('[MOOVE] Could not load session history:', error) }
    }
    void load()
    window.addEventListener('moove:session-saved', load)
    return () => window.removeEventListener('moove:session-saved', load)
  }, [user?.id, isDemo])

  const sessionRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const drivingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const effectiveIntervalSecs = (useCustomInterval && customInterval ? parseInt(customInterval) : intervalMins) * 60
  const recentlyUsedIds = exerciseHistory.slice(-3).map(e => e.exerciseId)

  // Restore persisted session
  useEffect(() => {
    try {
      const raw = localStorage.getItem('moove_active_session')
      if (!raw) return
      const data: ActiveSessionPersist = JSON.parse(raw)
      const bonusSecs = data.sessionState === 'running'
        ? Math.floor((Date.now() - new Date(data.savedAt).getTime()) / 1000) : 0
      setSessionElapsed(data.sessionElapsedAtSave + bonusSecs)
      setDrivingElapsed(data.drivingElapsedAtSave + (data.inBreak ? 0 : bonusSecs))
      setStartedAt(new Date(data.startedAt))
      setExercisesCompleted(data.exercisesCompleted)
      setExercisesSkipped(data.exercisesSkipped)
      setExerciseHistory(data.exerciseHistory)
      setTimeline(data.timeline)
      setLastReminderAt(data.lastReminderAt)
      setIntervalMins(data.intervalMins)
      setNote(data.note)
      setInBreak(data.inBreak)
      setSessionState(data.sessionState)
      if (data.completedBeforeIds) setCompletedBeforeIds(new Set(data.completedBeforeIds))
      if (data.completedAfterIds) setCompletedAfterIds(new Set(data.completedAfterIds))
      if (data.completedBreakIds) setCompletedBreakIds(new Set(data.completedBreakIds))
      if (data.activeDbSessionId) setActiveDbSessionId(data.activeDbSessionId)
    } catch { /* ignore */ }
  }, [])

  // Load personalization preferences and apply reminder_freq
  useEffect(() => {
    if (!user?.email) return
    try {
      const raw = localStorage.getItem(`moove_user_preferences_${user.email}`)
      if (!raw) return
      const prefs = JSON.parse(raw)
      setUserPrefs(prefs)
      const freq = parseInt(prefs.reminder_freq ?? '')
      if (!isNaN(freq) && freq > 0) setIntervalMins(freq)
    } catch { /* ignore */ }
  }, [user?.email])

  // Session timer — always runs while session is active
  useEffect(() => {
    if (sessionState === 'running' && view !== 'session_summary' && view !== 'session_processing') {
      sessionRef.current = setInterval(() => setSessionElapsed(e => e + 1), 1000)
    } else {
      if (sessionRef.current) clearInterval(sessionRef.current)
    }
    return () => { if (sessionRef.current) clearInterval(sessionRef.current) }
  }, [sessionState, view])

  // Driving timer — pauses when in break
  useEffect(() => {
    if (sessionState === 'running' && !inBreak && view !== 'session_summary' && view !== 'session_processing') {
      drivingRef.current = setInterval(() => setDrivingElapsed(e => e + 1), 1000)
    } else {
      if (drivingRef.current) clearInterval(drivingRef.current)
    }
    return () => { if (drivingRef.current) clearInterval(drivingRef.current) }
  }, [sessionState, inBreak, view])

  // Persist session state every 10s
  useEffect(() => {
    if (sessionState === 'idle' || view === 'session_summary' || view === 'session_processing') return
    const id = setInterval(() => {
      const data: ActiveSessionPersist = {
        startedAt: (startedAt ?? new Date()).toISOString(), savedAt: new Date().toISOString(),
        sessionElapsedAtSave: sessionElapsed, drivingElapsedAtSave: drivingElapsed,
        inBreak, exercisesCompleted, exercisesSkipped, exerciseHistory, timeline, lastReminderAt,
        intervalMins, note, sessionState,
        completedBeforeIds: [...completedBeforeIds],
        completedAfterIds: [...completedAfterIds],
        completedBreakIds: [...completedBreakIds],
        activeDbSessionId,
      }
      localStorage.setItem('moove_active_session', JSON.stringify(data))
    }, 10000)
    return () => clearInterval(id)
  }, [sessionState, sessionElapsed, drivingElapsed, inBreak, exercisesCompleted, exercisesSkipped, exerciseHistory, timeline, lastReminderAt, intervalMins, note, startedAt, completedBeforeIds, completedAfterIds, completedBreakIds, activeDbSessionId])

  // Auto break reminder on interval tick.
  // completedBreakIds MUST be in deps — without it the effect captures the initial
  // empty Set and will always recommend already-completed exercises.
  useEffect(() => {
    if (sessionState !== 'running' || reminderBehavior === 'silent' || view !== 'main' || inBreak) return
    if (sessionElapsed > 0 && sessionElapsed % effectiveIntervalSecs === 0 && sessionElapsed !== lastReminderAt) {
      setLastReminderAt(sessionElapsed)
      const tiredAreas = (userPrefs.tired_areas as string[] | undefined) ?? []
      const rec = pickBreakExercise(recentlyUsedIds, tiredAreas, completedBreakIds)
      if (rec) setStagedExerciseId(rec.id)
      setTimeline(t => [...t, { type: 'break_reminder', label: `Break reminder at ${Math.floor(sessionElapsed / 60)} min`, sessionTimeLabel: `At ${formatTime(sessionElapsed)}` }])
      triggerBreakReminder(Math.floor(sessionElapsed / 60))
      if (reminderBehavior === 'auto' || reminderBehavior === 'ask') {
        setInBreak(true)
        setShowRecommendation(true)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionElapsed, sessionState, effectiveIntervalSecs, lastReminderAt, reminderBehavior, view, inBreak, completedBreakIds])

  const handleIntervalChange = useCallback((mins: number, isCustom = false) => {
    setIntervalMins(mins)
    setUseCustomInterval(isCustom)
    setLastReminderAt(sessionElapsed - (sessionElapsed % (mins * 60)))
  }, [sessionElapsed])

  const handleStartSession = useCallback(() => {
    if (sessionRef.current) clearInterval(sessionRef.current)
    if (drivingRef.current) clearInterval(drivingRef.current)
    const now = new Date()
    setSessionElapsed(0); setDrivingElapsed(0); setStartedAt(now)
    setExercisesCompleted(0); setExercisesSkipped(0)
    setExerciseHistory([]); setLastReminderAt(0); setCompletedBreakIds(new Set())
    setInBreak(false); setSessionState('running'); setShowConfig(false)
    setTimeline([{ type: 'started', label: 'Session started', sessionTimeLabel: 'At 00:00' }])
    setView('main')
    // Create the session row in Supabase immediately so real-time exercise
    // completions can reference it. Fire-and-forget; null is handled gracefully.
    if (user?.id && user.id !== 'demo' && user.id !== 'admin-demo') {
      createDrivingSession(user.id, now.toISOString()).then(id => {
        setActiveDbSessionId(id)
        void recordSessionEvent(user.id, id, 'started', 0)
      })
    }
  }, [user?.id])

  const handleEnd = useCallback(() => {
    if (sessionRef.current) clearInterval(sessionRef.current)
    if (drivingRef.current) clearInterval(drivingRef.current)
    const endTime = new Date()
    const risk = getSedentaryRisk(drivingElapsed)
    const cooldownCount = completedAfterIds.size
    const warmupCount = completedBeforeIds.size
    const breakCount = Math.max(0, exercisesCompleted - cooldownCount - warmupCount)
    const healthScore = computeHealthScore(exercisesCompleted, exercisesSkipped, cooldownCount)
    const totalSets = exerciseHistory.filter(e => e.status === 'completed').reduce((sum, e) => sum + (e.sets ?? 0), 0)
    const session: SavedSession = {
      id: `sess_${Date.now()}`,
      date: (startedAt || endTime).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }),
      dateISO: endTime.toISOString().slice(0, 10),
      startTime: (startedAt || endTime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
      endTime: endTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
      duration: formatTime(sessionElapsed), durationSeconds: sessionElapsed,
      drivingSeconds: drivingElapsed, sedentarySeconds: drivingElapsed,
      exercisesCompleted, exercisesSkipped,
      warmupExercises: warmupCount, breakExercises: breakCount, cooldownExercises: cooldownCount,
      calories: Math.round((sessionElapsed / 60) * 1.5),
      avgRisk: risk.level, notes: note, healthScore, totalSets,
    }
    // The completed session is persisted in Supabase; do not maintain a second history in localStorage.
    localStorage.removeItem('moove_active_session')
    // Notify dependent screens only after the authoritative write completes.
    if (user?.id) {
      saveSessionToSupabase(user.id, session, exerciseHistory, activeDbSessionId).then(({ error }) => {
        if (error) console.warn('[MOOVE] Supabase session save failed (local saved):', error)
        else { void refreshWeeklyDriving(); window.dispatchEvent(new CustomEvent('moove:session-saved')) }
      })
      void recordSessionEvent(user.id, activeDbSessionId, 'completed', sessionElapsed, { drivingSeconds: drivingElapsed, exercisesCompleted })
    }
    setActiveDbSessionId(null)
    const finalTimeline: TimelineEvent[] = [...timeline, { type: 'completed', label: 'Session completed', sessionTimeLabel: `At ${formatTime(sessionElapsed)}` }]
    setSummaryData({ sessionSecs: sessionElapsed, drivingSecs: drivingElapsed, exercisesCompleted, exercisesSkipped, exerciseHistory, timeline: finalTimeline })
    setSessionState('idle'); setShowEndConfirm(false)
    setView('session_processing')
  }, [sessionElapsed, drivingElapsed, exercisesCompleted, exercisesSkipped, exerciseHistory, timeline, startedAt, note, completedAfterIds, completedBeforeIds, activeDbSessionId])

  // Demo simulation — immediately triggers break when interval threshold is crossed
  const handleSimulate = (mins: number) => {
    const isStarting = sessionState === 'idle'
    const baseSession = isStarting ? 0 : sessionElapsed
    const baseDriving = isStarting ? 0 : drivingElapsed
    const addSecs = mins * 60
    const newSE = baseSession + addSecs
    const newDE = baseDriving + addSecs

    if (isStarting) {
      setStartedAt(new Date())
      setExercisesCompleted(0); setExercisesSkipped(0)
      setExerciseHistory([]); setLastReminderAt(0); setInBreak(false)
      setTimeline([{ type: 'started', label: 'Session started (demo)', sessionTimeLabel: 'At 00:00' }])
      setSessionState('running')
    }

    setSessionElapsed(newSE)
    setDrivingElapsed(newDE)

    if (reminderBehavior !== 'silent') {
      const prevIntervals = Math.floor(baseSession / effectiveIntervalSecs)
      const newIntervals = Math.floor(newSE / effectiveIntervalSecs)
      if (newIntervals > prevIntervals) {
        const rec = pickBreakExercise(recentlyUsedIds, [], completedBreakIds)
        if (rec) setStagedExerciseId(rec.id)
        setLastReminderAt(newIntervals * effectiveIntervalSecs)
        setTimeout(() => {
          setInBreak(true)
          setShowRecommendation(true)
          setTimeline(t => [...t, {
            type: 'break_reminder',
            label: `Demo: break reminder at ${Math.floor(newSE / 60)} min`,
            sessionTimeLabel: `At ${formatTime(newSE)}`,
          }])
        }, 150)
      }
    }
  }

  const openRecommendation = () => {
    const tiredAreas = (userPrefs.tired_areas as string[] | undefined) ?? []
    const rec = pickBreakExercise(recentlyUsedIds, tiredAreas, completedBreakIds)
    if (rec) setStagedExerciseId(rec.id)
    setInBreak(true)
    setTimeline(t => [...t, { type: 'safely_stopped', label: "I'm Safely Stopped", sessionTimeLabel: `At ${formatTime(sessionElapsed)}` }])
    setShowRecommendation(true)
  }

  const handleAcceptExercise = (exerciseId: number) => {
    setShowRecommendation(false)
    setActiveExerciseId(exerciseId)
    const dur = exercises.find(e => e.id === exerciseId)?.durationSeconds ?? 45
    setCustomExerciseDuration(dur)
    setExerciseContext('break')
    setView('exercise_preview')
  }

  const handleContinueDriving = () => {
    setShowRecommendation(false)
    setInBreak(false)
    setExercisesSkipped(n => n + 1)
    setTimeline(t => [...t, { type: 'exercise_skipped', label: 'Break skipped — continued driving', sessionTimeLabel: `At ${formatTime(sessionElapsed)}` }])
  }

  const handleExerciseTimerDone = () => {
    if (!activeExerciseId) return
    const ex = exercises.find(e => e.id === activeExerciseId)
    if (!ex) return
    const now = new Date().toISOString()

    // Determine context string for DB storage
    const dbContext = exerciseContext === 'before_driving' ? 'before'
      : exerciseContext === 'cooldown' ? 'after'
      : 'break'

    const entry: CompletedExercise = {
      exerciseId: ex.id, name: ex.name, bodyArea: ex.bodyArea,
      durationSeconds: customExerciseDuration, completedAt: now, status: 'completed',
      sets: selectedSets, durationPerSet: selectedDurPerSet, restBetween: selectedRest,
      context: dbContext,
    }
    setExerciseHistory(h => [...h, entry])
    setExercisesCompleted(n => n + 1)
    setLastCompletedEx({ name: ex.name, emoji: ex.emoji, benefit: ex.benefits[0], sets: selectedSets, durationPerSet: selectedDurPerSet, totalDuration: customExerciseDuration, completedAt: now })
    setTimeline(t => [...t, { type: 'exercise_completed', label: `Completed: ${ex.name}`, sessionTimeLabel: `At ${formatTime(sessionElapsed)}` }])

    if (exerciseContext === 'before_driving') {
      setCompletedBeforeIds(s => new Set([...s, String(ex.id)]))
    } else if (exerciseContext === 'cooldown') {
      setCompletedAfterIds(s => new Set([...s, String(ex.id)]))
    } else if (exerciseContext === 'break') {
      setCompletedBreakIds(s => new Set([...s, ex.id]))
    }

    // Persist to Supabase immediately — fire-and-forget; localStorage is already updated
    if (user?.id && user.id !== 'demo' && user.id !== 'admin-demo') {
      recordExerciseCompletion(user.id, activeDbSessionId, {
        exerciseId: ex.id, name: ex.name, bodyArea: ex.bodyArea,
        durationSeconds: customExerciseDuration, completedAt: now, status: 'completed',
        sets: selectedSets, durationPerSet: selectedDurPerSet, restBetween: selectedRest,
        context: dbContext,
      }, dbContext)
      void recordSessionEvent(user.id, activeDbSessionId, 'exercise_completed', sessionElapsed, { exerciseId: ex.id, context: dbContext })
    }

    setView('exercise_complete')
  }

  const handleExerciseSkip = () => {
    if (activeExerciseId) {
      const ex = exercises.find(e => e.id === activeExerciseId)
      if (ex) {
        setExerciseHistory(h => [...h, { exerciseId: ex.id, name: ex.name, bodyArea: ex.bodyArea, durationSeconds: 0, completedAt: new Date().toISOString(), status: 'skipped', sets: 0, durationPerSet: 0, restBetween: 0 }])
        setExercisesSkipped(n => n + 1)
        setTimeline(t => [...t, { type: 'exercise_skipped', label: `Skipped: ${ex.name}`, sessionTimeLabel: `At ${formatTime(sessionElapsed)}` }])
      }
    }
    setActiveExerciseId(null)
    if (exerciseContext === 'before_driving') setView('before_driving')
    else if (exerciseContext === 'cooldown') setView('after_driving')
    else {
      setInBreak(false); setView('main')
      setTimeline(t => [...t, { type: 'driving_resumed', label: 'Driving resumed', sessionTimeLabel: `At ${formatTime(sessionElapsed)}` }])
    }
  }

  const handleDoAnother = () => {
    setActiveExerciseId(null)
    if (exerciseContext === 'before_driving') {
      setView('before_driving')
    } else if (exerciseContext === 'cooldown') {
      setView('after_driving')
    } else {
      const tiredAreas2 = (userPrefs.tired_areas as string[] | undefined) ?? []
      const rec = pickBreakExercise(recentlyUsedIds, tiredAreas2, completedBreakIds)
      if (rec) setStagedExerciseId(rec.id)
      setShowRecommendation(true)
      setView('main')
    }
  }

  const handleExerciseContinue = () => {
    setActiveExerciseId(null)
    if (exerciseContext === 'before_driving') {
      handleStartSession()
    } else if (exerciseContext === 'cooldown') {
      // If summaryData exists (post-session cooldown), return to summary; otherwise end session
      if (summaryData) setView('session_summary')
      else setView('after_driving')
    } else {
      setInBreak(false); setView('main')
      setTimeline(t => [...t, { type: 'driving_resumed', label: 'Driving resumed', sessionTimeLabel: `At ${formatTime(sessionElapsed)}` }])
    }
  }

  const handleSelectBeforeExercise = (ex: ContextExData) => {
    const match = exercises.find(e => e.name === ex.name) ?? exercises[0]
    setActiveExerciseId(match.id)
    setCustomExerciseDuration(match.durationSeconds)
    setExerciseContext('before_driving')
    setView('exercise_preview')
  }

  const handleSelectAfterExercise = (ex: ContextExData) => {
    const match = exercises.find(e => e.name === ex.name && e.contexts.after === 'safe')
      ?? exercises.find(e => e.contexts.after === 'safe')
      ?? exercises[0]
    setActiveExerciseId(match.id)
    setCustomExerciseDuration(match.durationSeconds)
    setExerciseContext('cooldown')
    setView('exercise_preview')
  }

  const toggleBreakType = (id: string) => {
    setEnabledBreakTypes(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  const risk = getSedentaryRisk(drivingElapsed)
  const nextBreakSecs = sessionState !== 'idle' ? Math.max(0, effectiveIntervalSecs - (sessionElapsed % effectiveIntervalSecs)) : 0
  const progressPct = Math.min(100, ((sessionElapsed % effectiveIntervalSecs) / effectiveIntervalSecs) * 100)
  const riskProgressPct = Math.min(100, (Math.floor(drivingElapsed / 60) / 91) * 100)
  const maxDriving = Math.max(...(weeklyDriving?.days.map(d => d.hours) ?? [1]), 1)

  // ── Sub-screen routing ────────────────────────────────────────────────────

  if (view === 'cooldown_prompt') {
    return (
      <CooldownPromptScreen
        exercisesCompleted={exercisesCompleted}
        onStartCooldown={() => { setCompletedAfterIds(new Set()); setView('after_driving') }}
        onSkip={handleEnd}
      />
    )
  }

  if (view === 'session_processing') {
    return <SessionProcessingScreen onComplete={() => setView('session_summary')} />
  }

  if (view === 'session_summary' && summaryData) {
    return (
      <SessionSummaryScreen
        {...summaryData}
        onAfterExercises={() => { setCompletedAfterIds(new Set()); setView('after_driving') }}
        onNavigate={path => navigate(path)}
        onDone={() => setView('main')}
      />
    )
  }

  if (view === 'before_driving') {
    return <BeforeDrivingScreen completedIds={completedBeforeIds} onSkip={handleStartSession} onSelectExercise={handleSelectBeforeExercise} />
  }

  if (view === 'after_driving') {
    return (
      <AfterDrivingScreen
        completedIds={completedAfterIds}
        onFinish={() => {
          if (summaryData) { setView('session_summary'); return }
          handleEnd()
        }}
        onSelectExercise={handleSelectAfterExercise}
      />
    )
  }

  if (view === 'exercise_preview' && activeExerciseId) {
    return (
      <ExercisePreviewScreen
        exerciseId={activeExerciseId}
        onStart={dur => { setCustomExerciseDuration(dur); setView('rep_select') }}
        onBack={() => {
          setActiveExerciseId(null)
          if (exerciseContext === 'before_driving') setView('before_driving')
          else if (exerciseContext === 'cooldown') setView('after_driving')
          else { setInBreak(false); setView('main') }
        }}
      />
    )
  }

  if (view === 'rep_select' && activeExerciseId) {
    return (
      <ExerciseSetupScreen
        exerciseId={activeExerciseId}
        defaultDuration={customExerciseDuration}
        onConfirm={(sets, durPerSet, rest, totalDur) => {
          setSelectedSets(sets); setSelectedDurPerSet(durPerSet); setSelectedRest(rest)
          setCustomExerciseDuration(totalDur); setView('exercise_active')
        }}
        onBack={() => setView('exercise_preview')}
      />
    )
  }

  if (view === 'exercise_active' && activeExerciseId) {
    return (
      <ExerciseTimerScreen
        exerciseId={activeExerciseId}
        sets={selectedSets}
        durationPerSet={selectedDurPerSet}
        restBetween={selectedRest}
        onDone={handleExerciseTimerDone}
        onSkip={handleExerciseSkip}
      />
    )
  }

  if (view === 'exercise_complete' && lastCompletedEx) {
    return (
      <ExerciseCompleteScreen
        exerciseName={lastCompletedEx.name}
        emoji={lastCompletedEx.emoji}
        benefit={lastCompletedEx.benefit}
        context={exerciseContext}
        sets={lastCompletedEx.sets}
        durationPerSet={lastCompletedEx.durationPerSet}
        totalDuration={lastCompletedEx.totalDuration}
        completedAt={lastCompletedEx.completedAt}
        onDoAnother={handleDoAnother}
        onContinue={handleExerciseContinue}
      />
    )
  }

  // ── Main session view ─────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Driving Sessions</h1>
          <p className="text-sm text-moove-muted">Intelligent preventive health companion for drivers.</p>
        </div>
        {sessionState === 'idle' && (
          <button onClick={() => setShowConfig(!showConfig)} className="text-xs font-bold px-3 py-2 rounded-xl bg-white border border-moove-border text-moove-brown hover:bg-moove-cream transition-all card-shadow">
            ⚙️ Configure
          </button>
        )}
      </div>

      {showConfig && sessionState === 'idle' && (
        <div className="bg-white rounded-2xl p-5 card-shadow mb-5 border border-orange-100">
          <div className="text-xs font-bold text-moove-orange mb-4 tracking-wide">SESSION CONFIGURATION</div>
          <div className="mb-5">
            <div className="text-sm font-bold text-moove-brown mb-2">Reminder Interval</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {INTERVAL_PRESETS.map(m => (
                <button key={m} onClick={() => handleIntervalChange(m)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${!useCustomInterval && intervalMins === m ? 'bg-moove-orange text-white border-moove-orange' : 'bg-white text-moove-muted border-moove-border hover:border-orange-200'}`}>
                  {m} min
                </button>
              ))}
              <div className="flex items-center gap-2">
                <button onClick={() => setUseCustomInterval(true)} className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${useCustomInterval ? 'bg-moove-orange text-white border-moove-orange' : 'bg-white text-moove-muted border-moove-border hover:border-orange-200'}`}>Custom</button>
                {useCustomInterval && (
                  <div className="flex items-center gap-1">
                    <input type="number" min="5" max="120" value={customInterval} onChange={e => setCustomInterval(e.target.value)} placeholder="25"
                      className="w-16 px-2 py-1.5 rounded-lg border border-moove-border text-xs text-moove-brown focus:outline-none focus:ring-2 focus:ring-moove-orange/40" />
                    <span className="text-xs text-moove-muted">min</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mb-5">
            <div className="text-sm font-bold text-moove-brown mb-2">Break Contexts</div>
            <div className="flex flex-wrap gap-2">
              {BREAK_TYPES.map(bt => (
                <button key={bt.id} onClick={() => toggleBreakType(bt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${enabledBreakTypes.has(bt.id) ? 'bg-moove-green text-white border-moove-green' : 'bg-white text-moove-muted border-moove-border hover:border-green-200'}`}>
                  {bt.icon} {bt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-moove-brown mb-2">Reminder Behavior</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {REMINDER_BEHAVIORS.map(rb => (
                <button key={rb.id} onClick={() => setReminderBehavior(rb.id as typeof reminderBehavior)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${reminderBehavior === rb.id ? 'border-moove-orange bg-orange-50' : 'border-moove-border bg-white hover:border-orange-200'}`}>
                  <div className={`text-xs font-bold ${reminderBehavior === rb.id ? 'text-moove-orange' : 'text-moove-brown'}`}>{rb.label}</div>
                  <div className="text-xs text-moove-muted mt-0.5">{rb.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-7 card-shadow mb-5">
        <div className="text-center">
          <div className="text-xs font-bold tracking-widest text-moove-muted mb-3">
            {sessionState === 'idle' ? 'READY TO DRIVE' : sessionState === 'running' ? (inBreak ? '🛑 SAFELY STOPPED' : '🔴 SESSION IN PROGRESS') : '⏸ PAUSED'}
          </div>

          <div className="flex items-center justify-center gap-6 mb-2">
            <div className="text-center">
              <div className="font-display font-black text-5xl text-moove-brown tabular-nums">{formatTime(sessionElapsed)}</div>
              <div className="text-xs text-moove-muted mt-1">Session Time</div>
            </div>
            {sessionState !== 'idle' && (
              <>
                <div className="text-moove-muted text-xl font-light">|</div>
                <div className="text-center">
                  <div className="font-display font-black text-3xl tabular-nums" style={{ color: inBreak ? '#9E8B7D' : '#F97316' }}>{formatTime(drivingElapsed)}</div>
                  <div className="text-xs mt-1" style={{ color: inBreak ? '#9E8B7D' : '#F97316' }}>Driving Time{inBreak ? ' (paused)' : ''}</div>
                </div>
              </>
            )}
          </div>

          <p className="text-sm text-moove-muted mb-6">
            {sessionState === 'idle' ? 'Do a warm-up first, or start driving right away.' : sessionState === 'paused' ? 'Session paused — resume when ready.' : inBreak ? 'Driving timer paused while safely stopped.' : 'Drive safe. Moo will remind you to stretch! 🐄'}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-3">
            {sessionState === 'idle' && (
              <>
                <button onClick={() => { setCompletedBeforeIds(new Set()); setView('before_driving') }}
                  className="px-6 py-3.5 rounded-xl bg-orange-100 text-moove-orange font-bold text-sm hover:bg-orange-200 transition-all shadow-sm active:scale-95">
                  🌅 Warm-Up First
                </button>
                <button onClick={handleStartSession} className="bg-moove-green text-white font-bold px-7 py-3.5 rounded-xl hover:bg-green-600 transition-all shadow-md active:scale-95 text-sm">
                  ▶ Start Driving
                </button>
              </>
            )}
            {sessionState === 'running' && (
              <>
                <button onClick={() => {
                  setSessionState('paused')
                  setTimeline(t => [...t, { type: 'paused', label: 'Session paused', sessionTimeLabel: `At ${formatTime(sessionElapsed)}` }])
                }} className="bg-moove-yellow text-white font-bold px-6 py-3.5 rounded-xl hover:bg-yellow-500 transition-all shadow-md active:scale-95 text-sm">
                  ⏸ Pause
                </button>
                <button onClick={() => setShowEndConfirm(true)} className="bg-red-500 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-red-600 transition-all shadow-md active:scale-95 text-sm">
                  ■ End Session
                </button>
              </>
            )}
            {sessionState === 'paused' && (
              <>
                <button onClick={() => {
                  setSessionState('running')
                  setTimeline(t => [...t, { type: 'resumed', label: 'Session resumed', sessionTimeLabel: `At ${formatTime(sessionElapsed)}` }])
                }} className="bg-moove-green text-white font-bold px-6 py-3.5 rounded-xl hover:bg-green-600 transition-all shadow-md active:scale-95 text-sm">
                  ▶ Resume
                </button>
                <button onClick={() => setShowEndConfirm(true)} className="bg-red-500 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-red-600 transition-all shadow-md active:scale-95 text-sm">
                  ■ End Session
                </button>
              </>
            )}
          </div>

          {sessionState === 'running' && !inBreak && (
            <div className="mt-1">
              <button onClick={openRecommendation}
                className="w-full max-w-sm mx-auto flex items-center justify-center gap-2.5 py-4 rounded-2xl font-display font-black text-base text-white shadow-lg active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)' }}>
                <span className="text-xl">🛑</span>
                <span>I'm Safely Stopped</span>
                <span className="text-sm opacity-80">→ Get Exercise</span>
              </button>
              <p className="text-xs text-moove-muted mt-1.5">Tap when stationary to get a preventive exercise recommendation.</p>
            </div>
          )}

          {(sessionState === 'running' || sessionState === 'paused') && (
            <div className="mt-4">
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a route note (optional)…"
                className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-moove-border text-sm text-moove-brown placeholder:text-moove-muted/60 focus:outline-none focus:ring-2 focus:ring-moove-orange/40" />
            </div>
          )}
        </div>

        {sessionState !== 'idle' && (
          <div className="mt-7 pt-6 border-t border-moove-border">
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="text-center">
                <div className="text-xs font-bold text-moove-muted mb-1">EXERCISES DONE</div>
                <div className="font-display font-black text-xl text-moove-green">{exercisesCompleted}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-moove-muted mb-1">NEXT BREAK</div>
                <div className="font-display font-black text-xl text-moove-brown tabular-nums">{formatTime(nextBreakSecs)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-moove-muted mb-1">BREAKS TAKEN</div>
                <div className="font-display font-black text-xl text-moove-brown">{timeline.filter(e => e.type === 'safely_stopped').length}</div>
              </div>
            </div>

            <div className="mb-4">
              <button onClick={() => setShowIntervalPicker(o => !o)} className="flex items-center gap-2 text-xs font-bold text-moove-muted hover:text-moove-orange transition-colors mb-2">
                ⚙️ Break interval: <span className="text-moove-orange">{useCustomInterval && customInterval ? customInterval : intervalMins} min</span>
                <span>{showIntervalPicker ? '▲' : '▼'}</span>
              </button>
              {showIntervalPicker && (
                <div className="flex flex-wrap gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  {INTERVAL_PRESETS.map(m => (
                    <button key={m} onClick={() => { handleIntervalChange(m); setShowIntervalPicker(false) }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${!useCustomInterval && intervalMins === m ? 'bg-moove-orange text-white border-moove-orange' : 'bg-white text-moove-muted border-moove-border hover:border-orange-300'}`}>
                      {m}m
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-5">
              <div className="flex justify-between text-xs font-semibold text-moove-muted mb-1.5">
                <span>Next break</span><span>{Math.round(progressPct)}%</span>
              </div>
              <div className="h-2 bg-orange-50 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: progressPct > 90 ? '#EF4444' : progressPct > 70 ? '#F97316' : '#22C55E' }} />
              </div>
            </div>

            <div className="rounded-2xl p-4 border mb-4" style={{ background: risk.bg, borderColor: `${risk.color}30` }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-xs font-bold text-moove-muted mb-0.5">SEDENTARY RISK</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{risk.icon}</span>
                    <span className="font-display font-black text-xl" style={{ color: risk.color }}>{risk.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-moove-muted">DRIVING TIME</div>
                  <div className="font-display font-black text-lg text-moove-brown">{Math.floor(drivingElapsed / 60)}m</div>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: `${risk.color}20` }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${riskProgressPct}%`, background: risk.color }} />
              </div>
              <p className="text-xs text-moove-muted mb-1">{risk.explanation}</p>
              <p className="text-xs font-semibold" style={{ color: risk.color }}>💡 {risk.recommendation}</p>
            </div>

            {exerciseHistory.length > 0 && (
              <div className="pt-4 border-t border-moove-border">
                <div className="text-xs font-bold text-moove-muted mb-2 tracking-wide">THIS SESSION</div>
                {exerciseHistory.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs mb-1">
                    <span className={e.status === 'completed' ? 'text-moove-green' : 'text-moove-muted'}>{e.status === 'completed' ? '✓' : '⏭'}</span>
                    <span className="text-moove-brown font-semibold flex-1">{e.name}</span>
                    <span className="text-moove-muted">{e.bodyArea}{e.status === 'completed' ? ` · ${e.durationSeconds}s` : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {sessionState !== 'idle' && <TimelineWidget timeline={timeline} />}

      {user && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-5 card-shadow mt-5 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-lg">🧪</div>
            <div>
              <div className="text-xs font-bold text-purple-700 tracking-wide">DEVELOPER TESTING PANEL</div>
              <div className="text-xs text-purple-600">Simulate driving time. Break triggers immediately when thresholds are crossed.</div>
            </div>
          </div>
          <p className="text-xs text-purple-500 mb-3">Start a session above first, then use these buttons to fast-forward time.</p>
          <div className="flex flex-wrap gap-2">
            {[20, 30, 45, 60, 90, 120].map(m => (
              <button key={m} onClick={() => handleSimulate(m)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all active:scale-95 disabled:opacity-40"
                disabled={sessionState === 'idle'}>
                +{m} min
              </button>
            ))}
          </div>
          <p className="text-xs text-purple-400 mt-2">For research testing purposes. Visible to all authenticated users.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h2 className="font-display font-bold text-moove-brown mb-4">Session History</h2>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {savedSessions.length === 0 && (!isDemo || mockSessions.length === 0) ? (
              <div className="py-10 text-center text-sm text-moove-muted">No sessions yet. Start your first session above.</div>
            ) : (
              <>
                {savedSessions.map(s => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-moove-cream hover:bg-orange-50 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="text-xs font-bold text-moove-brown">{s.date}</div>
                        <div className="text-xs text-moove-muted">{s.startTime} → {s.endTime}</div>
                        {s.notes && <div className="text-xs text-moove-muted italic mt-0.5">"{s.notes}"</div>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display font-black text-moove-brown">{s.duration}</div>
                        <div className="text-xs text-moove-green font-semibold">{s.exercisesCompleted} exercises ✓</div>
                        <div className="text-xs font-semibold mt-0.5" style={{ color: getSedentaryRisk(s.sedentarySeconds).color }}>{getSedentaryRisk(s.sedentarySeconds).icon} {s.avgRisk}</div>
                        <div className="text-xs text-purple-500 font-bold">Score: {s.healthScore}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {isDemo && mockSessions.map(s => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="text-xs font-bold text-moove-brown">{s.date}</div>
                        <div className="text-xs text-moove-muted">{s.route}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display font-black text-moove-brown">{s.duration}</div>
                        <div className="text-xs text-moove-green font-semibold">{s.exercises} exercises ✓</div>
                        <div className="text-xs text-blue-500 font-semibold">Demo data</div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h2 className="font-display font-bold text-moove-brown mb-4">Weekly Driving Activity</h2>
          <div className="flex items-end gap-2 h-36">
            {(weeklyDriving?.days ?? []).map(d => (
              <div key={d.label} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="text-xs font-bold text-moove-brown">{d.hours > 0 ? `${d.hours}h` : '0h'}</div>
                <div className="w-full flex flex-col justify-end h-24 bg-orange-50 rounded-lg overflow-hidden">
                  {d.hours > 0 && <div className="w-full rounded-t-lg" style={{ height: `${Math.max(5, (d.hours / maxDriving) * 100)}%`, background: 'linear-gradient(to top, #F97316, #FBBF24)' }} />}
                </div>
                <div className="text-xs text-moove-muted">{d.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-moove-border grid grid-cols-3 gap-3">
            <div className="text-center"><div className="font-display font-black text-xl text-moove-brown">{weeklyDriving?.daysActive ?? '—'}</div><div className="text-xs text-moove-muted">Days Active</div></div>
            <div className="text-center"><div className="font-display font-black text-xl text-moove-brown">{weeklyDriving ? `${(weeklyDriving.totalSeconds / 3600).toFixed(1)}h` : '—'}</div><div className="text-xs text-moove-muted">Total Driving</div></div>
            <div className="text-center"><div className="font-display font-black text-xl text-moove-brown">{weeklyDriving?.exercisesDone ?? '—'}</div><div className="text-xs text-moove-muted">Exercises Done</div></div>
          </div>
          {weeklyError && <p className="mt-3 text-xs text-red-600">{weeklyError}</p>}
        </div>
      </div>

      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-7 w-full max-w-sm card-shadow-lg text-center">
            <div className="text-3xl mb-3">🏁</div>
            <h2 className="font-display font-black text-xl text-moove-brown mb-3">End this session?</h2>
            <div className="flex gap-4 justify-center mb-4">
              <div className="text-center">
                <div className="text-xs text-moove-muted">Session Time</div>
                <div className="font-display font-black text-lg text-moove-brown">{formatTime(sessionElapsed)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-moove-muted">Driving Time</div>
                <div className="font-display font-black text-lg text-moove-orange">{formatTime(drivingElapsed)}</div>
              </div>
            </div>
            <p className="text-sm text-moove-muted mb-5">Exercises completed: <strong>{exercisesCompleted}</strong></p>
            <p className="text-xs text-moove-muted mb-6 bg-green-50 rounded-xl p-3 border border-green-100">✅ Session data and exercise history will be saved automatically.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="flex-1 py-3 rounded-xl border border-moove-border text-sm font-bold text-moove-muted hover:bg-moove-cream transition-all">Keep Going</button>
              <button onClick={() => { setShowEndConfirm(false); setView('cooldown_prompt') }} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all active:scale-95">End Session</button>
            </div>
          </div>
        </div>
      )}

      {showRecommendation && (
        <RecommendationModal
          elapsed={sessionElapsed}
          stagedExerciseId={stagedExerciseId}
          completedBreakIds={completedBreakIds}
          onAccept={handleAcceptExercise}
          onContinue={handleContinueDriving}
        />
      )}
    </div>
  )
}
