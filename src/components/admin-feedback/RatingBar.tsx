import React from 'react'

export default function RatingBar({ label, value, max = 5, color = '#F97316' }: { label: string; value: number; max?: number; color?: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-semibold text-moove-brown">{label}</span>
        <span className="text-xs font-black" style={{ color }}>{value.toFixed(1)}/{max}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  )
}
