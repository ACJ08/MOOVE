import { createBrowserRouter } from 'react-router'
import { lazy, Suspense } from 'react'
import { ErrorFallback } from './components/ErrorBoundary'
import DriverLayout from './layouts/DriverLayout'
import AdminLayout  from './layouts/AdminLayout'

// ─── Lazy page imports — a single broken page won't crash the whole router ─────
const LandingPage         = lazy(() => import('./pages/LandingPage'))
const LoginPage           = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage        = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage  = lazy(() => import('./pages/auth/ForgotPasswordPage'))

const Dashboard           = lazy(() => import('./pages/driver/Dashboard'))
const DrivingSessions     = lazy(() => import('./pages/driver/DrivingSessions'))
const GuidedExercises     = lazy(() => import('./pages/driver/GuidedExercises'))
const AIRecommendations   = lazy(() => import('./pages/driver/AIRecommendations'))
const SedentaryMonitoring = lazy(() => import('./pages/driver/SedentaryMonitoring'))
const HealthDashboard     = lazy(() => import('./pages/driver/HealthDashboard'))
const HealthEducation     = lazy(() => import('./pages/driver/HealthEducation'))
const FeedbackValidation  = lazy(() => import('./pages/driver/FeedbackValidation'))
const Settings            = lazy(() => import('./pages/driver/Settings'))
const OnboardingSetup     = lazy(() => import('./pages/driver/OnboardingSetup'))
const ResearchDashboard   = lazy(() => import('./pages/driver/ResearchDashboard'))
const ThinkAloud          = lazy(() => import('./pages/driver/ThinkAloud'))

const AdminDashboard      = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminParticipants   = lazy(() => import('./pages/admin/AdminParticipants'))
const AdminAnalytics      = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminFeedback       = lazy(() => import('./pages/admin/AdminFeedback'))
const AdminDemoMonitoring = lazy(() => import('./pages/admin/AdminDemoMonitoring'))
const AdminSettings       = lazy(() => import('./pages/admin/AdminSettings'))
const AdminThinkAloud     = lazy(() => import('./pages/admin/AdminThinkAloud'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#FDF8F4' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400 font-medium">Loading…</span>
      </div>
    </div>
  )
}

function wrap(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

const routeError = <ErrorFallback error={null} />

export const router = createBrowserRouter([
  { path: '/', element: wrap(LandingPage), errorElement: routeError },
  { path: '/auth/login',           element: wrap(LoginPage) },
  { path: '/auth/register',        element: wrap(RegisterPage) },
  { path: '/auth/forgot-password', element: wrap(ForgotPasswordPage) },
  {
    path: '/driver',
    Component: DriverLayout,
    errorElement: routeError,
    children: [
      { index: true,                     element: wrap(Dashboard) },
      { path: 'dashboard',               element: wrap(Dashboard) },
      { path: 'sessions',                element: wrap(DrivingSessions) },
      { path: 'exercises',               element: wrap(GuidedExercises) },
      { path: 'ai-recommendations',      element: wrap(AIRecommendations) },
      { path: 'sedentary',               element: wrap(SedentaryMonitoring) },
      { path: 'health-dashboard',        element: wrap(HealthDashboard) },
      { path: 'education',               element: wrap(HealthEducation) },
      { path: 'feedback',                element: wrap(FeedbackValidation) },
      { path: 'settings',                element: wrap(Settings) },
      { path: 'onboarding',              element: wrap(OnboardingSetup) },
      { path: 'research',                element: wrap(ResearchDashboard) },
      { path: 'thinkaloud',              element: wrap(ThinkAloud) },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    errorElement: routeError,
    children: [
      { index: true,           element: wrap(AdminDashboard) },
      { path: 'dashboard',     element: wrap(AdminDashboard) },
      { path: 'participants',  element: wrap(AdminParticipants) },
      { path: 'analytics',     element: wrap(AdminAnalytics) },
      { path: 'feedback',      element: wrap(AdminFeedback) },
      { path: 'demo-monitoring', element: wrap(AdminDemoMonitoring) },
      { path: 'settings',      element: wrap(AdminSettings) },
      { path: 'thinkaloud',    element: wrap(AdminThinkAloud) },
    ],
  },
])
