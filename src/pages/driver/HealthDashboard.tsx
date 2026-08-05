import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { exercises } from '@/data/exercises'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'

// ─── Types ────────────────────────────────────────────────────────────────────
interface SavedSession {
  id: string; date: string; dateISO?: string; startTime: string
  drivingSeconds: number; exercisesCompleted: number; exercisesSkipped: number
  warmupExercises?: number; breakExercises?: number; cooldownExercises?: number
  healthScore: number; avgRisk: string; durationSeconds: number
}

interface UserPrefs {
  tired_areas?: string[]; daily_hours?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadSessions(): SavedSession[] {
  try { return JSON.parse(localStorage.getItem('moove_session_history') || '[]') } catch { return [] }
}

function loadPrefs(email: string): UserPrefs {
  try { return JSON.parse(localStorage.getItem(`moove_user_preferences_${email}`) || '{}') } catch { return {} }
}

function getISO(s: SavedSession): string {
  if (s.dateISO) return s.dateISO
  const d = new Date(s.date)
  return isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10)
}

function isoNAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10)
}

function calcStreak(sessions: SavedSession[]): number {
  if (!sessions.length) return 0
  const days = new Set(sessions.filter(s => s.exercisesCompleted > 0).map(s => getISO(s)))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    if (days.has(d.toISOString().slice(0, 10))) streak++
    else if (i > 0) break
  }
  return streak
}

function buildAISummary(all: SavedSession[], weekEx: number, weekCd: number, streak: number): string {
  if (!all.length) return "Start logging driving sessions and completing exercises to receive your personalized AI health summary from Moo."
  const totalEx = all.reduce((a, s) => a + s.exercisesCompleted, 0)
  const totalCd = all.reduce((a, s) => a + (s.cooldownExercises ?? 0), 0)
  const avgScore = Math.round(all.reduce((a, s) => a + s.healthScore, 0) / all.length)
  if (streak >= 5) return `Outstanding! You're on a ${streak}-day streak with ${weekEx} exercises this week — including ${weekCd} cool-down${weekCd !== 1 ? 's' : ''}. Your average health score is ${avgScore}%. This level of consistency significantly reduces driving-related musculoskeletal risk.`
  if (weekCd >= 2) return `Great work this week — ${weekEx} exercises including ${weekCd} cool-down session${weekCd !== 1 ? 's' : ''}. Cool-downs help your muscles recover after driving and improve long-term flexibility. Your health score averages ${avgScore}%.`
  if (weekEx >= 3) return `You completed ${weekEx} exercises this week. Adding cool-down exercises after each session could further boost your health score (currently ${avgScore}%). You've done ${totalCd} cool-downs all-time — keep growing that number!`
  return `You've completed ${totalEx} total exercises across ${all.length} session${all.length !== 1 ? 's' : ''}, including ${totalCd} cool-down${totalCd !== 1 ? 's' : ''}. Your health score averages ${avgScore}%. Try completing at least one exercise per session to build your streak.`
}

const AREA_EX_MAP: Record<string, number> = {
  neck: 1, shoulders: 3, upper_back: 3, lower_back: 5,
  hips: 5, knees: 10, calves: 6, ankles: 6, wrists: 4, eyes: 9,
}

// ─── Mini bar ─────────────────────────────────────────────────────────────────
function MiniBar({ data, maxVal, color, accent }: {
  data: { label: string; val: number; today?: boolean }[]
  maxVal: number; color: string; accent?: string
}) {
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map(d => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <div className="text-[10px] font-bold text-moove-brown">{d.val > 0 ? d.val : ''}</div>
          <div className="w-full flex flex-col justify-end h-16 rounded-lg overflow-hidden" style={{ background: `${color}18` }}>
            {d.val > 0 && maxVal > 0 && (
              <div className="w-full rounded-t-lg"
                style={{ height: `${(d.val / maxVal) * 100}%`, background: d.today && accent ? accent : color }} />
            )}
          </div>
          <div className={`text-[10px] ${d.today ? 'font-bold text-moove-orange' : 'text-moove-muted'}`}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HealthDashboard() {
  const { user } = useAuth()
  const isDemo = user?.id === 'demo'
  const userKey = user?.email ?? user?.id ?? ''

  const [sessionVersion, setSessionVersion] = useState(0)
  useEffect(() => {
    const handler = () => setSessionVersion(v => v + 1)
    window.addEventListener('moove:session-saved', handler)
    return () => window.removeEventListener('moove:session-saved', handler)
  }, [])

  const all = useMemo(() => loadSessions(), [sessionVersion])
  const prefs = useMemo(() => loadPrefs(userKey), [userKey])

  const m = useMemo(() => {
    if (isDemo || !all.length) return null
    const last7Iso = Array.from({ length: 7 }, (_, i) => isoNAgo(6 - i))
    const byDate = new Map<string, SavedSession[]>()
    for (const s of all) {
      const iso = getISO(s); if (!byDate.has(iso)) byDate.set(iso, []); byDate.get(iso)!.push(s)
    }

    const today = new Date().toISOString().slice(0, 10)
    const todaySecs = (byDate.get(today) ?? []).reduce((a, s) => a + s.drivingSeconds, 0)
    const todaySedMins = Math.round(todaySecs / 60)

    const last7 = last7Iso.map((iso, i) => {
      const ss = byDate.get(iso) ?? []
      return {
        label: new Date(iso + 'T12:00:00').toLocaleDateString('en-PH', { weekday: 'short' }),
        ex: ss.reduce((a, s) => a + s.exercisesCompleted, 0),
        drivH: Math.round((ss.reduce((a, s) => a + s.drivingSeconds, 0) / 3600) * 10) / 10,
        cd: ss.reduce((a, s) => a + (s.cooldownExercises ?? 0), 0),
        wu: ss.reduce((a, s) => a + (s.warmupExercises ?? 0), 0),
        today: i === 6,
      }
    })

    const weekEx = last7.reduce((a, d) => a + d.ex, 0)
    const weekCd = last7.reduce((a, d) => a + d.cd, 0)
    const weekWu = last7.reduce((a, d) => a + d.wu, 0)
    const weekDrivH = Math.round(last7.reduce((a, d) => a + d.drivH, 0) * 10) / 10
    const streak = calcStreak(all)
    const totalEx = all.reduce((a, s) => a + s.exercisesCompleted, 0)
    const totalCd = all.reduce((a, s) => a + (s.cooldownExercises ?? 0), 0)
    const avgScore = Math.round(all.reduce((a, s) => a + s.healthScore, 0) / all.length)
    const aiSummary = buildAISummary(all, weekEx, weekCd, streak)

    const tiredArea = prefs.tired_areas?.find(a => AREA_EX_MAP[a])
    const suggestedEx = tiredArea
      ? exercises.find(e => e.id === AREA_EX_MAP[tiredArea])
      : exercises.find(e => e.id === 3)
    const preventiveTip = tiredArea
      ? `Targeting your ${tiredArea.replace('_', ' ')} — your most reported discomfort area from onboarding.`
      : "A 30-second exercise keeps muscles refreshed and focus sharp."

    return {
      todaySedMins, weekEx, weekCd, weekWu, weekDrivH, streak, totalEx, totalCd, avgScore,
      aiSummary, suggestedEx, preventiveTip,
      exBars: last7.map(d => ({ label: d.label, val: d.ex, today: d.today })),
      drivBars: last7.slice(-5).map(d => ({ label: d.label, val: d.drivH, today: d.today })),
    }
  }, [all, prefs, isDemo])

  const hasData = !isDemo && m !== null

  const fmtTime = (mins: number) => { const h = Math.floor(mins / 60); const mm = mins % 60; return h > 0 ? `${h}h ${mm}m` : `${mm}m` }

  const widgets = [
    { icon: '🪑', label: 'Total Sedentary Time', value: isDemo ? '2h 05m' : hasData ? fmtTime(m!.todaySedMins) : '—', sub: 'today', color: '#0EA5E9' },
    { icon: '🔥', label: 'Movement Streak',       value: isDemo ? '5 days' : hasData ? `${m!.streak} day${m!.streak !== 1 ? 's' : ''}` : '—', sub: 'consecutive', color: '#F97316' },
    { icon: '📅', label: 'Weekly Activities',     value: isDemo ? '17' : hasData ? String(m!.weekEx) : '—', sub: 'this week', color: '#A855F7' },
    { icon: '🚗', label: 'Weekly Driving',        value: isDemo ? '12.4h' : hasData ? `${m!.weekDrivH}h` : '—', sub: 'total hours', color: '#22C55E' },
    { icon: '✅', label: 'Exercises Completed',   value: isDemo ? '34' : hasData ? String(m!.totalEx) : '—', sub: 'all time', color: '#EC4899' },
    { icon: '💯', label: 'Health Engagement',     value: isDemo ? '84%' : hasData ? `${m!.avgScore}%` : '—', sub: 'avg score', color: '#FBBF24' },
  ]

  const MOCK_EX_BARS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, i) => ({ label, val: [3,2,4,2,3,2,1][i], today: i === 6 }))
  const MOCK_DRIV_BARS = [{ label:'Mon', val:2.5 },{ label:'Tue', val:1.8 },{ label:'Wed', val:3.2 },{ label:'Thu', val:2.0 },{ label:'Fri', val:2.9 }].map(d => ({ ...d, today: false }))

  const exBars = isDemo ? MOCK_EX_BARS : hasData ? m!.exBars : MOCK_EX_BARS.map(d => ({ ...d, val: 0 }))
  const drivBars = isDemo ? MOCK_DRIV_BARS : hasData ? m!.drivBars : MOCK_DRIV_BARS.map(d => ({ ...d, val: 0 }))

  const displayEx = isDemo ? exercises.find(e => e.id === 3) : hasData ? m!.suggestedEx : exercises.find(e => e.id === 3)
  const displayTip = isDemo
    ? "Shoulder Rolls target your upper trapezius — most stressed after sustained steering wheel grip."
    : hasData ? m!.preventiveTip : "Start a session to receive a personalized recommendation."
  const summaryText = isDemo
    ? "You drove 12.4 hours this week — above your weekly average. You completed 17 exercises including 9 cool-down sessions. Your 5-day streak and 84% health score show excellent preventive health engagement!"
    : hasData ? m!.aiSummary : "Start logging driving sessions and completing exercises to receive your personalized AI health summary from Moo."

  const weekCdDisplay = isDemo ? 9 : hasData ? m!.weekCd : 0
  const weekWuDisplay = isDemo ? 5 : hasData ? m!.weekWu : 0
  const weekBreakDisplay = isDemo ? 8 : hasData ? Math.max(0, m!.weekEx - m!.weekCd - m!.weekWu) : 0
  const totalCdDisplay = isDemo ? 18 : hasData ? m!.totalCd : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Preventive Health Dashboard</h1>
        <p className="text-sm text-moove-muted">Your complete wellness picture — updated every session, including cool-downs.</p>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {widgets.map(w => (
          <div key={w.label} className="bg-white rounded-2xl p-5 card-shadow hover-lift">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: `${w.color}15` }}>{w.icon}</div>
            <div className="font-display font-black text-2xl text-moove-brown">{w.value}</div>
            <div className="text-xs text-moove-muted">{w.label}</div>
            <div className="text-xs text-moove-muted/60">{w.sub}</div>
          </div>
        ))}
      </div>

      {/* Exercise type breakdown */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border border-purple-100 rounded-2xl p-5 mb-5">
        <div className="text-xs font-black text-moove-brown mb-3 tracking-wide">EXERCISE BREAKDOWN — THIS WEEK</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/80 rounded-xl p-3">
            <div className="text-xl mb-1">🌅</div>
            <div className="font-display font-black text-2xl text-blue-600">{weekWuDisplay}</div>
            <div className="text-[10px] text-moove-muted font-semibold">Warm-Ups</div>
          </div>
          <div className="bg-white/80 rounded-xl p-3">
            <div className="text-xl mb-1">🤸</div>
            <div className="font-display font-black text-2xl text-moove-orange">{weekBreakDisplay}</div>
            <div className="text-[10px] text-moove-muted font-semibold">Break Exercises</div>
          </div>
          <div className="bg-white/80 rounded-xl p-3">
            <div className="text-xl mb-1">🌆</div>
            <div className="font-display font-black text-2xl text-purple-600">{weekCdDisplay}</div>
            <div className="text-[10px] text-moove-muted font-semibold">Cool-Downs</div>
          </div>
        </div>
        {totalCdDisplay > 0 && (
          <div className="mt-3 bg-white/70 rounded-xl px-3 py-2 text-xs text-purple-700 font-semibold">
            🎉 {totalCdDisplay} cool-down exercise{totalCdDisplay !== 1 ? 's' : ''} completed all-time — each one earns up to +8 health score points!
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* AI Summary */}
        <div className="bg-white rounded-2xl p-5 card-shadow border-l-4 border-moove-purple">
          <div className="flex items-start gap-4">
            <img src={mascotImg} alt="Moo" className="w-12 h-12 object-contain shrink-0 animate-float" />
            <div>
              <div className="text-xs font-bold text-moove-purple mb-1 tracking-wide">AI HEALTH SUMMARY</div>
              <p className="text-sm text-moove-brown font-medium leading-relaxed">{summaryText}</p>
            </div>
          </div>
        </div>

        {/* Today's recommendation */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-5 border border-orange-100">
          <div className="text-xs font-bold text-moove-orange mb-3 tracking-wide">TODAY'S RECOMMENDATION</div>
          {displayEx ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{displayEx.emoji}</div>
                <div>
                  <div className="font-display font-bold text-moove-brown">{displayEx.name}</div>
                  <div className="text-xs text-moove-muted">{displayEx.bodyArea} · {displayEx.duration}</div>
                </div>
              </div>
              <p className="text-xs text-moove-muted leading-relaxed">{displayTip}</p>
            </>
          ) : (
            <p className="text-sm text-moove-muted">{displayTip}</p>
          )}
        </div>

        {/* Weekly exercise chart */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h2 className="font-display font-bold text-moove-brown mb-1">Weekly Exercise Activity</h2>
          <p className="text-xs text-moove-muted mb-4">All types: warm-up + breaks + cool-downs</p>
          <MiniBar data={exBars} maxVal={Math.max(...exBars.map(d => d.val), 1)} color="#22C55E" accent="#F97316" />
        </div>

        {/* Driving statistics */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h2 className="font-display font-bold text-moove-brown mb-4">Driving Statistics</h2>
          <div className="flex flex-col gap-2.5">
            {drivBars.map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <div className="w-8 text-xs font-bold text-moove-muted text-right">{row.label}</div>
                <div className="flex-1 h-3 bg-orange-50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{ width: `${(row.val / Math.max(...drivBars.map(d => d.val), 1)) * 100}%`, background: row.today ? '#F97316' : 'linear-gradient(to right, #F97316, #FBBF24)' }} />
                </div>
                <div className="w-10 text-xs font-bold text-moove-brown">{row.val > 0 ? `${row.val}h` : '—'}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-moove-border text-center">
            <div className="font-display font-black text-2xl text-moove-brown">{isDemo ? '12.4h' : hasData ? `${m!.weekDrivH}h` : '—'}</div>
            <div className="text-xs text-moove-muted">Total weekly driving</div>
          </div>
        </div>
      </div>

      {!isDemo && !hasData && (
        <div className="mt-6 bg-white rounded-2xl p-8 card-shadow flex flex-col items-center text-center gap-4">
          <img src={mascotImg} alt="Moo" className="w-20 h-20 object-contain opacity-70 animate-float" />
          <div>
            <div className="font-display font-bold text-lg text-moove-brown mb-1">Dashboard awaiting your first session</div>
            <p className="text-sm text-moove-muted max-w-sm">Complete a driving session — including cool-down exercises — to populate your health dashboard with real data.</p>
          </div>
          <a href="/driver/sessions" className="px-5 py-2.5 bg-moove-orange text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all active:scale-95">Start a Session →</a>
        </div>
      )}
    </div>
  )
}
