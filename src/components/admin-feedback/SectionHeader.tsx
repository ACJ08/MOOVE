import React from 'react'

export default function SectionHeader({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-black text-moove-muted tracking-widest mb-3 uppercase">{children}</div>
}
