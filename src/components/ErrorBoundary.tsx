import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[MOOVE ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false, error: null })} />
    }
    return this.props.children
  }
}

export function ErrorFallback({ error, onRetry }: { error: Error | null; onRetry?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#FDF8F4' }}>
      <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="font-display font-black text-2xl text-moove-brown mb-2">Something went wrong</h1>
        <p className="text-sm text-moove-muted mb-4">
          An unexpected error occurred. Your data is safe — please try again or return to the dashboard.
        </p>
        {error && (
          <details className="text-left mb-5">
            <summary className="text-xs text-moove-muted cursor-pointer hover:text-moove-brown mb-1">Show details</summary>
            <pre className="text-[10px] text-red-600 bg-red-50 rounded-xl p-3 overflow-auto max-h-32 whitespace-pre-wrap border border-red-100">
              {error.message}
            </pre>
          </details>
        )}
        <div className="flex gap-3">
          {onRetry && (
            <button onClick={onRetry}
              className="flex-1 py-3 rounded-2xl border-2 border-moove-orange text-moove-orange font-bold text-sm hover:bg-orange-50">
              🔄 Try Again
            </button>
          )}
          <button onClick={() => { window.location.href = '/' }}
            className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#F97316,#FBBF24)' }}>
            🏠 Go Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
