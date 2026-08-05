import { supabase } from '@/lib/supabase'

export type WeeklyDriving = { days: { label: string; hours: number }[]; daysActive: number; totalSeconds: number; exercisesDone: number }
export type ExerciseHistoryRow = { id: string; sessionId: string | null; name: string; bodyArea: string | null; durationSeconds: number; sets: number; repetitions: number | null; restSeconds: number; context: string | null; status: string; completedAt: string }

function weekStart() { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d }

export async function fetchWeeklyDriving(userId: string): Promise<WeeklyDriving> {
  const start = weekStart().toISOString()
  const empty: WeeklyDriving = { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(label => ({ label, hours: 0 })), daysActive: 0, totalSeconds: 0, exercisesDone: 0 }
  if (!supabase || !userId || userId === 'demo' || userId === 'admin-demo') return empty
  const { data: sessions, error: sessionError } = await supabase.from('driving_sessions')
    .select('id,started_at,driving_seconds,duration_seconds,exercises_completed')
    .eq('user_id', userId).eq('status', 'completed').not('ended_at', 'is', null)
    .gte('started_at', start).order('started_at', { ascending: true })
  if (sessionError) throw new Error(sessionError.message)
  const active = new Set<string>()
  for (const session of sessions ?? []) {
    const date = new Date(session.started_at); const index = (date.getDay() + 6) % 7
    const seconds = session.driving_seconds || session.duration_seconds || 0
    empty.days[index].hours += seconds / 3600; empty.totalSeconds += seconds
    empty.exercisesDone += session.exercises_completed ?? 0; active.add(date.toDateString())
  }
  empty.days = empty.days.map(day => ({ ...day, hours: Math.round(day.hours * 10) / 10 }))
  empty.daysActive = active.size
  return empty
}

export async function fetchExerciseHistory(userId: string): Promise<ExerciseHistoryRow[]> {
  if (!supabase || !userId || userId === 'demo' || userId === 'admin-demo') return []
  const { data, error } = await supabase.from('exercise_history')
    .select('id,session_id,exercise_name,body_area,duration_per_set,sets_completed,rest_between,context,status,completed_at,driving_sessions!inner(ended_at)')
    .eq('user_id', userId).eq('status', 'completed').not('driving_sessions.ended_at', 'is', null).order('completed_at', { ascending: false }).limit(250)
  if (error) throw new Error(error.message)
  return (data ?? []).map(row => ({ id: row.id, sessionId: row.session_id, name: row.exercise_name, bodyArea: row.body_area, durationSeconds: row.duration_per_set * row.sets_completed, sets: row.sets_completed, repetitions: null, restSeconds: row.rest_between, context: row.context, status: row.status, completedAt: row.completed_at }))
}

export async function fetchWeeklyExerciseCounts(userId: string): Promise<number[]> {
  const records = await fetchExerciseHistory(userId); const start = weekStart().getTime(); const counts = Array(7).fill(0)
  for (const record of records) { const date = new Date(record.completedAt); if (date.getTime() >= start) counts[(date.getDay() + 6) % 7]++ }
  return counts
}

export async function fetchInsightInput(userId: string): Promise<{ sessions: { id: string; date: string; durationSeconds: number; drivingSeconds: number; exercisesCompleted: number; exercisesSkipped: number; healthScore: number }[]; prefs: Record<string, string | string[]> }> {
  if (!supabase || !userId || userId === 'demo' || userId === 'admin-demo') return { sessions: [], prefs: {} }
  const [{ data: sessions, error: sessionsError }, { data: profile, error: profileError }] = await Promise.all([
    supabase.from('driving_sessions').select('id,started_at,duration_seconds,driving_seconds,exercises_completed,exercises_skipped,health_score').eq('user_id', userId).eq('status', 'completed').order('started_at', { ascending: false }).limit(90),
    supabase.from('driver_profiles').select('driver_type,daily_driving_hours,driving_schedule,problem_areas,reminder_interval_minutes,warmup_preference').eq('user_id', userId).maybeSingle(),
  ])
  if (sessionsError) throw new Error(sessionsError.message); if (profileError) throw new Error(profileError.message)
  return { sessions: (sessions ?? []).map(s => ({ id: s.id, date: s.started_at, durationSeconds: s.duration_seconds, drivingSeconds: s.driving_seconds || s.duration_seconds, exercisesCompleted: s.exercises_completed, exercisesSkipped: s.exercises_skipped, healthScore: s.health_score || 0 })), prefs: { driver_type: profile?.driver_type ?? '', daily_hours: profile?.daily_driving_hours ?? '', drive_times: profile?.driving_schedule ?? [], tired_areas: profile?.problem_areas ?? [], reminder_freq: String(profile?.reminder_interval_minutes ?? 30), warmup_pref: profile?.warmup_preference ?? '' } }
}
