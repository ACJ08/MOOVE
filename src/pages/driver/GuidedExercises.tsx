import { useState, useMemo } from 'react'
import { exercises, type Exercise } from '@/data/exercises'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'
import ExerciseVideo from '@/components/ExerciseVideo'
import { getExerciseVideo } from '@/data/exerciseVideos'

// ─── Types ────────────────────────────────────────────────────────────────────

type Context = 'traffic' | 'parked' | 'before' | 'after'
const ctxLabels: Record<Context, string> = { traffic: 'In Traffic', parked: 'Parked', before: 'Before Driving', after: 'After Driving' }
const ctxColors = { safe: '#22C55E', caution: '#FBBF24', unsafe: '#EF4444' }
const ctxIcons = { safe: '✅', caution: '⚠️', unsafe: '❌' }
const difficultyColors = { Easy: '#22C55E', Moderate: '#F97316' }

interface SavedSession {
  dateISO?: string; date?: string
  warmupExercises?: number; breakExercises?: number; cooldownExercises?: number
  exercisesCompleted?: number; totalSets?: number; durationSeconds?: number
  exerciseHistory?: CompletedExercise[]
}

interface CompletedExercise {
  exerciseId: number; name: string; bodyArea: string
  durationSeconds: number; completedAt: string; status: string
  sets?: number; durationPerSet?: number; restBetween?: number
}

function loadSessions(): SavedSession[] {
  try { return JSON.parse(localStorage.getItem('moove_session_history') || '[]') } catch { return [] }
}

function getTodayISO() { return new Date().toISOString().slice(0, 10) }

// ─── Today's Summary Widget ───────────────────────────────────────────────────

function TodaySummary() {
  const sessions = useMemo(loadSessions, [])
  const todayISO = getTodayISO()
  const todaySessions = useMemo(() => sessions.filter(s => (s.dateISO ?? '').startsWith(todayISO)), [sessions, todayISO])

  const warmup = todaySessions.reduce((s, r) => s + (r.warmupExercises ?? 0), 0)
  const brk = todaySessions.reduce((s, r) => s + (r.breakExercises ?? 0), 0)
  const cooldown = todaySessions.reduce((s, r) => s + (r.cooldownExercises ?? 0), 0)
  const total = todaySessions.reduce((s, r) => s + (r.exercisesCompleted ?? 0), 0)
  const sessionCount = todaySessions.length
  const exTimeSecs = todaySessions.reduce((sum, s) => {
    if (!s.exerciseHistory) return sum
    return sum + s.exerciseHistory.filter(e => e.status === 'completed').reduce((es, e) => es + e.durationSeconds, 0)
  }, 0)
  const exTimeMins = Math.round(exTimeSecs / 60)

  if (sessionCount === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 card-shadow mb-5 flex items-center gap-4">
        <img src={mascotImg} alt="Moo" className="w-10 h-10 object-contain animate-float shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-bold text-moove-brown mb-0.5">No driving sessions today yet</div>
          <div className="text-xs text-moove-muted">Complete a driving session to track your exercise progress here.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow mb-5">
      <div className="flex items-center gap-3 mb-4">
        <img src={mascotImg} alt="Moo" className="w-10 h-10 object-contain animate-float shrink-0" />
        <div>
          <div className="text-xs font-bold text-moove-muted tracking-wide">TODAY'S EXERCISE SUMMARY</div>
          <div className="text-sm font-bold text-moove-brown">
            {sessionCount} session{sessionCount > 1 ? 's' : ''} · {total} exercise{total !== 1 ? 's' : ''} · {exTimeMins} min active
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Warm-Up', value: warmup, icon: '🌅', color: '#F97316' },
          { label: 'Break', value: brk, icon: '🤸', color: '#22C55E' },
          { label: 'Cool-Down', value: cooldown, icon: '🌆', color: '#0EA5E9' },
          { label: 'Total', value: total, icon: '✅', color: '#A855F7' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: `${s.color}10` }}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="font-display font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-moove-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Exercise Detail Modal (read-only) ────────────────────────────────────────

function ExerciseDetailModal({ ex, onClose }: { ex: Exercise; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[94vh] overflow-y-auto card-shadow-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <div className="text-xs font-black tracking-widest text-moove-orange mb-1">{ex.category.toUpperCase()} EXERCISE</div>
            <h2 className="font-display font-black text-2xl text-moove-brown leading-tight">{ex.name}</h2>
            <p className="text-sm text-moove-muted mt-0.5">{ex.bodyArea}</p>
          </div>
          <button onClick={onClose} className="text-moove-muted hover:text-moove-brown text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-moove-cream transition-colors shrink-0 ml-3">×</button>
        </div>

        {/* Video player */}
        <div className="px-5 mb-4">
          <ExerciseVideo exerciseEmoji={ex.emoji} playing={true} src={getExerciseVideo(ex.id)} />
        </div>

        {/* Stats grid */}
        <div className="px-5 mb-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Duration', value: `${ex.durationSeconds}s`, icon: '⏱' },
              { label: 'Sets', value: String(ex.sets), icon: '🔁' },
              { label: 'Rest', value: ex.rest > 0 ? `${ex.rest}s` : '—', icon: '😮‍💨' },
              { label: 'Level', value: ex.difficulty, icon: '📊' },
            ].map(s => (
              <div key={s.label} className="text-center bg-moove-cream rounded-2xl py-3 px-1">
                <div className="text-base mb-0.5">{s.icon}</div>
                <div className="font-display font-black text-moove-brown text-sm leading-tight">{s.value}</div>
                <div className="text-[10px] text-moove-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended config */}
        <div className="px-5 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-xs text-green-800">
            <div className="font-bold text-sm mb-1">📋 Recommended</div>
            <div className="text-green-700">
              {ex.sets} Set{ex.sets > 1 ? 's' : ''} × {ex.durationSeconds}s
              {ex.rest > 0 && <span> · Rest {ex.rest}s between sets</span>}
            </div>
          </div>
        </div>

        {/* Safe contexts */}
        <div className="px-5 mb-4">
          <div className="text-xs font-black tracking-widest text-moove-brown mb-2">SAFE CONTEXTS</div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(ex.contexts) as [Context, 'safe' | 'caution' | 'unsafe'][]).map(([ctx, rating]) => (
              <div key={ctx} className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl" style={{ background: `${ctxColors[rating]}15`, color: ctxColors[rating] }}>
                <span className="text-base">{ctxIcons[rating]}</span><span>{ctxLabels[ctx]}</span>
              </div>
            ))}
          </div>
        </div>

        {ex.safetyNote && (
          <div className="px-5 mb-4">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 text-xs text-red-700 font-medium">
              ⚠️ {ex.safetyNote}
            </div>
          </div>
        )}

        {/* Detail sections */}
        <div className="px-5 space-y-3 mb-4">
          <div className="rounded-2xl overflow-hidden border border-moove-border">
            <div className="px-4 py-3 bg-moove-cream">
              <div className="text-xs font-black tracking-widest text-moove-brown">TARGET MUSCLES</div>
            </div>
            <div className="px-4 py-3">
              <div className="flex flex-wrap gap-1.5">
                {ex.targetMuscles.split(',').map(m => (
                  <span key={m} className="text-xs bg-orange-50 text-moove-orange font-semibold px-2.5 py-1 rounded-full border border-orange-100">{m.trim()}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-green-100">
            <div className="px-4 py-3 bg-green-50">
              <div className="text-xs font-black tracking-widest text-green-800">BENEFITS</div>
            </div>
            <div className="px-4 py-3 space-y-2">
              {ex.benefits.map(b => (
                <div key={b} className="flex items-center gap-2.5 text-sm text-moove-brown">
                  <span className="text-green-500 font-black shrink-0 text-base">✓</span> {b}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-blue-100">
            <div className="px-4 py-3 bg-blue-50">
              <div className="text-xs font-black tracking-widest text-blue-800">WHY DRIVERS NEED IT</div>
            </div>
            <div className="px-4 py-3 text-sm text-moove-brown leading-relaxed">{ex.whyDriversNeedIt}</div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-purple-100">
            <div className="px-4 py-3 bg-purple-50">
              <div className="text-xs font-black tracking-widest text-purple-800">KEY INSTRUCTION</div>
            </div>
            <div className="px-4 py-3 text-sm text-moove-brown leading-relaxed">{ex.keyInstruction}</div>
          </div>
        </div>

        <div className="mx-5 mb-5 bg-orange-50 border border-orange-100 rounded-2xl p-3.5 text-xs text-orange-700 text-center">
          💡 Exercises are performed during your <strong>Driving Session</strong> (Warm-Up, Break, Stop & Cool-Down).
        </div>
      </div>
    </div>
  )
}

// ─── Exercise History Tab ─────────────────────────────────────────────────────

function ExerciseHistory() {
  const allSessions = useMemo(loadSessions, [])
  const todayISO = getTodayISO()
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [catFilter, setCatFilter] = useState<'all' | 'warmup' | 'break' | 'cooldown'>('all')

  const historyRows = useMemo(() => {
    const rows: { sessionDate: string; sessionIdx: number; ex: CompletedExercise; category: string }[] = []
    allSessions.forEach((s, idx) => {
      if (!s.exerciseHistory) return
      const dateISO = s.dateISO ?? ''
      s.exerciseHistory.filter(e => e.status === 'completed').forEach(e => {
        rows.push({ sessionDate: dateISO, sessionIdx: idx, ex: e, category: 'break' })
      })
    })
    return rows
  }, [allSessions])

  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6)
  const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 29)

  const filtered = useMemo(() => {
    return historyRows.filter(r => {
      if (dateFilter === 'today' && r.sessionDate !== todayISO) return false
      if (dateFilter === 'week' && r.sessionDate < weekAgo.toISOString().slice(0, 10)) return false
      if (dateFilter === 'month' && r.sessionDate < monthAgo.toISOString().slice(0, 10)) return false
      if (search && !r.ex.name.toLowerCase().includes(search.toLowerCase()) && !r.ex.bodyArea.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [historyRows, dateFilter, catFilter, search])

  const streak = useMemo(() => {
    const days = new Set(allSessions.map(s => s.dateISO ?? '').filter(Boolean))
    let count = 0
    const cur = new Date()
    while (true) {
      const iso = cur.toISOString().slice(0, 10)
      if (!days.has(iso)) break
      count++
      cur.setDate(cur.getDate() - 1)
    }
    return count
  }, [allSessions])

  const totalExAll = useMemo(() => allSessions.reduce((s, r) => s + (r.exercisesCompleted ?? 0), 0), [allSessions])
  const totalSetsAll = useMemo(() => allSessions.reduce((s, r) => s + (r.totalSets ?? 0), 0), [allSessions])

  const weekSessions = useMemo(() => {
    const cutoff = weekAgo.toISOString().slice(0, 10)
    return allSessions.filter(s => (s.dateISO ?? '') >= cutoff)
  }, [allSessions])
  const weekWarmup = weekSessions.reduce((s, r) => s + (r.warmupExercises ?? 0), 0)
  const weekBreaks = weekSessions.reduce((s, r) => s + (r.breakExercises ?? 0), 0)
  const weekCooldown = weekSessions.reduce((s, r) => s + (r.cooldownExercises ?? 0), 0)
  const maxWeek = Math.max(weekWarmup, weekBreaks, weekCooldown, 5)

  if (allSessions.length === 0) {
    return (
      <div className="py-16 text-center">
        <img src={mascotImg} alt="Moo" className="w-16 h-16 object-contain mx-auto mb-4 animate-float opacity-60" />
        <div className="font-display font-bold text-moove-brown mb-2">No history yet!</div>
        <p className="text-sm text-moove-muted">Complete a Driving Session to see your exercise history here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Day Streak', value: String(streak), icon: '🔥', color: '#F97316' },
          { label: 'Total Exercises', value: String(totalExAll), icon: '✅', color: '#22C55E' },
          { label: 'Total Sets', value: String(totalSetsAll), icon: '💪', color: '#0EA5E9' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 card-shadow text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-display font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-moove-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly progress */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="text-xs font-bold text-moove-muted tracking-wide mb-4">THIS WEEK BY CATEGORY</div>
        <div className="space-y-3">
          {[
            { label: 'Warm-Up', count: weekWarmup, icon: '🌅', color: '#F97316' },
            { label: 'Break Exercises', count: weekBreaks, icon: '🤸', color: '#22C55E' },
            { label: 'Cool-Down', count: weekCooldown, icon: '🌆', color: '#0EA5E9' },
          ].map(c => {
            const pct = maxWeek > 0 ? Math.round((c.count / maxWeek) * 100) : 0
            return (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{c.icon}</span>
                    <span className="text-sm font-semibold text-moove-brown">{c.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm" style={{ color: c.color }}>{c.count}</span>
                    <span className="text-xs text-moove-muted">{pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 bg-moove-cream rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: c.color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Search + filter */}
      <div className="bg-white rounded-2xl p-4 card-shadow">
        <div className="text-xs font-bold text-moove-muted tracking-wide mb-3">EXERCISE HISTORY</div>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or body area…"
          className="w-full px-4 py-2.5 rounded-xl border border-moove-border text-sm text-moove-brown placeholder:text-moove-muted/60 focus:outline-none focus:ring-2 focus:ring-moove-orange/40 mb-3"
        />
        <div className="flex gap-2 flex-wrap mb-4">
          {([['all', 'All Time'], ['today', 'Today'], ['week', 'This Week'], ['month', 'This Month']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setDateFilter(v)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition-all ${dateFilter === v ? 'bg-moove-orange text-white border-moove-orange' : 'bg-white text-moove-muted border-moove-border hover:border-orange-200'}`}>
              {l}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-moove-muted">No exercises match your filter.</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.slice(0, 50).map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-moove-cream hover:bg-orange-50 transition-colors">
                <span className="text-moove-green font-black shrink-0">✓</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-moove-brown">{r.ex.name}</div>
                  <div className="text-xs text-moove-muted">{r.ex.bodyArea}</div>
                </div>
                <div className="text-right shrink-0">
                  {r.ex.sets ? <div className="text-xs font-bold text-moove-orange">{r.ex.sets} set{r.ex.sets > 1 ? 's' : ''}</div> : null}
                  <div className="text-xs text-moove-muted">{r.ex.durationSeconds}s</div>
                  <div className="text-xs text-moove-muted">{r.sessionDate}</div>
                </div>
              </div>
            ))}
            {filtered.length > 50 && (
              <div className="text-center text-xs text-moove-muted py-2">Showing 50 of {filtered.length} records</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GuidedExercises() {
  const [selected, setSelected] = useState<Exercise | null>(null)
  const [filter, setFilter] = useState<'all' | 'Upper Body' | 'Lower Body & Eyes'>('all')
  const [tab, setTab] = useState<'library' | 'history'>('library')

  const filtered = filter === 'all' ? exercises : exercises.filter(e => e.category === filter)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Exercise Library</h1>
          <p className="text-sm text-moove-muted">Browse exercises, learn proper technique, and understand benefits.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 card-shadow">
          <button onClick={() => setTab('library')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${tab === 'library' ? 'bg-moove-orange text-white' : 'text-moove-muted hover:text-moove-brown'}`}>
            📖 Library
          </button>
          <button onClick={() => setTab('history')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${tab === 'history' ? 'bg-moove-orange text-white' : 'text-moove-muted hover:text-moove-brown'}`}>
            📊 History
          </button>
        </div>
      </div>

      {tab === 'history' && <ExerciseHistory />}

      {tab === 'library' && (
        <>
          <TodaySummary />

          <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 card-shadow mb-5 w-fit">
            {(['all', 'Upper Body', 'Lower Body & Eyes'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${filter === f ? 'bg-moove-orange text-white' : 'text-moove-muted hover:text-moove-brown'}`}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 mb-5 text-xs text-blue-700 flex gap-2">
            <span className="shrink-0">ℹ️</span>
            <span>This library is for learning and reference. Exercises are performed during your <strong>Driving Session</strong> (Warm-Up, Break, Stop & Cool-Down flows).</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(ex => (
              <button key={ex.id} onClick={() => setSelected(ex)}
                className="text-left bg-white rounded-2xl p-5 card-shadow hover-lift transition-all border-2 border-transparent hover:border-orange-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{ex.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-moove-muted mb-0.5">{ex.category}</div>
                    <div className="font-display font-bold text-moove-brown text-sm leading-snug">{ex.name}</div>
                  </div>
                  <span className="text-xs font-bold text-moove-orange shrink-0">→</span>
                </div>
                <div className="flex gap-1.5 mb-2.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full border" style={{ color: difficultyColors[ex.difficulty], borderColor: `${difficultyColors[ex.difficulty]}40`, background: `${difficultyColors[ex.difficulty]}10` }}>{ex.difficulty}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{ex.durationSeconds}s</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">{ex.sets}×sets</span>
                </div>
                <div className="text-xs text-moove-muted leading-relaxed mb-3 line-clamp-2">{ex.whyDriversNeedIt}</div>
                <div className="flex gap-1 flex-wrap">
                  {(Object.entries(ex.contexts) as [Context, 'safe' | 'caution' | 'unsafe'][]).map(([ctx, rating]) => (
                    <span key={ctx} className="text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: `${ctxColors[rating]}15`, color: ctxColors[rating] }}>
                      {ctxIcons[rating]} {ctxLabels[ctx]}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {selected && <ExerciseDetailModal ex={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
