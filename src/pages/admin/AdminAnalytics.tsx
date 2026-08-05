import { useState, useEffect } from 'react'
import { fetchAdminAnalytics, type AdminAnalyticsStats } from '@/lib/db'

interface LocalSession {
  durationSeconds: number
  exercisesCompleted: number
  exercisesSkipped?: number
  avgRisk: string
  date: string
  dateISO?: string
  calories: number
}

function avg(arr: number[]): number {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

const riskColors: Record<string, string> = { Low: '#22C55E', Moderate: '#FBBF24', High: '#F97316', 'Very High': '#EF4444' }

export default function AdminAnalytics() {
  const [localSessions, setLocalSessions] = useState<LocalSession[]>([])
  const [supabaseStats, setSupabaseStats] = useState<AdminAnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try { setLocalSessions(JSON.parse(localStorage.getItem('moove_session_history') || '[]')) } catch { setLocalSessions([]) }

    fetchAdminAnalytics(30).then(stats => {
      setSupabaseStats(stats)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Merge: prefer Supabase stats if available, supplement with local
  const hasSupa = supabaseStats && supabaseStats.totalSessions > 0

  const totalSessions = hasSupa ? supabaseStats!.totalSessions : localSessions.length
  const avgDuration = hasSupa ? supabaseStats!.avgDurationMinutes : avg(localSessions.map(s => s.durationSeconds / 60))
  const avgExercises = avg(localSessions.map(s => s.exercisesCompleted))
  const avgCalories = avg(localSessions.map(s => s.calories || 0))
  const exerciseRate = hasSupa
    ? supabaseStats!.exerciseCompletionRate
    : (() => {
        const completed = localSessions.reduce((a, s) => a + s.exercisesCompleted, 0)
        const skipped = localSessions.reduce((a, s) => a + (s.exercisesSkipped || 0), 0)
        return completed + skipped > 0 ? Math.round(completed / (completed + skipped) * 100) : 0
      })()

  const riskCounts: Record<string, number> = hasSupa
    ? { Low: supabaseStats!.riskDistribution.Low, Moderate: supabaseStats!.riskDistribution.Moderate, High: supabaseStats!.riskDistribution.High, 'Very High': 0 }
    : { Low: 0, Moderate: 0, High: 0, 'Very High': 0 }

  if (!hasSupa) localSessions.forEach(s => { if (riskCounts[s.avgRisk] !== undefined) riskCounts[s.avgRisk]++ })

  const isEmpty = totalSessions === 0 && !loading

  // Daily active users chart (last 14 days)
  const dauData = hasSupa
    ? supabaseStats!.dailyActiveUsers.slice(-14)
    : (() => {
        const map: Record<string, number> = {}
        localSessions.forEach(s => { const d = s.dateISO || s.date; map[d] = (map[d] || 0) + 1 })
        return Object.entries(map).slice(-14).map(([date, count]) => ({ date, count }))
      })()

  const maxDau = Math.max(...dauData.map(d => d.count), 1)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Analytics</h1>
          <p className="text-sm text-moove-muted">Driving session trends and behavioral analytics.</p>
        </div>
        {hasSupa && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-100 shrink-0">
            ● Live from Supabase
          </span>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-10 card-shadow text-center">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-moove-muted">Loading analytics…</p>
        </div>
      ) : isEmpty ? (
        <div className="bg-white rounded-2xl p-10 card-shadow text-center">
          <div className="text-4xl mb-3">📈</div>
          <div className="font-display font-bold text-xl text-moove-brown mb-2">No Analytics Data Yet</div>
          <p className="text-sm text-moove-muted">Analytics will populate once drivers complete driving sessions.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* KPI grid */}
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <div className="text-xs font-bold text-moove-muted mb-4 tracking-wide">SESSION AVERAGES</div>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Avg Session Duration', value: `${Math.round(avgDuration)} min`, icon: '⏱️', color: '#F97316' },
                { label: 'Avg Exercises / Session', value: avgExercises.toFixed(1), icon: '🤸', color: '#22C55E' },
                { label: 'Exercise Completion Rate', value: exerciseRate > 0 ? `${exerciseRate}%` : '—', icon: '✅', color: '#A855F7' },
                { label: 'Total Sessions', value: String(totalSessions), icon: '🚗', color: '#3B82F6' },
                { label: hasSupa ? 'Total Participants (DB)' : 'Avg Calories Burned', value: hasSupa ? String(supabaseStats!.totalUsers) : `${avgCalories.toFixed(0)} kcal`, icon: hasSupa ? '👥' : '🔥', color: '#EF4444' },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-4 p-3 rounded-xl bg-moove-cream">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${m.color}15` }}>{m.icon}</div>
                  <div className="flex-1">
                    <div className="text-xs text-moove-muted">{m.label}</div>
                    <div className="font-display font-black text-moove-brown text-xl">{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk distribution */}
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <div className="text-xs font-bold text-moove-muted mb-4 tracking-wide">SEDENTARY RISK DISTRIBUTION</div>
            {Object.entries(riskCounts).map(([risk, cnt]) => (
              <div key={risk} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold" style={{ color: riskColors[risk] }}>{risk}</span>
                  <span className="text-moove-muted">{cnt} session{cnt !== 1 ? 's' : ''} ({totalSessions > 0 ? Math.round((cnt / totalSessions) * 100) : 0}%)</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${totalSessions > 0 ? (cnt / totalSessions) * 100 : 0}%`, background: riskColors[risk] }} />
                </div>
              </div>
            ))}

            {hasSupa && (
              <div className="mt-5">
                <div className="text-xs font-bold text-moove-muted mb-3 tracking-wide">BREAK COMPLIANCE</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${supabaseStats!.breakComplianceRate}%` }} />
                  </div>
                  <span className="text-sm font-black text-purple-600 shrink-0">{supabaseStats!.breakComplianceRate}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Daily Active Users chart */}
          {dauData.length > 0 && (
            <div className="bg-white rounded-2xl p-5 card-shadow lg:col-span-2">
              <div className="text-xs font-bold text-moove-muted mb-4 tracking-wide">DAILY ACTIVE USERS (LAST 14 DAYS)</div>
              <div className="flex items-end gap-1.5 h-32">
                {dauData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${Math.max(4, (d.count / maxDau) * 100)}%`,
                        background: 'linear-gradient(to top, #A855F7, #C084FC)',
                        minHeight: '4px',
                      }}
                      title={`${d.date}: ${d.count}`}
                    />
                    <span className="text-[9px] text-moove-muted truncate w-full text-center">
                      {d.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent sessions */}
          <div className="bg-white rounded-2xl p-5 card-shadow lg:col-span-2">
            <div className="text-xs font-bold text-moove-muted mb-4 tracking-wide">RECENT SESSIONS TIMELINE</div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {localSessions.slice(0, 15).map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-moove-cream text-xs">
                  <div className="font-bold text-moove-brown shrink-0">{s.date}</div>
                  <div className="flex-1 text-moove-muted">{Math.round(s.durationSeconds / 60)} min · {s.exercisesCompleted} exercises</div>
                  <div className="font-bold shrink-0" style={{ color: riskColors[s.avgRisk] || '#9E8B7D' }}>{s.avgRisk} risk</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
