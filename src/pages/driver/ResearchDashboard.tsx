import { useState, useEffect } from 'react'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'
import { supabase } from '@/lib/supabase'
import { fetchFeedbackSubmissions, type AdminFeedbackRow } from '@/lib/db'

// ─── UNLEASH Predefined Assumptions & KPIs ───────────────────────────────────

interface UnleashKPI {
  id: string
  label: string
  category: 'desirability' | 'feasibility' | 'viability'
  threshold: number
  target: number
  excellent: number
  unit: string
  description: string
}

const UNLEASH_KPIS: UnleashKPI[] = [
  { id: 'overall_satisfaction', label: 'Overall User Satisfaction', category: 'desirability', threshold: 3.5, target: 4.0, excellent: 4.5, unit: '/5', description: 'Average overall rating from all respondents' },
  { id: 'first_impression', label: 'First Impression Score', category: 'desirability', threshold: 3.0, target: 4.0, excellent: 4.5, unit: '/5', description: 'Average first impression rating' },
  { id: 'would_use_again', label: 'Would Use Again Rate', category: 'desirability', threshold: 60, target: 70, excellent: 85, unit: '%', description: 'Percentage of respondents who said Yes to using MOOVE again' },
  { id: 'would_recommend', label: 'Would Recommend Rate', category: 'desirability', threshold: 60, target: 70, excellent: 85, unit: '%', description: 'Percentage of respondents who would recommend MOOVE to other drivers' },
  { id: 'ease_navigation', label: 'Ease of Navigation', category: 'viability', threshold: 3.5, target: 4.0, excellent: 4.5, unit: '/5', description: 'Average ease of navigation rating' },
  { id: 'ease_learning', label: 'Ease of Learning', category: 'viability', threshold: 3.5, target: 4.0, excellent: 4.5, unit: '/5', description: 'Average ease of learning rating' },
  { id: 'task_completion', label: 'Task Completion Rate', category: 'viability', threshold: 70, target: 80, excellent: 92, unit: '%', description: 'Percentage of respondents who accomplished their task (Yes or Partially)' },
  { id: 'bug_free_rate', label: 'Bug-Free Rate', category: 'feasibility', threshold: 70, target: 85, excellent: 95, unit: '%', description: 'Percentage of respondents who encountered no bugs' },
  { id: 'desirability_score', label: 'Desirability Score', category: 'desirability', threshold: 3.0, target: 3.5, excellent: 4.0, unit: '/5', description: 'Composite desirability: satisfaction, impression, use-again, recommend' },
  { id: 'feasibility_score', label: 'Feasibility Score', category: 'feasibility', threshold: 3.0, target: 3.5, excellent: 4.0, unit: '/5', description: 'Composite feasibility: bug-free rate, performance, reliability' },
  { id: 'viability_score', label: 'Viability Score', category: 'viability', threshold: 3.0, target: 3.5, excellent: 4.0, unit: '/5', description: 'Composite viability: navigation, learning, task completion, adoption' },
]

const VALIDATION_ASSUMPTIONS = [
  'Filipino professional drivers are willing to use a wellness app during driving breaks',
  'Micro-movement exercises can be safely performed in parked or stopped vehicles',
  'Drivers will engage with AI-generated health recommendations',
  'The application will not distract drivers during active navigation',
  'Users can complete the feedback survey within 5 minutes after a session',
  'A TRL-4 prototype is sufficient to validate core desirability assumptions',
  'The UNLEASH hackathon audience represents a valid proxy for the target user group',
]

// ─── Computation ──────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function pct(arr: string[], value: string): number {
  if (!arr.length) return 0
  return Math.round((arr.filter(v => v === value).length / arr.length) * 100)
}

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }

interface ComputedMetrics {
  n: number
  overallSatisfaction: number
  firstImpression: number
  easeNavigation: number
  easeLearning: number
  wouldUseAgainPct: number
  wouldRecommendPct: number
  wouldUseAgainBreakdown: { yes: number; maybe: number; no: number }
  wouldRecommendBreakdown: { yes: number; maybe: number; no: number }
  taskCompletionPct: number
  bugFreePct: number
  desirabilityScore: number
  feasibilityScore: number
  viabilityScore: number
  noBugs: number
  minorBugs: number
  moderateBugs: number
  majorBugs: number
  mostUsefulFeatures: Record<string, number>
  needsImprovementFeatures: Record<string, number>
}

type ResearchFeedback = Pick<AdminFeedbackRow,
  'overallRating' | 'firstImpression' | 'easeOfNavigation' | 'easeOfLearning' |
  'wouldUseAgain' | 'wouldRecommend' | 'accomplishedTask' | 'bugExperience' |
  'bugDescription' | 'mostUsefulFeature' | 'needsImprovement' | 'submittedAt'
>

const answer = (value: string | null | undefined) => value?.trim().toLowerCase() ?? ''

function computeMetrics(feedback: ResearchFeedback[]): ComputedMetrics {
  const n = feedback.length
  if (n === 0) {
    return {
      n: 0, overallSatisfaction: 0, firstImpression: 0,
      easeNavigation: 0, easeLearning: 0, wouldUseAgainPct: 0,
      wouldRecommendPct: 0, taskCompletionPct: 0, bugFreePct: 0,
      wouldUseAgainBreakdown: { yes: 0, maybe: 0, no: 0 }, wouldRecommendBreakdown: { yes: 0, maybe: 0, no: 0 },
      desirabilityScore: 0, feasibilityScore: 0, viabilityScore: 0,
      noBugs: 0, minorBugs: 0, moderateBugs: 0, majorBugs: 0,
      mostUsefulFeatures: {}, needsImprovementFeatures: {},
    }
  }

  const ratings = (values: Array<number | null>) => values.filter((value): value is number => typeof value === 'number' && value > 0)
  const overallSatisfaction = avg(ratings(feedback.map(f => f.overallRating)))
  const firstImpression = avg(ratings(feedback.map(f => f.firstImpression)))
  const easeNavigation = avg(ratings(feedback.map(f => f.easeOfNavigation)))
  const easeLearning = avg(ratings(feedback.map(f => f.easeOfLearning)))

  const wouldUseAgainPct = pct(feedback.map(f => answer(f.wouldUseAgain)), 'yes')
  const wouldRecommendPct = pct(feedback.map(f => answer(f.wouldRecommend)), 'yes')
  const breakdown = (values: Array<string | null>) => ({ yes: pct(values.map(answer), 'yes'), maybe: pct(values.map(answer), 'maybe'), no: pct(values.map(answer), 'no') })
  const wouldUseAgainBreakdown = breakdown(feedback.map(f => f.wouldUseAgain))
  const wouldRecommendBreakdown = breakdown(feedback.map(f => f.wouldRecommend))

  // Task completion = yes + partially
  const taskCompletionPct = Math.round(
    (feedback.filter(f => ['yes', 'partially'].includes(answer(f.accomplishedTask))).length / n) * 100
  )

  // Bug-free rate
  const noBugs = feedback.filter(f => !f.bugExperience || f.bugExperience === 'none').length
  const minorBugs = feedback.filter(f => f.bugExperience === 'minor').length
  const moderateBugs = feedback.filter(f => f.bugExperience === 'moderate').length
  const majorBugs = feedback.filter(f => f.bugExperience === 'major').length
  const bugFreePct = Math.round((noBugs / n) * 100)

  // Desirability = (overallSatisfaction + firstImpression + wouldUseAgain*5/100 + wouldRecommend*5/100) / 4
  const desirabilityScore = clamp(
    (overallSatisfaction + firstImpression + (wouldUseAgainPct / 20) + (wouldRecommendPct / 20)) / 4, 0, 5
  )

  // Feasibility = bug-free weight (60%) + task completion weight (40%) → normalized to /5
  const feasibilityScore = clamp(
    ((bugFreePct / 100) * 3 + (taskCompletionPct / 100) * 2), 0, 5
  )

  // Viability = (easeNavigation + easeLearning + taskCompletion*5/100 + wouldUseAgain*5/100) / 4
  const viabilityScore = clamp(
    (easeNavigation + easeLearning + (taskCompletionPct / 20) + (wouldUseAgainPct / 20)) / 4, 0, 5
  )

  const mostUsefulFeatures: Record<string, number> = {}
  const needsImprovementFeatures: Record<string, number> = {}
  feedback.forEach(f => {
    if (f.mostUsefulFeature) mostUsefulFeatures[f.mostUsefulFeature] = (mostUsefulFeatures[f.mostUsefulFeature] || 0) + 1
    if (f.needsImprovement && f.needsImprovement !== 'None – Everything works well')
      needsImprovementFeatures[f.needsImprovement] = (needsImprovementFeatures[f.needsImprovement] || 0) + 1
  })

  return {
    n, overallSatisfaction, firstImpression, easeNavigation, easeLearning,
    wouldUseAgainPct, wouldRecommendPct, taskCompletionPct, bugFreePct,
    wouldUseAgainBreakdown, wouldRecommendBreakdown,
    desirabilityScore, feasibilityScore, viabilityScore,
    noBugs, minorBugs, moderateBugs, majorBugs,
    mostUsefulFeatures, needsImprovementFeatures,
  }
}

function getKPIValue(kpiId: string, m: ComputedMetrics): number {
  const map: Record<string, number> = {
    overall_satisfaction: m.overallSatisfaction,
    first_impression: m.firstImpression,
    would_use_again: m.wouldUseAgainPct,
    would_recommend: m.wouldRecommendPct,
    ease_navigation: m.easeNavigation,
    ease_learning: m.easeLearning,
    task_completion: m.taskCompletionPct,
    bug_free_rate: m.bugFreePct,
    desirability_score: m.desirabilityScore,
    feasibility_score: m.feasibilityScore,
    viability_score: m.viabilityScore,
  }
  return map[kpiId] ?? 0
}

function kpiStatus(kpi: UnleashKPI, value: number): 'excellent' | 'target' | 'threshold' | 'below' {
  if (value >= kpi.excellent) return 'excellent'
  if (value >= kpi.target) return 'target'
  if (value >= kpi.threshold) return 'threshold'
  return 'below'
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  excellent: { bg: '#F0FDF4', text: '#16A34A', label: '✦ Excellent' },
  target:    { bg: '#EFF6FF', text: '#2563EB', label: '✓ Target Met' },
  threshold: { bg: '#FFFBEB', text: '#D97706', label: '~ Threshold' },
  below:     { bg: '#FFF1F2', text: '#DC2626', label: '✕ Below' },
}

// ─── Generate explanation for D/F/V scores ────────────────────────────────────

function generateExplanation(category: 'desirability' | 'feasibility' | 'viability', m: ComputedMetrics): string {
  if (m.n === 0) return 'No feedback data available to generate an explanation.'

  if (category === 'desirability') {
    const score = m.desirabilityScore
    const level = score >= 4.0 ? 'high' : score >= 3.0 ? 'moderate' : 'low'
    const useAgainEvidence = `${m.wouldUseAgainPct}% of respondents said they would use MOOVE again`
    const recommendEvidence = `${m.wouldRecommendPct}% said they would recommend it to other drivers`
    const satisfEvidence = `average overall satisfaction of ${m.overallSatisfaction.toFixed(1)}/5`
    const impressionEvidence = `first impression score of ${m.firstImpression.toFixed(1)}/5`
    return `Desirability is ${level} (${score.toFixed(2)}/5) based on survey data from ${m.n} respondents. The score reflects a ${satisfEvidence} and a ${impressionEvidence}. Adoption intent shows ${useAgainEvidence}, and ${recommendEvidence}. ${
      level === 'high' ? 'This strongly validates that Filipino drivers find MOOVE valuable and would integrate it into their routine.' :
      level === 'moderate' ? 'This suggests moderate validation — drivers find value but improvements to first impression or overall satisfaction could strengthen desirability.' :
      'This indicates desirability needs improvement. Focus on delivering more immediate perceived value from the first session.'
    } Confidence: ${m.n >= 10 ? 'High' : m.n >= 5 ? 'Moderate' : 'Low'} (${m.n} respondents).`
  }

  if (category === 'feasibility') {
    const score = m.feasibilityScore
    const level = score >= 4.0 ? 'high' : score >= 3.0 ? 'moderate' : 'low'
    const bugEvidence = `${m.bugFreePct}% of respondents encountered no bugs (${m.noBugs}/${m.n})`
    const bugBreakdown = m.minorBugs + m.moderateBugs + m.majorBugs > 0
      ? `, with ${m.minorBugs} minor, ${m.moderateBugs} moderate, ${m.majorBugs} major bug reports`
      : ''
    return `Feasibility is ${level} (${score.toFixed(2)}/5) derived from technical quality indicators across ${m.n} respondents. ${bugEvidence}${bugBreakdown}. Task completion rate of ${m.taskCompletionPct}% also contributes to feasibility — indicating whether users can successfully achieve their goals using the system. ${
      score >= 4.0 ? 'The high bug-free rate and task completion rate confirm the prototype is technically stable and ready for expanded testing.' :
      score >= 3.0 ? 'The system is mostly stable but has room to improve reliability and reduce bug occurrences.' :
      'Feasibility concerns are present. Prioritize bug resolution and improving task completion reliability before scaling.'
    } Confidence: ${m.n >= 10 ? 'High' : m.n >= 5 ? 'Moderate' : 'Low'} (${m.n} respondents).`
  }

  // viability
  const score = m.viabilityScore
  const level = score >= 4.0 ? 'high' : score >= 3.0 ? 'moderate' : 'low'
  return `Viability is ${level} (${score.toFixed(2)}/5) measured by the ease of use and adoption intent across ${m.n} respondents. Navigation ease: ${m.easeNavigation.toFixed(1)}/5, learning ease: ${m.easeLearning.toFixed(1)}/5, and task completion rate: ${m.taskCompletionPct}%. ${m.wouldUseAgainPct}% would continue using the app. ${
    level === 'high' ? 'High viability confirms MOOVE is usable, intuitive, and has strong adoption intent — validating it as a viable product for the target market.' :
    level === 'moderate' ? 'Moderate viability indicates the product works but navigation or learnability could be improved to reduce drop-off.' :
    'Low viability suggests usability issues that would prevent sustained adoption. Prioritize UX improvements and onboarding.'
  } Confidence: ${m.n >= 10 ? 'High' : m.n >= 5 ? 'Moderate' : 'Low'} (${m.n} respondents).`
}

// ─── UI Primitives ────────────────────────────────────────────────────────────

function MiniBar({ label, value, max = 5, color = '#F97316' }: { label: string; value: number; max?: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-moove-muted w-36 shrink-0 truncate">{label}</div>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <div className="text-xs font-bold text-moove-brown w-10 text-right">{value.toFixed(2)}</div>
    </div>
  )
}

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const pct = (score / 5) * 100
  const r = 36
  const circ = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#F3F4F6" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-black text-lg text-moove-brown">{score > 0 ? score.toFixed(1) : '—'}</span>
        </div>
      </div>
      <div className="text-xs font-bold text-moove-brown text-center">{label}</div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const LOCAL_CONFIG_KEY = 'moove_unleash_config_loaded'

export default function ResearchDashboard() {
  const [feedback, setFeedback] = useState<ResearchFeedback[]>([])
  const [configLoaded, setConfigLoaded] = useState(false)
  const [tab, setTab] = useState<'overview' | 'kpis' | 'dfv' | 'features' | 'bugs'>('overview')

  useEffect(() => {
    const loadFeedback = async () => setFeedback(await fetchFeedbackSubmissions())
    void loadFeedback()
    const channel = supabase?.channel('research-feedback').on('postgres_changes', { event: '*', schema: 'public', table: 'feedback_submissions' }, loadFeedback).subscribe()
    return () => { if (channel) void supabase?.removeChannel(channel) }
  }, [])

  useEffect(() => {
    setConfigLoaded(!!localStorage.getItem(LOCAL_CONFIG_KEY))
  }, [])

  const handleLoadConfig = () => {
    localStorage.setItem(LOCAL_CONFIG_KEY, 'true')
    setConfigLoaded(true)
  }

  const m = computeMetrics(feedback)
  const isEmpty = m.n === 0

  const tabs = [
    { id: 'overview' as const, label: '📊 Overview' },
    { id: 'kpis' as const, label: '🎯 KPIs' },
    { id: 'dfv' as const, label: '💡 D/F/V Analysis' },
    { id: 'features' as const, label: '🌟 Features' },
    { id: 'bugs' as const, label: '🐛 Bug Report' },
  ]

  const dfvCategories = [
    { key: 'desirability' as const, label: 'Desirability', score: m.desirabilityScore, color: '#F97316', emoji: '❤️', desc: 'Do people want MOOVE?' },
    { key: 'feasibility' as const, label: 'Feasibility', score: m.feasibilityScore, color: '#22C55E', emoji: '⚙️', desc: 'Can it be built reliably?' },
    { key: 'viability' as const, label: 'Viability', score: m.viabilityScore, color: '#A855F7', emoji: '🚀', desc: 'Is it adoptable & sustainable?' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Research Dashboard</h1>
          <p className="text-sm text-moove-muted">TRL-4 UNLEASH Validation — Driver feedback analytics and KPI tracking.</p>
        </div>
        <button
          onClick={handleLoadConfig}
          className={`shrink-0 flex items-center gap-2 font-bold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95 ${
            configLoaded
              ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
              : 'bg-moove-orange text-white hover:bg-orange-600 shadow-md'
          }`}
        >
          {configLoaded ? '✓ Assumptions & KPIs Loaded' : '✓ Load All Predefined Assumptions & Metrics'}
        </button>
      </div>

      {/* Validation Assumptions — shown when config loaded */}
      {configLoaded && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
          <div className="text-xs font-bold text-blue-700 tracking-wide mb-2">VALIDATION ASSUMPTIONS (UNLEASH TRL-4)</div>
          <ul className="flex flex-col gap-1.5">
            {VALIDATION_ASSUMPTIONS.map((a, i) => (
              <li key={i} className="text-xs text-blue-800 flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-5 text-center">
          <div className="animate-float">
            <img src={mascotImg} alt="Moo" className="w-24 h-24 object-contain opacity-60" />
          </div>
          <div>
            <div className="font-display font-bold text-xl text-moove-brown mb-2">No Research Data Yet</div>
            <p className="text-sm text-moove-muted max-w-sm leading-relaxed">
              Research data will appear here once participants complete the Driver Feedback survey.
            </p>
          </div>
          <a href="/driver/feedback" className="bg-moove-orange text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-600 transition-all">
            Go to Feedback Survey
          </a>
        </div>
      ) : (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {[
              { icon: '👥', value: String(m.n), label: 'Total Respondents', color: '#F97316' },
              { icon: '⭐', value: `${m.overallSatisfaction.toFixed(1)}/5`, label: 'Avg Satisfaction', color: '#FBBF24' },
              { icon: '✅', value: `${m.taskCompletionPct}%`, label: 'Task Completion', color: '#22C55E' },
              { icon: '🐛', value: `${m.bugFreePct}%`, label: 'Bug-Free Rate', color: '#0EA5E9' },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-2xl p-4 card-shadow">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-2.5" style={{ background: `${k.color}15` }}>{k.icon}</div>
                <div className="font-display font-black text-2xl text-moove-brown">{k.value}</div>
                <div className="text-xs text-moove-muted font-semibold">{k.label}</div>
              </div>
            ))}
          </div>

          {/* D/F/V Score rings */}
          <div className="bg-white rounded-2xl p-5 card-shadow mb-5">
            <div className="text-xs font-bold text-moove-muted tracking-wide mb-4">UNLEASH D/F/V SCORES</div>
            <div className="flex items-center justify-around flex-wrap gap-6">
              {dfvCategories.map(c => (
                <ScoreRing key={c.key} score={c.score} label={c.label} color={c.color} />
              ))}
              <div className="text-center flex-1 min-w-[160px]">
                <div className="text-xs text-moove-muted mb-1">Overall Formula</div>
                <div className="font-display font-black text-3xl text-moove-brown">
                  {((m.desirabilityScore + m.feasibilityScore + m.viabilityScore) / 3).toFixed(2)}<span className="text-lg text-moove-muted">/5</span>
                </div>
                <div className="text-xs text-moove-muted mt-1">Composite Score</div>
                {(() => {
                  const composite = (m.desirabilityScore + m.feasibilityScore + m.viabilityScore) / 3
                  const label = composite >= 4.0 ? 'Excellent' : composite >= 3.5 ? 'Good' : composite >= 3.0 ? 'Fair' : 'Needs Work'
                  const color = composite >= 4.0 ? 'text-green-600' : composite >= 3.5 ? 'text-blue-600' : composite >= 3.0 ? 'text-yellow-600' : 'text-red-600'
                  return <div className={`text-xs font-bold mt-1 ${color}`}>{label}</div>
                })()}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all ${tab === t.id ? 'bg-moove-orange text-white' : 'bg-white text-moove-muted border border-moove-border hover:border-orange-200'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-bold text-moove-muted mb-4 tracking-wide">USABILITY METRICS</div>
                <div className="flex flex-col gap-3">
                  <MiniBar label="Overall Satisfaction" value={m.overallSatisfaction} color="#F97316" />
                  <MiniBar label="First Impression" value={m.firstImpression} color="#FBBF24" />
                  <MiniBar label="Ease of Navigation" value={m.easeNavigation} color="#22C55E" />
                  <MiniBar label="Ease of Learning" value={m.easeLearning} color="#0EA5E9" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-bold text-moove-muted mb-4 tracking-wide">ADOPTION INTENT</div>
                {[
                  { label: 'Would Use Again (Yes)', value: m.wouldUseAgainPct, color: '#22C55E' },
                  { label: 'Would Recommend (Yes)', value: m.wouldRecommendPct, color: '#0EA5E9' },
                  { label: 'Task Completion Rate', value: m.taskCompletionPct, color: '#A855F7' },
                  { label: 'Bug-Free Rate', value: m.bugFreePct, color: '#F97316' },
                ].map(m2 => (
                  <div key={m2.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1"><span className="text-moove-muted">{m2.label}</span><span className="font-bold text-moove-brown">{m2.value}%</span></div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m2.value}%`, background: m2.color }} />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-moove-border text-[10px]">
                  <div><b className="text-moove-brown block mb-1">Use again</b><span className="text-green-600">Yes {m.wouldUseAgainBreakdown.yes}%</span> · <span>Maybe {m.wouldUseAgainBreakdown.maybe}%</span> · <span className="text-red-500">No {m.wouldUseAgainBreakdown.no}%</span></div>
                  <div><b className="text-moove-brown block mb-1">Recommend</b><span className="text-green-600">Yes {m.wouldRecommendBreakdown.yes}%</span> · <span>Maybe {m.wouldRecommendBreakdown.maybe}%</span> · <span className="text-red-500">No {m.wouldRecommendBreakdown.no}%</span></div>
                </div>
              </div>
            </div>
          )}

          {/* KPIs */}
          {tab === 'kpis' && (
            <div className="flex flex-col gap-3">
              {configLoaded ? (
                <>
                  {(['desirability', 'feasibility', 'viability'] as const).map(cat => {
                    const catKpis = UNLEASH_KPIS.filter(k => k.category === cat)
                    const catColors = { desirability: '#F97316', feasibility: '#22C55E', viability: '#A855F7' }
                    const catLabels = { desirability: 'Desirability KPIs', feasibility: 'Feasibility KPIs', viability: 'Viability KPIs' }
                    return (
                      <div key={cat} className="bg-white rounded-2xl p-5 card-shadow">
                        <div className="text-xs font-bold tracking-wide mb-4" style={{ color: catColors[cat] }}>{catLabels[cat].toUpperCase()}</div>
                        <div className="flex flex-col gap-3">
                          {catKpis.map(kpi => {
                            const val = getKPIValue(kpi.id, m)
                            const status = kpiStatus(kpi, val)
                            const sc = statusColors[status]
                            const displayVal = kpi.unit === '%' ? `${Math.round(val)}%` : `${val.toFixed(2)}${kpi.unit}`
                            return (
                              <div key={kpi.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: sc.bg }}>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <div className="text-sm font-bold text-moove-brown">{kpi.label}</div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-sm font-black font-display text-moove-brown">{displayVal}</span>
                                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-moove-muted">{kpi.description} — Threshold: {kpi.threshold}{kpi.unit} | Target: {kpi.target}{kpi.unit} | Excellent: {kpi.excellent}{kpi.unit}</div>
                                  <div className="mt-2 h-1.5 bg-white/70 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (val / (kpi.unit === '%' ? 100 : 5)) * 100)}%`, background: catColors[cat] }} />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-bold text-moove-brown mb-1">Load KPI Configuration First</div>
                  <p className="text-xs text-moove-muted mb-4">Click "Load All Predefined Assumptions & Metrics" above to enable KPI tracking.</p>
                  <button onClick={handleLoadConfig} className="bg-moove-orange text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-all">
                    ✓ Load All Predefined Assumptions & Metrics
                  </button>
                </div>
              )}
            </div>
          )}

          {/* D/F/V Analysis */}
          {tab === 'dfv' && (
            <div className="flex flex-col gap-5">
              {dfvCategories.map(c => {
                const explanation = generateExplanation(c.key, m)
                const status = c.score >= 4.0 ? 'excellent' : c.score >= 3.5 ? 'target' : c.score >= 3.0 ? 'threshold' : 'below'
                const sc = statusColors[status]
                return (
                  <div key={c.key} className="bg-white rounded-2xl p-5 card-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${c.color}15` }}>{c.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-0.5">
                          <div className="font-display font-black text-xl text-moove-brown">{c.label}</div>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                        </div>
                        <div className="text-xs text-moove-muted">{c.desc}</div>
                      </div>
                      <div className="font-display font-black text-3xl shrink-0" style={{ color: c.color }}>{c.score.toFixed(2)}<span className="text-base text-moove-muted">/5</span></div>
                    </div>

                    {/* Score bar */}
                    <div className="mb-4">
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(c.score / 5) * 100}%`, background: c.color }} />
                        {/* threshold/target/excellent markers */}
                        {([3.0, 3.5, 4.0] as number[]).map((marker, i) => (
                          <div key={i} className="absolute top-0 bottom-0 w-0.5 bg-white/80" style={{ left: `${(marker / 5) * 100}%` }} />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-moove-muted mt-1">
                        <span>0</span><span>Threshold 3.0</span><span>Target 3.5</span><span>Excellent 4.0</span><span>5</span>
                      </div>
                    </div>

                    {/* Evidence & Explanation */}
                    <div className="p-4 rounded-xl" style={{ background: `${c.color}08` }}>
                      <div className="text-xs font-bold tracking-wide mb-2" style={{ color: c.color }}>SURVEY-BASED EXPLANATION</div>
                      <p className="text-xs text-moove-brown leading-relaxed">{explanation}</p>
                    </div>

                    {/* Supporting metrics */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {UNLEASH_KPIS.filter(k => k.category === c.key).map(kpi => {
                        const val = getKPIValue(kpi.id, m)
                        const s = kpiStatus(kpi, val)
                        const sc2 = statusColors[s]
                        return (
                          <div key={kpi.id} className="p-2.5 rounded-xl text-center" style={{ background: sc2.bg }}>
                            <div className="text-xs text-moove-muted leading-tight mb-0.5">{kpi.label}</div>
                            <div className="font-black text-sm" style={{ color: sc2.text }}>{kpi.unit === '%' ? `${Math.round(val)}%` : val.toFixed(2)}{kpi.unit !== '%' ? kpi.unit : ''}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Features */}
          {tab === 'features' && (
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-bold text-moove-muted mb-4 tracking-wide">MOST USEFUL FEATURES</div>
                {Object.keys(m.mostUsefulFeatures).length === 0 ? (
                  <div className="text-sm text-moove-muted text-center py-6">No data yet</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {Object.entries(m.mostUsefulFeatures)
                      .sort(([, a], [, b]) => b - a)
                      .map(([feat, cnt]) => (
                        <div key={feat} className="flex items-center gap-3">
                          <div className="text-xs text-moove-brown font-semibold flex-1 truncate">{feat}</div>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-green-400" style={{ width: `${(cnt / m.n) * 100}%` }} />
                          </div>
                          <div className="text-xs font-bold text-moove-brown w-10 text-right">{cnt}/{m.n}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-bold text-moove-muted mb-4 tracking-wide">NEEDS IMPROVEMENT</div>
                {Object.keys(m.needsImprovementFeatures).length === 0 ? (
                  <div className="text-sm text-moove-muted text-center py-6">No data or all respondents satisfied</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {Object.entries(m.needsImprovementFeatures)
                      .sort(([, a], [, b]) => b - a)
                      .map(([feat, cnt]) => (
                        <div key={feat} className="flex items-center gap-3">
                          <div className="text-xs text-moove-brown font-semibold flex-1 truncate">{feat}</div>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-orange-400" style={{ width: `${(cnt / m.n) * 100}%` }} />
                          </div>
                          <div className="text-xs font-bold text-moove-brown w-10 text-right">{cnt}/{m.n}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bugs */}
          {tab === 'bugs' && (
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-bold text-moove-muted mb-4 tracking-wide">BUG EXPERIENCE DISTRIBUTION</div>
                {[
                  { label: 'No bugs', count: m.noBugs, color: '#22C55E' },
                  { label: 'Minor bugs', count: m.minorBugs, color: '#FBBF24' },
                  { label: 'Moderate bugs', count: m.moderateBugs, color: '#F97316' },
                  { label: 'Major bugs', count: m.majorBugs, color: '#EF4444' },
                ].map(row => (
                  <div key={row.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold" style={{ color: row.color }}>{row.label}</span>
                      <span className="text-moove-muted">{row.count} ({m.n > 0 ? Math.round((row.count / m.n) * 100) : 0}%)</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.n > 0 ? (row.count / m.n) * 100 : 0}%`, background: row.color }} />
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-100">
                  <div className="text-xs font-bold text-moove-brown">Bug-Free Rate: <span className="text-moove-orange">{m.bugFreePct}%</span></div>
                  <div className="text-xs text-moove-muted mt-0.5">Target: ≥85% | Excellent: ≥95%</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="text-xs font-bold text-moove-muted mb-4 tracking-wide">BUG DESCRIPTIONS FROM RESPONDENTS</div>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {feedback
                    .filter(f => f.bugExperience && f.bugExperience !== 'none' && f.bugDescription)
                    .map((f, i) => (
                      <div key={i} className="p-3 rounded-xl bg-red-50 border border-red-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-red-600 capitalize">{f.bugExperience}</span>
                          <span className="text-xs text-moove-muted">· {new Date(f.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-moove-brown leading-relaxed">{f.bugDescription}</p>
                      </div>
                    ))}
                  {feedback.filter(f => f.bugExperience && f.bugExperience !== 'none' && f.bugDescription).length === 0 && (
                    <div className="text-center py-6 text-sm text-moove-muted">No bug descriptions submitted yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
