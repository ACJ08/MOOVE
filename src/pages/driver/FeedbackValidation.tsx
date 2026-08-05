import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { fetchTestingConfig } from '@/lib/db'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeedbackEntry {
  id: string
  driverId: string
  testingSessionId: string
  date: string
  time: string
  device: string
  browser: string
  appVersion: string
  testingMethod: string
  // Step 1 — Overall Experience
  overallRating: number
  firstImpression: number
  // Step 2 — Usability
  easeOfNavigation: number
  easeOfLearning: number
  accomplishedTask: string
  // Step 3 — Features & Issues
  mostUsefulFeature: string
  needsImprovement: string
  confusingPart: string
  bugExperience: 'none' | 'minor' | 'moderate' | 'major'
  bugDescription: string
  bugReport: string
  // Step 4 — Intent & Open Feedback
  wouldUseAgain: string
  wouldRecommend: string
  additionalComments: string
  featureRequest: string
  // Metadata
  submittedAt: string
  completionStatus: 'completed'
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Iteration 49 — TRL 4 UNLEASH prototype
// Format: v<major>.<iteration>-TRL<level> — clearly signals prototype stage and iteration count
const APP_VERSION = 'v0.49-TRL4'
const TESTING_METHOD = 'User Feedback Survey (In-App Feedback Module)'

const APP_FEATURES = [
  { emoji: '🏠', label: 'Home', description: 'Overall dashboard and quick access' },
  { emoji: '🚗', label: 'Driving Session', description: 'Posture monitoring, reminders, driving detection' },
  { emoji: '📖', label: 'Exercise Library', description: 'Exercise videos, instructions, rehabilitation guides' },
  { emoji: '💙', label: 'Health Dashboard', description: 'Health statistics and progress tracking' },
  { emoji: '🤖', label: 'AI Insights', description: 'AI-generated recommendations and analysis' },
  { emoji: '📊', label: 'Sedentary Monitor', description: 'Inactivity monitoring and alerts' },
  { emoji: '📚', label: 'Learn', description: 'Educational driving health resources' },
  { emoji: '⚙️', label: 'Profile & Settings', description: 'Personalization and notification preferences' },
]

const NONE_OPTION = { emoji: '✅', label: 'None – Everything works well', description: 'I am satisfied with all features' }

function getDeviceInfo() {
  const ua = navigator.userAgent
  const device = /Mobi|Android/i.test(ua) ? 'Mobile' : /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Desktop'
  const browser = /Edg/i.test(ua) ? 'Edge' : /Chrome/i.test(ua) ? 'Chrome'
    : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : 'Other'
  return { device, browser }
}

function getActiveTestingSessionId(): string {
  try {
    const cfg = JSON.parse(localStorage.getItem('moove_testing_config') || '{}')
    return cfg.sessionId ?? 'UNLEASH-2026'
  } catch { return 'UNLEASH-2026' }
}

function getActiveProtoVersion(): string {
  try {
    const cfg = JSON.parse(localStorage.getItem('moove_testing_config') || '{}')
    return cfg.prototypeVersion ?? APP_VERSION
  } catch { return APP_VERSION }
}

function saveFeedbackLocal(entry: FeedbackEntry) {
  try {
    const existing = JSON.parse(localStorage.getItem('moove_feedback_responses') || '[]')
    existing.push(entry)
    localStorage.setItem('moove_feedback_responses', JSON.stringify(existing))
  } catch { /* ignore */ }
}

async function saveFeedbackSupabase(entry: FeedbackEntry, userId: string | null): Promise<{ error: string | null }> {
  if (!supabase || !userId || userId === 'demo' || userId === 'admin-demo') return { error: null }
  try {
    const { data: { user: authenticatedUser } } = await supabase.auth.getUser()
    if (!authenticatedUser || authenticatedUser.id !== userId) {
      return { error: 'Please sign in again before submitting feedback.' }
    }
    const { error } = await supabase.from('feedback_submissions').insert({
      user_id: userId,
      testing_session_id: entry.testingSessionId,
      app_version: entry.appVersion,
      testing_method: entry.testingMethod,
      overall_rating: entry.overallRating,
      first_impression: entry.firstImpression,
      ease_of_navigation: entry.easeOfNavigation,
      ease_of_learning: entry.easeOfLearning,
      accomplished_task: entry.accomplishedTask,
      most_useful_feature: entry.mostUsefulFeature,
      needs_improvement: entry.needsImprovement,
      confusing_part: entry.confusingPart || null,
      bug_report: [entry.bugExperience !== 'none' ? `[${entry.bugExperience}] ${entry.bugDescription}` : '', entry.bugReport].filter(Boolean).join('\n') || null,
      would_use_again: entry.wouldUseAgain,
      would_recommend: entry.wouldRecommend,
      additional_comments: entry.additionalComments || null,
      feature_request: entry.featureRequest || null,
      device: entry.device,
      browser: entry.browser,
      submitted_at: entry.submittedAt,
    })
    return { error: error ? error.message : null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ─── Shared UI Primitives ─────────────────────────────────────────────────────

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="mb-5">
      <div className="text-sm font-semibold text-moove-brown mb-2">{label}</div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} type="button"
            onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="text-3xl transition-transform hover:scale-110 active:scale-95 focus:outline-none">
            <span style={{ color: star <= (hover || value) ? '#FBBF24' : '#E5E7EB' }}>★</span>
          </button>
        ))}
        {value > 0 && (
          <span className="self-center text-xs font-bold text-moove-muted ml-1">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
          </span>
        )}
      </div>
    </div>
  )
}

function ThreeWay({ label, value, onChange, options = ['Yes', 'Partially', 'No'] }: {
  label: string; value: string; onChange: (v: string) => void; options?: string[]
}) {
  const colorMap: Record<string, string> = {
    'Yes': 'bg-green-500 border-green-500 text-white',
    'Partially': 'bg-yellow-400 border-yellow-400 text-white',
    'No': 'bg-red-500 border-red-500 text-white',
    'Maybe': 'bg-yellow-400 border-yellow-400 text-white',
  }
  return (
    <div className="mb-5">
      <div className="text-sm font-semibold text-moove-brown mb-2">{label}</div>
      <div className="flex gap-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt.toLowerCase())}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
              value === opt.toLowerCase()
                ? (colorMap[opt] ?? 'bg-moove-orange border-moove-orange text-white')
                : 'bg-white text-moove-muted border-gray-200 hover:border-moove-orange'
            }`}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

function FeaturePicker({ label, value, onChange, includeNone = false }: {
  label: string; value: string; onChange: (v: string) => void; includeNone?: boolean
}) {
  const options = includeNone ? [...APP_FEATURES, NONE_OPTION] : APP_FEATURES
  return (
    <div className="mb-5">
      <div className="text-sm font-semibold text-moove-brown mb-2">{label}</div>
      <div className="grid grid-cols-2 gap-1.5">
        {options.map(f => (
          <button key={f.label} type="button" onClick={() => onChange(f.label)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 text-left transition-all flex items-start gap-1.5 ${
              value === f.label
                ? 'bg-moove-orange/10 border-moove-orange text-moove-orange'
                : 'border-gray-200 text-moove-muted hover:border-moove-orange'
            } ${f.label === NONE_OPTION.label ? 'col-span-2' : ''}`}>
            <span className="text-base leading-none shrink-0">{f.emoji}</span>
            <span>{f.label === NONE_OPTION.label ? f.label : f.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ['Context', 'Experience', 'Usability', 'Features & Issues', 'Intent & Feedback']

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FeedbackValidation() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [activeSessionId, setActiveSessionId] = useState(getActiveTestingSessionId)
  const [activeVersion, setActiveVersion] = useState(getActiveProtoVersion)

  // Load testing config from Supabase on mount (syncs admin changes across devices)
  useEffect(() => {
    fetchTestingConfig().then(cfg => {
      setActiveSessionId(cfg.sessionId)
      setActiveVersion(cfg.prototypeVersion)
    })
  }, [])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // Step 1
  const [overallRating, setOverallRating] = useState(0)
  const [firstImpression, setFirstImpression] = useState(0)
  // Step 2
  const [easeOfNavigation, setEaseOfNavigation] = useState(0)
  const [easeOfLearning, setEaseOfLearning] = useState(0)
  const [accomplishedTask, setAccomplishedTask] = useState('')
  // Step 3
  const [mostUsefulFeature, setMostUsefulFeature] = useState('')
  const [needsImprovement, setNeedsImprovement] = useState('')
  const [confusingPart, setConfusingPart] = useState('')
  const [bugExperience, setBugExperience] = useState<'none' | 'minor' | 'moderate' | 'major' | ''>('')
  const [bugDescription, setBugDescription] = useState('')
  const [bugReport, setBugReport] = useState('')
  // Step 4
  const [wouldUseAgain, setWouldUseAgain] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState('')
  const [additionalComments, setAdditionalComments] = useState('')
  const [featureRequest, setFeatureRequest] = useState('')

  const canProceed = () => {
    if (step === 0) return true
    if (step === 1) return overallRating > 0 && firstImpression > 0
    if (step === 2) return easeOfNavigation > 0 && easeOfLearning > 0 && accomplishedTask !== ''
    if (step === 3) return mostUsefulFeature !== '' && bugExperience !== ''
    if (step === 4) return wouldUseAgain !== '' && wouldRecommend !== ''
    return true
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    const now = new Date()
    const { device, browser } = getDeviceInfo()
    const entry: FeedbackEntry = {
      id: `fb_${Date.now()}`,
      driverId: user?.email ?? user?.id ?? 'anonymous',
      testingSessionId: activeSessionId,
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      device,
      browser,
      appVersion: activeVersion,
      testingMethod: TESTING_METHOD,
      overallRating, firstImpression,
      easeOfNavigation, easeOfLearning, accomplishedTask,
      mostUsefulFeature, needsImprovement, confusingPart,
      bugExperience: (bugExperience || 'none') as 'none' | 'minor' | 'moderate' | 'major',
      bugDescription,
      bugReport,
      wouldUseAgain, wouldRecommend, additionalComments, featureRequest,
      submittedAt: now.toISOString(),
      completionStatus: 'completed',
    }
    // Always save locally first so data is never lost
    saveFeedbackLocal(entry)
    // Attempt Supabase sync
    const userId = user?.id ?? null
    const { error } = await saveFeedbackSupabase(entry, userId)
    setSubmitting(false)
    if (error) {
      showToast('error', 'Saved locally. Supabase sync failed: ' + error)
      // Still mark submitted — local copy is valid
    } else {
      showToast('success', 'Feedback submitted successfully!')
    }
    setSubmitted(true)
  }

  const resetForm = () => {
    setStep(0)
    setSubmitted(false)
    setOverallRating(0); setFirstImpression(0)
    setEaseOfNavigation(0); setEaseOfLearning(0); setAccomplishedTask('')
    setMostUsefulFeature(''); setNeedsImprovement(''); setConfusingPart('')
    setBugExperience(''); setBugDescription(''); setBugReport('')
    setWouldUseAgain(''); setWouldRecommend(''); setAdditionalComments(''); setFeatureRequest('')
  }

  if (submitted) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <div className="bg-white rounded-3xl p-10 card-shadow">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-display font-black text-2xl text-moove-brown mb-2">Thank You!</h2>
          <p className="text-sm text-moove-muted mb-2">Your feedback has been recorded for the UNLEASH testing session.</p>
          <div className="text-xs bg-orange-50 text-moove-orange font-semibold rounded-xl px-3 py-2 mb-6 inline-block">
            Testing Session: {activeSessionId}
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/driver')}
              className="w-full py-3 rounded-2xl bg-moove-orange text-white font-bold text-sm">
              Return to Dashboard
            </button>
            <button onClick={resetForm}
              className="w-full py-3 rounded-2xl bg-white border-2 border-moove-orange text-moove-orange font-bold text-sm hover:bg-orange-50 transition-all">
              Submit Another Response
            </button>
          </div>
          <p className="text-xs text-moove-muted mt-4">Multiple submissions are allowed and stored separately.</p>
        </div>
      </div>
    )
  }

  const pct = (step / (STEPS.length - 1)) * 100

  return (
    <div className="p-4 max-w-lg mx-auto pb-28">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white shadow-xl transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.message}
        </div>
      )}
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-black text-white bg-moove-orange px-2 py-0.5 rounded-full">UNLEASH</span>
          <span className="text-xs font-black text-white bg-blue-500 px-2 py-0.5 rounded-full">TRL 4</span>
          <h1 className="font-display font-black text-xl text-moove-brown">Driver Feedback</h1>
        </div>
        <p className="text-xs text-moove-muted">{TESTING_METHOD}</p>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-moove-muted mb-1">
          <span>{STEPS[step]}</span>
          <span>Step {step + 1} of {STEPS.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-moove-orange rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-1 mt-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? 'bg-moove-orange' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 card-shadow">

        {/* Step 0 — Context */}
        {step === 0 && (
          <div>
            <h2 className="font-display font-bold text-lg text-moove-brown mb-1">Testing Context</h2>
            <p className="text-xs text-moove-muted mb-5">You are participating in a structured UNLEASH prototype evaluation. Your responses will be used to improve MOOVE.</p>

            <div className="space-y-3 mb-5">
              <div className="bg-moove-cream rounded-2xl p-4">
                <div className="text-xs font-black text-moove-muted tracking-widest mb-2">SESSION INFORMATION</div>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Testing Method', value: TESTING_METHOD },
                    { label: 'Prototype Version', value: APP_VERSION },
                    { label: 'Testing Session', value: getActiveTestingSessionId() },
                    { label: 'Driver ID', value: user?.email ?? 'Anonymous' },
                    { label: 'Date', value: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between gap-3">
                      <span className="text-moove-muted font-medium shrink-0">{item.label}</span>
                      <span className="text-moove-brown font-semibold text-right text-xs leading-relaxed">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin-defined objective if available */}
              {(() => {
                try {
                  const cfg = JSON.parse(localStorage.getItem('moove_testing_config') || '{}')
                  if (!cfg.testingObjective) return null
                  return (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <div className="text-xs font-black text-blue-700 tracking-widest mb-1">TESTING OBJECTIVE</div>
                      <p className="text-sm text-blue-800">{cfg.testingObjective}</p>
                    </div>
                  )
                } catch { return null }
              })()}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-800">
              <strong>Instructions:</strong> Use the MOOVE application as you normally would during a driving session. After testing, complete this feedback form honestly. Your responses remain confidential.
            </div>
          </div>
        )}

        {/* Step 1 — Overall Experience */}
        {step === 1 && (
          <div>
            <h2 className="font-display font-bold text-lg text-moove-brown mb-1">Overall Experience</h2>
            <p className="text-xs text-moove-muted mb-5">Rate your overall experience with the MOOVE application.</p>
            <StarRating label="Overall Rating" value={overallRating} onChange={setOverallRating} />
            <StarRating label="First Impression" value={firstImpression} onChange={setFirstImpression} />
          </div>
        )}

        {/* Step 2 — Usability */}
        {step === 2 && (
          <div>
            <h2 className="font-display font-bold text-lg text-moove-brown mb-1">Usability</h2>
            <p className="text-xs text-moove-muted mb-5">How easy was the application to use?</p>
            <StarRating label="Ease of Navigation" value={easeOfNavigation} onChange={setEaseOfNavigation} />
            <StarRating label="Ease of Learning" value={easeOfLearning} onChange={setEaseOfLearning} />
            <ThreeWay
              label="Did the application help you accomplish your task?"
              value={accomplishedTask}
              onChange={setAccomplishedTask}
              options={['Yes', 'Partially', 'No']}
            />
          </div>
        )}

        {/* Step 3 — Features & Issues */}
        {step === 3 && (
          <div>
            <h2 className="font-display font-bold text-lg text-moove-brown mb-1">Features & Issues</h2>
            <p className="text-xs text-moove-muted mb-5">Help us understand which features worked and which need improvement.</p>
            <FeaturePicker label="Which feature was most useful?" value={mostUsefulFeature} onChange={setMostUsefulFeature} />
            <FeaturePicker label="Which feature needs the most improvement?" value={needsImprovement} onChange={setNeedsImprovement} includeNone={true} />
            <div className="mb-5">
              <label className="text-sm font-semibold text-moove-brown mb-2 block">Did anything confuse you?</label>
              <textarea rows={3} value={confusingPart} onChange={e => setConfusingPart(e.target.value)}
                placeholder="Describe any confusing steps, labels, or workflows..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-moove-brown focus:outline-none focus:border-moove-orange resize-none" />
            </div>
            <div className="mb-5">
              <div className="text-sm font-semibold text-moove-brown mb-2">Did you encounter any bugs while using MOOVE? <span className="text-red-500">*</span></div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'none', label: 'No bugs encountered', icon: '✅', color: 'text-green-600 border-green-400 bg-green-50' },
                  { value: 'minor', label: 'Minor bugs', icon: '🟡', color: 'text-yellow-600 border-yellow-400 bg-yellow-50' },
                  { value: 'moderate', label: 'Moderate bugs', icon: '🟠', color: 'text-orange-600 border-orange-400 bg-orange-50' },
                  { value: 'major', label: 'Major bugs', icon: '🔴', color: 'text-red-600 border-red-400 bg-red-50' },
                ] as const).map(opt => (
                  <button key={opt.value} type="button" onClick={() => { setBugExperience(opt.value); if (opt.value === 'none') setBugDescription('') }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all text-left flex items-center gap-2 ${
                      bugExperience === opt.value ? opt.color : 'border-gray-200 text-moove-muted bg-white hover:border-moove-orange'
                    }`}>
                    <span className="text-base leading-none">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
              {bugExperience && bugExperience !== 'none' && (
                <div className="mt-3">
                  <label className="text-xs font-semibold text-moove-brown mb-1.5 block">Describe the issue <span className="text-moove-muted font-normal">(optional)</span></label>
                  <textarea rows={2} value={bugDescription} onChange={e => setBugDescription(e.target.value)}
                    placeholder="What happened? When did it occur? Steps to reproduce..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-moove-brown focus:outline-none focus:border-moove-orange resize-none" />
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-moove-brown mb-2 block">Additional Bug Report <span className="text-moove-muted font-normal">(optional)</span></label>
              <textarea rows={2} value={bugReport} onChange={e => setBugReport(e.target.value)}
                placeholder="Describe any other errors, crashes, or unexpected behaviour..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-moove-brown focus:outline-none focus:border-moove-orange resize-none" />
            </div>
          </div>
        )}

        {/* Step 4 — Intent & Open Feedback */}
        {step === 4 && (
          <div>
            <h2 className="font-display font-bold text-lg text-moove-brown mb-1">Intent & Feedback</h2>
            <p className="text-xs text-moove-muted mb-5">Final section. Share your intent and any open-ended thoughts.</p>
            <ThreeWay
              label="Would you use MOOVE again?"
              value={wouldUseAgain}
              onChange={setWouldUseAgain}
              options={['Yes', 'Maybe', 'No']}
            />
            <ThreeWay
              label="Would you recommend MOOVE to other drivers?"
              value={wouldRecommend}
              onChange={setWouldRecommend}
              options={['Yes', 'Maybe', 'No']}
            />
            <div className="mb-4">
              <label className="text-sm font-semibold text-moove-brown mb-2 block">Additional Comments</label>
              <textarea rows={3} value={additionalComments} onChange={e => setAdditionalComments(e.target.value)}
                placeholder="What did you like? What stood out? Any overall thoughts..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-moove-brown focus:outline-none focus:border-moove-orange resize-none" />
            </div>
            <div>
              <label className="text-sm font-semibold text-moove-brown mb-2 block">Feature Request <span className="text-moove-muted font-normal">(optional)</span></label>
              <textarea rows={2} value={featureRequest} onChange={e => setFeatureRequest(e.target.value)}
                placeholder="What feature would you like to see added?"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-moove-brown focus:outline-none focus:border-moove-orange resize-none" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-moove-border px-4 py-3 flex gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3 rounded-2xl border-2 border-moove-orange text-moove-orange font-bold text-sm">
            ← Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => canProceed() && setStep(s => s + 1)}
            disabled={!canProceed()}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white"
            style={{ background: canProceed() ? 'linear-gradient(135deg,#F97316,#FBBF24)' : undefined, backgroundColor: !canProceed() ? '#D1D5DB' : undefined }}>
            Continue →
          </button>
        ) : (
          <button type="button" onClick={handleSubmit}
            disabled={!canProceed() || submitting}
            className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? 'Submitting…' : 'Submit Feedback ✓'}
          </button>
        )}
      </div>
    </div>
  )
}
