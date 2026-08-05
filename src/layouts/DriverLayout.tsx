import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import logoImg from '@/imports/_REMOVE_BG__MOOVE.png'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'

const navSections = [
  {
    label: 'Core',
    items: [
      { to: '/driver/dashboard', icon: '🏠', label: 'Home' },
      { to: '/driver/sessions', icon: '🚗', label: 'Driving Session' },
      { to: '/driver/exercises', icon: '📖', label: 'Exercise Library' },
    ],
  },
  {
    label: 'Health',
    items: [
      { to: '/driver/health-dashboard', icon: '💙', label: 'Dashboard' },
      { to: '/driver/ai-recommendations', icon: '🤖', label: 'AI Insights' },
      { to: '/driver/sedentary', icon: '📊', label: 'Sedentary Monitor' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { to: '/driver/education', icon: '📚', label: 'Learn' },
      { to: '/driver/feedback', icon: '📝', label: 'Feedback' },
      { to: '/driver/settings', icon: '⚙️', label: 'Profile & Settings' },
    ],
  },
]

const mooQuips = [
  '"Every stretch counts! 💪"',
  '"You\'re doing great! 🌟"',
  '"Keep moving, stay safe! 🚗"',
  '"Hydrate between drives! 💧"',
  '"Rest is part of health! 😴"',
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const quip = mooQuips[new Date().getHours() % mooQuips.length]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-moove-border">
        <img src={logoImg} alt="MOOVE" className="h-8 w-auto" />
      </div>

      {/* User card */}
      <div className="px-4 py-3 border-b border-moove-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-display font-black text-moove-brown text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-moove-brown truncate">{user?.name}</div>
            <div className="text-xs text-moove-muted truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navSections.map(section => (
          <div key={section.label} className="mb-4">
            <div className="px-3 mb-1 text-[10px] font-black tracking-widest text-moove-muted/60 uppercase">
              {section.label}
            </div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-moove-orange text-white shadow-sm'
                      : 'text-moove-brown/70 hover:bg-moove-peach hover:text-moove-brown'
                  }`
                }
              >
                <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Moo + logout */}
      <div className="p-4 border-t border-moove-border">
        <div className="flex items-center gap-2 mb-3">
          <img src={mascotImg} alt="Moo" className="w-8 h-8 object-contain animate-float" />
          <div className="text-xs text-moove-muted leading-tight">
            <div className="font-semibold text-moove-brown">Moo says:</div>
            <div>{quip}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-moove-muted hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <span className="text-base w-5 text-center">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default function DriverLayout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  if (!user) return <Navigate to="/auth/login" replace />

  // Redirect to onboarding if driver hasn't completed setup (skip for demo & admin)
  const isDemo = user.email === 'driver@moove.app'
  const isAdmin = user.role === 'admin'
  const isOnboardingPath = location.pathname === '/driver/onboarding'
  if (!isDemo && !isAdmin && !isOnboardingPath) {
    if (!user.onboardingComplete) return <Navigate to="/driver/onboarding" replace />
  }

  return (
    <div className="flex h-screen bg-moove-cream overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-moove-border">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white h-full shadow-2xl z-10">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-moove-border shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-moove-brown hover:bg-moove-peach" aria-label="Open menu">
            <div className="w-5 h-0.5 bg-moove-brown mb-1" />
            <div className="w-5 h-0.5 bg-moove-brown mb-1" />
            <div className="w-5 h-0.5 bg-moove-brown" />
          </button>
          <img src={logoImg} alt="MOOVE" className="h-7 w-auto" />
          <div className="w-9" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
