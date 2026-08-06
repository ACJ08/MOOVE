import React from 'react'

export default function UserIntent({data}:{data:{reuse:number,recommend:number,task:number}}){
  const items = [
    {key:'Would Use Again', v: data.reuse, icon:'🔁', color:'#A855F7'},
    {key:'Would Recommend', v: data.recommend, icon:'📣', color:'#0EA5E9'},
    {key:'Task Completion', v: data.task, icon:'✅', color:'#22C55E'}
  ]
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map(it=> (
        <div key={it.key} className="bg-white p-5 rounded-2xl card-shadow min-h-40 flex flex-col border border-moove-border/60">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 pr-3">
              <div className="text-base font-semibold text-moove-brown truncate">{it.key}</div>
              <div className="text-[11px] text-moove-muted mt-0.5">Intent metric</div>
            </div>
            <div className="text-2xl leading-none shrink-0" aria-hidden>{it.icon}</div>
          </div>

          <div className="mt-4 text-4xl font-black leading-none" style={{ color: it.color }}>{it.v}%</div>

          <div className="mt-auto pt-5 w-full">
            <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, it.v))}%`, background: it.color }}
              />
            </div>
            <div className="mt-2 text-[11px] text-moove-muted text-right">{Math.min(100, Math.max(0, it.v))}% toward target</div>
          </div>
        </div>
      ))}
    </div>
  )
}
