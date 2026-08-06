import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import logoImg from '@/imports/_REMOVE_BG__MOOVE.png'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'

const features = [
  { icon: '🤸', text: 'Guided micro-movement exercises' },
  { icon: '🤖', text: 'AI-powered wellness insights' },
  { icon: '📊', text: 'Sedentary risk monitoring' },
  { icon: '🏆', text: 'Streak & achievement system' },
]

export default function LoginPage() {
  const { login, loginDemo } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = await login(email, password)
    setLoading(false)
    if (result.ok) {
      if (result.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        const done = localStorage.getItem(`moove_onboarding_done_${email}`)
        navigate(done ? '/driver/dashboard' : '/driver/onboarding')
      }
    } else {
      setError(result.error || 'Login failed.')
    }
  }

  const handleDemo = () => {
    loginDemo()
    navigate('/driver/dashboard')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #FEFAF5 0%, #FFF4EA 100%)' }}>
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #FEFAF5 0%, #FFF0DC 40%, #FFE4B5 75%, #FBBF24 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-25 -translate-y-1/3 translate-x-1/3" style={{ background: 'radial-gradient(circle, #F97316, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20 translate-y-1/3 -translate-x-1/4" style={{ background: 'radial-gradient(circle, #A855F7, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #22C55E, transparent 70%)' }} />

        <div className="relative z-10">
          <img src={logoImg} alt="MOOVE" className="h-10 w-auto" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="animate-float">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: 'radial-gradient(circle, #F97316, transparent 70%)' }} />
              <img src={mascotImg} alt="Moo" className="w-52 h-52 object-contain relative z-10 drop-shadow-2xl" />
            </div>
          </div>

          <div className="text-center">
            <div className="font-display font-black text-2xl text-moove-brown mb-2 leading-tight">
              "Small Movements.<br />Healthier Journeys."
            </div>
            <p className="text-sm text-moove-brown/70 max-w-xs leading-relaxed">
              Join thousands of Filipino drivers building healthier habits one stretch at a time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {features.map(f => (
              <div key={f.text} className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/80">
                <span className="text-base shrink-0">{f.icon}</span>
                <span className="text-xs font-semibold text-moove-brown leading-tight">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-moove-brown/50 text-xs">© 2026 MOOVE. Preventive health for every driver.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logoImg} alt="MOOVE" className="h-10 w-auto" />
          </div>

          <div className="mb-7">
            <h1 className="font-display font-black text-3xl text-moove-brown mb-1">Welcome back 👋</h1>
            <p className="text-sm text-moove-muted">Sign in to continue your wellness journey.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <div className="bg-white rounded-3xl p-7 card-shadow-lg mb-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-moove-brown mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-moove-border text-sm text-moove-brown placeholder:text-moove-muted/60 focus:outline-none focus:ring-2 focus:ring-moove-orange/40 focus:border-moove-orange transition-all bg-moove-cream/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-moove-brown mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-moove-border text-sm text-moove-brown placeholder:text-moove-muted/60 focus:outline-none focus:ring-2 focus:ring-moove-orange/40 focus:border-moove-orange transition-all bg-moove-cream/40"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-moove-orange text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-all shadow-md disabled:opacity-60 active:scale-95"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

              <div className="text-right mt-1">
                <Link to="/auth/forgot-password" className="text-xs text-moove-orange hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
            </form>

            <div className="relative my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-moove-border" />
              <span className="text-xs text-moove-muted font-medium">or try demo</span>
              <div className="flex-1 h-px bg-moove-border" />
            </div>

            <button
              onClick={handleDemo}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 mb-3"
              style={{ background: 'linear-gradient(135deg, #FFF4EA 0%, #FFE8CC 100%)', color: '#3E1F0D' }}
            >
              <img src={mascotImg} alt="" className="w-6 h-6 object-contain" />
              Driver Demo Account
            </button>

            <div className="p-3.5 rounded-xl border border-amber-100 text-xs text-moove-muted" style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' }}>
              <div className="font-bold text-moove-brown mb-1.5">🔑 Demo Credentials</div>
              <div className="flex flex-col gap-1">
                <div><span className="text-moove-muted">Driver: </span><span className="font-mono text-moove-brown">driver@moove.app</span> / <span className="font-mono text-moove-brown">Driver123!</span></div>
                <div className="mt-1">Administrator access uses your Supabase Auth credentials.</div>
              </div>
            </div>

            <p className="text-center text-sm text-moove-muted mt-6">
              Don't have an account?{' '}
              <Link to="/auth/register" className="font-bold text-moove-orange hover:underline">
                Create Account
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-moove-muted">
            <Link to="/" className="hover:text-moove-orange transition-colors">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
