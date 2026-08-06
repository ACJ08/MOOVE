import React from 'react'
import type { AdminFeedbackRow } from '@/lib/db'

type LearningReflectionProps = {
  rows: AdminFeedbackRow[]
  participantCount: number
  updatedAt: string
}

function answer(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

function average(values: Array<number | null>) {
  const valid = values.filter((value): value is number => typeof value === 'number' && value > 0)
  return valid.length > 0 ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0
}

function ratio(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0
}

function topPhrases(list: string[], count = 3) {
  const frequencies: Record<string, number> = {}
  for (const value of list) {
    const key = value.trim()
    if (!key) continue
    frequencies[key] = (frequencies[key] ?? 0) + 1
  }
  return Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([text, frequency]) => `${text} (${frequency})`)
}

function InsightCard({
  icon,
  title,
  description,
  highlights,
  color,
}: {
  icon: string
  title: string
  description: string
  highlights: string[]
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-moove-border/60 hover-lift">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-bold text-moove-brown">{title}</h3>
          <p className="text-xs text-moove-muted mt-1">{description}</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${color}1a` }}>{icon}</div>
      </div>
      <div className="space-y-2">
        {highlights.map(item => (
          <div key={item} className="text-sm text-moove-brown rounded-xl px-3 py-2 border" style={{ borderColor: `${color}33`, background: `${color}0d` }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LearningReflection({ rows, participantCount, updatedAt }: LearningReflectionProps) {
  const overall = average(rows.map(row => row.overallRating))
  const firstImpression = average(rows.map(row => row.firstImpression))
  const navigation = average(rows.map(row => row.easeOfNavigation))
  const learning = average(rows.map(row => row.easeOfLearning))
  const completionYes = ratio(rows.filter(row => answer(row.accomplishedTask) === 'yes').length, rows.length)
  const recommendYes = ratio(rows.filter(row => answer(row.wouldRecommend) === 'yes').length, rows.length)
  const useAgainYes = ratio(rows.filter(row => answer(row.wouldUseAgain) === 'yes').length, rows.length)

  const topUseful = topPhrases(rows.map(row => row.mostUsefulFeature ?? ''))
  const topImprovements = topPhrases(rows.map(row => row.needsImprovement ?? ''))
  const topConfusing = topPhrases(rows.map(row => row.confusingPart ?? ''))
  const topRequests = topPhrases(rows.map(row => row.featureRequest ?? ''))

  const worked = [
    overall > 0 ? `Overall satisfaction averaged ${overall.toFixed(2)} / 5.` : 'Overall satisfaction data is still pending.',
    completionYes > 0 ? `${completionYes}% of participants reported successful task completion.` : 'Task completion confirmations are still pending.',
    topUseful[0] ? `Most appreciated feature: ${topUseful[0]}.` : 'No repeated “most useful feature” pattern yet.',
  ]

  const didNotWork = [
    navigation > 0 && navigation < 4 ? `Navigation score (${navigation.toFixed(2)} / 5) indicates friction in wayfinding.` : 'Navigation score remains at or above target.',
    topImprovements[0] ? `Most common improvement request: ${topImprovements[0]}.` : 'No dominant improvement request yet.',
    topConfusing[0] ? `Most confusing workflow reported: ${topConfusing[0]}.` : 'No major confusion pattern detected yet.',
  ]

  const surprises = [
    firstImpression > overall ? `First impression (${firstImpression.toFixed(2)} / 5) outperformed overall satisfaction.` : 'First impression and overall satisfaction trend closely.',
    recommendYes > useAgainYes ? `Recommendation intent (${recommendYes}%) is stronger than retention intent (${useAgainYes}%).` : `Retention intent (${useAgainYes}%) is aligned with or stronger than recommendation intent (${recommendYes}%).`,
    topRequests[0] ? `Unexpected recurring request: ${topRequests[0]}.` : 'Feature requests are diverse without a single dominant theme.',
  ]

  const improveNext = [
    learning > 0 && learning < 4 ? `Refine onboarding and in-flow guidance to lift learnability from ${learning.toFixed(2)} / 5.` : 'Preserve current learnability patterns and validate at larger sample size.',
    topImprovements[1] ? `Prioritize the second most cited gap: ${topImprovements[1]}.` : 'Collect more submissions to prioritize the second improvement wave.',
    'Run another validation cycle after updates and compare deltas against current KPI baseline.',
  ]

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl card-shadow">
        <h2 className="font-display font-black text-2xl text-moove-brown">Learning & Solution Development</h2>
        <p className="text-sm text-moove-muted mt-1">Reflect on the validation findings and identify improvements for the next prototype iteration.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-orange-50 text-moove-orange font-semibold">Participants: {participantCount}</span>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">Updated: {updatedAt}</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl card-shadow">
        <div className="text-xs font-black tracking-widest text-moove-muted mb-3">LEARNING & SOLUTION DEVELOPMENT NEXT STEPS</div>
        <div className="grid lg:grid-cols-2 gap-4">
          <InsightCard
            icon="✅"
            title="What worked"
            description="Successful prototype aspects and positive validation outcomes."
            highlights={worked}
            color="#22C55E"
          />
          <InsightCard
            icon="⚠️"
            title="What didn't work"
            description="Usability issues, pain points, and recurring friction in the journey."
            highlights={didNotWork}
            color="#EF4444"
          />
          <InsightCard
            icon="💡"
            title="What surprised you"
            description="Unexpected reactions, disproven assumptions, and hidden patterns."
            highlights={surprises}
            color="#A855F7"
          />
          <InsightCard
            icon="🚀"
            title="What you'll improve next"
            description="Actionable improvements for the next validation and iteration cycle."
            highlights={improveNext}
            color="#0EA5E9"
          />
        </div>
      </div>

      <div className="rounded-2xl p-5 border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 card-shadow">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-xl shrink-0">🎯</div>
          <div>
            <div className="text-sm font-black text-moove-brown mb-1">TRL 4 Reflection</div>
            <p className="text-sm text-moove-brown leading-relaxed">
              Reflection and documented learnings are an essential part of reaching Technology Readiness Level (TRL) 4. These insights demonstrate how user validation informs iterative solution development and continuous improvement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
