import React from 'react'
import type { AdminFeedbackRow } from '@/lib/db'

type MetricValue = { value: number; type: 'rating' | 'percent' }
type MetricsMap = Record<string, MetricValue>
type FeedbackKey = keyof AdminFeedbackRow

type ClassificationProps = {
  rows: AdminFeedbackRow[]
  metrics: MetricsMap
  totalResponses: number
  lastUpdatedAt: string
}

type ClassificationItem = {
  label: string
  metricKey: string
  evidenceKeys: FeedbackKey[]
}

function formatMetric(value: number, type: MetricValue['type'], totalResponses: number) {
  if (totalResponses === 0) return 'Pending'
  return type === 'rating' ? `${value.toFixed(2)} / 5` : `${Math.round(value)}%`
}

function normalizedToFive(value: number, type: MetricValue['type']) {
  return type === 'rating' ? value : (value / 100) * 5
}

function participantEvidence(rows: AdminFeedbackRow[], keys: FeedbackKey[]) {
  const evidence: Array<{ comment: string; participant: number }> = []
  for (const row of rows) {
    for (const key of keys) {
      const response = row[key]
      if (typeof response === 'string' && response.trim() && !evidence.some(item => item.comment === response.trim())) {
        evidence.push({ comment: response.trim(), participant: evidence.length + 1 })
      }
      if (evidence.length === 3) return evidence
    }
  }
  return evidence
}

/** Creates a descriptive finding exclusively from the displayed, computed metric. */
function researchSummary(label: string, metric: MetricValue | undefined, participantCount: number) {
  if (!participantCount || !metric) return 'Waiting for participant responses to calculate this research finding.'

  const value = metric.value
  if (metric.type === 'percent') {
    const response = `${Math.round(value)}% of ${participantCount} participant${participantCount === 1 ? '' : 's'}`
    if (value >= 80) return `${response} indicate a strong ${label.toLowerCase()} outcome.`
    if (value >= 60) return `${response} indicate a generally positive ${label.toLowerCase()} outcome.`
    return `${response} indicate that ${label.toLowerCase()} needs further validation.`
  }

  const response = `The average ${label.toLowerCase()} rating is ${value.toFixed(2)} out of 5`
  if (value >= 4) return `${response}, reflecting a strong participant evaluation.`
  if (value >= 3) return `${response}, reflecting a mixed but usable participant evaluation.`
  return `${response}, identifying an area for follow-up research.`
}

function renderCategoryCard({ label, icon, color, items, rows, metrics, totalResponses, lastUpdatedAt }: {
  label: string
  icon: string
  color: string
  items: ClassificationItem[]
  rows: AdminFeedbackRow[]
  metrics: MetricsMap
  totalResponses: number
  lastUpdatedAt: string
}) {
  const mapped = items.map(item => {
    const metric = metrics[item.metricKey]
    const value = metric?.value ?? 0
    const type = metric?.type ?? 'percent'
    const normalized = normalizedToFive(value, type)
    return {
      ...item,
      metric,
      value,
      type,
      normalized,
      progress: Math.min(100, Math.max(0, (normalized / 5) * 100)),
      summary: researchSummary(item.label, metric, totalResponses),
      evidence: participantEvidence(rows, item.evidenceKeys),
    }
  })
  const averageScore = mapped.length ? mapped.reduce((sum, item) => sum + item.normalized, 0) / mapped.length : 0

  return (
    <section className="bg-white rounded-2xl p-5 card-shadow" aria-label={`${label} validation findings`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{icon}</span>
          <div>
            <div className="text-xs font-black tracking-widest" style={{ color }}>{label.toUpperCase()}</div>
            <div className="text-[11px] text-moove-muted">UNLEASH validation lens</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-black" style={{ color }}>{totalResponses ? `${averageScore.toFixed(2)} / 5` : 'Pending'}</div>
          <div className="text-[10px] text-moove-muted">Avg category score</div>
        </div>
      </div>

      <div className="space-y-2.5">
        {mapped.map(item => (
          <article key={`${label}-${item.label}`} className="rounded-xl border border-moove-border p-3 bg-moove-cream/40">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold text-moove-brown">{item.label}</h3>
              <span className="text-xs font-black shrink-0" style={{ color }}>{formatMetric(item.value, item.type, totalResponses)}</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.progress}%`, background: color }} />
            </div>
            <div className="rounded-lg bg-white/80 px-2.5 py-2 text-xs leading-relaxed text-moove-brown break-words">
              <span className="font-bold" style={{ color }}>Research summary: </span>{item.summary}
            </div>
            <div className="mt-2 rounded-lg border border-moove-border bg-white p-2.5">
              <div className="text-[10px] font-black tracking-wider text-moove-muted uppercase mb-2">Participant evidence</div>
              {item.evidence.length ? (
                <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                  {item.evidence.map(evidence => <div key={evidence.comment} className="border-l-2 pl-2 text-[11px] leading-relaxed text-moove-brown" style={{ borderColor: color }}>
                    <div className="break-words">💬 “{evidence.comment}”</div>
                    <div className="mt-1 text-[10px] text-moove-muted">Participant #{String(evidence.participant).padStart(2, '0')}</div>
                  </div>)}
                </div>
              ) : <p className="text-[11px] text-moove-muted">No participant comments have been submitted for this category yet.</p>}
            </div>
          </article>
        ))}
      </div>
      <div className="mt-4 text-[11px] text-moove-muted">Based on {totalResponses} participant response{totalResponses === 1 ? '' : 's'} · Last updated: {lastUpdatedAt}</div>
    </section>
  )
}

export default function Classification({ rows, metrics, totalResponses, lastUpdatedAt }: ClassificationProps) {
  const desirabilityItems: ClassificationItem[] = [
    { label: 'Overall Satisfaction', metricKey: 'overall_satisfaction_score', evidenceKeys: ['userExperienceComment', 'additionalComments'] },
    { label: 'User Experience', metricKey: 'overall_user_satisfaction_composite', evidenceKeys: ['userExperienceComment', 'additionalComments'] },
    { label: 'Ease of Navigation', metricKey: 'navigation_usability_score', evidenceKeys: ['easeOfUseComment', 'confusingPart'] },
    { label: 'Ease of Learning', metricKey: 'learnability_score', evidenceKeys: ['easeOfUseComment', 'needsImprovement'] },
    { label: 'First Impression', metricKey: 'first_impression_score', evidenceKeys: ['firstImpressionComment', 'additionalComments'] },
    { label: 'Perceived Value', metricKey: 'overall_user_satisfaction_composite', evidenceKeys: ['perceivedValueComment', 'mostUsefulFeature'] },
    { label: 'User Enjoyment', metricKey: 'overall_satisfaction_score', evidenceKeys: ['userExperienceComment', 'additionalComments'] },
    { label: 'Retention Intent', metricKey: 'retention_intent_rate', evidenceKeys: ['continuedUsageComment', 'wouldUseAgain'] },
    { label: 'Recommendation Intent', metricKey: 'recommendation_rate', evidenceKeys: ['wouldRecommend', 'continuedUsageComment'] },
  ]
  const feasibilityItems: ClassificationItem[] = [
    { label: 'Task Completion', metricKey: 'task_completion_rate', evidenceKeys: ['additionalComments', 'accomplishedTask'] },
    { label: 'Learnability', metricKey: 'learnability_score', evidenceKeys: ['easeOfUseComment', 'needsImprovement'] },
    { label: 'Technical Reliability', metricKey: 'bug_free_rate', evidenceKeys: ['technicalReliabilityComment', 'bugDescription'] },
    { label: 'Bug-Free Experience', metricKey: 'bug_free_rate', evidenceKeys: ['bugFreeExperienceComment', 'bugDescription'] },
    { label: 'Performance', metricKey: 'bug_free_rate', evidenceKeys: ['technicalReliabilityComment', 'bugDescription'] },
    { label: 'Ease of Use', metricKey: 'navigation_usability_score', evidenceKeys: ['easeOfUseComment', 'confusingPart'] },
    { label: 'System Stability', metricKey: 'bug_free_rate', evidenceKeys: ['technicalReliabilityComment', 'bugDescription'] },
    { label: 'Accessibility', metricKey: 'navigation_usability_score', evidenceKeys: ['easeOfUseComment', 'confusingPart'] },
    { label: 'Prototype Functionality', metricKey: 'user_success_rate', evidenceKeys: ['additionalComments', 'accomplishedTask'] },
  ]
  const viabilityItems: ClassificationItem[] = [
    { label: 'Continued Usage', metricKey: 'retention_intent_rate', evidenceKeys: ['continuedUsageComment', 'wouldUseAgain'] },
    { label: 'Adoption Intent', metricKey: 'retention_intent_rate', evidenceKeys: ['continuedUsageComment', 'featureRequest'] },
    { label: 'Recommendation Rate', metricKey: 'recommendation_rate', evidenceKeys: ['continuedUsageComment', 'wouldRecommend'] },
    { label: 'Long-Term Engagement', metricKey: 'retention_intent_rate', evidenceKeys: ['continuedUsageComment', 'additionalComments'] },
    { label: 'Product Readiness', metricKey: 'overall_user_satisfaction_composite', evidenceKeys: ['additionalComments', 'featureRequest'] },
    { label: 'Market Acceptance', metricKey: 'recommendation_rate', evidenceKeys: ['continuedUsageComment', 'perceivedValueComment'] },
    { label: 'Deployment Readiness', metricKey: 'bug_free_rate', evidenceKeys: ['technicalReliabilityComment', 'bugFreeExperienceComment'] },
    { label: 'User Retention', metricKey: 'retention_intent_rate', evidenceKeys: ['continuedUsageComment', 'wouldUseAgain'] },
    { label: 'Research Success Indicators', metricKey: 'user_success_rate', evidenceKeys: ['additionalComments', 'userExperienceComment'] },
  ]

  return <div className="space-y-4">
    {renderCategoryCard({ label: 'Desirability', icon: '❤️', color: '#F97316', items: desirabilityItems, rows, metrics, totalResponses, lastUpdatedAt })}
    {renderCategoryCard({ label: 'Feasibility', icon: '⚙️', color: '#0EA5E9', items: feasibilityItems, rows, metrics, totalResponses, lastUpdatedAt })}
    {renderCategoryCard({ label: 'Viability', icon: '📈', color: '#22C55E', items: viabilityItems, rows, metrics, totalResponses, lastUpdatedAt })}
  </div>
}
