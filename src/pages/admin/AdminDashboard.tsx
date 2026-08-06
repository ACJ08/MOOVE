import { useState, useEffect } from 'react'
import type { FeedbackEntry } from '@/pages/driver/FeedbackValidation'
import { fetchAllSessionsAdmin, fetchFeedbackSubmissions } from '@/lib/db'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionEntry {
  durationSeconds: number
  exercisesCompleted: number
  avgRisk?: string
  submittedAt?: string
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadFeedback(): FeedbackEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem('moove_feedback_responses') || '[]')
    // Only include entries that conform to the new FeedbackEntry shape
    return (Array.isArray(raw) ? raw : []).filter(
      (f: unknown) => f !== null && typeof f === 'object' && 'overallRating' in (f as object)
    ) as FeedbackEntry[]
  } catch { return [] }
}

function loadSessions(): SessionEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem('moove_session_history') || '[]')
    return Array.isArray(raw) ? raw : []
  } catch { return [] }
}

function safeAvg(arr: number[]): number {
  const valid = arr.filter(n => typeof n === 'number' && !isNaN(n) && n > 0)
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
}

function safePct(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0
}

const intentOptions = [
  { l: 'Yes', v: 'yes', c: '#22C55E' },
  { l: 'Partially', v: 'partially', c: '#FBBF24' },
  { l: 'Maybe', v: 'maybe', c: '#FBBF24' },
  { l: 'No', v: 'no', c: '#EF4444' },
] as const

function normaliseIntent(value: string | null | undefined): string {
  const normalised = value?.trim().toLowerCase() ?? ''
  if (normalised === 'partly') return 'partially'
  return intentOptions.some(option => option.v === normalised) ? normalised : ''
}

function modeOf(arr: string[]): [string, number][] {
  const freq: Record<string, number> = {}
  arr.forEach(s => { if (s) freq[s] = (freq[s] ?? 0) + 1 })
  return Object.entries(freq).sort((a, b) => b[1] - a[1])
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function KPICard({ icon, value, label, color, sub }: { icon: string; value: string; label: string; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 card-shadow hover-lift">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background: `${color}15` }}>{icon}</div>
      <div className="font-display font-black text-2xl text-moove-brown">{value}</div>
      <div className="text-xs font-semibold text-moove-muted">{label}</div>
      {sub && <div className="text-xs text-moove-muted mt-0.5">{sub}</div>}
    </div>
  )
}

function MiniBar({ label, value, max = 5, color = '#F97316' }: { label: string; value: number; max?: number; color?: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="text-xs text-moove-muted w-40 shrink-0 truncate">{label}</div>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <div className="text-xs font-bold text-moove-brown w-8 text-right">{value.toFixed(1)}</div>
    </div>
  )
}

function DistBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const p = safePct(count, total)
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-moove-muted truncate max-w-[70%]">{label}</span>
        <span className="font-bold text-moove-brown shrink-0">{count} ({p}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${p}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [tab, setTab] = useState<'overview' | 'features' | 'ratings' | 'intent' | 'sessions'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [dbSessions, dbFeedback] = await Promise.all([fetchAllSessionsAdmin(), fetchFeedbackSubmissions()])
        setSessions(dbSessions.map(s => ({ durationSeconds: s.durationSeconds, exercisesCompleted: s.exercisesCompleted, avgRisk: s.avgRisk, submittedAt: s.startedAt })))
        setFeedback(dbFeedback.map(f => ({
          overallRating: f.overallRating ?? 0, firstImpression: f.firstImpression ?? 0,
          easeOfNavigation: f.easeOfNavigation ?? 0, easeOfLearning: f.easeOfLearning ?? 0,
          accomplishedTask: f.accomplishedTask ?? '', mostUsefulFeature: f.mostUsefulFeature ?? '',
          needsImprovement: f.needsImprovement ?? '',
          wouldUseAgain: normaliseIntent(f.wouldUseAgain),
          wouldRecommend: normaliseIntent(f.wouldRecommend),
          driverId: f.userId ?? '', date: f.submittedAt,
        }) as FeedbackEntry))
      } finally { setLoading(false) }
    }
    void load()
    window.addEventListener('moove:session-saved', load)
    const channel = supabase
      ?.channel('research-dashboard-feedback')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback_submissions' }, () => { void load() })
      .subscribe()
    return () => {
      window.removeEventListener('moove:session-saved', load)
      if (channel) void supabase?.removeChannel(channel)
    }
  }, [])

  const n = feedback.length

  // Derived safe metrics
  const avgOverall = safeAvg(feedback.map(f => f.overallRating))
  const avgFirstImpression = safeAvg(feedback.map(f => f.firstImpression))
  const avgEaseNav = safeAvg(feedback.map(f => f.easeOfNavigation))
  const avgEaseLearn = safeAvg(feedback.map(f => f.easeOfLearning))
  const recommendationAnswers = feedback.map(f => normaliseIntent(f.wouldRecommend)).filter(Boolean)
  const useAgainAnswers = feedback.map(f => normaliseIntent(f.wouldUseAgain)).filter(Boolean)
  const recRate = safePct(recommendationAnswers.filter(value => value === 'yes').length, recommendationAnswers.length)
  const useAgainRate = safePct(useAgainAnswers.filter(value => value === 'yes').length, useAgainAnswers.length)
  const successRate = safePct(feedback.filter(f => f.accomplishedTask === 'yes').length, n)

  const avgSessionDuration = safeAvg(sessions.map(s => s.durationSeconds))
  const avgExercisesPerSession = safeAvg(sessions.map(s => s.exercisesCompleted))

  const usefulFeatures = modeOf(feedback.map(f => f.mostUsefulFeature))
  const improvementFeatures = modeOf(feedback.map(f => f.needsImprovement))

  const riskDist: Record<string, number> = {}
  sessions.forEach(s => {
    if (s.avgRisk) riskDist[s.avgRisk] = (riskDist[s.avgRisk] ?? 0) + 1
  })

  const tabs = [
    { id: 'overview' as const, label: '📊 Overview' },
    { id: 'features' as const, label: '🏆 Features' },
    { id: 'ratings' as const, label: '⭐ Ratings' },
    { id: 'intent' as const, label: '🚀 Intent' },
    { id: 'sessions' as const, label: '🚗 Sessions' },
  ]

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-3">
        <div className="w-8 h-8 border-4 border-moove-orange border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-moove-muted">Loading dashboard data…</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Research Dashboard</h1>
        <p className="text-sm text-moove-muted">Aggregate analytics from UNLEASH testing sessions — TRL-4 validation data.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KPICard icon="👥" value={String(n)} label="Total Participants" color="#F97316" />
        <KPICard icon="⭐" value={avgOverall > 0 ? `${avgOverall.toFixed(1)}/5` : '—'} label="Avg Overall Rating" color="#FBBF24" />
        <KPICard icon="✅" value={n > 0 ? `${successRate}%` : '—'} label="User Success Rate" color="#22C55E" />
        <KPICard icon="📢" value={n > 0 ? `${recRate}%` : '—'} label="Recommendation Rate" color="#0EA5E9" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon="🧭" value={avgEaseNav > 0 ? `${avgEaseNav.toFixed(1)}/5` : '—'} label="Ease of Navigation" color="#A855F7" />
        <KPICard icon="📖" value={avgEaseLearn > 0 ? `${avgEaseLearn.toFixed(1)}/5` : '—'} label="Ease of Learning" color="#0EA5E9" />
        <KPICard icon="🤸" value={avgExercisesPerSession > 0 ? avgExercisesPerSession.toFixed(1) : '—'} label="Avg Exercises/Session" color="#22C55E" />
        <KPICard icon="⏱️" value={avgSessionDuration > 0 ? `${Math.round(avgSessionDuration / 60)}m` : '—'} label="Avg Session Duration" color="#F97316" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all ${
              tab === t.id ? 'bg-moove-orange text-white' : 'bg-white text-moove-muted border border-moove-border hover:border-moove-orange'
            }`}>{t.label}</button>
        ))}
      </div>

      {n === 0 && sessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 card-shadow text-center">
          <div className="text-5xl mb-4">🔬</div>
          <div className="font-display font-bold text-xl text-moove-brown mb-2">No Research Data Yet</div>
          <p className="text-sm text-moove-muted max-w-md mx-auto">
            Research data will appear here once participants complete the Driver Feedback survey. Go to the Testing Analysis Dashboard to configure testing parameters.
          </p>
        </div>
      ) : (
        <>
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-black text-moove-muted mb-4 tracking-widest">KEY METRICS</div>
                <MiniBar label="Overall Rating" value={avgOverall} color="#F97316" />
                <MiniBar label="First Impression" value={avgFirstImpression} color="#FBBF24" />
                <MiniBar label="Ease of Navigation" value={avgEaseNav} color="#0EA5E9" />
                <MiniBar label="Ease of Learning" value={avgEaseLearn} color="#A855F7" />
              </div>

              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-black text-moove-muted mb-4 tracking-widest">ADOPTION INTENT</div>
                {[
                  { label: 'Would Use Again', value: useAgainRate, color: '#22C55E' },
                  { label: 'Would Recommend', value: recRate, color: '#0EA5E9' },
                  { label: 'Task Accomplished', value: successRate, color: '#A855F7' },
                ].map(m => (
                  <div key={m.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-moove-muted">{m.label}</span>
                      <span className="font-bold text-moove-brown">{m.value}% Yes</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent comments */}
              {feedback.some(f => f.additionalComments) && (
                <div className="bg-white rounded-2xl p-5 card-shadow lg:col-span-2">
                  <div className="text-xs font-black text-moove-muted mb-4 tracking-widest">RECENT COMMENTS</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {feedback.filter(f => f.additionalComments).slice(-5).reverse().map((f, i) => (
                      <div key={i} className="text-xs text-moove-brown bg-moove-cream rounded-xl p-3 border border-moove-border">
                        <div className="text-moove-muted text-[10px] mb-1">{f.driverId} · {f.date}</div>
                        "{f.additionalComments}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FEATURES */}
          {tab === 'features' && (
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-black text-moove-muted mb-4 tracking-widest">MOST USEFUL FEATURES</div>
                {usefulFeatures.length === 0 ? (
                  <div className="text-sm text-moove-muted text-center py-6">No feature data yet.</div>
                ) : (
                  usefulFeatures.map(([feature, count]) => (
                    <DistBar key={feature} label={feature} count={count} total={n} color="#22C55E" />
                  ))
                )}
              </div>
              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-black text-moove-muted mb-4 tracking-widest">FEATURES NEEDING IMPROVEMENT</div>
                {improvementFeatures.length === 0 ? (
                  <div className="text-sm text-moove-muted text-center py-6">No data yet.</div>
                ) : (
                  improvementFeatures.map(([feature, count]) => (
                    <DistBar key={feature} label={feature} count={count} total={n}
                      color={feature === 'None – Everything works well' ? '#22C55E' : '#F97316'} />
                  ))
                )}
              </div>
              {/* Bug reports */}
              {feedback.some(f => f.bugReport) && (
                <div className="bg-white rounded-2xl p-5 card-shadow lg:col-span-2">
                  <div className="text-xs font-black text-moove-muted mb-4 tracking-widest">BUG REPORTS</div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {feedback.filter(f => f.bugReport).map((f, i) => (
                      <div key={i} className="text-xs text-red-700 bg-red-50 rounded-xl p-3 border border-red-100">{f.bugReport}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RATINGS */}
          {tab === 'ratings' && (
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <div className="text-xs font-black text-moove-muted mb-5 tracking-widest">RATING BREAKDOWN</div>
              {n === 0 ? (
                <div className="text-center py-8 text-sm text-moove-muted">No survey data yet.</div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    <MiniBar label="Overall Rating" value={avgOverall} color="#F97316" />
                    <MiniBar label="First Impression" value={avgFirstImpression} color="#FBBF24" />
                    <MiniBar label="Ease of Navigation" value={avgEaseNav} color="#0EA5E9" />
                    <MiniBar label="Ease of Learning" value={avgEaseLearn} color="#A855F7" />
                  </div>
                  {/* Star distribution for overall rating */}
                  <div className="text-xs font-black text-moove-muted mb-3 tracking-widest">OVERALL RATING DISTRIBUTION</div>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = feedback.filter(f => f.overallRating === star).length
                    return (
                      <div key={star} className="flex items-center gap-3 mb-1.5">
                        <div className="text-xs font-bold text-moove-brown w-8 shrink-0">{star}★</div>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${safePct(count, n)}%` }} />
                        </div>
                        <div className="text-xs font-bold text-moove-muted w-10 text-right">{count}</div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}

          {/* INTENT */}
          {tab === 'intent' && (
            <div className="grid lg:grid-cols-3 gap-5">
              {[
                { label: 'Would Use Again', key: 'wouldUseAgain' as const },
                { label: 'Would Recommend', key: 'wouldRecommend' as const },
                { label: 'Accomplished Task', key: 'accomplishedTask' as const },
              ].map(q => {
                const vals = feedback.map(f => normaliseIntent(f[q.key])).filter(Boolean)
                return (
                  <div key={q.label} className="bg-white rounded-2xl p-5 card-shadow">
                    <div className="text-xs font-black text-moove-muted mb-4 text-center tracking-widest">{q.label.toUpperCase()}</div>
                    {vals.length === 0 ? (
                      <div className="text-center py-8 text-sm text-moove-muted">No responses to this question yet.</div>
                    ) : intentOptions.map(o => {
                      const count = vals.filter(v => v === o.v).length
                      if (count === 0) return null
                      return (
                        <div key={o.v} className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold" style={{ color: o.c }}>{o.l}</span>
                            <span className="font-bold text-moove-brown">{count} ({safePct(count, vals.length)}%)</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${safePct(count, vals.length)}%`, background: o.c }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          {/* SESSIONS */}
          {tab === 'sessions' && (
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-black text-moove-muted mb-4 tracking-widest">SESSION STATISTICS</div>
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-sm text-moove-muted">No session data yet.</div>
                ) : (
                  <div className="space-y-3">
                    <MiniBar label="Avg Duration (min)" value={avgSessionDuration / 60} max={120} color="#F97316" />
                    <MiniBar label="Avg Exercises/Session" value={avgExercisesPerSession} max={10} color="#22C55E" />
                    <div className="text-xs text-moove-muted pt-2">
                      Total sessions: <strong className="text-moove-brown">{sessions.length}</strong>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-black text-moove-muted mb-4 tracking-widest">SEDENTARY RISK DISTRIBUTION</div>
                {Object.keys(riskDist).length === 0 ? (
                  <div className="text-center py-8 text-sm text-moove-muted">No risk data yet.</div>
                ) : (
                  Object.entries(riskDist).map(([risk, cnt]) => {
                    const colors: Record<string, string> = { Low: '#22C55E', Moderate: '#FBBF24', High: '#F97316', 'Very High': '#EF4444' }
                    return (
                      <div key={risk} className="flex items-center gap-3 mb-2">
                        <div className="text-xs font-bold w-20 shrink-0" style={{ color: colors[risk] || '#9E8B7D' }}>{risk}</div>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(cnt / sessions.length) * 100}%`, background: colors[risk] || '#9E8B7D' }} />
                        </div>
                        <div className="text-xs font-bold text-moove-brown w-6">{cnt}</div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
