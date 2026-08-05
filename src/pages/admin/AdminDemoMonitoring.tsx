import { useState, useEffect } from 'react'

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
    try { setSessions(JSON.parse(localStorage.getItem('moove_session_history') || '[]')) } catch { setSessions([]) }
  }, [])

  const demoSessions = sessions.filter(s => s.id?.startsWith('sess_'))

  const handleClear = () => {
    localStorage.removeItem('moove_session_history')
    setSessions([])
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Demo Monitoring</h1>
          <p className="text-sm text-moove-muted">Simulated and real driving sessions recorded during testing.</p>
        </div>
        {sessions.length > 0 && (
          <button onClick={handleClear} className="text-xs font-bold px-4 py-2.5 rounded-xl bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-all">
            Clear All Sessions
          </button>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-xs text-amber-700">
        <div className="font-bold mb-1">🧪 Demo Session Detection</div>
        Sessions created using the Developer Testing Panel (Demo Mode) appear here. They are marked with their session ID. Real participant sessions will also appear in the Research Dashboard analytics.
      </div>

      {demoSessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 card-shadow text-center">
          <div className="text-4xl mb-3">🧪</div>
          <div className="font-display font-bold text-xl text-moove-brown mb-2">No Demo Sessions Yet</div>
          <p className="text-sm text-moove-muted">Demo sessions created via the Driver Dashboard will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {demoSessions.map(s => {
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
