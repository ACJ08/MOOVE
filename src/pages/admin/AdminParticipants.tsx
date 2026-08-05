import { useState, useEffect } from 'react'
import type { FeedbackEntry } from '@/pages/driver/FeedbackValidation'
import { fetchFeedbackSubmissions, type AdminFeedbackRow } from '@/lib/db'

function safeAvgRating(f: FeedbackEntry | AdminFeedbackRow): number {
  const vals = [
    (f as FeedbackEntry).overallRating ?? (f as AdminFeedbackRow).overallRating,
    (f as FeedbackEntry).firstImpression ?? (f as AdminFeedbackRow).firstImpression,
    (f as FeedbackEntry).easeOfNavigation ?? (f as AdminFeedbackRow).easeOfNavigation,
    (f as FeedbackEntry).easeOfLearning ?? (f as AdminFeedbackRow).easeOfLearning,
  ].filter(v => typeof v === 'number' && v > 0) as number[]
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}

interface Row {
  id: string
  driverId: string
  date: string
  device: string
  avgRating: number
  accomplishedTask: string
  wouldUseAgain: string
  wouldRecommend: string
  source: 'local' | 'db'
}

function toRow(f: FeedbackEntry, i: number): Row {
  return {
    id: `local-${i}`,
    driverId: f.driverId || `P${String(i + 1).padStart(3, '0')}`,
    date: f.date || f.submittedAt?.slice(0, 10) || '—',
    device: f.device || '—',
    avgRating: safeAvgRating(f),
    accomplishedTask: f.accomplishedTask || '—',
    wouldUseAgain: f.wouldUseAgain || '—',
    wouldRecommend: f.wouldRecommend || '—',
    source: 'local',
  }
}

function dbToRow(f: AdminFeedbackRow, i: number): Row {
  return {
    id: f.id,
    driverId: f.userId ? `DB-${f.userId.slice(0, 8)}` : `P${String(i + 1).padStart(3, '0')}`,
    date: f.submittedAt?.slice(0, 10) || '—',
    device: '—',
    avgRating: safeAvgRating(f),
    accomplishedTask: f.accomplishedTask || '—',
    wouldUseAgain: '—',
    wouldRecommend: f.wouldRecommend || '—',
    source: 'db',
  }
}

function badge(val: string) {
  const color = val === 'yes' ? '#22C55E' : val === 'no' ? '#EF4444' : '#FBBF24'
  const bg    = val === 'yes' ? '#F0FDF4' : val === 'no' ? '#FEF2F2' : '#FFFBEB'
  const label = val && val !== '—' ? val.charAt(0).toUpperCase() + val.slice(1) : '—'
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>{label}</span>
}

export default function AdminParticipants() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSupa, setHasSupa] = useState(false)
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState('')

  useEffect(() => {
    const localRaw: FeedbackEntry[] = (() => {
      try {
        const raw = JSON.parse(localStorage.getItem('moove_feedback_responses') || '[]')
        return (Array.isArray(raw) ? raw : []).filter(
          (f: unknown) => f !== null && typeof f === 'object' && 'overallRating' in (f as object)
        ) as FeedbackEntry[]
      } catch { return [] }
    })()

    const localRows = localRaw.map(toRow)

    fetchFeedbackSubmissions().then(dbRows => {
      const dbConverted = dbRows.map(dbToRow)
      setHasSupa(dbRows.length > 0)
      // Merge: prefer DB rows, include local rows not in DB
      const combined = [...dbConverted, ...localRows]
      setRows(combined)
      setLoading(false)
    }).catch(() => {
      setRows(localRows)
      setLoading(false)
    })
  }, [])

  const filtered = rows.filter(r => {
    if (filterSource && r.source !== filterSource) return false
    if (search) {
      const q = search.toLowerCase()
      if (!r.driverId.toLowerCase().includes(q) && !r.device.toLowerCase().includes(q)) return false
    }
    return true
  })

  const handleExportCSV = () => {
    const headers = ['#', 'Driver', 'Date', 'Device', 'Avg Rating', 'Task Done', 'Use Again', 'Recommend', 'Source']
    const csvRows = filtered.map((r, i) => [
      `P${String(i + 1).padStart(3, '0')}`, r.driverId, r.date, r.device,
      r.avgRating.toFixed(1), r.accomplishedTask, r.wouldUseAgain, r.wouldRecommend, r.source,
    ])
    const csv = [headers, ...csvRows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = 'moove_participants.csv'
    a.click()
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Participants</h1>
          <p className="text-sm text-moove-muted">Drivers who completed the UNLEASH feedback survey.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasSupa && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-100">● Live DB</span>
          )}
          <button onClick={handleExportCSV} disabled={rows.length === 0}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all disabled:opacity-40">
            ⬇ Export CSV
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <input type="text" placeholder="Search by driver ID or device…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-moove-border text-sm text-moove-brown focus:outline-none focus:ring-2 focus:ring-purple-300" />
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-moove-border text-sm text-moove-brown bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
          <option value="">All Sources</option>
          <option value="db">Database</option>
          <option value="local">Local</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-10 card-shadow text-center">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-moove-muted">Loading participants…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 card-shadow text-center">
          <div className="text-4xl mb-3">👥</div>
          <div className="font-display font-bold text-xl text-moove-brown mb-2">
            {rows.length === 0 ? 'No Participants Yet' : 'No Results Found'}
          </div>
          <p className="text-sm text-moove-muted">Participants appear here once they complete the Driver Feedback survey.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-moove-border bg-moove-cream">
                  {['#', 'Driver', 'Date', 'Device', 'Avg Rating', 'Task Done', 'Use Again', 'Recommend', 'Source'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-moove-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className="border-b border-moove-border hover:bg-moove-cream transition-colors">
                    <td className="px-4 py-3 font-bold text-moove-brown">P{String(i + 1).padStart(3, '0')}</td>
                    <td className="px-4 py-3 text-moove-muted text-xs max-w-[140px] truncate">{r.driverId}</td>
                    <td className="px-4 py-3 text-moove-muted text-xs">{r.date}</td>
                    <td className="px-4 py-3 text-moove-muted">{r.device}</td>
                    <td className="px-4 py-3 font-bold text-purple-600">{r.avgRating > 0 ? `${r.avgRating.toFixed(1)}/5` : '—'}</td>
                    <td className="px-4 py-3">{badge(r.accomplishedTask)}</td>
                    <td className="px-4 py-3">{badge(r.wouldUseAgain)}</td>
                    <td className="px-4 py-3">{badge(r.wouldRecommend)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.source === 'db' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                        {r.source === 'db' ? 'DB' : 'Local'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 text-xs text-moove-muted border-t border-moove-border">
            Showing {filtered.length} of {rows.length} participant{rows.length !== 1 ? 's' : ''}.
          </div>
        </div>
      )}
    </div>
  )
}
