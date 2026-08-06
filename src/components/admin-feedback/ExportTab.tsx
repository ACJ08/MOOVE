import React from 'react'

export default function ExportTab({ count, onExport }: { count: number; onExport: (k: 'csv'|'txt'|'pdf') => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="text-xs font-black tracking-widest mb-2">Export Testing Evidence</div>
        <p className="text-xs text-moove-muted mb-4">Download testing data suitable as evidence for UNLEASH Testing and TRL 4 documentation.</p>
        <div className="space-y-3">
          <button onClick={() => onExport('csv')} disabled={count===0} className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-moove-orange text-moove-orange hover:bg-orange-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="text-2xl">📈</span>
            <div className="text-left"><div className="font-bold text-sm">Export Feedback Data — CSV</div><div className="text-xs opacity-70">{count} submission{count!==1?'s':''} · all raw responses and metadata</div></div>
          </button>

          <button onClick={() => onExport('txt')} className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-blue-300 text-blue-700 hover:bg-blue-50 transition-all">
            <span className="text-2xl">📄</span>
            <div className="text-left"><div className="font-bold text-sm">Export TRL 4 Evidence Report — TXT</div><div className="text-xs opacity-70">Testing config · executive summary · assumptions · action plan</div></div>
          </button>

          <button onClick={() => onExport('pdf')} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-moove-orange text-white">
            <span className="text-2xl">📚</span>
            <div className="text-left"><div className="font-bold text-sm">Generate print-ready PDF report</div><div className="text-xs opacity-70">Full A4 research report · opens the browser print dialog</div></div>
          </button>
        </div>
      </div>
    </div>
  )
}
