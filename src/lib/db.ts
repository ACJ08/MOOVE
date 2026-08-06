/**
 * db.ts — Centralized Supabase database operations for MOOVE.
 * Supabase is the durable source of truth. Browser state is UI-only.
 */
import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionRecord {
  id: string
  dateISO: string
  startTime: string
  endTime: string
  date: string
  duration: string
  durationSeconds: number
  drivingSeconds: number
  sedentarySeconds: number
  exercisesCompleted: number
  exercisesSkipped: number
  warmupExercises: number
  breakExercises: number
  cooldownExercises: number
  calories: number
  avgRisk: string
  notes: string
  healthScore: number
  totalSets: number
}

export interface ExerciseHistoryEntry {
  exerciseId: number
  name: string
  bodyArea: string
  durationSeconds: number
  completedAt: string
  status: 'completed' | 'skipped' | 'partial'
  sets: number
  durationPerSet: number
  restBetween: number
  context?: string
}

export interface DashboardStats {
  todayDrivingSeconds: number
  weeklyDrivingSeconds: number
  movementStreak: number
  exercisesCompleted: number
  caloriesBurned: number
  wellnessScore: number
  stressTrend: number[]  // last 7 days, 1-5
  weeklyActivity: { day: string; driving: number }[]
  recentSessions: SessionRecord[]
  totalSessions?: number
  bestStreak?: number
  totalExercises?: number
}

export interface OnboardingAnswers { driver_type: string; daily_hours: string; drive_times: string[]; tired_areas: string[]; reminder_freq: string; reminder_style: string; warmup_pref: string; notifications: string }

export async function saveOnboarding(userId: string, answers: OnboardingAnswers): Promise<void> {
  if (!supabase || userId === 'demo' || userId === 'admin-demo') return
  const interval = Number.parseInt(answers.reminder_freq, 10)
  const [{ error: profileError }, { error: preferencesError }, { error: driverError }] = await Promise.all([
    supabase.from('profiles').update({ onboarding_complete: true, vehicle_type: answers.driver_type }).eq('id', userId),
    supabase.from('user_preferences').upsert({ user_id: userId, reminder_interval: Number.isFinite(interval) ? String(interval) : '30', tired_areas: answers.tired_areas, reminder_style: answers.reminder_style, warmup_pref: answers.warmup_pref, notifications_enabled: answers.notifications === 'yes' }, { onConflict: 'user_id' }),
    supabase.from('driver_profiles').upsert({ user_id: userId, driver_type: answers.driver_type, daily_driving_hours: answers.daily_hours, driving_schedule: answers.drive_times, problem_areas: answers.tired_areas, reminder_interval_minutes: Number.isFinite(interval) ? interval : null, reminder_style: answers.reminder_style, warmup_preference: answers.warmup_pref, smart_notifications_enabled: answers.notifications === 'yes', completed_at: new Date().toISOString() }, { onConflict: 'user_id' }),
  ])
  const error = profileError || preferencesError || driverError
  if (error) throw new Error(error.message)
}

export async function recordSessionEvent(userId: string, sessionId: string | null, eventType: string, elapsedSeconds: number, payload: Record<string, unknown> = {}): Promise<void> {
  if (!supabase || !sessionId || userId === 'demo' || userId === 'admin-demo') return
  const { error } = await supabase.from('session_events').insert({ session_id: sessionId, user_id: userId, event_type: eventType, elapsed_seconds: elapsedSeconds, payload })
  if (error) throw new Error(error.message)
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadLocalSessions(): SessionRecord[] {
  try { return JSON.parse(localStorage.getItem('moove_session_history') || '[]') } catch { return [] }
}

function localDateKey(value: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}

function completedSessionFromRow(row: any): SessionRecord {
  const startedAt = new Date(row.started_at)
  const drivingSeconds = row.driving_seconds ?? row.duration_seconds ?? 0
  return {
    id: row.id, dateISO: localDateKey(startedAt),
    date: startedAt.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }),
    startTime: startedAt.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
    endTime: row.ended_at ? new Date(row.ended_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—',
    duration: formatDuration(row.duration_seconds ?? 0), durationSeconds: row.duration_seconds ?? 0,
    drivingSeconds, sedentarySeconds: row.sedentary_seconds ?? drivingSeconds,
    exercisesCompleted: row.exercises_completed ?? 0, exercisesSkipped: row.exercises_skipped ?? 0,
    warmupExercises: row.warmup_exercises ?? 0, breakExercises: row.breaks_taken ?? 0,
    cooldownExercises: row.cooldown_exercises ?? 0, calories: Number(row.calories ?? 0),
    avgRisk: row.avg_sedentary_risk ?? 'Low', notes: row.note ?? '', healthScore: row.health_score ?? 0,
    totalSets: row.total_sets ?? 0,
  }
}

// ─── Create a partial session at start ───────────────────────────────────────
// Inserts a driving_sessions row immediately when a session begins so that
// real-time exercise completions can reference it via session_id.
// Returns the new row's UUID, or null for demo/offline users.

export async function createDrivingSession(
  userId: string,
  startedAt: string,
): Promise<string | null> {
  if (!supabase || userId === 'demo' || userId === 'admin-demo') return null
  try {
    const { data, error } = await supabase
      .from('driving_sessions')
      .insert({ user_id: userId, started_at: startedAt })
      .select('id')
      .single()
    if (error) {
      console.warn('[MOOVE DB] createDrivingSession failed:', error.message)
      return null
    }
    return data?.id ?? null
  } catch { return null }
}

// ─── Record a single exercise completion in real-time ─────────────────────────
// Called immediately after the user finishes an exercise timer.
// context: 'before' | 'after' | 'break' | 'traffic' | 'parked'
// Idempotent: duplicate (session_id, exercise_id, context) rows are harmless;
// the UI prevents double-starts via the completed state.

export async function recordExerciseCompletion(
  userId: string,
  sessionId: string | null,
  entry: ExerciseHistoryEntry,
  context: string,
): Promise<void> {
  if (!supabase || userId === 'demo' || userId === 'admin-demo') return
  try {
    const { error } = await supabase.from('exercise_history').insert({
      user_id: userId,
      session_id: sessionId ?? null,
      exercise_id: entry.exerciseId,
      exercise_name: entry.name,
      body_area: entry.bodyArea,
      sets_completed: entry.sets || 1,
      duration_per_set: entry.durationPerSet || entry.durationSeconds,
      rest_between: entry.restBetween || 0,
      context,
      status: entry.status === 'partial' ? 'completed' : entry.status,
      completed_at: entry.completedAt,
    })
    if (error) console.warn('[MOOVE DB] recordExerciseCompletion failed:', error.message)
  } catch (err) {
    console.warn('[MOOVE DB] recordExerciseCompletion failed:', err)
  }
}

// ─── Save driving session ─────────────────────────────────────────────────────
// If existingSessionId is provided (session was started via createDrivingSession),
// UPDATE that row with final stats.  Otherwise INSERT a new row (offline fallback).
// Exercise history is skipped when existingSessionId is set — each exercise was
// already persisted in real-time via recordExerciseCompletion.

export async function saveSessionToSupabase(
  userId: string,
  session: SessionRecord,
  exerciseHistory: ExerciseHistoryEntry[],
  existingSessionId?: string | null,
): Promise<{ sessionId: string | null; error: string | null }> {
  if (!supabase || userId === 'demo' || userId === 'admin-demo') {
    return { sessionId: null, error: null }
  }

  const startedAt = new Date(session.dateISO + 'T' + convertTime12to24(session.startTime)).toISOString()
  const endedAt = new Date().toISOString()

  const sessionPayload = {
    ended_at: endedAt,
    status: 'completed',
    duration_seconds: session.durationSeconds,
    driving_seconds: session.drivingSeconds,
    sedentary_seconds: session.sedentarySeconds,
    exercises_completed: session.exercisesCompleted,
    exercises_skipped: session.exercisesSkipped,
    breaks_taken: session.breakExercises,
    warmup_exercises: session.warmupExercises,
    cooldown_exercises: session.cooldownExercises,
    health_score: session.healthScore,
    calories: session.calories,
    total_sets: session.totalSets,
    avg_sedentary_risk: session.avgRisk,
    note: session.notes || null,
  }

  let dbSessionId: string | null = existingSessionId ?? null

  if (existingSessionId) {
    // Update the partial row created at session start
    const { error } = await supabase
      .from('driving_sessions')
      .update(sessionPayload)
      .eq('id', existingSessionId)
    if (error) {
      console.error('[MOOVE DB] driving_sessions update failed:', error.message)
      return { sessionId: existingSessionId, error: error.message }
    }
    // Update session_id on any exercise_history rows recorded with null session_id
    // (edge case: exercise completed before session row was confirmed)
    await supabase
      .from('exercise_history')
      .update({ session_id: existingSessionId })
      .eq('user_id', userId)
      .is('session_id', null)
      .gte('completed_at', startedAt)
      .then(() => {})
  } else {
    // Offline fallback: insert a complete session row + exercise history at once
    const { data: sessionRow, error: sessionErr } = await supabase
      .from('driving_sessions')
      .insert({ user_id: userId, started_at: startedAt, ...sessionPayload })
      .select('id')
      .single()

    if (sessionErr) {
      console.error('[MOOVE DB] driving_sessions insert failed:', sessionErr.message)
      return { sessionId: null, error: sessionErr.message }
    }

    dbSessionId = sessionRow?.id ?? null

    // Insert exercise history in bulk (only for offline fallback path)
    const completedExercises = exerciseHistory.filter(e => e.status === 'completed' || e.status === 'partial')
    if (completedExercises.length > 0 && dbSessionId) {
      const rows = completedExercises.map(e => ({
        user_id: userId,
        session_id: dbSessionId,
        exercise_id: e.exerciseId,
        exercise_name: e.name,
        body_area: e.bodyArea,
        sets_completed: e.sets || 1,
        duration_per_set: e.durationPerSet || e.durationSeconds,
        rest_between: e.restBetween || 0,
        context: e.context || 'break',
        status: (e.status === 'partial' ? 'completed' : e.status) as 'completed' | 'skipped',
        completed_at: e.completedAt,
      }))
      const { error: exErr } = await supabase.from('exercise_history').insert(rows)
      if (exErr) console.error('[MOOVE DB] exercise_history insert failed:', exErr.message)
    }
  }

  // Upsert health metrics for today
  const today = new Date().toISOString().slice(0, 10)
  const stressLevel = session.avgRisk === 'Low' ? 1 : session.avgRisk === 'Moderate' ? 2 : session.avgRisk === 'High' ? 3 : 4
  await supabase.from('health_metrics').upsert({
    user_id: userId,
    recorded_at: today,
    wellness_score: session.healthScore,
    stress_level: stressLevel,
    calories_burned: session.calories,
  }, { onConflict: 'user_id,recorded_at' })

  return { sessionId: dbSessionId, error: null }
}

// ─── Fetch dashboard stats ────────────────────────────────────────────────────

export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  return buildDashboardStats(await fetchCompletedSessions(userId))

  /* Legacy localStorage aggregation retained below temporarily for migration reference.
     It is intentionally unreachable: Supabase is the only source of driver data. */
  const localSessions = loadLocalSessions()

  // Calculate today's stats from localStorage sessions
  const todayISO = new Date().toISOString().slice(0, 10)
  const todaySessions = localSessions.filter(s => s.dateISO === todayISO)
  const todayDrivingSeconds = todaySessions.reduce((sum, s) => sum + (s.drivingSeconds || 0), 0)
  const todayExercises = todaySessions.reduce((sum, s) => sum + (s.exercisesCompleted || 0), 0)
  const todayCalories = todaySessions.reduce((sum, s) => sum + (s.calories || 0), 0)
  const todayHealthScore = todaySessions.length > 0 ? Math.round(todaySessions.reduce((sum, s) => sum + (s.healthScore || 0), 0) / todaySessions.length) : 0

  // Weekly activity (last 7 days)
  const weeklyActivity: { day: string; driving: number }[] = []
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const dayLabel = days[d.getDay()]
    const secs = localSessions.filter(s => s.dateISO === iso).reduce((sum, s) => sum + (s.drivingSeconds || 0), 0)
    weeklyActivity.push({ day: dayLabel, driving: Math.round(secs / 3600 * 10) / 10 })
  }

  const weeklyDrivingSeconds = weeklyActivity.reduce((sum, d) => sum + d.driving * 3600, 0)

  // Movement streak — consecutive days with at least 1 session
  let streak = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    if (localSessions.some(s => s.dateISO === iso)) streak++
    else break
  }

  // Stress trend — last 7 days health scores mapped to stress (inverted)
  const stressTrend = (() => {
    const trend: number[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const iso = d.toISOString().slice(0, 10)
      const daySessions = localSessions.filter(s => s.dateISO === iso)
      if (daySessions.length === 0) { trend.push(0); continue }
      const avgHealth = daySessions.reduce((sum, s) => sum + (s.healthScore || 0), 0) / daySessions.length
      trend.push(avgHealth === 0 ? 0 : Math.max(1, Math.min(5, Math.round((100 - avgHealth) / 20))))
    }
    return trend
  })()

  // Enrich from Supabase — only count COMPLETED sessions (ended_at IS NOT NULL)
  if (supabase && userId !== 'demo' && userId !== 'admin-demo') {
    try {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
      const { data: dbSessions } = await supabase
        .from('driving_sessions')
        .select('id,started_at,ended_at,duration_seconds,exercises_completed,exercises_skipped,health_score,calories')
        .eq('user_id', userId)
        .not('ended_at', 'is', null)          // only completed sessions
        .gte('started_at', weekAgo.toISOString())
        .order('started_at', { ascending: false })
        .limit(100)

      if (dbSessions && dbSessions.length > 0) {
        // Build per-day weekly activity from DB (Mon–Sun current week)
        const dbWeeklyActivity: { day: string; driving: number }[] = []
        const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i)
          const iso = d.toISOString().slice(0, 10)
          const label = dayLabels[d.getDay()]
          const secs = dbSessions
            .filter(s => s.started_at.startsWith(iso))
            .reduce((sum, s) => sum + (s.duration_seconds || 0), 0)
          dbWeeklyActivity.push({ day: label, driving: Math.round(secs / 3600 * 10) / 10 })
        }

        const dbTodaySessions = dbSessions.filter(s => s.started_at.startsWith(todayISO))
        const dbTodayDrivingSecs = dbTodaySessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0)
        const dbTodayExercises  = dbTodaySessions.reduce((sum, s) => sum + (s.exercises_completed || 0), 0)
        const dbWeeklyDrivingSecs = dbSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0)

        // Streak from DB: consecutive days with completed sessions
        const dbDays = new Set(dbSessions.map(s => s.started_at.slice(0, 10)))
        let dbStreak = 0
        for (let i = 0; i < 30; i++) {
          const d = new Date(); d.setDate(d.getDate() - i)
          if (dbDays.has(d.toISOString().slice(0, 10))) dbStreak++
          else break
        }

        return {
          todayDrivingSeconds: Math.max(todayDrivingSeconds, dbTodayDrivingSecs),
          weeklyDrivingSeconds: Math.max(weeklyDrivingSeconds, dbWeeklyDrivingSecs),
          movementStreak: Math.max(streak, dbStreak),
          exercisesCompleted: Math.max(todayExercises, dbTodayExercises),
          caloriesBurned: todayCalories,
          wellnessScore: todayHealthScore,
          stressTrend,
          weeklyActivity: dbWeeklyActivity,
          recentSessions: localSessions.slice(0, 5),
        }
      }
    } catch (err) {
      console.warn('[MOOVE DB] fetchDashboardStats Supabase error:', err)
    }
  }

  return {
    todayDrivingSeconds,
    weeklyDrivingSeconds,
    movementStreak: streak,
    exercisesCompleted: todayExercises,
    caloriesBurned: todayCalories,
    wellnessScore: todayHealthScore,
    stressTrend,
    weeklyActivity,
    recentSessions: localSessions.slice(0, 5),
  }
}

function buildDashboardStats(sessions: SessionRecord[]): DashboardStats {
  const today = localDateKey(new Date())
  const dayKeys = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - i)); return localDateKey(date)
  })
  const todaySessions = sessions.filter(s => s.dateISO === today)
  const activeDays = new Set(sessions.map(s => s.dateISO))
  const streakFrom = (start: Date) => {
    let count = 0; const cursor = new Date(start)
    while (activeDays.has(localDateKey(cursor))) { count++; cursor.setDate(cursor.getDate() - 1) }
    return count
  }
  const movementStreak = streakFrom(new Date())
  const bestStreak = Array.from(activeDays).reduce((best, key) => Math.max(best, streakFrom(new Date(`${key}T12:00:00`))), 0)
  const weeklyActivity = dayKeys.map(key => {
    const seconds = sessions.filter(s => s.dateISO === key).reduce((sum, s) => sum + s.drivingSeconds, 0)
    return { day: new Date(`${key}T12:00:00`).toLocaleDateString('en-PH', { weekday: 'short' }), driving: Math.round(seconds / 360) / 10 }
  })
  const wellnessRows = todaySessions.filter(s => s.healthScore > 0)
  return {
    todayDrivingSeconds: todaySessions.reduce((sum, s) => sum + s.drivingSeconds, 0),
    weeklyDrivingSeconds: sessions.filter(s => dayKeys.includes(s.dateISO)).reduce((sum, s) => sum + s.drivingSeconds, 0),
    movementStreak, bestStreak, totalSessions: sessions.length,
    exercisesCompleted: todaySessions.reduce((sum, s) => sum + s.exercisesCompleted, 0),
    totalExercises: sessions.reduce((sum, s) => sum + s.exercisesCompleted, 0),
    caloriesBurned: todaySessions.reduce((sum, s) => sum + s.calories, 0),
    wellnessScore: wellnessRows.length ? Math.round(wellnessRows.reduce((sum, s) => sum + s.healthScore, 0) / wellnessRows.length) : 0,
    stressTrend: dayKeys.map(key => { const rows = sessions.filter(s => s.dateISO === key && s.healthScore > 0); return rows.length ? Math.max(1, Math.min(5, Math.round((100 - rows.reduce((sum, s) => sum + s.healthScore, 0) / rows.length) / 20))) : 0 }),
    weeklyActivity, recentSessions: sessions.slice(0, 5),
  }
}

/** Single source of truth for all real driver session history and analytics. */
export async function fetchCompletedSessions(userId: string, limit = 1000): Promise<SessionRecord[]> {
  if (!supabase || userId === 'demo' || userId === 'admin-demo') return []
  const { data, error } = await supabase.from('driving_sessions').select('*').eq('user_id', userId)
    .eq('status', 'completed').not('ended_at', 'is', null).order('started_at', { ascending: false }).limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []).map(completedSessionFromRow)
}

// ─── Fetch recent sessions from Supabase ─────────────────────────────────────

export async function fetchRecentSessionsFromDB(userId: string, limit = 10): Promise<SessionRecord[]> {
  return fetchCompletedSessions(userId, limit)

  // Legacy compatibility path. Driver pages must never read browser session history.
  if (!supabase || userId === 'demo' || userId === 'admin-demo') return loadLocalSessions().slice(0, limit)

  try {
    const { data, error } = await supabase
      .from('driving_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error || !data) return loadLocalSessions().slice(0, limit)

    return data.map(row => ({
      id: row.id,
      dateISO: row.started_at.slice(0, 10),
      date: new Date(row.started_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }),
      startTime: new Date(row.started_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
      endTime: row.ended_at ? new Date(row.ended_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—',
      duration: formatDuration(row.duration_seconds),
      durationSeconds: row.duration_seconds,
      drivingSeconds: row.duration_seconds,
      sedentarySeconds: row.duration_seconds,
      exercisesCompleted: row.exercises_completed,
      exercisesSkipped: row.exercises_skipped,
      warmupExercises: 0,
      breakExercises: row.breaks_taken || 0,
      cooldownExercises: 0,
      calories: Math.round((row.duration_seconds / 60) * 1.5),
      avgRisk: row.avg_sedentary_risk || 'Low',
      notes: row.note || '',
      healthScore: 0,
      totalSets: 0,
    }))
  } catch {
    return loadLocalSessions().slice(0, limit)
  }
}

// ─── Notification preferences ────────────────────────────────────────────────

export interface NotificationPrefs {
  exerciseReminders: boolean
  breakAlerts: boolean
  healthInsights: boolean
  sessionSummaries: boolean
  reminderInterval: string
}

export async function upsertNotificationPrefs(userId: string, prefs: NotificationPrefs): Promise<void> {
  if (!supabase || userId === 'demo' || userId === 'admin-demo') return
  await supabase.from('user_preferences').upsert({
    user_id: userId,
    notifications_enabled: prefs.exerciseReminders || prefs.breakAlerts || prefs.healthInsights,
    exercise_reminders: prefs.exerciseReminders,
    break_alerts: prefs.breakAlerts,
    health_insights: prefs.healthInsights,
    session_summaries: prefs.sessionSummaries,
    reminder_interval: prefs.reminderInterval,
  }, { onConflict: 'user_id' })
}

export async function fetchNotificationPrefs(userId: string): Promise<NotificationPrefs | null> {
  if (!supabase || userId === 'demo' || userId === 'admin-demo') return null
  try {
    // maybeSingle() returns null (not an error) when no row exists — avoids 406
    const { data } = await supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle()
    if (!data) {
      // Auto-create defaults so subsequent calls find a row
      await supabase.from('user_preferences').upsert({ user_id: userId }, { onConflict: 'user_id' })
      return {
        exerciseReminders: true, breakAlerts: true,
        healthInsights: true, sessionSummaries: true, reminderInterval: '30',
      }
    }
    return {
      exerciseReminders: data.exercise_reminders ?? data.notifications_enabled ?? true,
      breakAlerts: data.break_alerts ?? data.notifications_enabled ?? true,
      healthInsights: data.health_insights ?? data.notifications_enabled ?? true,
      sessionSummaries: data.session_summaries ?? data.notifications_enabled ?? true,
      reminderInterval: data.reminder_interval ?? '30',
    }
  } catch { return null }
}

// ─── Testing Session Config (admin → driver feedback sync) ────────────────────

export interface TestingConfig {
  sessionId: string
  prototypeVersion: string
  userGroup: string
  testingEnvironment: string
  studyStartDate: string
  targetParticipants: string
  testingObjective: string
  overallSuccessCriteria: string
}

function defaultTestingConfig(): TestingConfig {
  return {
    sessionId: 'UNLEASH-2026',
    prototypeVersion: 'v0.49-TRL4',
    userGroup: 'Alpha Testers',
    testingEnvironment: 'Controlled Lab',
    studyStartDate: '',
    targetParticipants: '30',
    testingObjective: 'Validate MOOVE TRL-4 prototype for driver preventive health engagement.',
    overallSuccessCriteria: '≥70% usability satisfaction, ≥3/5 average rating across all metrics.',
  }
}

export async function fetchTestingConfig(): Promise<TestingConfig> {
  if (supabase) {
    try {
      const { data: testingConfig, error } = await supabase.from('testing_configurations').select('*').eq('id', 'current').maybeSingle()
      if (!error && testingConfig) return {
        sessionId: testingConfig.session_id, prototypeVersion: testingConfig.prototype_version,
        userGroup: testingConfig.user_group ?? '', testingEnvironment: testingConfig.testing_environment ?? '',
        studyStartDate: testingConfig.study_start_date ?? '', targetParticipants: String(testingConfig.target_participants ?? ''),
        testingObjective: testingConfig.testing_objective ?? '', overallSuccessCriteria: testingConfig.overall_success_criteria ?? '',
      }
    } catch { /* legacy fallback */ }
  }
  // Try Supabase first — admin_settings is now readable by all authenticated users
  if (supabase) {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_key,setting_value')
        .in('setting_key', [
          'testing_session_id','prototype_version','user_group',
          'testing_environment','study_start_date','target_participants',
          'testing_objective','overall_success_criteria',
        ])
      if (data && data.length > 0) {
        const m: Record<string, string> = {}
        data.forEach((r: { setting_key: string; setting_value: string }) => { m[r.setting_key] = r.setting_value })
        const cfg: TestingConfig = {
          sessionId: m['testing_session_id'] ?? 'UNLEASH-2026',
          prototypeVersion: m['prototype_version'] ?? 'v0.49-TRL4',
          userGroup: m['user_group'] ?? 'Alpha Testers',
          testingEnvironment: m['testing_environment'] ?? 'Controlled Lab',
          studyStartDate: m['study_start_date'] ?? '',
          targetParticipants: m['target_participants'] ?? '30',
          testingObjective: m['testing_objective'] ?? '',
          overallSuccessCriteria: m['overall_success_criteria'] ?? '',
        }
        return cfg
      }
    } catch { return defaultTestingConfig() }
  }
  return defaultTestingConfig()
}

export async function saveTestingConfig(cfg: TestingConfig): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sign in as an administrator to save settings.')
  const pairs: [string, string][] = [
    ['testing_session_id', cfg.sessionId],
    ['prototype_version', cfg.prototypeVersion],
    ['user_group', cfg.userGroup],
    ['testing_environment', cfg.testingEnvironment],
    ['study_start_date', cfg.studyStartDate],
    ['target_participants', cfg.targetParticipants],
    ['testing_objective', cfg.testingObjective],
    ['overall_success_criteria', cfg.overallSuccessCriteria],
  ]
  // Fire-and-forget via SECURITY DEFINER RPC — no table GRANT needed.
  const results = await Promise.all(pairs.map(([p_key, p_val]) => supabase.rpc('upsert_admin_setting', { p_key, p_val })))
  const failure = results.find(result => result.error)
  if (failure?.error) throw new Error(failure.error.message)
}

export async function fetchAdminSettings(keys: string[]): Promise<Record<string, string>> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('admin_settings').select('setting_key,setting_value').in('setting_key', keys)
  if (error) throw new Error(error.message)
  return Object.fromEntries((data ?? []).map(row => [row.setting_key, row.setting_value]))
}

export async function saveAdminSettings(values: Record<string, string>): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const results = await Promise.all(Object.entries(values).map(([p_key, p_val]) => supabase.rpc('upsert_admin_setting', { p_key, p_val })))
  const failure = results.find(result => result.error)
  if (failure?.error) throw new Error(failure.error.message)
}

// ─── Admin queries ────────────────────────────────────────────────────────────

export interface AdminSessionRow {
  id: string
  userId: string
  startedAt: string
  durationSeconds: number
  exercisesCompleted: number
  exercisesSkipped: number
  breaksTaken: number
  avgRisk: string
}

export async function fetchAllSessionsAdmin(days?: number): Promise<AdminSessionRow[]> {
  if (!supabase) return []
  try {
    let query = supabase
      .from('driving_sessions')
      .select('id,user_id,started_at,duration_seconds,exercises_completed,exercises_skipped,breaks_taken,avg_sedentary_risk')
      .not('ended_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(500)
    if (days) { const since = new Date(); since.setDate(since.getDate() - days); query = query.gte('started_at', since.toISOString()) }
    const { data, error } = await query

    if (error || !data) return []
    return data.map(r => ({
      id: r.id,
      userId: r.user_id,
      startedAt: r.started_at,
      durationSeconds: r.duration_seconds,
      exercisesCompleted: r.exercises_completed,
      exercisesSkipped: r.exercises_skipped,
      breaksTaken: r.breaks_taken || 0,
      avgRisk: r.avg_sedentary_risk || 'Low',
    }))
  } catch { return [] }
}

export interface AdminFeedbackRow {
  id: string
  userId: string | null
  overallRating: number | null
  firstImpression: number | null
  easeOfNavigation: number | null
  easeOfLearning: number | null
  accomplishedTask: string | null
  mostUsefulFeature: string | null
  needsImprovement: string | null
  wouldRecommend: string | null
  wouldUseAgain: string | null
  bugExperience: string | null
  bugDescription: string | null
  confusingPart: string | null
  featureRequest: string | null
  userExperienceComment: string | null
  firstImpressionComment: string | null
  perceivedValueComment: string | null
  easeOfUseComment: string | null
  technicalReliabilityComment: string | null
  bugFreeExperienceComment: string | null
  continuedUsageComment: string | null
  submittedAt: string
}

export async function fetchFeedbackSubmissions(): Promise<AdminFeedbackRow[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('feedback_submissions')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(200)

    if (error || !data) return []
    return data.map(r => ({
      id: r.id,
      userId: r.user_id,
      overallRating: r.overall_rating,
      firstImpression: r.first_impression,
      easeOfNavigation: r.ease_of_navigation,
      easeOfLearning: r.ease_of_learning,
      accomplishedTask: r.accomplished_task,
      mostUsefulFeature: r.most_useful_feature,
      needsImprovement: r.needs_improvement,
      wouldRecommend: r.would_recommend,
      wouldUseAgain: r.would_use_again,
      bugExperience: r.bug_experience,
      bugDescription: r.bug_description,
      confusingPart: r.confusing_part,
      featureRequest: r.feature_request,
      userExperienceComment: r.user_experience_comment,
      firstImpressionComment: r.first_impression_comment,
      perceivedValueComment: r.perceived_value_comment,
      easeOfUseComment: r.ease_of_use_comment,
      technicalReliabilityComment: r.technical_reliability_comment,
      bugFreeExperienceComment: r.bug_free_experience_comment,
      continuedUsageComment: r.continued_usage_comment,
      submittedAt: r.submitted_at,
    }))
  } catch { return [] }
}

export interface AdminAnalyticsStats {
  totalSessions: number
  totalUsers: number
  avgDurationMinutes: number
  exerciseCompletionRate: number
  breakComplianceRate: number
  dailyActiveUsers: { date: string; count: number }[]
  drivingDurationByDay: { date: string; totalMinutes: number }[]
  riskDistribution: { Low: number; Moderate: number; High: number }
}

export async function fetchAdminAnalytics(days = 30): Promise<AdminAnalyticsStats | null> {
  const sessions = await fetchAllSessionsAdmin(days)
  if (sessions.length === 0) return null

  const uniqueUsers = new Set(sessions.map(s => s.userId)).size
  const totalDuration = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const totalCompleted = sessions.reduce((sum, s) => sum + s.exercisesCompleted, 0)
  const totalSkipped = sessions.reduce((sum, s) => sum + s.exercisesSkipped, 0)
  const totalExercises = totalCompleted + totalSkipped
  const totalBreaks = sessions.reduce((sum, s) => sum + s.breaksTaken, 0)

  const dayMap: Record<string, { users: Set<string>; totalSecs: number }> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    dayMap[iso] = { users: new Set(), totalSecs: 0 }
  }
  for (const s of sessions) {
    const day = s.startedAt.slice(0, 10)
    if (dayMap[day]) {
      dayMap[day].users.add(s.userId)
      dayMap[day].totalSecs += s.durationSeconds
    }
  }

  const riskDist = { Low: 0, Moderate: 0, High: 0 }
  for (const s of sessions) {
    if (s.avgRisk === 'Low') riskDist.Low++
    else if (s.avgRisk === 'Moderate') riskDist.Moderate++
    else riskDist.High++
  }

  return {
    totalSessions: sessions.length,
    totalUsers: uniqueUsers,
    avgDurationMinutes: sessions.length > 0 ? Math.round(totalDuration / sessions.length / 60) : 0,
    exerciseCompletionRate: totalExercises > 0 ? Math.round((totalCompleted / totalExercises) * 100) : 0,
    breakComplianceRate: sessions.length > 0 ? Math.round((totalBreaks / sessions.length) * 100) : 0,
    dailyActiveUsers: Object.entries(dayMap).map(([date, v]) => ({ date, count: v.users.size })),
    drivingDurationByDay: Object.entries(dayMap).map(([date, v]) => ({ date, totalMinutes: Math.round(v.totalSecs / 60) })),
    riskDistribution: riskDist,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function convertTime12to24(time12: string): string {
  try {
    const [time, modifier] = time12.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    if (modifier === 'PM' && hours !== 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
  } catch {
    return '00:00:00'
  }
}
