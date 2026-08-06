import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  name: string
  email: string
  joinedDate: string
  role: 'driver' | 'admin'
  drivingGoal?: string
  age?: string
  vehicleType?: string
  avatarUrl?: string
  gender?: string
  heightCm?: number
  weightKg?: number
  emergencyContact?: string
  onboardingComplete?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; role?: 'driver' | 'admin' }>
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  loginDemo: () => void
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  forgotPassword: (email: string) => Promise<{ ok: boolean; error?: string }>
}

// ─── Demo accounts ───────────────────────────────────────────────────────────

const DEMO_USER: User = {
  id: 'demo',
  name: 'Alex Santos',
  email: 'driver@moove.app',
  joinedDate: '2026-01-15',
  role: 'driver',
  drivingGoal: 'Reduce back pain from long drives',
  age: '32',
  vehicleType: 'Sedan',
}

const DEMO_PASSWORD  = 'Driver123!'

// ─── localStorage keys ────────────────────────────────────────────────────────

const STORAGE_KEY = 'moove_auth_user'
const USERS_KEY   = 'moove_registered_users'

function getLocalUsers(): Array<User & { password: string }> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}

function persistLocal(user: User | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(STORAGE_KEY)
}

// ─── Profile fetch ────────────────────────────────────────────────────────────

async function fetchProfile(id: string): Promise<User | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    if (!data) return null
    // Stamp last_login_at fire-and-forget
    supabase.from('profiles').update({ last_login_at: new Date().toISOString() }).eq('id', id).then(() => {})
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as 'driver' | 'admin',
      joinedDate: data.joined_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      drivingGoal: data.driving_goal ?? undefined,
      age: data.age ?? undefined,
      vehicleType: data.vehicle_type ?? undefined,
      avatarUrl: data.avatar_url ?? undefined,
      gender: data.gender ?? undefined,
      heightCm: data.height_cm ?? undefined,
      weightKg: data.weight_kg ?? undefined,
      emergencyContact: data.emergency_contact ?? undefined,
      onboardingComplete: data.onboarding_complete ?? false,
    }
  } catch { return null }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    if (!supabase) {
      // No Supabase — restore from localStorage only
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) setUser(JSON.parse(stored))
      } catch { /* ignore */ }
      setLoading(false)
      return
    }

    // Always register the auth state listener FIRST.
    // It fires for every auth event: INITIAL_SESSION, SIGNED_IN, SIGNED_OUT,
    // TOKEN_REFRESHED — ensuring session persists across page refreshes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        const resolved: User = profile ?? {
          id: session.user.id,
          name: session.user.user_metadata?.name ?? session.user.email ?? 'User',
          email: session.user.email ?? '',
          joinedDate: session.user.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
          // Roles are server-owned. Never trust user metadata for authorization.
          role: 'driver',
        }
        if (!cancelled) { setUser(resolved); persistLocal(resolved) }
      } else if (event === 'SIGNED_OUT') {
        if (!cancelled) { setUser(null); persistLocal(null) }
      } else if (event === 'INITIAL_SESSION') {
        // No active Supabase session on load — restore demo/localStorage user
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored && !cancelled) setUser(JSON.parse(stored))
        } catch { /* ignore */ }
      }

      if (!cancelled) setLoading(false)
    })

    // Triggers INITIAL_SESSION event in the listener above
    supabase.auth.getSession()

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  // ─── login ──────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string; role?: 'driver' | 'admin' }> => {
    // When Supabase is configured, every account (including the documented
    // administrator account) must establish a real JWT-backed session. This
    // ensures admin RLS policies can authorize database writes.
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data.user) {
        const profile = await fetchProfile(data.user.id)
        const role = profile?.role ?? 'driver'
        return { ok: true, role }
      }
      if (error) {
        if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials'))
          return { ok: false, error: 'Invalid email or password.' }
        if (error.message.includes('Email not confirmed'))
          return { ok: false, error: 'Please verify your email address before signing in.' }
        if (error.message.includes('Too many requests'))
          return { ok: false, error: 'Too many attempts. Please try again in a few minutes.' }
        return { ok: false, error: error.message }
      }
    }

    // These convenience identities exist only for an offline preview where no
    // Supabase project is configured. They never have database permissions.
    if (email === DEMO_USER.email && password === DEMO_PASSWORD) {
      setUser(DEMO_USER); persistLocal(DEMO_USER); setLoading(false)
      return { ok: true, role: 'driver' }
    }
    // localStorage fallback
    const found = getLocalUsers().find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _pw, ...userObj } = found; void _pw
      setUser(userObj); persistLocal(userObj)
      return { ok: true, role: userObj.role }
    }

    return { ok: false, error: 'Invalid email or password.' }
  }

  // ─── register ───────────────────────────────────────────────────────────────

  const register = async (name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (email === DEMO_USER.email)
      return { ok: false, error: 'Email already in use.' }

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } },
      })
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered'))
          return { ok: false, error: 'An account with this email already exists.' }
        if (error.message.includes('Password should be'))
          return { ok: false, error: 'Password must be at least 8 characters long.' }
        return { ok: false, error: error.message }
      }
      if (data.user) {
        if (data.session) {
          // Email confirmation disabled — immediately logged in
          const newUser: User = {
            id: data.user.id, name, email,
            joinedDate: new Date().toISOString().slice(0, 10),
            role: 'driver',
          }
          setUser(newUser); persistLocal(newUser)
        }
        return { ok: true }
      }
    }

    // localStorage fallback
    const users = getLocalUsers()
    if (users.find(u => u.email === email)) return { ok: false, error: 'Email already in use.' }
    const newUser: User = {
      id: `user_${Date.now()}`, name, email,
      joinedDate: new Date().toISOString().slice(0, 10),
      role: 'driver',
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, { ...newUser, password }]))
    setUser(newUser); persistLocal(newUser)
    return { ok: true }
  }

  // ─── forgotPassword ──────────────────────────────────────────────────────────

  const forgotPassword = async (email: string): Promise<{ ok: boolean; error?: string }> => {
    if (!supabase) return { ok: false, error: 'Password reset requires an internet connection.' }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }

  // ─── demo shortcuts ──────────────────────────────────────────────────────────

  const loginDemo = () => { setUser(DEMO_USER); persistLocal(DEMO_USER); setLoading(false) }

  // ─── logout ──────────────────────────────────────────────────────────────────

  const logout = async () => {
    if (supabase && user?.id !== 'demo' && user?.id !== 'admin-demo') {
      await supabase.auth.signOut()
    }
    setUser(null); persistLocal(null)
  }

  // ─── updateUser ──────────────────────────────────────────────────────────────

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...updates }
    setUser(updated); persistLocal(updated)

    if (supabase && user.id !== 'demo' && user.id !== 'admin-demo') {
      const { error } = await supabase.from('profiles').update({
        name: updated.name,
        driving_goal: updated.drivingGoal ?? null,
        age: updated.age ?? null,
        vehicle_type: updated.vehicleType ?? null,
        avatar_url: updated.avatarUrl ?? null,
        gender: updated.gender ?? null,
        height_cm: updated.heightCm ?? null,
        weight_kg: updated.weightKg ?? null,
        emergency_contact: updated.emergencyContact ?? null,
        onboarding_complete: updated.onboardingComplete ?? false,
      }).eq('id', user.id)
      if (error) {
        setUser(user); persistLocal(user)
        throw new Error(error.message)
      }
    } else if (user.id !== 'demo' && user.id !== 'admin-demo') {
      const users = getLocalUsers()
      const idx = users.findIndex(u => u.id === user.id)
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates }
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginDemo, logout, updateUser, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
