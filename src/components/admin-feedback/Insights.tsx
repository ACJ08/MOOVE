import React from 'react'
import type { AdminFeedbackRow } from '@/lib/db'

function mode(arr: string[]) {
  const freq: Record<string, number> = {}
  arr.forEach(s => s && (freq[s] = (freq[s] ?? 0) + 1))
  return Object.entries(freq).sort((a,b)=>b[1]-a[1])
}

export default function Insights({ rows }: { rows: AdminFeedbackRow[] }) {
  if (!rows || rows.length === 0) return <div className="bg-white rounded-2xl p-10 card-shadow text-center text-sm text-moove-muted">No feedback to analyze yet.</div>

  const topUseful = mode(rows.map(r => r.mostUsefulFeature ?? '').filter(Boolean))
  const topImprove = mode(rows.map(r => r.needsImprovement ?? '').filter(Boolean))
  const topFeatureReq = mode(rows.map(r => r.featureRequest ?? '').filter(Boolean))
  const confusing = rows.map(r => r.confusingPart).filter(Boolean)
  const positive = rows.map(r => (r.bugDescription ?? r.featureRequest ?? '')).filter(Boolean)
  const bugs = rows.map(r => r.bugExperience).filter(Boolean)

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl p-5 card-shadow">
      <div className="text-xs font-black tracking-widest mb-3">{title}</div>
      {children}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Highest-Rated Feature">
          {topUseful.length === 0 ? <p className="text-sm text-moove-muted">No data yet.</p> : (
            <div className="space-y-2">{topUseful.slice(0,3).map(([f,c]) => <div key={f} className="flex items-center justify-between"><span className="text-sm font-semibold text-moove-brown">{f}</span><span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{c} votes</span></div>)}</div>
          )}
        </Card>

        <Card title="Most Needs Improvement">
          {topImprove.length === 0 ? <p className="text-sm text-moove-muted">No data yet.</p> : (
            <div className="space-y-2">{topImprove.slice(0,3).map(([f,c]) => <div key={f} className="flex items-center justify-between"><span className="text-sm font-semibold text-moove-brown">{f}</span><span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{c} mentions</span></div>)}</div>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Most Requested Feature">
          {topFeatureReq.length === 0 ? <p className="text-sm text-moove-muted">No feature requests yet.</p> : (
            <div className="space-y-2">{topFeatureReq.slice(0,3).map(([f,c]) => <div key={f} className="flex items-start gap-3"><span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full shrink-0">{c}×</span><span className="text-sm text-moove-brown">{f}</span></div>)}</div>
          )}
        </Card>

        <Card title="Most Confusing Workflows">
          {confusing.length === 0 ? <p className="text-sm text-moove-muted">No confusion reported.</p> : (
            <div className="space-y-2 max-h-48 overflow-y-auto">{confusing.slice(0,5).map((t,i) => <div key={i} className="text-xs text-moove-brown bg-red-50 rounded-xl p-2 border border-red-100">{t}</div>)}</div>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Positive Feedback Highlights">
          {positive.length === 0 ? <p className="text-sm text-moove-muted">No comments yet.</p> : (
            <div className="space-y-2 max-h-48 overflow-y-auto">{positive.slice(0,5).map((t,i) => <div key={i} className="text-xs text-moove-brown bg-green-50 rounded-xl p-2 border border-green-100">"{t}"</div>)}</div>
          )}
        </Card>

        {bugs.length > 0 && <Card title="Bug Reports"><div className="space-y-2 max-h-48 overflow-y-auto">{bugs.map((b,i) => <div key={i} className="text-xs text-red-700 bg-red-50 rounded-xl p-2 border border-red-100">{b}</div>)}</div></Card>}
      </div>
    </div>
  )
}
