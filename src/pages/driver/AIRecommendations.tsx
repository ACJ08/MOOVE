import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { exercises } from '@/data/exercises'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'
import { fetchWeeklyExerciseCounts } from '@/services/analyticsService'
import { fetchInsightInput } from '@/services/analyticsService'
import { fetchWellnessSummary } from '@/services/ai/wellness'

// ─── Types ────────────────────────────────────────────────────────────────────
interface SavedSession {
  id: string; date: string; durationSeconds: number; drivingSeconds: number
  exercisesCompleted: number; exercisesSkipped: number; healthScore: number
}

interface UserPreferences {
  driver_type?: string; daily_hours?: string; drive_times?: string[]
  tired_areas?: string[]; reminder_freq?: string; warmup_pref?: string
}

interface AIInsight {
  id: string; icon: string; color: string; badge: string
  title: string; message: string; why?: string; actionLabel?: string; actionHref?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseHours(s: SavedSession) { return s.drivingSeconds / 3600 }

function sessionDaysAgo(s: SavedSession): number {
  const d = new Date(s.date).getTime()
  return Math.floor((Date.now() - d) / 86400000)
}

function formatHoursMin(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

const AREA_EXERCISE_MAP: Record<string, number[]> = {
  neck: [1, 2],        // Chin Tuck, Upper Trap
  shoulders: [3, 2],   // Shoulder Rolls, Upper Trap
  upper_back: [3, 9],  // Shoulder Rolls, Lateral Lumbar
  lower_back: [5, 9],  // Figure-4, Lateral Lumbar
  hips: [5, 7],        // Figure-4, Hip Flexor
  knees: [10, 7],      // Knee Extension, Hip Flexor
  calves: [6],         // Heel Raise
  ankles: [6],         // Heel Raise
  wrists: [4],         // Wrist Flexor
  eyes: [8],           // 20-20-20
}

const DRIVER_TYPE_LABELS: Record<string, string> = {
  private_car: 'private car driver', ride_hailing: 'ride-hailing driver',
  taxi: 'taxi driver', delivery: 'delivery driver', truck: 'truck driver',
  bus: 'bus driver', van: 'van driver', other: 'driver',
}

const HOURS_LABELS: Record<string, string> = {
  lt1: 'under 1 hour', '1_2': '1–2 hours', '3_4': '3–4 hours',
  '5_6': '5–6 hours', '7plus': '7+ hours',
}

// ─── AI Engine ────────────────────────────────────────────────────────────────
function generateInsights(
  sessions: SavedSession[],
  prefs: UserPreferences,
  isDemo: boolean,
): AIInsight[] {
  if (isDemo) return MOCK_INSIGHTS

  const now = new Date()
  const hour = now.getHours()
  const insights: AIInsight[] = []

  const last7 = sessions.filter(s => sessionDaysAgo(s) <= 7)
  const last30 = sessions.filter(s => sessionDaysAgo(s) <= 30)
  const todaySessions = sessions.filter(s => sessionDaysAgo(s) === 0)

  const totalDrivingWeek = last7.reduce((a, s) => a + s.drivingSeconds, 0)
  const totalExWeek = last7.reduce((a, s) => a + s.exercisesCompleted, 0)
  const avgHealthScore = last7.length
    ? Math.round(last7.reduce((a, s) => a + (s.healthScore || 70), 0) / last7.length)
    : 0

  const streak = calcStreak(sessions)
  const todayDriving = todaySessions.reduce((a, s) => a + s.drivingSeconds, 0)
  const driverLabel = DRIVER_TYPE_LABELS[prefs.driver_type || ''] || 'driver'
  const tiredAreas = prefs.tired_areas ?? []

  // ── 1. Behavioral Summary ──────────────────────────────────────────────────
  if (last7.length > 0) {
    const skippedWeek = last7.reduce((a, s) => a + s.exercisesSkipped, 0)
    const compRate = totalExWeek + skippedWeek > 0
      ? Math.round((totalExWeek / (totalExWeek + skippedWeek)) * 100)
      : 0

    insights.push({
      id: 'summary',
      icon: '📊',
      color: '#0EA5E9',
      badge: 'Weekly Behavioral Summary',
      title: 'Your Week in Review',
      message: `You drove ${formatHoursMin(totalDrivingWeek)} this week across ${last7.length} session${last7.length !== 1 ? 's' : ''}, completing ${totalExWeek} exercise${totalExWeek !== 1 ? 's' : ''}${compRate > 0 ? ` (${compRate}% completion rate)` : ''}. ${
        avgHealthScore >= 75 ? 'Your health engagement score is strong — keep it up!' :
        avgHealthScore >= 55 ? 'Your engagement is building — try completing one more exercise per session.' :
        'Completing even one exercise per session can significantly reduce driving-related fatigue.'
      }`,
      why: 'Moo tracks your weekly driving time and exercise history to identify patterns and surface actionable insights.',
    })
  }

  // ── 2. Today's Context-Aware Recommendation ───────────────────────────────
  const timeContext = hour < 7 ? 'early morning' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night'

  let todayMsg = ''
  let todayWhy = ''
  let suggestedExId: number | null = null

  if (todayDriving >= 5400) {
    // 90+ min today — recommend a break exercise based on tired areas
    const areaKey = tiredAreas.find(a => AREA_EXERCISE_MAP[a])
    suggestedExId = areaKey ? (AREA_EXERCISE_MAP[areaKey][0] ?? 1) : 3
    const ex = exercises.find(e => e.id === suggestedExId)
    todayMsg = `You've already driven ${formatHoursMin(todayDriving)} today. As a ${driverLabel}, this is when ${tiredAreas.length > 0 ? tiredAreas[0].replace('_', ' ') : 'muscle'} tension typically builds up. Moo recommends a quick ${ex?.name ?? 'Shoulder Roll'} to refresh before your next trip.`
    todayWhy = `Based on your reported tired areas and today's driving duration, ${ex?.name ?? 'this exercise'} directly targets the muscles most stressed in your driving context.`
  } else if (todayDriving > 0) {
    const areaKey = tiredAreas.find(a => AREA_EXERCISE_MAP[a])
    suggestedExId = areaKey ? (AREA_EXERCISE_MAP[areaKey][0] ?? 8) : 8
    const ex = exercises.find(e => e.id === suggestedExId)
    todayMsg = `Good ${timeContext}! You've driven ${formatHoursMin(todayDriving)} so far today. Consider a ${ex?.name ?? '20-20-20 Eye Reset'} the next time you're safely stopped — your ${tiredAreas.includes('eyes') ? 'eyes' : 'body'} will thank you.`
    todayWhy = 'Moo tracks your daily driving accumulation and recommends exercises timed to when your body needs them most.'
  } else {
    // No driving today
    const ex = exercises.find(e => e.id === (tiredAreas.includes('eyes') ? 8 : tiredAreas.includes('neck') ? 1 : 3))
    const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
    todayMsg = `${greet}! No driving sessions recorded today yet. ${last30.length > 0 ? `When you hit the road, Moo will be ready with personalized break reminders every ${prefs.reminder_freq === '60' ? 'hour' : (prefs.reminder_freq ?? '30') + ' minutes'}.` : "Start your first driving session to activate your personalized movement reminders."}`
    todayWhy = `Your preferred reminder interval is every ${prefs.reminder_freq ?? '30'} minutes — Moo will prompt you at the right moment.`
    suggestedExId = ex?.id ?? null
  }

  insights.push({
    id: 'today',
    icon: '🤖',
    color: '#A855F7',
    badge: "Moo's Recommendation",
    title: "Today's Personalized Recommendation",
    message: todayMsg,
    why: todayWhy,
    ...(suggestedExId ? { actionLabel: 'Try This Exercise', actionHref: '/driver/exercises' } : {}),
  })

  // ── 3. Streak & Encouragement ─────────────────────────────────────────────
  if (streak >= 3) {
    insights.push({
      id: 'streak',
      icon: '🔥',
      color: '#F97316',
      badge: 'Great Consistency!',
      title: `${streak}-Day Movement Streak`,
      message: `Incredible! You've completed at least one exercise for ${streak} consecutive days. Drivers who maintain a 3+ day streak report 40% less driving-related discomfort within two weeks. You're building a real healthy driving habit.`,
      why: 'Consistent micro-movement — even just one exercise per day — is more effective than longer, infrequent sessions for managing sedentary health risk.',
    })
  } else if (sessions.length > 0 && streak === 0) {
    const lastActive = sessions[0] ? sessionDaysAgo(sessions[0]) : null
    insights.push({
      id: 'streak',
      icon: '💫',
      color: '#F97316',
      badge: 'Streak Opportunity',
      title: 'Start Your Movement Streak Today',
      message: `${lastActive !== null && lastActive <= 3 ? `You last completed an exercise ${lastActive === 1 ? 'yesterday' : `${lastActive} days ago`}. ` : ''}Complete one exercise today to start your streak. Even a 30-second Shoulder Roll counts — Moo will track it.`,
      why: 'Streak tracking leverages behavioral science to encourage daily micro-movement through positive reinforcement.',
    })
  } else if (sessions.length === 0) {
    insights.push({
      id: 'streak',
      icon: '🌱',
      color: '#22C55E',
      badge: 'Getting Started',
      title: 'Your Journey Starts Here',
      message: "Complete your first driving session to unlock personalized behavioral insights, weekly summaries, and Moo's AI coaching based on your actual driving patterns.",
      why: 'Moo needs at least one session to begin personalizing recommendations for you.',
      actionLabel: 'Start a Session', actionHref: '/driver/sessions',
    })
  }

  // ── 4. Tired Area Insight ─────────────────────────────────────────────────
  if (tiredAreas.length > 0 && !tiredAreas.includes('none')) {
    const primaryArea = tiredAreas[0]
    const exIds = AREA_EXERCISE_MAP[primaryArea] ?? []
    const ex = exIds.length > 0 ? exercises.find(e => e.id === exIds[0]) : null
    const areaLabel = primaryArea.replace('_', ' ')

    if (ex) {
      insights.push({
        id: 'area_insight',
        icon: '💡',
        color: '#22C55E',
        badge: 'Personalized Insight',
        title: `Targeting Your ${areaLabel.charAt(0).toUpperCase() + areaLabel.slice(1)} Discomfort`,
        message: `During onboarding you reported ${areaLabel} tension after driving. Moo has prioritized exercises that directly address this — including ${ex.name}. ${ex.whyDriversNeedIt}`,
        why: `Your personalization profile flags ${areaLabel} as a primary discomfort area. Moo surfaces ${ex.name} as a priority recommendation in your break reminders.`,
        actionLabel: 'View Exercise', actionHref: '/driver/exercises',
      })
    }
  }

  // ── 5. Long-Session Safety Insight ───────────────────────────────────────
  const prefs_hours = prefs.daily_hours
  if (prefs_hours === '5_6' || prefs_hours === '7plus') {
    const threshold = prefs_hours === '7plus' ? 7 : 5
    insights.push({
      id: 'safety',
      icon: '⚠️',
      color: '#FBBF24',
      badge: 'Sedentary Risk Alert',
      title: `High-Duration Driver Profile`,
      message: `As a ${driverLabel} who drives ${HOURS_LABELS[prefs_hours] ?? 'several hours'} daily, you're in the highest sedentary risk category. The WHO recommends a movement break every 45–60 minutes. Moo has set your reminders to ${prefs.reminder_freq === 'custom' ? 'your custom interval' : `every ${prefs.reminder_freq ?? 30} minutes`} to help offset this risk.`,
      why: 'Extended vehicle-based sedentary time increases cardiovascular risk, lower back compression, and hip flexor shortening more rapidly than desk-based sitting.',
      actionLabel: 'Read More', actionHref: '/driver/education',
    })
  }

  // ── 6. Weekly Progress ────────────────────────────────────────────────────
  if (last30.length >= 3) {
    const prev7 = sessions.filter(s => { const d = sessionDaysAgo(s); return d > 7 && d <= 14 })
    const exPrev = prev7.reduce((a, s) => a + s.exercisesCompleted, 0)
    const delta = totalExWeek - exPrev
    insights.push({
      id: 'progress',
      icon: '📈',
      color: '#0EA5E9',
      badge: 'Progress Insight',
      title: delta >= 0 ? 'Exercise Consistency Improving' : 'Let\'s Pick Up the Pace',
      message: delta >= 1
        ? `You completed ${delta} more exercise${delta !== 1 ? 's' : ''} this week compared to last week. Steady improvement is exactly the behavioral pattern Moo is designed to support. Your body is adapting.`
        : delta === 0
        ? `Your exercise count is consistent with last week (${totalExWeek} exercise${totalExWeek !== 1 ? 's' : ''}). Consistency is valuable — try adding one extra break exercise this week to keep progressing.`
        : `Exercise completions were slightly lower this week. Busy weeks happen! Try enabling warm-up exercises before each session — they take under 2 minutes and make a measurable difference.`,
      why: 'Week-over-week comparison helps identify behavioral trends and provides meaningful feedback to reinforce positive habit formation.',
    })
  }

  return insights.slice(0, 6)
}

function calcStreak(sessions: SavedSession[]): number {
  if (sessions.length === 0) return 0
  const days = new Set(sessions.filter(s => s.exercisesCompleted > 0).map(s => s.date.slice(0, 10)))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (days.has(d.toISOString().slice(0, 10))) streak++
    else if (i > 0) break
  }
  return streak
}

// ─── Mock data for demo user ──────────────────────────────────────────────────
const MOCK_INSIGHTS: AIInsight[] = [
  {
    id: 'm1', icon: '📊', color: '#0EA5E9', badge: 'Weekly Behavioral Summary',
    title: 'Your Week in Review',
    message: "You drove 12.4 hours this week across 5 sessions — above your weekly average of 9.8 hours. Your longest session was 2 hours 25 minutes on Wednesday. You completed 8 exercises with an 80% completion rate. Your health engagement score is 84 — excellent!",
    why: 'Moo aggregates your weekly driving and exercise data to surface patterns and trends you might miss day-to-day.',
  },
  {
    id: 'm2', icon: '🤖', color: '#A855F7', badge: "Moo's Recommendation",
    title: "Today's Personalized Recommendation",
    message: "You've already driven 90 minutes today. As a private car driver, this is when shoulder and upper trapezius tension typically peaks from sustained steering wheel grip. Moo recommends a quick Shoulder Roll break the next time you're safely stopped.",
    why: "Based on your onboarding profile (shoulders & neck as tired areas) and today's 90-minute driving session, Shoulder Rolls directly target your most stressed muscle groups.",
    actionLabel: 'Try This Exercise', actionHref: '/driver/exercises',
  },
  {
    id: 'm3', icon: '🔥', color: '#F97316', badge: 'Great Consistency!',
    title: '5-Day Movement Streak',
    message: "Amazing! You've completed at least one exercise for 5 consecutive days. Drivers who maintain a 3+ day streak report 40% less driving-related musculoskeletal discomfort within two weeks. You're building a real healthy driving habit.",
    why: 'Streak tracking leverages behavioral science — daily completion, even one micro-exercise, creates compounding preventive health benefits over time.',
  },
  {
    id: 'm4', icon: '💡', color: '#22C55E', badge: 'Personalized Insight',
    title: 'Targeting Your Shoulder Discomfort',
    message: "During onboarding you reported shoulder tension after driving. Moo has prioritized exercises targeting your upper trapezius and scapular stabilizers — including Shoulder Rolls and Upper Trapezius Stretches. These are now your primary break recommendations.",
    why: 'Your personalization profile flags shoulders as a primary discomfort area. Moo surfaces targeted exercises as a priority in your break reminders.',
    actionLabel: 'View Exercise', actionHref: '/driver/exercises',
  },
  {
    id: 'm5', icon: '⚠️', color: '#FBBF24', badge: 'Sedentary Risk Alert',
    title: 'High-Duration Driver Profile',
    message: "As a driver who logs 3–4 hours daily, you're in a moderate-to-high sedentary risk bracket. The WHO recommends a movement break every 45–60 minutes. Moo has set your reminders to every 30 minutes to help offset this risk and protect your lower back and hip flexors.",
    why: 'Extended vehicle-based sedentary time increases cardiovascular risk and lower back compression more rapidly than desk-based sitting.',
    actionLabel: 'Read More', actionHref: '/driver/education',
  },
  {
    id: 'm6', icon: '📈', color: '#0EA5E9', badge: 'Progress Insight',
    title: 'Exercise Consistency Improving',
    message: "You completed 3 more exercises this week compared to last week (8 vs 5). Steady improvement is exactly the behavioral pattern Moo is designed to support. At this rate, you'll reach your weekly target of 10 exercises by Thursday.",
    why: 'Week-over-week comparison helps identify behavioral trends and provides meaningful feedback to reinforce positive habit formation.',
  },
]

// ─── Color map ────────────────────────────────────────────────────────────────
const COLOR_BG: Record<string, string> = {
  '#0EA5E9': 'bg-blue-50 border-blue-100',
  '#A855F7': 'bg-purple-50 border-purple-100',
  '#F97316': 'bg-orange-50 border-orange-100',
  '#22C55E': 'bg-green-50 border-green-100',
  '#FBBF24': 'bg-yellow-50 border-yellow-100',
}

// ─── Weekly Bar Chart (real data) ─────────────────────────────────────────────
function WeeklyChart({ counts }: { counts: number[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = (new Date().getDay() + 6) % 7
  const data = days.map((label, i) => ({ label, exercises: counts[i] ?? 0, isToday: i === today }))
  const maxEx = Math.max(...data.map(d => d.exercises), 1)

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow">
      <h2 className="font-display font-bold text-moove-brown mb-1">Weekly Exercise Consistency</h2>
      <p className="text-xs text-moove-muted mb-4">Exercises completed per day this week</p>
      <div className="flex items-end gap-2 h-28">
        {data.map(d => (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
            <div className="text-xs font-bold text-moove-brown">{d.exercises}</div>
            <div className="w-full flex flex-col justify-end h-16 bg-purple-50 rounded-lg overflow-hidden relative">
              {d.exercises > 0 && (
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{ height: `${(d.exercises / maxEx) * 100}%`, background: d.isToday ? '#F97316' : '#A855F7' }}
                />
              )}
              {d.isToday && d.exercises === 0 && (
                <div className="absolute inset-0 border-2 border-dashed border-orange-200 rounded-lg" />
              )}
            </div>
            <div className={`text-xs ${d.isToday ? 'text-moove-orange font-bold' : 'text-moove-muted'}`}>{d.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-moove-muted">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400 inline-block" /> Today</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-500 inline-block" /> Other days</span>
      </div>
    </div>
  )
}

// ─── Insight Card ─────────────────────────────────────────────────────────────
function InsightCard({ insight }: { insight: AIInsight }) {
  return (
    <div className={`rounded-2xl p-5 border ${COLOR_BG[insight.color] || 'bg-white border-moove-border'} card-shadow`}>
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `${insight.color}20` }}
        >
          {insight.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black tracking-widest mb-1" style={{ color: insight.color }}>
            {insight.badge.toUpperCase()}
          </div>
          <div className="font-bold text-sm text-moove-brown mb-1.5">{insight.title}</div>
          <p className="text-sm text-moove-muted leading-relaxed">{insight.message}</p>
          {insight.why && (
            <div className="mt-3 flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2">
              <span className="text-xs shrink-0" style={{ color: insight.color }}>💭</span>
              <p className="text-xs leading-relaxed" style={{ color: insight.color }}>
                <span className="font-bold">Why Moo says this: </span>{insight.why}
              </p>
            </div>
          )}
          {insight.actionLabel && insight.actionHref && (
            <a
              href={insight.actionHref}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: `${insight.color}15`, color: insight.color }}
            >
              {insight.actionLabel} →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AIRecommendations() {
  const { user } = useAuth()
  const isDemo = user?.id === 'demo'
  const [sessionVersion, setSessionVersion] = useState(0)
  const [sessions, setSessions] = useState<SavedSession[]>([])
  const [prefs, setPrefs] = useState<UserPreferences>({})
  const [weeklyExerciseCounts, setWeeklyExerciseCounts] = useState<number[]>(Array(7).fill(0))
  const [weeklyChartError, setWeeklyChartError] = useState<string | null>(null)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  useEffect(() => {
    const handler = () => setSessionVersion(v => v + 1)
    window.addEventListener('moove:session-saved', handler)
    return () => window.removeEventListener('moove:session-saved', handler)
  }, [])

  useEffect(() => { let active = true; const load = async () => { try { const input = await fetchInsightInput(user?.id ?? ''); if (active) { setSessions(input.sessions); setPrefs(input.prefs) } } catch { if (active) { setSessions([]); setPrefs({}) } } }; void load(); return () => { active = false } }, [user?.id, sessionVersion])

  useEffect(() => {
    let active = true
    const load = async () => { try { setWeeklyChartError(null); const counts = await fetchWeeklyExerciseCounts(user?.id ?? ''); if (active) setWeeklyExerciseCounts(counts) } catch (error) { if (active) setWeeklyChartError(error instanceof Error ? error.message : 'Unable to load weekly exercise consistency.') } }
    void load(); window.addEventListener('moove:session-saved', load)
    return () => { active = false; window.removeEventListener('moove:session-saved', load) }
  }, [user?.id])

  const last7 = sessions.filter(s => {
    const d = new Date(s.date).getTime()
    return (Date.now() - d) / 86400000 <= 7
  })

  const totalExWeek = last7.reduce((a, s) => a + s.exercisesCompleted, 0)
  const streak = useMemo(() => calcStreak(sessions), [sessions])
  const avgHealthScore = last7.length
    ? Math.round(last7.reduce((a, s) => a + (s.healthScore || 70), 0) / last7.length)
    : 0

  useEffect(() => {
    if (isDemo || sessions.length === 0) { setAiSummary(null); return }
    const completedExercises = last7.reduce((sum, session) => sum + session.exercisesCompleted, 0)
    const skipped = last7.reduce((sum, session) => sum + session.exercisesSkipped, 0)
    void fetchWellnessSummary({
      weeklyDrivingMinutes: Math.round(last7.reduce((sum, session) => sum + session.drivingSeconds, 0) / 60),
      completedExercises, completedSessions: last7.length,
      exerciseCompletionRate: completedExercises + skipped ? Math.round((completedExercises / (completedExercises + skipped)) * 100) : 0,
      tiredAreas: Array.isArray(prefs.tired_areas) ? prefs.tired_areas : [],
    }).then(result => setAiSummary(result.summary)).catch(() => setAiSummary(null))
  }, [isDemo, sessions, prefs.tired_areas])

  const insights = useMemo(() => generateInsights(sessions, prefs, isDemo), [sessions, prefs, isDemo])
  const displayStreak = isDemo ? 5 : streak
  const displayExWeek = isDemo ? 11 : totalExWeek
  const displayHealthScore = isDemo ? 84 : avgHealthScore

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-moove-brown mb-1">AI Recommendations</h1>
        <p className="text-sm text-moove-muted">Personalized insights from your AI health companion, Moo.</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <span className="shrink-0 text-amber-500 mt-0.5">⚕️</span>
        <div className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">Preventive Wellness Only: </span>
          All recommendations are preventive wellness guidance, not medical advice. MOOVE does not diagnose conditions, prescribe medication, or provide clinical treatment. Moo's AI selects only from MOOVE's validated exercise library — it never recommends outside it. Consult a healthcare professional for medical concerns.
        </div>
      </div>

      {/* Moo hero card */}
      <div className="bg-white rounded-3xl p-6 card-shadow mb-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)' }} />
            <img src={mascotImg} alt="Moo" className="w-20 h-20 object-contain relative z-10 animate-float" />
          </div>
          <div>
            <div className="font-display font-black text-xl text-moove-brown mb-1">Hi, I'm Moo! 🐄</div>
            <p className="text-sm text-moove-muted leading-relaxed">
              I analyze your driving sessions and sedentary patterns to give you personalized, context-aware preventive health recommendations — right when you need them most.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['Rule-based engine', 'Context-aware', 'Safety-first', 'No medical advice'].map(tag => (
                <span key={tag} className="text-xs font-semibold bg-orange-50 text-moove-orange px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 pt-5 border-t border-moove-border grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="font-display font-black text-2xl text-moove-orange">{displayExWeek}</div>
            <div className="text-xs text-moove-muted">Exercises This Week</div>
          </div>
          <div className="text-center">
            <div className="font-display font-black text-2xl text-moove-green">{displayStreak}</div>
            <div className="text-xs text-moove-muted">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="font-display font-black text-2xl text-moove-purple">{displayHealthScore > 0 ? `${displayHealthScore}%` : '—'}</div>
            <div className="text-xs text-moove-muted">Health Score</div>
          </div>
        </div>
      </div>

      {aiSummary && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-6">
          <div className="text-xs font-bold text-moove-purple mb-2 tracking-wide">AI WELLNESS SUMMARY</div>
          <p className="text-sm text-moove-brown leading-relaxed">{aiSummary}</p>
        </div>
      )}

      {/* How Moo's AI Works */}
      <div className="bg-white rounded-2xl p-5 card-shadow mb-6">
        <h2 className="font-display font-bold text-moove-brown mb-3">How Moo's AI Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '📋', title: 'Rule-Based Engine', desc: 'Selects exercises from the validated library based on your driving context, duration, and discomfort areas.' },
            { icon: '🧠', title: 'AI Personalization', desc: 'Generates behavioral summaries, coaching messages, and progress insights tailored to your session history.' },
            { icon: '🎯', title: 'Onboarding Profile', desc: 'Uses your setup preferences — driver type, tired areas, reminder frequency — to prioritize recommendations.' },
            { icon: '🚫', title: 'What AI Does Not Do', desc: 'Moo never diagnoses medical conditions, recommends outside the validated exercise library, or replaces clinical care.' },
          ].map(item => (
            <div key={item.title} className="flex gap-3 p-3 bg-moove-cream/60 rounded-xl">
              <span className="text-lg shrink-0">{item.icon}</span>
              <div>
                <div className="text-xs font-bold text-moove-brown mb-0.5">{item.title}</div>
                <div className="text-xs text-moove-muted leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight cards */}
      <div className="flex flex-col gap-4 mb-6">
        {insights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {/* Weekly chart */}
      <WeeklyChart counts={weeklyExerciseCounts} />
      {weeklyChartError && <p className="mt-2 text-xs text-red-600">{weeklyChartError}</p>}
    </div>
  )
}
