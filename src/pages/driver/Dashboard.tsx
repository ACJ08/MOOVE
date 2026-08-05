import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import { mockDashboard, mockWeeklyActivity, mockSessions } from '@/data/mockData'
import { fetchDashboardStats, type DashboardStats } from '@/lib/db'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'

function StatCard({ icon, value, label, color, sub }: { icon: string; value: string; label: string; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 card-shadow flex flex-col gap-3 hover-lift">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${color}15` }}>
        {icon}
      </div>
      <div>
        <div className="font-display font-black text-2xl text-moove-brown">{value}</div>
        <div className="text-xs font-semibold text-moove-muted">{label}</div>
        {sub && <div className="text-xs text-moove-muted mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

const badges = [
  { icon: '🔥', label: 'Streak Master', desc: '7-day stretch', earned: true },
  { icon: '🏆', label: 'Session Pro', desc: '10 sessions', earned: true },
  { icon: '🤸', label: 'Exercise Champ', desc: '50 exercises', earned: false },
  { icon: '💪', label: 'Consistency King', desc: '30-day streak', earned: false },
]

function formatDrivingTime(seconds: number): string {
  if (seconds === 0) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isDemo = user?.id === 'demo'

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id || isDemo) { setStatsLoading(false); return }
    const load = () => {
      fetchDashboardStats(user.id).then(s => { setStats(s); setStatsLoading(false) })
    }
    load()
    window.addEventListener('moove:session-saved', load)
    return () => window.removeEventListener('moove:session-saved', load)
  }, [user?.id, isDemo])

  const demoStats = {
    todayDrivingTime: mockDashboard.todayDrivingTime,
    sedentaryTime: mockDashboard.todaySedentaryTime,
    streak: mockDashboard.movementStreak,
    exercises: mockDashboard.exercisesCompleted,
    calories: 142,
    wellness: 87,
    stress: 35,
    weeklyH: '12.4h',
    weeklyActivity: mockWeeklyActivity,
    recentSessions: mockSessions.slice(0, 3),
  }

  const realStats = stats ? {
    todayDrivingTime: formatDrivingTime(stats.todayDrivingSeconds),
    sedentaryTime: formatDrivingTime(stats.todayDrivingSeconds),
    streak: stats.movementStreak,
    exercises: stats.exercisesCompleted,
    calories: stats.caloriesBurned,
    wellness: stats.wellnessScore,
    stress: 0,
    weeklyH: formatDrivingTime(stats.weeklyDrivingSeconds),
    weeklyActivity: stats.weeklyActivity,
    recentSessions: stats.recentSessions,
  } : null

  const d = isDemo ? demoStats : realStats

  const hasData = isDemo || (stats && stats.recentSessions.length > 0)
  const maxDriving = Math.max(...(d?.weeklyActivity ?? []).map(x => x.driving), 1)

  const wellnessScore = isDemo ? 87 : (stats?.wellnessScore ?? 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-moove-brown mb-1">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-moove-muted">Here's your wellness snapshot for today.</p>
        </div>
        <button
          onClick={() => navigate('/driver/sessions')}
          className="shrink-0 bg-moove-orange text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-all shadow-sm active:scale-95"
        >
          + Start Session
        </button>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🚗" value={d?.todayDrivingTime ?? '—'} label="Today's Driving Time" color="#F97316" />
        <StatCard icon="🪑" value={d?.sedentaryTime ?? '—'} label="Sedentary Time" color="#0EA5E9" />
        <StatCard icon="🔥" value={`${d?.streak ?? 0} days`} label="Movement Streak" color="#FBBF24" />
        <StatCard icon="✅" value={String(d?.exercises ?? 0)} label="Exercises Completed" color="#22C55E" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🔥" value={`${d?.calories ?? 0} kcal`} label="Calories Burned" color="#EF4444" sub="Estimated today" />
        <StatCard icon="💚" value={`${wellnessScore}/100`} label="Wellness Score" color="#22C55E" sub={wellnessScore >= 70 ? 'Above average' : wellnessScore > 0 ? 'Keep improving' : 'No data yet'} />
        <StatCard icon="📅" value={isDemo ? '7 days' : `${stats?.movementStreak ?? 0} days`} label="Best Streak" color="#A855F7" sub="Consecutive days active" />
        <StatCard icon="📅" value={d?.weeklyH ?? '—'} label="Weekly Driving" color="#0EA5E9" sub="This week" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Wellness Score & AI */}
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <div className="flex items-start gap-4">
              <img src={mascotImg} alt="Moo" className="w-14 h-14 object-contain shrink-0 animate-float" />
              <div className="flex-1">
                <div className="text-xs font-bold text-moove-orange mb-1 tracking-wide">MOO'S RECOMMENDATION</div>
                <p className="text-sm text-moove-brown font-medium leading-relaxed">{mockDashboard.aiRecommendation}</p>
                <Link to="/driver/ai-recommendations" className="text-xs font-bold text-moove-orange mt-2 inline-block hover:underline">
                  See all insights →
                </Link>
              </div>
            </div>
          </div>

          {/* Weekly activity chart */}
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-bold text-moove-brown">Weekly Driving Activity</h2>
                <p className="text-xs text-moove-muted">Hours per day this week</p>
              </div>
              <div className="text-2xl font-black font-display text-moove-brown">{d?.weeklyH ?? '—'}</div>
            </div>
            <div className="flex items-end gap-2 h-32">
              {(d?.weeklyActivity ?? mockWeeklyActivity).map(day => (
                <div key={day.day} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full flex flex-col justify-end h-24 bg-orange-50 rounded-lg overflow-hidden">
                    <div
                      className="w-full rounded-lg transition-all duration-700"
                      style={{ height: `${maxDriving > 0 ? (day.driving / maxDriving) * 100 : 0}%`, background: day.driving > 0 ? '#F97316' : 'transparent' }}
                    />
                  </div>
                  <div className="text-xs text-moove-muted font-medium">{day.day}</div>
                  <div className="text-xs font-bold text-moove-brown">{day.driving > 0 ? `${day.driving}h` : '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sessions */}
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-moove-brown">Recent Sessions</h2>
              <Link to="/driver/sessions" className="text-xs font-bold text-moove-orange hover:underline">View all</Link>
            </div>
            <div className="flex flex-col gap-2">
              {isDemo ? (
                mockSessions.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-moove-cream">
                    <div>
                      <div className="text-xs font-bold text-moove-brown">{s.date} · {s.start}–{s.end}</div>
                      <div className="text-xs text-moove-muted">{s.route}</div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-sm font-black font-display text-moove-brown">{s.duration}</div>
                      <div className="text-xs text-moove-green font-semibold">{s.exercises} exercises</div>
                    </div>
                  </div>
                ))
              ) : statsLoading ? (
                <div className="text-center py-6 text-sm text-moove-muted">Loading sessions…</div>
              ) : stats && stats.recentSessions.length > 0 ? (
                stats.recentSessions.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-moove-cream">
                    <div>
                      <div className="text-xs font-bold text-moove-brown">{s.date} · {s.startTime}–{s.endTime}</div>
                      <div className="text-xs text-moove-muted">{s.avgRisk} risk · {s.calories} kcal</div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-sm font-black font-display text-moove-brown">{s.duration}</div>
                      <div className="text-xs text-moove-green font-semibold">{s.exercisesCompleted} exercises</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-moove-muted">
                  No sessions yet.{' '}
                  <Link to="/driver/sessions" className="text-moove-orange font-bold hover:underline">Start your first session</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Wellness Score Ring */}
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <div className="text-xs font-bold text-moove-purple mb-3 tracking-wide">DAILY WELLNESS SCORE</div>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={wellnessScore >= 80 ? '#22C55E' : wellnessScore >= 60 ? '#FBBF24' : '#EF4444'}
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - wellnessScore / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display font-black text-lg text-moove-brown">{wellnessScore || '—'}</span>
                </div>
              </div>
              <div>
                <div className="font-display font-black text-moove-brown text-base">
                  {wellnessScore >= 80 ? 'Excellent' : wellnessScore >= 60 ? 'Good' : wellnessScore > 0 ? 'Fair' : 'No data'}
                </div>
                <div className="text-xs text-moove-muted leading-tight mt-0.5">Based on sessions, exercises, and consistency</div>
              </div>
            </div>
          </div>

          {/* START DRIVING SESSION */}
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <div className="text-xs font-bold text-moove-orange mb-3 tracking-wide">START DRIVING SESSION</div>
            <div className="text-center">
              <div className="text-5xl mb-3">🚗</div>
              <div className="font-display font-black text-lg text-moove-brown mb-1">Ready to Drive?</div>
              <div className="text-xs text-moove-muted mb-4">Track exercises, breaks & wellness during your trip</div>
              <button
                onClick={() => navigate('/driver/sessions')}
                className="block w-full bg-moove-orange text-white font-bold text-sm py-2.5 rounded-xl hover:bg-orange-600 transition-all active:scale-95"
              >
                Begin Session →
              </button>
            </div>
            {hasData && (
              <div className="mt-3 pt-3 border-t border-moove-border flex items-center justify-between">
                <span className="text-xs text-moove-muted">
                  {isDemo ? '12 sessions' : `${stats?.recentSessions.length ?? 0} sessions`} recorded
                </span>
                <Link to="/driver/sessions" className="text-xs font-bold text-moove-orange hover:underline">History →</Link>
              </div>
            )}
          </div>

          {/* Achievement Badges */}
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <div className="text-xs font-bold text-moove-yellow mb-3 tracking-wide">ACHIEVEMENT BADGES</div>
            <div className="grid grid-cols-2 gap-2">
              {badges.map(b => (
                <div
                  key={b.label}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border ${b.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}
                >
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <div className="text-xs font-bold text-moove-brown leading-tight">{b.label}</div>
                  <div className="text-xs text-moove-muted">{b.desc}</div>
                  {b.earned && <div className="text-xs font-bold text-yellow-600 mt-1">Earned ✓</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Health engagement */}
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <div className="text-xs font-bold text-moove-teal mb-3 tracking-wide">HEALTH ENGAGEMENT</div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Health Score', value: isDemo ? mockDashboard.healthEngagementScore : wellnessScore, color: '#22C55E' },
                { label: 'Exercise Rate', value: isDemo ? 71 : 0, color: '#F97316' },
                { label: 'Break Compliance', value: isDemo ? 85 : 0, color: '#0EA5E9' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-moove-muted">{m.label}</span>
                    <span className="font-black text-moove-brown font-display text-sm">{m.value}%</span>
                  </div>
                  <div className="h-1.5 bg-orange-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${m.value}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preventive tip */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-5 border border-green-100">
            <div className="text-xs font-bold text-moove-green mb-2 tracking-wide">💡 PREVENTIVE TIP</div>
            <p className="text-xs text-moove-brown leading-relaxed">{mockDashboard.preventiveTip}</p>
            <Link to="/driver/education" className="text-xs font-bold text-moove-teal mt-3 inline-block hover:underline">
              Learn more →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
