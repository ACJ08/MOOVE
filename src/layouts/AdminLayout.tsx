import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import logoImg from '@/imports/_REMOVE_BG__MOOVE.png'

const navItems = [
  { to: '/admin/dashboard', icon: '📊', label: 'Research Dashboard' },
  { to: '/admin/participants', icon: '👥', label: 'Participants' },
  { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
  { to: '/admin/feedback', icon: '📝', label: 'Feedback Analytics' },
  { to: '/admin/demo-monitoring', icon: '🧪', label: 'Demo Monitoring' },
  { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-moove-border">
        <img src={logoImg} alt="MOOVE" className="h-8 w-auto mb-2" />
        <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
          🔬 Research Admin
        </div>
      </div>

      <div className="p-4 border-b border-moove-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-display font-black text-purple-700 text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-moove-brown truncate">{user?.name}</div>
            <div className="text-xs text-moove-muted truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-moove-brown/70 hover:bg-purple-50 hover:text-moove-brown'
              }`
            }
          >
            <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-moove-border">
        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-moove-muted hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <span className="text-base w-5 text-center">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return <Navigate to="/auth/login" replace />
  if (user.role !== 'admin') return <Navigate to="/driver/dashboard" replace />

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8F6FF' }}>
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-moove-border">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white h-full shadow-2xl z-10">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-moove-border shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-moove-brown hover:bg-purple-50" aria-label="Open menu">
            <div className="w-5 h-0.5 bg-moove-brown mb-1" /><div className="w-5 h-0.5 bg-moove-brown mb-1" /><div className="w-5 h-0.5 bg-moove-brown" />
          </button>
          <img src={logoImg} alt="MOOVE" className="h-7 w-auto" />
          <div className="w-9" />
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
