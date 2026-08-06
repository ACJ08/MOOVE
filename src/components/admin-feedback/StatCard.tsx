import React from 'react'

export default function StatCard({ icon, label, value, sub, color = '#F97316' }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 card-shadow text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-display font-black text-2xl leading-tight" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] text-moove-muted mt-0.5">{sub}</div>}
      <div className="text-xs text-moove-muted mt-1">{label}</div>
    </div>
  )
}
