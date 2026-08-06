import React from 'react'

export default function RatingBreakdown({rows,values}:{rows:any[],values:{rating:number,firstImpression:number,nav:number,learn:number,ous:number}}){
  const items = [
    {key:'Overall Rating', v: values.rating, color:'#FBBF24'},
    {key:'First Impression', v: values.firstImpression, color:'#0EA5E9'},
    {key:'Ease of Navigation', v: values.nav, color:'#F97316'},
    {key:'Ease of Learning', v: values.learn, color:'#A855F7'},
    {key:'OUS Composite', v: values.ous, color:'#22C55E'}
  ]
  return (
    <div className="bg-white p-4 rounded-2xl card-shadow">
      <h3 className="font-bold mb-3">Rating Breakdown</h3>
      <div className="space-y-3">
        {items.map(it=> (
          <div key={it.key}>
            <div className="flex justify-between items-center mb-1"><div className="text-sm text-moove-brown">{it.key}</div><div className="text-xs font-black">{it.v.toFixed(1)} / 5</div></div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div style={{width: `${Math.min(100, (it.v/5)*100)}%`, background: it.color}} className="h-3 rounded-full transition-all duration-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
