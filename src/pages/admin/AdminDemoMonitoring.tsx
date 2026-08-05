import { useState, useEffect } from 'react'
import { fetchAllSessionsAdmin, type AdminSessionRow } from '@/lib/db'

interface SessionEntry {
  id: string
  date: string
  startTime: string
  endTime: string
  duration: string
  durationSeconds: number
  exercisesCompleted: number
  avgRisk: string
  calories: number
  notes: string
}

export default function AdminDemoMonitoring() {
  const [sessions, setSessions] = useState<SessionEntry[]>([])

  useEffect(() => {
    const load = async () => setSessions((await fetchAllSessionsAdmin()).map((row: AdminSessionRow) => {
      const started = new Date(row.startedAt)
      return {
        id: row.id,
        date: started.toLocaleDateString('en-PH'),
        startTime: started.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
        endTime: 'Completed', duration: `${Math.round(row.durationSeconds / 60)} min`,
        durationSeconds: row.durationSeconds, exercisesCompleted: row.exercisesCompleted,
        avgRisk: row.avgRisk, calories: 0, notes: '',
      }
    }))
    void load()
    window.addEventListener('moove:session-saved', load)
    return () => window.removeEventListener('moove:session-saved', load)
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Demo Monitoring</h1>
          <p className="text-sm text-moove-muted">Simulated and real driving sessions recorded during testing.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-xs text-amber-700">
        <div className="font-bold mb-1">🧪 Demo Session Detection</div>
        Sessions created using the Developer Testing Panel (Demo Mode) appear here. They are marked with their session ID. Real participant sessions will also appear in the Research Dashboard analytics.
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 card-shadow text-center">
          <div className="text-4xl mb-3">🧪</div>
          <div className="font-display font-bold text-xl text-moove-brown mb-2">No Demo Sessions Yet</div>
          <p className="text-sm text-moove-muted">Demo sessions created via the Driver Dashboard will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map(s => {
            const riskColors: Record<string, string> = { Low: '#22C55E', Moderate: '#FBBF24', High: '#F97316', 'Very High': '#EF4444' }
            return (
              <div key={s.id} className="bg-white rounded-2xl p-5 card-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono text-moove-muted mb-1">{s.id}</div>
                    <div className="font-display font-bold text-moove-brown">{s.date} · {s.startTime} → {s.endTime}</div>
                    {s.notes && <div className="text-xs text-moove-muted mt-1">Note: "{s.notes}"</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-black text-moove-brown text-xl">{s.duration}</div>
                    <div className="text-xs text-moove-green font-semibold">{s.exercisesCompleted} exercises</div>
                    <div className="text-xs font-bold" style={{ color: riskColors[s.avgRisk] || '#9E8B7D' }}>{s.avgRisk} risk</div>
                    <div className="text-xs text-moove-muted">{s.calories} kcal</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
