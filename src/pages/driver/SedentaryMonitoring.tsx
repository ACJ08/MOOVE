import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'

// ─── Types ────────────────────────────────────────────────────────────────────
interface SavedSession {
  id: string; date: string; dateISO?: string; startTime: string
  drivingSeconds: number; exercisesCompleted: number; exercisesSkipped: number
  warmupExercises?: number; breakExercises?: number; cooldownExercises?: number
  healthScore: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadSessions(): SavedSession[] {
  try { return JSON.parse(localStorage.getItem('moove_session_history') || '[]') } catch { return [] }
}

function getISO(s: SavedSession): string {
  if (s.dateISO) return s.dateISO
  const d = new Date(s.date)
  return isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10)
}

function fmtMins(mins: number) {
  const h = Math.floor(mins / 60); const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function isoNAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10)
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_SED = [95, 148, 145, 82, 125, 60, 30]
const MOCK_EX  = [3, 2, 4, 2, 3, 2, 1]
const MOCK_TIMELINE = [
  { label: 'Jul 31 · 07:14 AM', dur: '1h 35m', ex: 3, cd: 2, wu: 1 },
  { label: 'Jul 30 · 08:02 AM', dur: '2h 05m', ex: 2, cd: 1, wu: 0 },
  { label: 'Jul 29 · 06:55 AM', dur: '2h 25m', ex: 4, cd: 2, wu: 1 },
  { label: 'Jul 28 · 07:30 AM', dur: '1h 22m', ex: 2, cd: 1, wu: 0 },
]

// ─── Simple bar chart ─────────────────────────────────────────────────────────
function Bars({ data, maxVal, colorFn, goalMins = 0 }: {
  data: { label: string; val: number; today?: boolean }[]
  maxVal: number; colorFn: (v: number, t?: boolean) => string; goalMins?: number
}) {
  return (
    <div className="flex items-end gap-2 h-36">
      {data.map(d => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <div className="text-[10px] font-bold text-moove-brown leading-none">{d.val > 0 ? fmtMins(d.val) : ''}</div>
          <div className="w-full flex flex-col justify-end h-28 bg-blue-50 rounded-lg overflow-hidden relative">
            {goalMins > 0 && maxVal > 0 && (
              <div className="absolute w-full border-t-2 border-dashed border-blue-300 z-10"
                style={{ bottom: `${(goalMins / maxVal) * 100}%` }} />
            )}
            {d.val > 0 && maxVal > 0 && (
              <div className="w-full rounded-t-lg"
                style={{ height: `${(d.val / maxVal) * 100}%`, background: colorFn(d.val, d.today) }} />
            )}
          </div>
          <div className={`text-[10px] ${d.today ? 'font-bold text-moove-orange' : 'text-moove-muted'}`}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SedentaryMonitoring() {
  const { user } = useAuth()
  const isDemo = user?.id === 'demo'
  const all = useMemo(() => loadSessions(), [])

  const m = useMemo(() => {
    if (isDemo || all.length === 0) return null
    const today = new Date().toISOString().slice(0, 10)
    const last7 = Array.from({ length: 7 }, (_, i) => isoNAgo(6 - i))
    const byDate = new Map<string, SavedSession[]>()
    for (const s of all) {
      const iso = getISO(s)
      if (!byDate.has(iso)) byDate.set(iso, [])
      byDate.get(iso)!.push(s)
    }

    const days = last7.map((iso, i) => {
      const ss = byDate.get(iso) ?? []
      const sedMins = Math.round(ss.reduce((a, s) => a + s.drivingSeconds, 0) / 60)
      const ex = ss.reduce((a, s) => a + s.exercisesCompleted, 0)
      const skipped = ss.reduce((a, s) => a + s.exercisesSkipped, 0)
      const cd = ss.reduce((a, s) => a + (s.cooldownExercises ?? 0), 0)
      const wu = ss.reduce((a, s) => a + (s.warmupExercises ?? 0), 0)
      const label = new Date(iso + 'T12:00:00').toLocaleDateString('en-PH', { weekday: 'short' })
      return { iso, label, sedMins, ex, skipped, cd, wu, today: i === 6 }
    })

    const todaySessions = byDate.get(today) ?? []
    const todaySedMins = Math.round(todaySessions.reduce((a, s) => a + s.drivingSeconds, 0) / 60)
    const weekSed = days.reduce((a, d) => a + d.sedMins, 0)
    const weekEx = days.reduce((a, d) => a + d.ex, 0)
    const weekSkipped = days.reduce((a, d) => a + d.skipped, 0)
    const weekCd = days.reduce((a, d) => a + d.cd, 0)
    const weekWu = days.reduce((a, d) => a + d.wu, 0)
    const weekBreak = Math.max(0, weekEx - weekCd - weekWu)
    const overGoal = days.filter(d => d.sedMins > 120).length
    const avgDaily = Math.round(weekSed / 7)
    const compRate = weekEx + weekSkipped > 0 ? Math.round((weekEx / (weekEx + weekSkipped)) * 100) : 0
    const logDays = days.filter(d => d.sedMins > 0).length
    const logConsistency = Math.round((logDays / 7) * 100)
    const goalAdherence = Math.round(((7 - overGoal) / 7) * 100)
    let streak = 0
    for (let i = 6; i >= 0; i--) { if (days[i].ex > 0) streak++; else if (i < 6) break }

    return {
      todaySedMins, weekSed, avgDaily, overGoal, days,
      weekEx, weekCd, weekWu, weekBreak, weekSkipped,
      compRate, logConsistency, goalAdherence, streakPct: Math.round((streak / 7) * 100),
      recent: all.slice(0, 5),
    }
  }, [all, isDemo])

  const hasData = !isDemo && m !== null

  const sedBars = isDemo
    ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, i) => ({ label, val: MOCK_SED[i], today: i === 6 }))
    : hasData ? m!.days.map(d => ({ label: d.label, val: d.sedMins, today: d.today }))
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(label => ({ label, val: 0 }))

  const exBars = isDemo
    ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, i) => ({ label, val: MOCK_EX[i], today: i === 6 }))
    : hasData ? m!.days.map(d => ({ label: d.label, val: d.ex, today: d.today }))
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(label => ({ label, val: 0 }))

  const maxSed = Math.max(...sedBars.map(d => d.val), 120)
  const maxEx = Math.max(...exBars.map(d => d.val), 1)

  const engagement = [
    { label: 'Session Logging Consistency', val: isDemo ? 85 : hasData ? m!.logConsistency : 0, color: '#F97316' },
    { label: 'Exercise Completion Rate',    val: isDemo ? 71 : hasData ? m!.compRate       : 0, color: '#22C55E' },
    { label: 'Sedentary Goal Adherence',    val: isDemo ? 57 : hasData ? m!.goalAdherence  : 0, color: '#0EA5E9' },
    { label: 'Daily Streak Maintenance',    val: isDemo ? 90 : hasData ? m!.streakPct      : 0, color: '#A855F7' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Sedentary Monitoring</h1>
        <p className="text-sm text-moove-muted">Track daily sedentary duration, exercise completion, and preventive health engagement.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Today Sedentary',  icon: '🪑', color: '#0EA5E9', value: isDemo ? '2h 05m' : hasData ? fmtMins(m!.todaySedMins) : '—' },
          { label: 'Weekly Total',     icon: '📅', color: '#F97316', value: isDemo ? '9h 45m'  : hasData ? fmtMins(m!.weekSed)      : '—' },
          { label: 'Daily Average',    icon: '📊', color: '#A855F7', value: isDemo ? '1h 24m'  : hasData ? fmtMins(m!.avgDaily)     : '—' },
          { label: 'Goal Exceeded',    icon: '⚠️', color: '#EF4444', value: isDemo ? '3 days'  : hasData ? `${m!.overGoal} day${m!.overGoal !== 1 ? 's' : ''}` : '—' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 card-shadow">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: `${s.color}15` }}>{s.icon}</div>
            <div className="font-display font-black text-2xl text-moove-brown">{s.value}</div>
            <div className="text-xs text-moove-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Exercise type breakdown banner */}
      {(isDemo || hasData) && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-4 mb-5">
          <div className="text-xs font-black text-moove-brown mb-3 tracking-wide">THIS WEEK'S EXERCISE BREAKDOWN</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/80 rounded-xl p-3">
              <div className="text-lg mb-1">🌅</div>
              <div className="font-display font-black text-xl text-blue-600">{isDemo ? 5 : m!.weekWu}</div>
              <div className="text-[10px] text-moove-muted font-semibold">Warm-Ups</div>
            </div>
            <div className="bg-white/80 rounded-xl p-3">
              <div className="text-lg mb-1">🤸</div>
              <div className="font-display font-black text-xl text-moove-orange">{isDemo ? 9 : m!.weekBreak}</div>
              <div className="text-[10px] text-moove-muted font-semibold">Break Exercises</div>
            </div>
            <div className="bg-white/80 rounded-xl p-3">
              <div className="text-lg mb-1">🌆</div>
              <div className="font-display font-black text-xl text-purple-600">{isDemo ? 9 : m!.weekCd}</div>
              <div className="text-[10px] text-moove-muted font-semibold">Cool-Downs</div>
            </div>
          </div>
          {hasData && m!.weekCd > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-purple-700 font-semibold bg-purple-50 rounded-lg px-3 py-2">
              <span>🎉</span>
              <span>You completed {m!.weekCd} cool-down exercise{m!.weekCd !== 1 ? 's' : ''} this week — these are counted in your health score and streak!</span>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Sedentary chart */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-moove-brown">Daily Sedentary Duration</h2>
            <span className="text-xs text-moove-muted">This week</span>
          </div>
          <Bars data={sedBars} maxVal={maxSed} goalMins={120} colorFn={v => v > 120 ? '#EF4444' : '#0EA5E9'} />
          <div className="flex gap-4 mt-3 text-xs text-moove-muted flex-wrap">
            <span className="flex items-center gap-1"><span className="w-4 h-0 border-t-2 border-dashed border-blue-400 inline-block" /> Goal (2h)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-red-500 inline-block rounded-sm" />Over</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-blue-500 inline-block rounded-sm" />Within</span>
          </div>
        </div>

        {/* Exercise chart */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h2 className="font-display font-bold text-moove-brown mb-1">Exercise Completion</h2>
          <p className="text-xs text-moove-muted mb-4">All types: warm-up + breaks + cool-downs</p>
          <Bars data={exBars} maxVal={maxEx} colorFn={(_, t) => t ? '#F97316' : '#22C55E'} />
          <div className="mt-4 pt-4 border-t border-moove-border flex justify-between">
            <span className="text-sm text-moove-muted">Total this week</span>
            <span className="font-display font-black text-xl text-moove-green">
              {isDemo ? 17 : hasData ? m!.weekEx : 0} exercises
            </span>
          </div>
        </div>

        {/* Activity timeline */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h2 className="font-display font-bold text-moove-brown mb-4">Activity Timeline</h2>
          {isDemo ? (
            <div className="flex flex-col gap-2">
              {MOCK_TIMELINE.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-moove-cream">
                  <div className="w-2 h-2 rounded-full bg-moove-orange shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-moove-brown">{s.label}</div>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] font-semibold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">{s.ex} total</span>
                      {s.cd > 0 && <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">🌆 {s.cd} cool-down</span>}
                      {s.wu > 0 && <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">🌅 {s.wu} warm-up</span>}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-moove-brown shrink-0">{s.dur}</div>
                </div>
              ))}
            </div>
          ) : hasData ? (
            <div className="flex flex-col gap-2">
              {m!.recent.map((s, i) => {
                const mins = Math.round(s.drivingSeconds / 60)
                const h = Math.floor(mins / 60); const mm = mins % 60
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-moove-cream">
                    <div className="w-2 h-2 rounded-full bg-moove-orange shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-moove-brown">{s.date} · {s.startTime}</div>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-semibold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">{s.exercisesCompleted} total</span>
                        {(s.cooldownExercises ?? 0) > 0 && <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">🌆 {s.cooldownExercises} cool-down</span>}
                        {(s.warmupExercises ?? 0) > 0 && <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">🌅 {s.warmupExercises} warm-up</span>}
                        <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Score: {s.healthScore}%</span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-moove-brown shrink-0">{h > 0 ? `${h}h ${mm}m` : `${mm}m`}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 gap-3 text-center">
              <img src={mascotImg} alt="Moo" className="w-16 h-16 object-contain opacity-50" />
              <p className="text-sm text-moove-muted">No activity yet. Complete a session to see your timeline.</p>
            </div>
          )}
        </div>

        {/* Engagement bars */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h2 className="font-display font-bold text-moove-brown mb-1">Preventive Health Engagement</h2>
          <p className="text-xs text-moove-muted mb-4">Based on your last 7 days</p>
          <div className="flex flex-col gap-4">
            {engagement.map(e => (
              <div key={e.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-moove-muted">{e.label}</span>
                  <span className="text-xs font-black text-moove-brown">{e.val}%</span>
                </div>
                <div className="h-2.5 bg-moove-cream rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${e.val}%`, background: e.color }} />
                </div>
              </div>
            ))}
          </div>
          {hasData && (
            <div className="mt-5 pt-4 border-t border-moove-border grid grid-cols-3 gap-2 text-center">
              <div><div className="font-display font-black text-lg text-moove-orange">{m!.weekEx}</div><div className="text-[10px] text-moove-muted">Total</div></div>
              <div><div className="font-display font-black text-lg text-purple-600">{m!.weekCd}</div><div className="text-[10px] text-moove-muted">Cool-downs</div></div>
              <div><div className="font-display font-black text-lg text-blue-600">{m!.weekWu}</div><div className="text-[10px] text-moove-muted">Warm-ups</div></div>
            </div>
          )}
        </div>
      </div>

      {!isDemo && !hasData && (
        <div className="mt-6 bg-white rounded-2xl p-8 card-shadow flex flex-col items-center text-center gap-4">
          <img src={mascotImg} alt="Moo" className="w-20 h-20 object-contain opacity-70 animate-float" />
          <div>
            <div className="font-display font-bold text-lg text-moove-brown mb-1">No data yet</div>
            <p className="text-sm text-moove-muted max-w-sm">Complete your first driving session — including warm-up and cool-down exercises — to see your data here.</p>
          </div>
          <a href="/driver/sessions" className="px-5 py-2.5 bg-moove-orange text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all active:scale-95">Start a Session →</a>
        </div>
      )}
    </div>
  )
}
