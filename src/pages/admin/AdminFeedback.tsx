import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchFeedbackSubmissions, fetchTestingConfig, type AdminFeedbackRow, type TestingConfig } from '@/lib/db'
import { useAuth } from '@/context/AuthContext'
import StatCard from '@/components/admin-feedback/StatCard'
import SectionHeader from '@/components/admin-feedback/SectionHeader'
import Insights from '@/components/admin-feedback/Insights'
import Classification from '@/components/admin-feedback/Classification'
import RatingBreakdown from '@/components/admin-feedback/RatingBreakdown'
import UserIntent from '@/components/admin-feedback/UserIntent'
import ExportTab from '@/components/admin-feedback/ExportTab'
import LearningReflection from '@/components/admin-feedback/LearningReflection'
import { openFeedbackReport } from '@/lib/feedbackReport'

type Tab = 'Setup' | 'Overview' | 'Validation Insights' | 'Classification' | 'Learning' | 'Action Plan' | 'Iterations' | 'Export'
type MetricType = 'rating' | 'percent'
type MetricKey =
  | 'overall_satisfaction_score'
  | 'first_impression_score'
  | 'navigation_usability_score'
  | 'learnability_score'
  | 'task_completion_rate'
  | 'user_success_rate'
  | 'retention_intent_rate'
  | 'recommendation_rate'
  | 'overall_user_satisfaction_composite'
  | 'bug_free_rate'

type ValidationAssumption = {
  id: string
  title: string
  description: string
  metricKey: MetricKey
  targetLabel: string
  targetType: MetricType
  targetValue: number
  icon: string
}

type EvaluationMetric = {
  id: string
  key: MetricKey
  name: string
  description: string
  formula: string
  targetLabel: string
  passThresholdLabel: string
  targetType: MetricType
  targetValue: number
  passThreshold: number
  icon: string
}

type FrameworkState = {
  assumptions: ValidationAssumption[]
  metrics: EvaluationMetric[]
  frameworkVersion: string
  metadata: Record<string, unknown>
}

type Action = { id: string; issue: string; title: string | null; category: string | null; description: string; reason: string; expected_outcome: string; priority: 'High' | 'Medium' | 'Low'; status: 'Open' | 'In Progress' | 'Done'; completion_percentage: number; target_completion_date: string | null; completed_date: string | null; notes: string; risks: string; mitigation_strategy: string; suggested_solution: string; retest_required: boolean }
type Iteration = { id: string; version: string; testing_cycle: string; iteration_number: number | null; iteration_name: string | null; phase: string; objective: string; summary: string; work_completed: string; feedback_received: string; improvements_made: string; issues_found: string; resolution: string; validation_result: string; completion_percentage: number; status: 'Planned' | 'In Progress' | 'Complete'; retesting_status: 'Pending' | 'In Progress' | 'Complete'; start_date: string | null; end_date: string | null }

const defaultConfig: TestingConfig = {
  sessionId: '',
  prototypeVersion: '',
  userGroup: '',
  testingEnvironment: '',
  studyStartDate: '',
  targetParticipants: '',
  testingObjective: '',
  overallSuccessCriteria: '',
}

const PREDEFINED_ASSUMPTIONS: ValidationAssumption[] = [
  {
    id: 'assumption_1',
    title: 'Drivers can intuitively navigate MOOVE without prior training or documentation.',
    description: 'Ease of Navigation Score must indicate independent navigation confidence.',
    metricKey: 'navigation_usability_score',
    targetLabel: '>= 4.0 / 5 average rating',
    targetType: 'rating',
    targetValue: 4,
    icon: '🧭',
  },
  {
    id: 'assumption_2',
    title: 'The prototype creates a strong positive first impression on new users.',
    description: 'First Impression Score should pass early emotional and visual response checks.',
    metricKey: 'first_impression_score',
    targetLabel: '>= 4.0 / 5 average rating',
    targetType: 'rating',
    targetValue: 4,
    icon: '✨',
  },
  {
    id: 'assumption_3',
    title: 'Drivers can independently learn how to use all core features within one session.',
    description: 'Ease of Learning Score indicates onboarding clarity and discoverability.',
    metricKey: 'learnability_score',
    targetLabel: '>= 4.0 / 5 average rating',
    targetType: 'rating',
    targetValue: 4,
    icon: '📘',
  },
  {
    id: 'assumption_4',
    title: 'Drivers can successfully accomplish their intended task using MOOVE without external assistance.',
    description: 'Task completion answers must demonstrate successful independent outcomes.',
    metricKey: 'task_completion_rate',
    targetLabel: '>= 80% respond "Yes"',
    targetType: 'percent',
    targetValue: 80,
    icon: '✅',
  },
  {
    id: 'assumption_5',
    title: 'Drivers are satisfied with their overall experience and would use MOOVE again.',
    description: 'Retention intent should show strong willingness for continued usage.',
    metricKey: 'retention_intent_rate',
    targetLabel: '>= 75% respond "Yes"',
    targetType: 'percent',
    targetValue: 75,
    icon: '🔁',
  },
  {
    id: 'assumption_6',
    title: 'Drivers would recommend MOOVE to other professional drivers.',
    description: 'Recommendation intent should validate word-of-mouth confidence.',
    metricKey: 'recommendation_rate',
    targetLabel: '>= 70% respond "Yes"',
    targetType: 'percent',
    targetValue: 70,
    icon: '📣',
  },
  {
    id: 'assumption_7',
    title: 'The prototype delivers a satisfactory overall user experience across all dimensions.',
    description: 'Composite score across Q1-Q4 reflects holistic experience quality.',
    metricKey: 'overall_user_satisfaction_composite',
    targetLabel: '>= 3.5 / 5 composite average',
    targetType: 'rating',
    targetValue: 3.5,
    icon: '📊',
  },
]

const PREDEFINED_METRICS: EvaluationMetric[] = [
  {
    id: 'metric_1',
    key: 'overall_satisfaction_score',
    name: 'Overall Satisfaction Score',
    description: 'Overall satisfaction from Q1 star ratings.',
    formula: 'Average of Q1 — Overall Rating (1–5 stars)',
    targetLabel: '>= 4.0 / 5',
    passThresholdLabel: '>= 3.5 / 5',
    targetType: 'rating',
    targetValue: 4,
    passThreshold: 3.5,
    icon: '⭐',
  },
  {
    id: 'metric_2',
    key: 'first_impression_score',
    name: 'First Impression Score',
    description: 'Immediate first impression quality from Q2 ratings.',
    formula: 'Average of Q2',
    targetLabel: '>= 4.0 / 5',
    passThresholdLabel: '>= 3.5 / 5',
    targetType: 'rating',
    targetValue: 4,
    passThreshold: 3.5,
    icon: '✨',
  },
  {
    id: 'metric_3',
    key: 'navigation_usability_score',
    name: 'Navigation Usability Score',
    description: 'Perceived navigation clarity and ease from Q3 ratings.',
    formula: 'Average of Q3',
    targetLabel: '>= 4.0 / 5',
    passThresholdLabel: '>= 3.5 / 5',
    targetType: 'rating',
    targetValue: 4,
    passThreshold: 3.5,
    icon: '🧭',
  },
  {
    id: 'metric_4',
    key: 'learnability_score',
    name: 'Learnability Score',
    description: 'How quickly users can learn the core product in one session.',
    formula: 'Average of Q4',
    targetLabel: '>= 4.0 / 5',
    passThresholdLabel: '>= 3.5 / 5',
    targetType: 'rating',
    targetValue: 4,
    passThreshold: 3.5,
    icon: '📘',
  },
  {
    id: 'metric_5',
    key: 'task_completion_rate',
    name: 'Task Completion Rate',
    description: 'Share of participants who answered Yes to accomplishing their task.',
    formula: 'Percentage of users answering Yes to Q5',
    targetLabel: '>= 80%',
    passThresholdLabel: '>= 70%',
    targetType: 'percent',
    targetValue: 80,
    passThreshold: 70,
    icon: '✅',
  },
  {
    id: 'metric_6',
    key: 'user_success_rate',
    name: 'User Success Rate',
    description: 'Broad success indicator including partial completion.',
    formula: 'Percentage answering Yes or Partially',
    targetLabel: '>= 85%',
    passThresholdLabel: '>= 75%',
    targetType: 'percent',
    targetValue: 85,
    passThreshold: 75,
    icon: '🎯',
  },
  {
    id: 'metric_7',
    key: 'retention_intent_rate',
    name: 'Retention Intent Rate',
    description: 'Likelihood of continued use after trial session.',
    formula: 'Percentage answering Yes to Q9',
    targetLabel: '>= 75%',
    passThresholdLabel: '>= 60%',
    targetType: 'percent',
    targetValue: 75,
    passThreshold: 60,
    icon: '🔁',
  },
  {
    id: 'metric_8',
    key: 'recommendation_rate',
    name: 'Recommendation Rate',
    description: 'Word-of-mouth recommendation confidence.',
    formula: 'Percentage answering Yes to Q10',
    targetLabel: '>= 70%',
    passThresholdLabel: '>= 60%',
    targetType: 'percent',
    targetValue: 70,
    passThreshold: 60,
    icon: '📣',
  },
  {
    id: 'metric_9',
    key: 'overall_user_satisfaction_composite',
    name: 'Overall User Satisfaction (Composite)',
    description: 'Weighted outcome proxy for complete user experience.',
    formula: 'Weighted Average of Q1–Q4',
    targetLabel: '>= 4.0 / 5',
    passThresholdLabel: '>= 3.5 / 5',
    targetType: 'rating',
    targetValue: 4,
    passThreshold: 3.5,
    icon: '📊',
  },
  {
    id: 'metric_10',
    key: 'bug_free_rate',
    name: 'Bug-Free Rate',
    description: 'Submission quality metric without reported bugs.',
    formula: 'Percentage of submissions without a reported bug',
    targetLabel: '>= 80%',
    passThresholdLabel: '>= 70%',
    targetType: 'percent',
    targetValue: 80,
    passThreshold: 70,
    icon: '🐞',
  },
]

const configFields: Array<{ key: keyof TestingConfig; label: string; required?: boolean; type?: 'text' | 'date' | 'number' }> = [
  { key: 'sessionId', label: 'Testing Session ID', required: true },
  { key: 'prototypeVersion', label: 'Prototype Version', required: true },
  { key: 'userGroup', label: 'User Group' },
  { key: 'testingEnvironment', label: 'Testing Environment' },
  { key: 'studyStartDate', label: 'Study Start Date', type: 'date' },
  { key: 'targetParticipants', label: 'Target Participants', type: 'number' },
  { key: 'testingObjective', label: 'Testing Objective', required: true },
  { key: 'overallSuccessCriteria', label: 'Overall Success Criteria' },
]

const CARD_HEADER_COLORS = ['#0EA5E9', '#F97316', '#A855F7', '#22C55E', '#F59E0B', '#14B8A6', '#EF4444', '#7C3AED', '#10B981', '#3B82F6']

const cloneAssumptions = () => PREDEFINED_ASSUMPTIONS.map(item => ({ ...item }))
const cloneMetrics = () => PREDEFINED_METRICS.map(item => ({ ...item }))

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeMetricType(value: unknown, fallback: MetricType): MetricType {
  if (value === 'rating' || value === 'percent') return value
  return fallback
}

function normalizeAssumptions(raw: unknown, metrics: EvaluationMetric[]): ValidationAssumption[] {
  const options = Array.isArray(raw) ? raw : []
  const metricKeys = new Set(metrics.map(metric => metric.key))
  return PREDEFINED_ASSUMPTIONS.map((fallback, index) => {
    const candidate = options[index]
    if (!isObject(candidate)) return { ...fallback }
    const metricCandidate = typeof candidate.metricKey === 'string' ? (candidate.metricKey as MetricKey) : fallback.metricKey
    return {
      id: typeof candidate.id === 'string' ? candidate.id : fallback.id,
      title: typeof candidate.title === 'string' ? candidate.title : fallback.title,
      description: typeof candidate.description === 'string' ? candidate.description : fallback.description,
      metricKey: metricKeys.has(metricCandidate) ? metricCandidate : fallback.metricKey,
      targetLabel: typeof candidate.targetLabel === 'string' ? candidate.targetLabel : fallback.targetLabel,
      targetType: normalizeMetricType(candidate.targetType, fallback.targetType),
      targetValue: toNumber(candidate.targetValue, fallback.targetValue),
      icon: typeof candidate.icon === 'string' ? candidate.icon : fallback.icon,
    }
  })
}

function normalizeMetrics(raw: unknown): EvaluationMetric[] {
  const options = Array.isArray(raw) ? raw : []
  return PREDEFINED_METRICS.map((fallback, index) => {
    const candidate = options[index]
    if (typeof candidate === 'string') {
      return { ...fallback, name: candidate }
    }
    if (!isObject(candidate)) return { ...fallback }
    return {
      id: typeof candidate.id === 'string' ? candidate.id : fallback.id,
      key: typeof candidate.key === 'string' ? (candidate.key as MetricKey) : fallback.key,
      name: typeof candidate.name === 'string' ? candidate.name : fallback.name,
      description: typeof candidate.description === 'string' ? candidate.description : fallback.description,
      formula: typeof candidate.formula === 'string' ? candidate.formula : fallback.formula,
      targetLabel: typeof candidate.targetLabel === 'string' ? candidate.targetLabel : fallback.targetLabel,
      passThresholdLabel: typeof candidate.passThresholdLabel === 'string' ? candidate.passThresholdLabel : fallback.passThresholdLabel,
      targetType: normalizeMetricType(candidate.targetType, fallback.targetType),
      targetValue: toNumber(candidate.targetValue, fallback.targetValue),
      passThreshold: toNumber(candidate.passThreshold, fallback.passThreshold),
      icon: typeof candidate.icon === 'string' ? candidate.icon : fallback.icon,
    }
  })
}

function average(values: Array<number | null>) {
  const valid = values.filter((value): value is number => typeof value === 'number' && value > 0)
  return valid.length > 0 ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0
}

function percent(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0
}

function answer(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

function getStatus(totalResponses: number, value: number, threshold: number): 'PASS' | 'FAIL' | 'PENDING' {
  if (totalResponses === 0) return 'PENDING'
  return value >= threshold ? 'PASS' : 'FAIL'
}

function statusClasses(status: 'PASS' | 'FAIL' | 'PENDING') {
  if (status === 'PASS') return 'bg-green-50 text-green-700 border border-green-200'
  if (status === 'FAIL') return 'bg-red-50 text-red-700 border border-red-200'
  return 'bg-gray-100 text-gray-600 border border-gray-200'
}

function formatMetricValue(value: number, type: MetricType, totalResponses: number) {
  if (totalResponses === 0) return 'Pending'
  return type === 'rating' ? `${value.toFixed(2)} / 5` : `${Math.round(value)}%`
}

function progressTowardTarget(value: number, target: number) {
  if (target <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((value / target) * 100)))
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not yet available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not yet available'
  return date.toLocaleString()
}

export default function AdminFeedback() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('Setup')
  const [rows, setRows] = useState<AdminFeedbackRow[]>([])
  const [config, setConfig] = useState<TestingConfig>(defaultConfig)
  const [frame, setFrame] = useState<FrameworkState>({
    assumptions: cloneAssumptions(),
    metrics: cloneMetrics(),
    frameworkVersion: '2026.08.unleash-v1',
    metadata: {},
  })
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [actions, setActions] = useState<Action[]>([])
  const [iterations, setIterations] = useState<Iteration[]>([])
  const [actionDraft, setActionDraft] = useState<Partial<Action> | null>(null)
  const [iterationDraft, setIterationDraft] = useState<Partial<Iteration> | null>(null)
  const [expandedAssumptions, setExpandedAssumptions] = useState<Record<string, boolean>>({})
  const [expandedMetrics, setExpandedMetrics] = useState<Record<string, boolean>>({})
  const [lastConfigUpdatedAt, setLastConfigUpdatedAt] = useState<string>('')

  const load = async () => {
    setIsLoading(true)
    try {
      const [feedback, cfg, framework, actionData, iterationData] = await Promise.all([
        fetchFeedbackSubmissions(),
        fetchTestingConfig(),
        supabase?.from('testing_configurations').select('*').eq('id', 'current').maybeSingle(),
        supabase?.from('testing_action_plans').select('*').is('deleted_at', null).order('target_completion_date', { ascending: true }),
        supabase?.from('testing_iterations').select('*').is('deleted_at', null).order('iteration_number', { ascending: true }),
      ])

      const rawMetrics = normalizeMetrics(framework?.data?.evaluation_metrics)
      const rawAssumptions = normalizeAssumptions(framework?.data?.validation_assumptions, rawMetrics)

      setRows(feedback)
      setConfig(cfg ?? defaultConfig)
      setFrame({
        assumptions: rawAssumptions,
        metrics: rawMetrics,
        frameworkVersion: typeof framework?.data?.framework_version === 'string' ? framework.data.framework_version : '2026.08.unleash-v1',
        metadata: isObject(framework?.data?.configuration_metadata) ? framework.data.configuration_metadata : {},
      })
      setActions((actionData?.data as Action[] | null) ?? [])
      setIterations((iterationData?.data as Iteration[] | null) ?? [])
      setLastConfigUpdatedAt(typeof framework?.data?.updated_at === 'string' ? framework.data.updated_at : '')
      setNotice('')
    } catch {
      setNotice('Unable to load live Supabase data.')
      setSaveState('error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
    const channel = supabase
      ?.channel('feedback-analytics-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback_submissions' }, () => { void load() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testing_configurations' }, () => { void load() })
      .subscribe()
    return () => {
      if (channel) void supabase?.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    setExpandedAssumptions(prev => {
      const next = { ...prev }
      for (const assumption of frame.assumptions) {
        if (next[assumption.id] === undefined) next[assumption.id] = true
      }
      return next
    })
    setExpandedMetrics(prev => {
      const next = { ...prev }
      for (const metric of frame.metrics) {
        if (next[metric.id] === undefined) next[metric.id] = true
      }
      return next
    })
  }, [frame.assumptions, frame.metrics])

  const data = useMemo(() => {
    const n = rows.length
    const rating = average(rows.map(row => row.overallRating))
    const firstImpression = average(rows.map(row => row.firstImpression))
    const nav = average(rows.map(row => row.easeOfNavigation))
    const learn = average(rows.map(row => row.easeOfLearning))
    const composite = average([rating, firstImpression, nav, learn])

    function isBugFree(row: AdminFeedbackRow) {
      const bugExperience = answer(row.bugExperience)
      const bugDescription = (row.bugDescription ?? '').trim()
      if (!bugExperience && !bugDescription) return true
      const noBugResponses = ['none', 'no', 'no bug', 'no bugs', 'no issues', 'n/a', 'na']
      if (noBugResponses.includes(bugExperience) && bugDescription.length === 0) return true
      return false
    }

    const taskCompletion = percent(rows.filter(row => answer(row.accomplishedTask) === 'yes').length, n)
    const userSuccess = percent(rows.filter(row => ['yes', 'partially'].includes(answer(row.accomplishedTask))).length, n)
    const retentionIntent = percent(rows.filter(row => answer(row.wouldUseAgain) === 'yes').length, n)
    const recommendation = percent(rows.filter(row => answer(row.wouldRecommend) === 'yes').length, n)
    const bugFree = percent(rows.filter(isBugFree).length, n)

    const metricValues: Record<MetricKey, number> = {
      overall_satisfaction_score: rating,
      first_impression_score: firstImpression,
      navigation_usability_score: nav,
      learnability_score: learn,
      task_completion_rate: taskCompletion,
      user_success_rate: userSuccess,
      retention_intent_rate: retentionIntent,
      recommendation_rate: recommendation,
      overall_user_satisfaction_composite: composite,
      bug_free_rate: bugFree,
    }

    return {
      n,
      rating,
      firstImpression,
      nav,
      learn,
      composite,
      taskCompletion,
      userSuccess,
      retentionIntent,
      recommendation,
      bugFree,
      metricValues,
      latestSubmissionAt: rows[0]?.submittedAt ?? '',
    }
  }, [rows])

  const assumptionCards = useMemo(() => {
    return frame.assumptions.map(assumption => {
      const currentValue = data.metricValues[assumption.metricKey] ?? 0
      const status = getStatus(data.n, currentValue, assumption.targetValue)
      const completion = progressTowardTarget(currentValue, assumption.targetValue)
      const metric = frame.metrics.find(item => item.key === assumption.metricKey)
      return {
        ...assumption,
        status,
        completion,
        currentValue,
        metricName: metric?.name ?? assumption.metricKey,
      }
    })
  }, [frame.assumptions, frame.metrics, data.metricValues, data.n])

  const metricCards = useMemo(() => {
    return frame.metrics.map(metric => {
      const currentValue = data.metricValues[metric.key] ?? 0
      const status = getStatus(data.n, currentValue, metric.passThreshold)
      return {
        ...metric,
        currentValue,
        status,
      }
    })
  }, [frame.metrics, data.metricValues, data.n])

  const classificationMetrics = useMemo(() => {
    const mapped: Record<string, { value: number; type: MetricType }> = {}
    for (const metric of frame.metrics) {
      mapped[metric.key] = {
        value: data.metricValues[metric.key] ?? 0,
        type: metric.targetType,
      }
    }
    return mapped
  }, [frame.metrics, data.metricValues])

  const updateAssumption = (id: string, patch: Partial<ValidationAssumption>) => {
    setFrame(current => ({
      ...current,
      assumptions: current.assumptions.map(assumption => (assumption.id === id ? { ...assumption, ...patch } : assumption)),
    }))
  }

  const updateMetric = (id: string, patch: Partial<EvaluationMetric>) => {
    setFrame(current => ({
      ...current,
      metrics: current.metrics.map(metric => (metric.id === id ? { ...metric, ...patch } : metric)),
    }))
  }

  const save = async () => {
    if (!supabase) return

    const requiredErrors: string[] = []
    if (!config.sessionId.trim()) requiredErrors.push('Testing Session ID is required.')
    if (!config.prototypeVersion.trim()) requiredErrors.push('Prototype Version is required.')
    if (!config.testingObjective.trim()) requiredErrors.push('Testing Objective is required.')
    if (frame.assumptions.some(assumption => !assumption.title.trim())) requiredErrors.push('Every assumption must have a title.')
    if (frame.metrics.some(metric => !metric.name.trim() || !metric.formula.trim())) requiredErrors.push('Every metric must have a name and formula.')

    if (requiredErrors.length > 0) {
      setSaveState('error')
      setNotice(requiredErrors.join(' '))
      return
    }

    const { data: { user: sessionUser } } = await supabase.auth.getUser()
    if (!sessionUser || user?.role !== 'admin') {
      setSaveState('error')
      setNotice('Please sign in with a real administrator account before saving. Demo accounts cannot write to Supabase.')
      return
    }

    setSaveState('saving')
    setNotice('Saving testing configuration...')

    const basePayload = {
      id: 'current',
      session_id: config.sessionId,
      prototype_version: config.prototypeVersion,
      user_group: config.userGroup,
      testing_environment: config.testingEnvironment,
      study_start_date: config.studyStartDate || null,
      target_participants: Number(config.targetParticipants) || null,
      testing_objective: config.testingObjective,
      overall_success_criteria: config.overallSuccessCriteria,
      validation_assumptions: frame.assumptions,
      evaluation_metrics: frame.metrics,
      updated_by: sessionUser.id,
    }

    const payloadWithMetadata = {
      ...basePayload,
      framework_version: frame.frameworkVersion,
      configuration_metadata: {
        ...frame.metadata,
        saved_at_client: new Date().toISOString(),
        assumptions_count: frame.assumptions.length,
        metrics_count: frame.metrics.length,
      },
    }

    let { error } = await supabase.from('testing_configurations').upsert(payloadWithMetadata, { onConflict: 'id' })
    if (error && /framework_version|configuration_metadata/i.test(error.message)) {
      const retry = await supabase.from('testing_configurations').upsert(basePayload, { onConflict: 'id' })
      error = retry.error
    }

    if (error) {
      setSaveState('error')
      setNotice(error.message)
      return
    }

    setSaveState('success')
    setNotice('Testing configuration saved successfully.')
    void load()
  }

  const saveAction = async () => {
    if (!supabase || !actionDraft?.issue) return
    const payload = {
      issue: actionDraft.issue,
      title: actionDraft.title ?? actionDraft.issue,
      category: actionDraft.category ?? 'General',
      description: actionDraft.description ?? '', reason: actionDraft.reason ?? '', expected_outcome: actionDraft.expected_outcome ?? '',
      priority: actionDraft.priority ?? 'Medium',
      suggested_solution: actionDraft.suggested_solution ?? '',
      status: actionDraft.status ?? 'Open',
      retest_required: !!actionDraft.retest_required,
      completion_percentage: actionDraft.completion_percentage ?? 0,
      target_completion_date: actionDraft.target_completion_date || null, completed_date: actionDraft.completed_date || null,
      notes: actionDraft.notes ?? '', risks: actionDraft.risks ?? '', mitigation_strategy: actionDraft.mitigation_strategy ?? '',
      created_by: (await supabase.auth.getUser()).data.user?.id,
    }
    const query = actionDraft.id ? supabase.from('testing_action_plans').update(payload).eq('id', actionDraft.id) : supabase.from('testing_action_plans').insert(payload)
    const { error } = await query
    setNotice(error?.message ?? 'Action plan saved.')
    if (!error) {
      setActionDraft(null)
      void load()
    }
  }

  const saveIteration = async () => {
    if (!supabase || !iterationDraft?.version) return
    const payload = {
      version: iterationDraft.version,
      testing_cycle: iterationDraft.testing_cycle ?? '',
      iteration_number: iterationDraft.iteration_number ?? null, iteration_name: iterationDraft.iteration_name ?? iterationDraft.version,
      phase: iterationDraft.phase ?? '', objective: iterationDraft.objective ?? '', summary: iterationDraft.summary ?? '', work_completed: iterationDraft.work_completed ?? '', feedback_received: iterationDraft.feedback_received ?? '',
      improvements_made: iterationDraft.improvements_made ?? '',
      issues_found: iterationDraft.issues_found ?? '', resolution: iterationDraft.resolution ?? '', validation_result: iterationDraft.validation_result ?? '',
      completion_percentage: iterationDraft.completion_percentage ?? 0, status: iterationDraft.status ?? 'Planned',
      start_date: iterationDraft.start_date || null, end_date: iterationDraft.end_date || null,
      retesting_status: iterationDraft.retesting_status ?? 'Pending',
      created_by: (await supabase.auth.getUser()).data.user?.id,
    }
    const query = iterationDraft.id ? supabase.from('testing_iterations').update(payload).eq('id', iterationDraft.id) : supabase.from('testing_iterations').insert(payload)
    const { error } = await query
    setNotice(error?.message ?? 'Iteration saved.')
    if (!error) {
      setIterationDraft(null)
      void load()
    }
  }

  const archiveRecord = async (table: 'testing_action_plans' | 'testing_iterations', id: string) => {
    if (!supabase) return
    const { error } = await supabase.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id)
    setNotice(error?.message ?? 'Record archived.')
    if (!error) void load()
  }

  const exportFile = async (kind: 'csv' | 'txt' | 'pdf') => {
    const assumptionsText = frame.assumptions
      .map(assumption => `${assumption.title} | Metric: ${assumption.metricKey} | Target: ${assumption.targetLabel}`)
      .join('\n')
    const metricsText = frame.metrics
      .map(metric => `${metric.name} | Formula: ${metric.formula} | Target: ${metric.targetLabel} | Pass: ${metric.passThresholdLabel}`)
      .join('\n')
    const report = `MOOVE TRL-4 Evidence Report\nGenerated: ${new Date().toLocaleString()}\nParticipants: ${data.n}\nOUS: ${data.composite.toFixed(2)}/5\nRecommendation: ${data.recommendation}%\n\nAssumptions\n${assumptionsText}\n\nMetrics\n${metricsText}`

    if (kind === 'pdf') {
      const opened = openFeedbackReport({
        generatedAt: new Date().toLocaleString(), config,
        assumptions: frame.assumptions.map(item => ({ title: item.title, description: item.description, targetLabel: item.targetLabel })),
        metrics: frame.metrics.map(item => ({ name: item.name, formula: item.formula, targetLabel: item.targetLabel, passThresholdLabel: item.passThresholdLabel })),
        rows, actions, iterations,
        overview: {
          satisfaction: data.rating, firstImpression: data.firstImpression, navigation: data.nav, learnability: data.learn,
          taskCompletion: data.taskCompletion, retention: data.retentionIntent, recommendation: data.recommendation, bugFree: data.bugFree,
        },
      })
      if (!opened) setNotice('Allow pop-ups to open the print-ready PDF report.')
    } else {
      const content = kind === 'csv'
        ? ['id,user,rating,navigation,learning,recommendation,timestamp', ...rows.map(row => [row.id, row.userId, row.overallRating, row.easeOfNavigation, row.easeOfLearning, row.wouldRecommend, row.submittedAt].map(value => JSON.stringify(value ?? '')).join(','))].join('\n')
        : report
      const anchor = document.createElement('a')
      anchor.href = URL.createObjectURL(new Blob([content], { type: kind === 'csv' ? 'text/csv' : 'text/plain' }))
      anchor.download = `moove-trl4.${kind}`
      anchor.click()
    }

    if (supabase) {
      await supabase.from('testing_report_exports').insert({
        report_type: kind,
        configuration_id: 'current',
        generated_by: (await supabase.auth.getUser()).data.user?.id,
        metadata: { participants: data.n },
      })
    }
  }

  const tabs: Tab[] = ['Setup', 'Overview', 'Validation Insights', 'Classification', 'Learning', 'Action Plan', 'Iterations', 'Export']
  const assumedLastUpdated = data.latestSubmissionAt || lastConfigUpdatedAt

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="font-display font-black text-2xl text-moove-brown">UNLEASH TRL 4 Testing Analysis</h1>
      <p className="text-sm text-moove-muted mb-4">Realtime Supabase evidence dashboard.</p>

      {notice && (
        <div className={`p-3 mb-3 rounded-xl text-sm ${saveState === 'error' ? 'bg-red-50 text-red-700' : saveState === 'success' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}>
          {notice}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto mb-5">
        {tabs.map(item => (
          <button key={item} onClick={() => setTab(item)} className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold ${tab === item ? 'bg-moove-orange text-white' : 'bg-white border border-moove-border'}`}>
            {item}
          </button>
        ))}
      </div>

      {tab === 'Setup' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl card-shadow">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <SectionHeader>UNLEASH Validation Framework Setup</SectionHeader>
                <p className="text-sm text-moove-muted">Configure assumptions and KPI definitions. Each assumption and KPI is saved to Supabase with versioned metadata.</p>
              </div>
              <button
                onClick={() => setFrame(current => ({ ...current, assumptions: cloneAssumptions(), metrics: cloneMetrics() }))}
                className="px-3 py-2 rounded-xl bg-white border border-moove-border text-sm font-semibold hover:border-moove-orange"
              >
                Reset to Predefined Framework
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {configFields.map(field => (
                <label key={field.key} className="text-xs font-semibold text-moove-muted">
                  {field.label}{field.required ? ' *' : ''}
                  <input
                    value={config[field.key]}
                    type={field.type ?? 'text'}
                    onChange={event => setConfig(current => ({ ...current, [field.key]: event.target.value }))}
                    className="mt-1 block w-full border border-moove-border rounded-xl p-2.5 text-sm text-moove-brown"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-moove-muted">
                Framework Version
                <input
                  value={frame.frameworkVersion}
                  onChange={event => setFrame(current => ({ ...current, frameworkVersion: event.target.value }))}
                  className="mt-1 block w-full border border-moove-border rounded-xl p-2.5 text-sm text-moove-brown"
                />
              </label>
              <label className="text-xs font-semibold text-moove-muted">
                Last Config Update
                <input value={formatDateTime(lastConfigUpdatedAt)} disabled className="mt-1 block w-full border border-moove-border rounded-xl p-2.5 text-sm text-moove-muted bg-gray-50" />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button onClick={save} disabled={saveState === 'saving'} className="px-4 py-2 rounded-2xl bg-moove-orange text-white text-sm font-bold disabled:opacity-70">
                {saveState === 'saving' ? 'Saving Configuration...' : 'Save Testing Configuration'}
              </button>
              <div className="text-xs text-moove-muted">UPSERT mode enabled: saves update the existing record instead of creating duplicates.</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl card-shadow">
            <div className="flex items-center justify-between gap-3 mb-3">
              <SectionHeader>Validation Assumptions</SectionHeader>
              <div className="text-xs text-moove-muted">1 card per assumption</div>
            </div>
            <div className="grid xl:grid-cols-2 gap-4">
              {assumptionCards.map((assumption, index) => {
                const headerColor = CARD_HEADER_COLORS[index % CARD_HEADER_COLORS.length]
                const expanded = expandedAssumptions[assumption.id] ?? true
                return (
                  <div key={assumption.id} className="rounded-2xl border border-moove-border bg-white card-shadow hover-lift">
                    <div className="rounded-t-2xl px-4 py-3 text-white" style={{ background: headerColor }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">{assumption.icon}</span>
                          <div className="text-sm font-black truncate">Assumption {index + 1}</div>
                        </div>
                        <div className={`text-[11px] font-black px-2 py-1 rounded-full ${statusClasses(assumption.status)}`}>{assumption.status}</div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <input
                          value={assumption.title}
                          onChange={event => updateAssumption(assumption.id, { title: event.target.value })}
                          className="w-full font-semibold text-sm text-moove-brown border-b border-moove-border pb-1"
                        />
                        <button
                          onClick={() => setExpandedAssumptions(current => ({ ...current, [assumption.id]: !expanded }))}
                          className="text-xs font-bold text-moove-muted shrink-0"
                        >
                          {expanded ? 'Collapse' : 'Expand'}
                        </button>
                      </div>

                      <div className="text-xs text-moove-muted mb-3">Current: {formatMetricValue(assumption.currentValue, assumption.targetType, data.n)} | Target: {assumption.targetLabel}</div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${assumption.completion}%`, background: headerColor }} />
                      </div>
                      <div className="text-[11px] text-moove-muted mb-2">{assumption.completion}% of target achieved</div>

                      {expanded && (
                        <div className="space-y-2">
                          <textarea
                            value={assumption.description}
                            onChange={event => updateAssumption(assumption.id, { description: event.target.value })}
                            className="w-full border border-moove-border rounded-xl p-2.5 text-sm"
                            rows={2}
                          />
                          <div className="grid sm:grid-cols-2 gap-2">
                            <label className="text-xs text-moove-muted">
                              Linked metric
                              <select
                                value={assumption.metricKey}
                                onChange={event => updateAssumption(assumption.id, { metricKey: event.target.value as MetricKey })}
                                className="mt-1 w-full border border-moove-border rounded-xl p-2 text-sm"
                              >
                                {frame.metrics.map(metric => (
                                  <option key={metric.id} value={metric.key}>{metric.name}</option>
                                ))}
                              </select>
                            </label>
                            <label className="text-xs text-moove-muted">
                              Target value
                              <input
                                type="number"
                                step={assumption.targetType === 'rating' ? '0.1' : '1'}
                                value={assumption.targetValue}
                                onChange={event => updateAssumption(assumption.id, { targetValue: toNumber(event.target.value, assumption.targetValue) })}
                                className="mt-1 w-full border border-moove-border rounded-xl p-2 text-sm"
                              />
                            </label>
                          </div>
                          <input
                            value={assumption.targetLabel}
                            onChange={event => updateAssumption(assumption.id, { targetLabel: event.target.value })}
                            className="w-full border border-moove-border rounded-xl p-2.5 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl card-shadow">
            <div className="flex items-center justify-between gap-3 mb-3">
              <SectionHeader>Predefined Evaluation Metrics And KPI</SectionHeader>
              <div className="text-xs text-moove-muted">1 card per KPI definition</div>
            </div>
            <div className="grid xl:grid-cols-2 gap-4">
              {metricCards.map((metric, index) => {
                const headerColor = CARD_HEADER_COLORS[index % CARD_HEADER_COLORS.length]
                const expanded = expandedMetrics[metric.id] ?? true
                return (
                  <div key={metric.id} className="rounded-2xl border border-moove-border bg-white card-shadow hover-lift">
                    <div className="rounded-t-2xl px-4 py-3 text-white" style={{ background: headerColor }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">{metric.icon}</span>
                          <div className="text-sm font-black truncate">{metric.name}</div>
                        </div>
                        <div className={`text-[11px] font-black px-2 py-1 rounded-full ${statusClasses(metric.status)}`}>{metric.status}</div>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-xs text-moove-muted">Current Result: {formatMetricValue(metric.currentValue, metric.targetType, data.n)}</div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressTowardTarget(metric.currentValue, metric.targetValue)}%`, background: headerColor }} />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-moove-muted">Pass threshold: {metric.passThresholdLabel}</div>
                        <button
                          onClick={() => setExpandedMetrics(current => ({ ...current, [metric.id]: !expanded }))}
                          className="text-xs font-bold text-moove-muted"
                        >
                          {expanded ? 'Collapse' : 'Expand'}
                        </button>
                      </div>

                      {expanded && (
                        <div className="space-y-2">
                          <input value={metric.name} onChange={event => updateMetric(metric.id, { name: event.target.value })} className="w-full border border-moove-border rounded-xl p-2.5 text-sm font-semibold" />
                          <textarea value={metric.description} onChange={event => updateMetric(metric.id, { description: event.target.value })} rows={2} className="w-full border border-moove-border rounded-xl p-2.5 text-sm" />
                          <textarea value={metric.formula} onChange={event => updateMetric(metric.id, { formula: event.target.value })} rows={2} className="w-full border border-moove-border rounded-xl p-2.5 text-sm" />
                          <div className="grid sm:grid-cols-2 gap-2">
                            <input value={metric.targetLabel} onChange={event => updateMetric(metric.id, { targetLabel: event.target.value })} className="w-full border border-moove-border rounded-xl p-2 text-sm" />
                            <input value={metric.passThresholdLabel} onChange={event => updateMetric(metric.id, { passThresholdLabel: event.target.value })} className="w-full border border-moove-border rounded-xl p-2 text-sm" />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-2">
                            <label className="text-xs text-moove-muted">
                              Target
                              <input
                                type="number"
                                step={metric.targetType === 'rating' ? '0.1' : '1'}
                                value={metric.targetValue}
                                onChange={event => updateMetric(metric.id, { targetValue: toNumber(event.target.value, metric.targetValue) })}
                                className="mt-1 w-full border border-moove-border rounded-xl p-2 text-sm"
                              />
                            </label>
                            <label className="text-xs text-moove-muted">
                              Pass threshold
                              <input
                                type="number"
                                step={metric.targetType === 'rating' ? '0.1' : '1'}
                                value={metric.passThreshold}
                                onChange={event => updateMetric(metric.id, { passThreshold: toNumber(event.target.value, metric.passThreshold) })}
                                className="mt-1 w-full border border-moove-border rounded-xl p-2 text-sm"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'Overview' && (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-28 bg-white rounded-2xl card-shadow animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={'👥'} label={'Participants'} value={String(data.n)} color={'#F97316'} />
              <StatCard icon={'⭐'} label={'Overall Satisfaction'} value={formatMetricValue(data.rating, 'rating', data.n)} color={'#FBBF24'} />
              <StatCard icon={'📊'} label={'OUS Composite'} value={formatMetricValue(data.composite, 'rating', data.n)} color={'#22C55E'} sub={'Overall User Satisfaction'} />
              <StatCard icon={'📣'} label={'Recommendation'} value={formatMetricValue(data.recommendation, 'percent', data.n)} color={'#0EA5E9'} />
              <StatCard icon={'✅'} label={'Task Completion'} value={formatMetricValue(data.taskCompletion, 'percent', data.n)} color={'#22C55E'} />
              <StatCard icon={'🔁'} label={'Would Use Again'} value={formatMetricValue(data.retentionIntent, 'percent', data.n)} color={'#A855F7'} />
              <StatCard icon={'🎯'} label={'User Success'} value={formatMetricValue(data.userSuccess, 'percent', data.n)} color={'#F97316'} />
              <StatCard icon={'🐞'} label={'Bug-Free Rate'} value={formatMetricValue(data.bugFree, 'percent', data.n)} color={'#EF4444'} />
            </div>
          )}

          <div className="bg-white p-5 rounded-2xl card-shadow mt-5">
            <SectionHeader>Assumption Validation Status</SectionHeader>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {assumptionCards.map((assumption, index) => {
                const cardColor = CARD_HEADER_COLORS[index % CARD_HEADER_COLORS.length]
                return (
                  <div key={assumption.id} className="rounded-2xl border border-moove-border p-4 bg-moove-cream/30">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="text-sm font-bold text-moove-brown flex items-center gap-2"><span>{assumption.icon}</span><span>{assumption.metricName}</span></div>
                      <div className={`text-[11px] font-black px-2 py-1 rounded-full ${statusClasses(assumption.status)}`}>{assumption.status}</div>
                    </div>
                    <div className="text-xs font-semibold text-moove-brown mb-1">{assumption.title}</div>
                    <div className="text-[11px] text-moove-muted mb-2">{assumption.description}</div>
                    <div className="text-[11px] text-moove-muted">Target: {assumption.targetLabel}</div>
                    <div className="text-[11px] text-moove-muted mb-2">Current: {formatMetricValue(assumption.currentValue, assumption.targetType, data.n)}</div>
                    <div className="h-2 bg-white rounded-full overflow-hidden mb-1">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${assumption.completion}%`, background: cardColor }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-moove-muted">
                      <span>{assumption.completion}% completion</span>
                      <span>Updated: {formatDateTime(assumedLastUpdated)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mt-5">
            <div>
              <div className="bg-white p-5 rounded-2xl card-shadow">
                <h2 className="font-bold mb-3">Validation Scorecard</h2>
                <div className="space-y-3">
                  {metricCards.map(metric => (
                    <div key={metric.id} className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-moove-brown">{metric.name}</div>
                        <div className="text-xs text-moove-muted">{formatMetricValue(metric.currentValue, metric.targetType, data.n)} | Target {metric.targetLabel}</div>
                      </div>
                      <div className={`text-xs font-black px-2 py-1 rounded-full ${statusClasses(metric.status)}`}>{metric.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <RatingBreakdown rows={rows} values={{ rating: data.rating, firstImpression: data.firstImpression, nav: data.nav, learn: data.learn, ous: data.composite }} />
            </div>
          </div>

          <div className="mt-4 bg-white p-5 rounded-2xl card-shadow">
            <div className="flex items-center justify-between gap-2 mb-3">
              <SectionHeader>Intent And Completion KPI</SectionHeader>
              <div className="text-xs text-moove-muted">Research-aligned participant intent summary</div>
            </div>
            <UserIntent data={{ reuse: data.retentionIntent, recommend: data.recommendation, task: data.taskCompletion }} />
          </div>
        </div>
      )}

      {tab === 'Validation Insights' && <Insights rows={rows} />}
      {tab === 'Classification' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <h2 className="font-bold text-lg text-moove-brown">Validation Insights by Classification Lens</h2>
            <p className="text-sm text-moove-muted mt-1">Evidence-based research findings organized by Desirability, Feasibility, and Viability using participant responses and calculated evaluation metrics.</p>
          </div>
          <Classification rows={rows} metrics={classificationMetrics} totalResponses={data.n} lastUpdatedAt={formatDateTime(assumedLastUpdated)} />
        </div>
      )}
      {tab === 'Learning' && <LearningReflection rows={rows} participantCount={data.n} updatedAt={formatDateTime(assumedLastUpdated)} />}

      {tab === 'Action Plan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl card-shadow">
            <div>
              <h2 className="font-bold">Validation Action Plan</h2>
              <p className="text-sm text-moove-muted">{actions.filter(item => item.status === 'Done').length} of {actions.length} actions completed</p>
            </div>
            <button onClick={() => setActionDraft({ priority: 'Medium', status: 'Open', completion_percentage: 0, retest_required: false })} className="px-4 py-2 rounded-xl bg-moove-orange text-white text-sm font-bold">+ Add action</button>
          </div>

          {actionDraft && (
            <div className="bg-white p-5 rounded-2xl card-shadow grid md:grid-cols-2 gap-3">
              <input autoFocus placeholder="Action title" value={actionDraft.issue ?? ''} onChange={event => setActionDraft(draft => ({ ...draft!, issue: event.target.value, title: event.target.value }))} className="md:col-span-2 border rounded-xl p-3 text-sm" />
              <input placeholder="Category" value={actionDraft.category ?? ''} onChange={event => setActionDraft(draft => ({ ...draft!, category: event.target.value }))} className="border rounded-xl p-3 text-sm" />
              <input type="date" value={actionDraft.target_completion_date ?? ''} onChange={event => setActionDraft(draft => ({ ...draft!, target_completion_date: event.target.value }))} className="border rounded-xl p-3 text-sm" />
              <select value={actionDraft.priority ?? 'Medium'} onChange={event => setActionDraft(draft => ({ ...draft!, priority: event.target.value as Action['priority'] }))} className="border rounded-xl p-3 text-sm"><option>High</option><option>Medium</option><option>Low</option></select>
              <select value={actionDraft.status ?? 'Open'} onChange={event => setActionDraft(draft => ({ ...draft!, status: event.target.value as Action['status'] }))} className="border rounded-2xl p-3 text-sm"><option>Open</option><option>In Progress</option><option>Done</option></select>
              <textarea placeholder="Suggested solution" value={actionDraft.suggested_solution ?? ''} onChange={event => setActionDraft(draft => ({ ...draft!, suggested_solution: event.target.value }))} className="md:col-span-2 border rounded-xl p-3 text-sm" />
              <textarea placeholder="Reason" value={actionDraft.reason ?? ''} onChange={event => setActionDraft(draft => ({ ...draft!, reason: event.target.value }))} className="border rounded-xl p-3 text-sm" />
              <label className="text-sm">Completion: {actionDraft.completion_percentage ?? 0}%<input type="range" min="0" max="100" value={actionDraft.completion_percentage ?? 0} onChange={event => setActionDraft(draft => ({ ...draft!, completion_percentage: Number(event.target.value) }))} className="w-full accent-orange-500" /></label>
              <label className="text-sm flex gap-2 items-center"><input type="checkbox" checked={!!actionDraft.retest_required} onChange={event => setActionDraft(draft => ({ ...draft!, retest_required: event.target.checked }))} /> Retest required</label>
              <div className="flex gap-2 justify-end"><button onClick={() => setActionDraft(null)} className="px-3 py-2 text-sm">Cancel</button><button onClick={saveAction} className="px-4 py-2 rounded-xl bg-moove-orange text-white text-sm font-bold">Save action</button></div>
            </div>
          )}

          <div className="space-y-3">
            {actions.length === 0 ? <div className="bg-white rounded-2xl p-10 card-shadow text-center">No action items yet.</div> : actions.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 card-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: item.priority === 'High' ? '#EF4444' : item.priority === 'Medium' ? '#FBBF24' : '#22C55E' }}>{item.priority}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full border">{item.status}</span>
                  </div>
                  <div className="flex gap-2"><button onClick={() => setActionDraft(item)} className="text-moove-orange text-xs font-bold">Edit</button><button onClick={() => void archiveRecord('testing_action_plans', item.id)} className="text-red-400 text-xs hover:text-red-600">Archive</button></div>
                </div>
                <div className="text-sm font-semibold text-moove-brown mb-1">{item.issue}</div>
                {item.suggested_solution && <div className="text-xs text-moove-muted mb-2">→ {item.suggested_solution}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Iterations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl card-shadow">
            <div>
              <h2 className="font-bold">Prototype timeline</h2>
              <p className="text-sm text-moove-muted">Document each validation cycle and its evidence.</p>
            </div>
            <button onClick={() => setIterationDraft({ retesting_status: 'Pending', status: 'Planned', completion_percentage: 0 })} className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold">+ Add iteration</button>
          </div>

          {iterationDraft && (
            <div className="bg-white p-5 rounded-2xl card-shadow grid md:grid-cols-2 gap-3">
              <input autoFocus placeholder="Prototype version" value={iterationDraft.version ?? ''} onChange={event => setIterationDraft(draft => ({ ...draft!, version: event.target.value }))} className="border rounded-xl p-3 text-sm" />
              <input placeholder="Testing cycle" value={iterationDraft.testing_cycle ?? ''} onChange={event => setIterationDraft(draft => ({ ...draft!, testing_cycle: event.target.value }))} className="border rounded-xl p-3 text-sm" />
              <input type="number" placeholder="Iteration #" value={iterationDraft.iteration_number ?? ''} onChange={event => setIterationDraft(draft => ({ ...draft!, iteration_number: Number(event.target.value) }))} className="border rounded-xl p-3 text-sm" />
              <input placeholder="Phase" value={iterationDraft.phase ?? ''} onChange={event => setIterationDraft(draft => ({ ...draft!, phase: event.target.value }))} className="border rounded-xl p-3 text-sm" />
              <textarea placeholder="Improvements made" value={iterationDraft.improvements_made ?? ''} onChange={event => setIterationDraft(draft => ({ ...draft!, improvements_made: event.target.value }))} className="md:col-span-2 border rounded-2xl p-3 text-sm" />
              <select value={iterationDraft.retesting_status ?? 'Pending'} onChange={event => setIterationDraft(draft => ({ ...draft!, retesting_status: event.target.value as Iteration['retesting_status'] }))} className="border rounded-xl p-3 text-sm"><option>Pending</option><option>In Progress</option><option>Complete</option></select>
              <select value={iterationDraft.status ?? 'Planned'} onChange={event => setIterationDraft(draft => ({ ...draft!, status: event.target.value as Iteration['status'] }))} className="border rounded-xl p-3 text-sm"><option>Planned</option><option>In Progress</option><option>Complete</option></select>
              <div className="flex gap-2 justify-end"><button onClick={() => setIterationDraft(null)} className="px-3 py-2 text-sm">Cancel</button><button onClick={saveIteration} className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold">Save iteration</button></div>
            </div>
          )}

          <div className="space-y-3">
            {iterations.length === 0 ? <div className="bg-white rounded-2xl p-10 card-shadow text-center">No iterations logged yet.</div> : iterations.map((iteration, index) => (
              <div key={iteration.id} className="bg-white p-4 rounded-2xl card-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2"><span className="text-xs font-black text-moove-orange bg-orange-50 px-2 py-0.5 rounded-full">v{iteration.version}</span><span className="text-xs text-moove-muted">{iteration.testing_cycle}</span></div>
                  <div className="flex items-center gap-2"><span className="text-xs text-moove-muted">#{iteration.iteration_number ?? index + 1}</span><button onClick={() => setIterationDraft(iteration)} className="text-moove-orange text-xs font-bold">Edit</button><button onClick={() => void archiveRecord('testing_iterations', iteration.id)} className="text-red-400 text-xs hover:text-red-600">Archive</button></div>
                </div>
                {iteration.improvements_made && <div className="text-xs text-moove-brown bg-moove-cream rounded-xl p-2.5 leading-relaxed">{iteration.improvements_made}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Export' && <ExportTab count={data.n} onExport={exportFile} />}
    </div>
  )
}
