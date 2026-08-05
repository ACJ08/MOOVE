import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import logoImg from '@/imports/_REMOVE_BG__MOOVE.png'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'

const benefits = [
  { icon: '🎯', title: 'Personalized to you', desc: 'AI adapts to your driving schedule and goals' },
  { icon: '⏱️', title: 'Quick micro-sessions', desc: 'Under 2 minutes per intervention — fits any routine' },
  { icon: '📊', title: 'Track your progress', desc: 'Streak tracking, health scores, and session history' },
  { icon: '🔬', title: 'Science-backed', desc: 'Evidence-based exercises validated for drivers' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) return setError('Passwords do not match.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const result = await register(name, email, password)
    setLoading(false)
    if (result.ok) {
      navigate('/driver/onboarding')
    } else {
      setError(result.error || 'Registration failed.')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #FEFAF5 0%, #FFF4EA 100%)' }}>
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #FFF8F0 0%, #FFE8CC 50%, #FBBF24 100%)' }}
      >
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 -translate-y-1/4 translate-x-1/4" style={{ background: 'radial-gradient(circle, #F97316, transparent 70%)' }} />
        <div className="absolute bottom-10 left-0 w-56 h-56 rounded-full opacity-15 -translate-x-1/4" style={{ background: 'radial-gradient(circle, #22C55E, transparent 70%)' }} />
        <div className="absolute top-1/3 left-1/2 w-40 h-40 rounded-full opacity-15 -translate-x-1/2" style={{ background: 'radial-gradient(circle, #A855F7, transparent 70%)' }} />

        <div className="relative z-10">
          <img src={logoImg} alt="MOOVE" className="h-10 w-auto" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="animate-float">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: 'radial-gradient(circle, #FBBF24, transparent 70%)' }} />
              <img
                src={mascotImg}
                alt="Moo"
                className="w-44 h-44 object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="text-center">
            <div className="font-display font-black text-2xl text-moove-brown mb-1 leading-tight">
              Start your health journey
            </div>
            <p className="text-sm text-moove-brown/70">Free forever. No credit card required.</p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            {benefits.map(b => (
              <div key={b.title} className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl px-3.5 py-2.5 border border-white/80">
                <span className="text-xl shrink-0">{b.icon}</span>
                <div>
                  <div className="text-xs font-bold text-moove-brown">{b.title}</div>
                  <div className="text-xs text-moove-brown/60 leading-tight">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-moove-brown/50 text-xs">© 2026 MOOVE. Built for healthier Filipino drivers.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logoImg} alt="MOOVE" className="h-10 w-auto" />
          </div>

          <div className="mb-7">
            <h1 className="font-display font-black text-3xl text-moove-brown mb-1">Create your account</h1>
            <p className="text-sm text-moove-muted">Join MOOVE and start driving healthier today.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <div className="bg-white rounded-3xl p-7 card-shadow-lg mb-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-moove-brown mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Juan dela Cruz"
                  className="w-full px-4 py-3 rounded-xl border border-moove-border text-sm text-moove-brown placeholder:text-moove-muted/60 focus:outline-none focus:ring-2 focus:ring-moove-orange/40 focus:border-moove-orange transition-all bg-moove-cream/40"
                />
              </div>
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
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 rounded-xl border border-moove-border text-sm text-moove-brown placeholder:text-moove-muted/60 focus:outline-none focus:ring-2 focus:ring-moove-orange/40 focus:border-moove-orange transition-all bg-moove-cream/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-moove-brown mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-moove-border text-sm text-moove-brown placeholder:text-moove-muted/60 focus:outline-none focus:ring-2 focus:ring-moove-orange/40 focus:border-moove-orange transition-all bg-moove-cream/40"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-moove-orange text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-all shadow-md disabled:opacity-60 active:scale-95 mt-1"
              >
                {loading ? 'Creating account…' : 'Create Free Account'}
              </button>
            </form>

            <p className="text-xs text-moove-muted text-center mt-4">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-moove-orange hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-moove-orange hover:underline">Privacy Policy</a>.
            </p>

            <p className="text-center text-sm text-moove-muted mt-5">
              Already have an account?{' '}
              <Link to="/auth/login" className="font-bold text-moove-orange hover:underline">Sign In</Link>
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
