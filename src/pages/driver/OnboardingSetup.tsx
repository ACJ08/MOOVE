import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import logoImg from '@/imports/_REMOVE_BG__MOOVE.png'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'
import { requestNotificationPermission } from '@/services/notificationService'
import { saveOnboarding, type OnboardingAnswers } from '@/lib/db'

// ─── Question Types ────────────────────────────────────────────────────────────
type OptionItem = { value: string; label: string; icon: string }
type Question =
  | { id: string; type: 'single'; question: string; subtitle?: string; options: OptionItem[] }
  | { id: string; type: 'multi'; question: string; subtitle?: string; options: OptionItem[]; minSelect?: number }

const QUESTIONS: Question[] = [
  {
    id: 'driver_type',
    type: 'single',
    question: "What type of driver are you?",
    subtitle: "Moo will personalize your exercises based on how you drive.",
    options: [
      { value: 'private_car', label: 'Private Car', icon: '🚗' },
      { value: 'ride_hailing', label: 'Ride-Hailing (Grab/Angkas)', icon: '📱' },
      { value: 'taxi', label: 'Taxi', icon: '🟡' },
      { value: 'delivery', label: 'Delivery', icon: '📦' },
      { value: 'truck', label: 'Truck Driver', icon: '🚛' },
      { value: 'bus', label: 'Bus Driver', icon: '🚌' },
      { value: 'van', label: 'Van / FX Driver', icon: '🚐' },
      { value: 'other', label: 'Other', icon: '🔄' },
    ],
  },
  {
    id: 'daily_hours',
    type: 'single',
    question: "How many hours do you drive per day?",
    subtitle: "This helps Moo calibrate how often to remind you to move.",
    options: [
      { value: 'lt1', label: 'Less than 1 hour', icon: '⚡' },
      { value: '1_2', label: '1–2 hours', icon: '🕐' },
      { value: '3_4', label: '3–4 hours', icon: '🕒' },
      { value: '5_6', label: '5–6 hours', icon: '🕔' },
      { value: '7plus', label: '7+ hours', icon: '🌅' },
    ],
  },
  {
    id: 'drive_times',
    type: 'multi',
    question: "When do you usually drive?",
    subtitle: "Select all that apply — Moo will schedule reminders around your rhythm.",
    minSelect: 1,
    options: [
      { value: 'early_morning', label: 'Early Morning (4–7am)', icon: '🌄' },
      { value: 'morning', label: 'Morning (7–11am)', icon: '☀️' },
      { value: 'afternoon', label: 'Afternoon (12–5pm)', icon: '🌤️' },
      { value: 'evening', label: 'Evening (5–9pm)', icon: '🌆' },
      { value: 'late_night', label: 'Late Night (9pm–4am)', icon: '🌙' },
      { value: 'varies', label: 'Varies Daily', icon: '🔄' },
    ],
  },
  {
    id: 'tired_areas',
    type: 'multi',
    question: "Which areas feel tired or stiff while driving?",
    subtitle: "Moo will prioritize exercises for your problem areas.",
    minSelect: 1,
    options: [
      { value: 'neck', label: 'Neck & Upper Back', icon: '😫' },
      { value: 'shoulders', label: 'Shoulders', icon: '🙆' },
      { value: 'lower_back', label: 'Lower Back & Hips', icon: '🤲' },
      { value: 'wrists', label: 'Wrists & Hands', icon: '✋' },
      { value: 'knees', label: 'Knees & Legs', icon: '🦵' },
      { value: 'ankles', label: 'Ankles & Feet', icon: '🦶' },
      { value: 'eyes', label: 'Eyes', icon: '👀' },
      { value: 'all', label: 'All of the above', icon: '🌐' },
      { value: 'none', label: "Not sure yet", icon: '🤷' },
    ],
  },
  {
    id: 'reminder_freq',
    type: 'single',
    question: "How often should Moo remind you to move?",
    subtitle: "You can change this anytime in Settings.",
    options: [
      { value: '15', label: 'Every 15 minutes', icon: '⚡' },
      { value: '20', label: 'Every 20 minutes', icon: '🔔' },
      { value: '30', label: 'Every 30 minutes', icon: '⏰' },
      { value: '45', label: 'Every 45 minutes', icon: '🌛' },
      { value: '60', label: 'Every hour', icon: '⌛' },
      { value: 'custom', label: "I'll customize later", icon: '⚙️' },
    ],
  },
  {
    id: 'reminder_style',
    type: 'single',
    question: "How would you like reminders?",
    subtitle: "Choose the style that works best for you while driving.",
    options: [
      { value: 'popup', label: 'Pop-up notification', icon: '📲' },
      { value: 'sound', label: 'Sound alert', icon: '🔊' },
      { value: 'vibration', label: 'Gentle vibration', icon: '📳' },
      { value: 'silent', label: 'Silent (visual only)', icon: '👁️' },
    ],
  },
  {
    id: 'warmup_pref',
    type: 'single',
    question: "Warm-up exercises before every drive?",
    subtitle: "A 2-minute warm-up reduces fatigue and improves alertness.",
    options: [
      { value: 'always', label: "Yes, always!", icon: '💪' },
      { value: 'sometimes', label: "Sometimes, when I have time", icon: '⏱️' },
      { value: 'skip', label: "No thanks, skip warm-ups", icon: '❌' },
    ],
  },
  {
    id: 'notifications',
    type: 'single',
    question: "Enable smart notifications?",
    subtitle: "Get timely nudges from Moo so you never miss a movement break.",
    options: [
      { value: 'yes', label: "Yes, keep me on track!", icon: '🔔' },
      { value: 'no', label: "No thanks, I'll check manually", icon: '🔕' },
    ],
  },
]

// ─── Option Card ───────────────────────────────────────────────────────────────
function OptionCard({
  opt,
  selected,
  onToggle,
}: {
  opt: OptionItem
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all active:scale-95 w-full ${
        selected
          ? 'border-moove-orange bg-orange-50 shadow-sm'
          : 'border-moove-border bg-white hover:border-orange-200 hover:bg-orange-50/30'
      }`}
    >
      <span className="text-2xl shrink-0">{opt.icon}</span>
      <span
        className={`text-sm font-semibold leading-tight ${
          selected ? 'text-moove-brown' : 'text-moove-brown/80'
        }`}
      >
        {opt.label}
      </span>
      {selected && (
        <span className="ml-auto shrink-0 w-5 h-5 rounded-full bg-moove-orange flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function OnboardingSetup() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [saving, setSaving] = useState(false)

  const q = QUESTIONS[step]
  const totalSteps = QUESTIONS.length
  const progress = ((step + 1) / totalSteps) * 100

  const currentAnswer = answers[q.id]
  const singleVal = q.type === 'single' ? (currentAnswer as string | undefined) : undefined
  const multiVals = q.type === 'multi' ? ((currentAnswer as string[] | undefined) ?? []) : []

  const canProceed =
    q.type === 'single'
      ? !!singleVal
      : multiVals.length >= (q.type === 'multi' && q.minSelect ? q.minSelect : 1)

  const toggleSingle = (val: string) => {
    setAnswers(prev => ({ ...prev, [q.id]: val }))
  }

  const toggleMulti = (val: string) => {
    setAnswers(prev => {
      const cur = (prev[q.id] as string[] | undefined) ?? []
      const updated = cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val]
      return { ...prev, [q.id]: updated }
    })
  }

  const handleNext = async () => {
    if (!canProceed) return
    if (step < totalSteps - 1) {
      setStep(s => s + 1)
      return
    }
    // Final step — save and go
    setSaving(true)
    // Request notification permission if user chose popup reminders
    if (answers['reminder_style'] === 'popup' || answers['notifications'] === 'yes') {
      await requestNotificationPermission()
    }
    try {
      if (user?.id) await saveOnboarding(user.id, answers as OnboardingAnswers)
      await updateUser({ onboardingComplete: true })
    } catch (error) {
      setSaving(false)
      alert(error instanceof Error ? `Could not save setup: ${error.message}` : 'Could not save setup. Please try again.')
      return
    }
    navigate('/driver/sessions', { replace: true })
  }

  const handleSkip = async () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1)
    } else {
      if (user?.id) await saveOnboarding(user.id, { driver_type: 'other', daily_hours: 'unknown', drive_times: [], tired_areas: [], reminder_freq: '30', reminder_style: 'popup', warmup_pref: 'sometimes', notifications: 'yes' })
      await updateUser({ onboardingComplete: true })
      navigate('/driver/sessions', { replace: true })
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const mooMessages = [
    "Let's get to know each other! 🐮",
    "Great! Now let's dial in your schedule. 📅",
    "Perfect timing awareness! 🕐",
    "I'll target the right muscles for you! 💪",
    "I'll remind you at just the right moments! ⏰",
    "Your comfort is my priority! 🎯",
    "Warm muscles = safer driving! 🌡️",
    "Almost done — one last thing! 🎉",
  ]

  if (saving) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
        style={{ background: 'linear-gradient(135deg, #FEFAF5 0%, #FFF4EA 100%)' }}
      >
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-40"
            style={{ background: 'radial-gradient(circle, #FBBF24, transparent 70%)' }}
          />
          <img src={mascotImg} alt="Moo" className="w-32 h-32 object-contain relative z-10 animate-bounce" />
        </div>
        <div className="text-center">
          <div className="font-display font-black text-2xl text-moove-brown mb-2">Setting things up…</div>
          <p className="text-sm text-moove-muted">Moo is personalizing your MOOVE experience!</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-moove-orange animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #FEFAF5 0%, #FFF4EA 100%)' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0">
        <img src={logoImg} alt="MOOVE" className="h-7 w-auto" />
        <button
          onClick={handleSkip}
          className="text-xs font-semibold text-moove-muted hover:text-moove-brown transition-colors px-3 py-1.5 rounded-lg hover:bg-white/60"
        >
          Skip for now →
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-xs font-bold text-moove-orange">
            Quick Setup · Step {step + 1} of {totalSteps}
          </div>
          <div className="text-xs text-moove-muted">~1 Minute</div>
        </div>
        <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-moove-orange rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="max-w-lg mx-auto">
          {/* Moo + speech bubble */}
          <div className="flex items-end gap-3 mb-6">
            <img src={mascotImg} alt="Moo" className="w-14 h-14 object-contain shrink-0 animate-float" />
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 card-shadow text-sm text-moove-brown font-semibold leading-snug max-w-xs">
              {mooMessages[step]}
            </div>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-3xl p-6 card-shadow-lg mb-4">
            <h2 className="font-display font-black text-xl text-moove-brown mb-1 leading-tight">
              {q.question}
            </h2>
            {q.subtitle && (
              <p className="text-sm text-moove-muted mb-5 leading-relaxed">{q.subtitle}</p>
            )}
            {q.type === 'multi' && (
              <div className="text-xs font-semibold text-moove-orange bg-orange-50 rounded-xl px-3 py-1.5 mb-4 inline-flex items-center gap-1.5">
                ✓ Select all that apply
              </div>
            )}

            <div className={`grid gap-2.5 ${q.options.length > 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {q.options.map(opt => (
                <OptionCard
                  key={opt.value}
                  opt={opt}
                  selected={
                    q.type === 'single'
                      ? singleVal === opt.value
                      : multiVals.includes(opt.value)
                  }
                  onToggle={() =>
                    q.type === 'single' ? toggleSingle(opt.value) : toggleMulti(opt.value)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action buttons */}
      <div className="px-5 pb-6 pt-2 shrink-0 bg-gradient-to-t from-[#FEFAF5] to-transparent">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="px-5 py-3.5 rounded-xl border-2 border-moove-border text-sm font-bold text-moove-brown hover:bg-white transition-all active:scale-95"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all active:scale-95 ${
              canProceed
                ? 'bg-moove-orange text-white shadow-md hover:bg-orange-600'
                : 'bg-moove-border text-moove-muted cursor-not-allowed'
            }`}
          >
            {step < totalSteps - 1 ? 'Next →' : "🚗 Start My MOOVE Journey"}
          </button>
        </div>
      </div>
    </div>
  )
}
