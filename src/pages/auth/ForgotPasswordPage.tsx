import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import logoImg from '@/imports/_REMOVE_BG__MOOVE.png'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await forgotPassword(email)
    setLoading(false)
    if (result.ok) {
      setSent(true)
    } else {
      setError(result.error || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #FEFAF5 0%, #FFF4EA 100%)' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logoImg} alt="MOOVE" className="h-10 w-auto" />
        </div>

        <div className="bg-white rounded-3xl p-8 card-shadow-lg">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📬</div>
              <h1 className="font-display font-black text-2xl text-moove-brown mb-2">Check your inbox</h1>
              <p className="text-sm text-moove-muted leading-relaxed mb-6">
                We sent a password reset link to <span className="font-semibold text-moove-brown">{email}</span>. It may take a minute to arrive.
              </p>
              <Link
                to="/auth/login"
                className="inline-block w-full bg-moove-orange text-white font-bold py-3.5 rounded-xl text-center hover:bg-orange-600 transition-all shadow-md active:scale-95"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Forgot password?</h1>
                <p className="text-sm text-moove-muted">Enter your email and we'll send you a reset link.</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-moove-orange text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-all shadow-md disabled:opacity-60 active:scale-95"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-sm text-moove-muted mt-5">
                Remember it?{' '}
                <Link to="/auth/login" className="font-bold text-moove-orange hover:underline">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-moove-muted mt-4">
          <Link to="/" className="hover:text-moove-orange transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
