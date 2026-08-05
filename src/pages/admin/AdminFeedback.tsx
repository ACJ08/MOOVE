import { useState, useMemo } from 'react'
import type { FeedbackEntry } from '@/pages/driver/FeedbackValidation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assumption {
  id: string; text: string; metric: string; successCriteria: string
}
interface Metric {
  id: string; name: string; description: string; target: string; threshold: string
}
interface TestingConfig {
  sessionId: string; prototypeVersion: string; testingObjective: string
  userGroup: string; environment: string; startDate: string
  targetParticipants: number; successCriteria: string
  assumptions: Assumption[]; metrics: Metric[]; updatedAt: string
}
interface ActionItem {
  id: string; issue: string; priority: 'High' | 'Medium' | 'Low'
  suggestedSolution: string; status: 'Open' | 'In Progress' | 'Done'; retestRequired: boolean
}
interface Iteration {
  id: string; version: string; testingCycle: string; improvementsMade: string
  retestingStatus: 'Pending' | 'In Progress' | 'Complete'
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadFeedback(): FeedbackEntry[] {
  try { return JSON.parse(localStorage.getItem('moove_feedback_responses') || '[]') } catch { return [] }
}
function loadConfig(): TestingConfig {
  const defaults: TestingConfig = {
    sessionId: 'UNLEASH-2026', prototypeVersion: 'v0.49-TRL4',
    testingObjective: '', userGroup: '', environment: '', startDate: '',
    targetParticipants: 10, successCriteria: '',
    assumptions: [], metrics: [], updatedAt: '',
  }
  try { return { ...defaults, ...JSON.parse(localStorage.getItem('moove_testing_config') || '{}') } }
  catch { return defaults }
}
function saveConfig(cfg: TestingConfig) {
  try { localStorage.setItem('moove_testing_config', JSON.stringify({ ...cfg, updatedAt: new Date().toISOString() })) }
  catch { /* ignore */ }
}
function loadActions(): ActionItem[] {
  try { return JSON.parse(localStorage.getItem('moove_action_plan') || '[]') } catch { return [] }
}
function saveActions(items: ActionItem[]) {
  try { localStorage.setItem('moove_action_plan', JSON.stringify(items)) } catch { /* ignore */ }
}
function loadIterations(): Iteration[] {
  try { return JSON.parse(localStorage.getItem('moove_iterations') || '[]') } catch { return [] }
}
function saveIterations(items: Iteration[]) {
  try { localStorage.setItem('moove_iterations', JSON.stringify(items)) } catch { /* ignore */ }
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

function avg(arr: number[]) {
  const v = arr.filter(n => n > 0)
  return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : 0
}
function pct(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0
}
function mode(arr: string[]) {
  const freq: Record<string, number> = {}
  arr.forEach(s => s && (freq[s] = (freq[s] ?? 0) + 1))
  return Object.entries(freq).sort((a, b) => b[1] - a[1])
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = '#F97316' }: { icon: string; label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 card-shadow text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-display font-black text-2xl leading-tight" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] text-moove-muted mt-0.5">{sub}</div>}
      <div className="text-xs text-moove-muted mt-1">{label}</div>
    </div>
  )
}

function RatingBar({ label, value, max = 5, color = '#F97316' }: { label: string; value: number; max?: number; color?: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-semibold text-moove-brown">{label}</span>
        <span className="text-xs font-black" style={{ color }}>{value.toFixed(1)}/{max}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-black text-moove-muted tracking-widest mb-3 uppercase">{children}</div>
}

// ─── Predefined validation framework (derived from FeedbackValidation questions) ─

const PREDEFINED_ASSUMPTIONS: Omit<Assumption, 'id'>[] = [
  { text: 'Drivers can intuitively navigate MOOVE without prior training or documentation.', metric: 'Ease of Navigation Score', successCriteria: '≥ 4.0 / 5 average rating' },
  { text: 'The prototype creates a strong positive first impression on new users.', metric: 'First Impression Score', successCriteria: '≥ 4.0 / 5 average rating' },
  { text: 'Drivers can independently learn how to use all core features within one session.', metric: 'Ease of Learning Score', successCriteria: '≥ 4.0 / 5 average rating' },
  { text: 'Drivers can successfully accomplish their intended task using MOOVE without external assistance.', metric: 'Task Completion Rate', successCriteria: '≥ 80% respond "Yes"' },
  { text: 'Drivers are satisfied with their overall experience and would use MOOVE again.', metric: 'Retention Intent Rate', successCriteria: '≥ 75% respond "Yes"' },
  { text: 'Drivers would recommend MOOVE to other professional drivers.', metric: 'Recommendation Rate', successCriteria: '≥ 70% respond "Yes"' },
  { text: 'The prototype delivers a satisfactory overall user experience across all dimensions.', metric: 'Overall User Satisfaction (Composite)', successCriteria: '≥ 3.5 / 5 composite average' },
]

const PREDEFINED_METRICS: Omit<Metric, 'id'>[] = [
  { name: 'Overall Satisfaction Score', description: 'Average of Q1 — Overall Rating (1–5 stars)', target: '≥ 4.0 / 5', threshold: '≥ 3.5 / 5 (PASS)' },
  { name: 'First Impression Score', description: 'Average of Q2 — First Impression (1–5 stars)', target: '≥ 4.0 / 5', threshold: '≥ 3.5 / 5 (PASS)' },
  { name: 'Navigation Usability Score', description: 'Average of Q3 — Ease of Navigation (1–5 stars)', target: '≥ 4.0 / 5', threshold: '≥ 3.5 / 5 (PASS)' },
  { name: 'Learnability Score', description: 'Average of Q4 — Ease of Learning (1–5 stars)', target: '≥ 4.0 / 5', threshold: '≥ 3.5 / 5 (PASS)' },
  { name: 'Task Completion Rate', description: '% of users who answered "Yes" to Q5 — Accomplished Task', target: '≥ 80%', threshold: '≥ 70% (PASS)' },
  { name: 'User Success Rate', description: '% who answered "Yes" or "Partially" to Q5 — broader success', target: '≥ 85%', threshold: '≥ 75% (PASS)' },
  { name: 'Retention Intent Rate', description: '% who answered "Yes" to Q9 — Would Use Again', target: '≥ 75%', threshold: '≥ 60% (PASS)' },
  { name: 'Recommendation Rate', description: '% who answered "Yes" to Q10 — Would Recommend', target: '≥ 70%', threshold: '≥ 60% (PASS)' },
  { name: 'Overall User Satisfaction (Composite)', description: 'Weighted average of all four rating dimensions (Q1–Q4)', target: '≥ 4.0 / 5', threshold: '≥ 3.5 / 5 (PASS)' },
  { name: 'Bug-Free Rate', description: '% of submissions with no bug report entered', target: '≥ 80%', threshold: '≥ 70% (PASS)' },
]

// ─── Tab: Setup ───────────────────────────────────────────────────────────────

function SetupTab() {
  const [config, setConfig] = useState<TestingConfig>(loadConfig)
  const [saved, setSaved] = useState(false)
  const [showFramework, setShowFramework] = useState(false)

  const updateAssumption = (id: string, field: keyof Assumption, val: string) =>
    setConfig(c => ({ ...c, assumptions: c.assumptions.map(a => a.id === id ? { ...a, [field]: val } : a) }))
  const addAssumption = () =>
    setConfig(c => ({ ...c, assumptions: [...c.assumptions, { id: Date.now().toString(), text: '', metric: '', successCriteria: '' }] }))
  const removeAssumption = (id: string) =>
    setConfig(c => ({ ...c, assumptions: c.assumptions.filter(a => a.id !== id) }))

  const updateMetric = (id: string, field: keyof Metric, val: string) =>
    setConfig(c => ({ ...c, metrics: c.metrics.map(m => m.id === id ? { ...m, [field]: val } : m) }))
  const addMetric = () =>
    setConfig(c => ({ ...c, metrics: [...c.metrics, { id: Date.now().toString(), name: '', description: '', target: '', threshold: '' }] }))
  const removeMetric = (id: string) =>
    setConfig(c => ({ ...c, metrics: c.metrics.filter(m => m.id !== id) }))

  const loadPredefined = () => {
    setConfig(c => ({
      ...c,
      prototypeVersion: c.prototypeVersion || 'v0.49-TRL4',
      testingObjective: c.testingObjective || 'Validate the usability, desirability, and adoption intent of the MOOVE v0.49-TRL4 prototype with professional drivers during the UNLEASH Testing Phase.',
      successCriteria: c.successCriteria || 'Overall User Satisfaction Composite ≥ 3.5/5 AND Task Completion Rate ≥ 70% AND Recommendation Rate ≥ 60%',
      assumptions: PREDEFINED_ASSUMPTIONS.map((a, i) => ({ ...a, id: `pre_a_${i}` })),
      metrics: PREDEFINED_METRICS.map((m, i) => ({ ...m, id: `pre_m_${i}` })),
    }))
  }

  const handleSave = () => {
    saveConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-moove-brown focus:outline-none focus:border-moove-orange"

  return (
    <div className="space-y-5">

      {/* Predefined framework banner */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black text-moove-orange tracking-widest mb-1">UNLEASH VALIDATION FRAMEWORK</div>
            <p className="text-xs text-moove-brown">
              Load the predefined assumptions and metrics derived directly from the Feedback survey questions (Overall Rating, First Impression, Ease of Navigation, Ease of Learning, Task Completion, Retention Intent, Recommendation Rate).
            </p>
          </div>
          <button onClick={() => setShowFramework(v => !v)}
            className="shrink-0 text-xs font-bold text-moove-orange border border-moove-orange px-3 py-1.5 rounded-xl hover:bg-orange-100 whitespace-nowrap">
            {showFramework ? 'Hide' : 'View Framework'}
          </button>
        </div>

        {showFramework && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-black text-moove-muted tracking-widest mb-2">RATING INTERPRETATION</div>
            {[
              { range: '4.5 – 5.0', label: 'Excellent', color: '#22C55E' },
              { range: '4.0 – 4.4', label: 'Good — meets target', color: '#84CC16' },
              { range: '3.5 – 3.9', label: 'Acceptable — meets threshold', color: '#FBBF24' },
              { range: '3.0 – 3.4', label: 'Below threshold — needs improvement', color: '#F97316' },
              { range: '< 3.0',     label: 'Fail — significant issues', color: '#EF4444' },
            ].map(r => (
              <div key={r.range} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
                <span className="text-xs font-bold text-moove-brown w-24 shrink-0">{r.range}</span>
                <span className="text-xs text-moove-muted">{r.label}</span>
              </div>
            ))}

            <div className="text-xs font-black text-moove-muted tracking-widest mt-3 mb-2">OVERALL USER SATISFACTION FORMULA</div>
            <div className="bg-white rounded-xl p-3 text-xs text-moove-brown font-mono border border-orange-100">
              OUS = (OverallRating + FirstImpression + EaseOfNavigation + EaseOfLearning) ÷ 4<br />
              <span className="text-moove-muted">Pass: OUS ≥ 3.5 &nbsp;|&nbsp; Target: OUS ≥ 4.0 &nbsp;|&nbsp; Excellent: OUS ≥ 4.5</span>
            </div>

            <button onClick={loadPredefined}
              className="w-full mt-3 py-2.5 rounded-xl bg-moove-orange text-white text-xs font-bold hover:opacity-90 transition-all">
              ✓ Load All Predefined Assumptions & Metrics
            </button>
          </div>
        )}
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <SectionHeader>Testing Session Configuration</SectionHeader>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { key: 'sessionId' as const, label: 'Session ID' },
            { key: 'prototypeVersion' as const, label: 'Prototype Version' },
            { key: 'userGroup' as const, label: 'User Group' },
            { key: 'environment' as const, label: 'Testing Environment' },
            { key: 'startDate' as const, label: 'Start Date', type: 'date' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-moove-brown mb-1 block">{f.label}</label>
              <input type={f.type ?? 'text'} value={config[f.key] as string}
                onChange={e => setConfig(c => ({ ...c, [f.key]: e.target.value }))}
                className={inputCls} />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-moove-brown mb-1 block">Target Participants</label>
            <input type="number" min={1} value={config.targetParticipants}
              onChange={e => setConfig(c => ({ ...c, targetParticipants: Number(e.target.value) }))}
              className={inputCls} />
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs font-semibold text-moove-brown mb-1 block">Testing Objective</label>
          <textarea rows={2} value={config.testingObjective}
            onChange={e => setConfig(c => ({ ...c, testingObjective: e.target.value }))}
            placeholder="What are you trying to validate in this testing cycle?"
            className={`${inputCls} resize-none`} />
        </div>
        <div className="mt-3">
          <label className="text-xs font-semibold text-moove-brown mb-1 block">Overall Success Criteria</label>
          <textarea rows={2} value={config.successCriteria}
            onChange={e => setConfig(c => ({ ...c, successCriteria: e.target.value }))}
            placeholder="e.g. ≥ 80% task completion, ≥ 4/5 ease of use rating"
            className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* Assumptions */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex justify-between items-center mb-3">
          <SectionHeader>Validation Assumptions</SectionHeader>
          <button onClick={addAssumption} className="text-xs font-bold text-moove-orange border border-moove-orange px-3 py-1 rounded-xl hover:bg-orange-50">+ Add</button>
        </div>
        {config.assumptions.length === 0 && (
          <p className="text-xs text-moove-muted py-4 text-center">No assumptions defined. Use "View Framework" above to load predefined assumptions.</p>
        )}
        <div className="space-y-4">
          {config.assumptions.map((a, i) => (
            <div key={a.id} className="border border-moove-border rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-moove-orange">Assumption {i + 1}</span>
                <button onClick={() => removeAssumption(a.id)} className="text-red-400 text-xs hover:text-red-600">✕ Remove</button>
              </div>
              <div className="space-y-2">
                <textarea rows={2} value={a.text} onChange={e => updateAssumption(a.id, 'text', e.target.value)}
                  placeholder="Assumption statement — e.g. Drivers can complete the fatigue workflow without assistance."
                  className={`${inputCls} resize-none`} />
                <input value={a.metric} onChange={e => updateAssumption(a.id, 'metric', e.target.value)}
                  placeholder="Linked metric — e.g. User Success Rate"
                  className={inputCls} />
                <input value={a.successCriteria} onChange={e => updateAssumption(a.id, 'successCriteria', e.target.value)}
                  placeholder="Success criteria — e.g. ≥ 90% positive responses"
                  className={inputCls} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex justify-between items-center mb-3">
          <SectionHeader>Predefined Evaluation Metrics & KPIs</SectionHeader>
          <button onClick={addMetric} className="text-xs font-bold text-moove-orange border border-moove-orange px-3 py-1 rounded-xl hover:bg-orange-50">+ Add</button>
        </div>
        {config.metrics.length === 0 && (
          <p className="text-xs text-moove-muted py-4 text-center">No metrics defined. Use "View Framework" above to load predefined metrics.</p>
        )}
        <div className="space-y-3">
          {config.metrics.map((m, i) => (
            <div key={m.id} className="border border-moove-border rounded-2xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-moove-orange">Metric {i + 1}</span>
                <button onClick={() => removeMetric(m.id)} className="text-red-400 text-xs hover:text-red-600">✕</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <input value={m.name} onChange={e => updateMetric(m.id, 'name', e.target.value)}
                  placeholder="Metric name" className={inputCls} />
                <input value={m.description} onChange={e => updateMetric(m.id, 'description', e.target.value)}
                  placeholder="Description" className={inputCls} />
                <input value={m.target} onChange={e => updateMetric(m.id, 'target', e.target.value)}
                  placeholder="Target value (e.g. 4/5)" className={inputCls} />
                <input value={m.threshold} onChange={e => updateMetric(m.id, 'threshold', e.target.value)}
                  placeholder="Success threshold (e.g. ≥ 80%)" className={inputCls} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave}
        className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
        style={{ background: saved ? '#22C55E' : 'linear-gradient(135deg,#F97316,#FBBF24)' }}>
        {saved ? '✓ Saved!' : 'Save Testing Configuration'}
      </button>
    </div>
  )
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: FeedbackEntry[] }) {
  const config = useMemo(loadConfig, [])
  const n = data.length
  const target = config.targetParticipants

  const avgRating    = avg(data.map(f => f.overallRating))
  const avgImpression= avg(data.map(f => f.firstImpression))
  const avgEaseNav   = avg(data.map(f => f.easeOfNavigation))
  const avgEaseLearn = avg(data.map(f => f.easeOfLearning))
  const ousScore     = n > 0 ? Math.round(((avgRating + avgImpression + avgEaseNav + avgEaseLearn) / 4) * 10) / 10 : 0
  const avgSat = ousScore
  const recRate      = pct(data.filter(f => f.wouldRecommend === 'yes').length, n)
  const successRate  = pct(data.filter(f => f.accomplishedTask === 'yes').length, n)
  const userSuccessRate = pct(data.filter(f => f.accomplishedTask === 'yes' || f.accomplishedTask === 'partially').length, n)
  const completionRate = pct(data.filter(f => f.completionStatus === 'completed').length, n || 1)
  const useAgainRate = pct(data.filter(f => f.wouldUseAgain === 'yes').length, n)
  const bugFreeRate  = pct(data.filter(f => !f.bugReport).length, n)

  // Pass/fail scorecard — thresholds from predefined framework
  const scorecard = [
    { label: 'Overall Satisfaction', value: avgRating,    unit: '/5', pass: avgRating >= 3.5,    target: '≥ 4.0', threshold: '≥ 3.5' },
    { label: 'First Impression',     value: avgImpression, unit: '/5', pass: avgImpression >= 3.5, target: '≥ 4.0', threshold: '≥ 3.5' },
    { label: 'Ease of Navigation',   value: avgEaseNav,   unit: '/5', pass: avgEaseNav >= 3.5,   target: '≥ 4.0', threshold: '≥ 3.5' },
    { label: 'Ease of Learning',     value: avgEaseLearn, unit: '/5', pass: avgEaseLearn >= 3.5, target: '≥ 4.0', threshold: '≥ 3.5' },
    { label: 'OUS Composite',        value: ousScore,     unit: '/5', pass: ousScore >= 3.5,     target: '≥ 4.0', threshold: '≥ 3.5' },
    { label: 'Task Completion',      value: successRate,  unit: '%',  pass: successRate >= 70,   target: '≥ 80%', threshold: '≥ 70%' },
    { label: 'Retention Intent',     value: useAgainRate, unit: '%',  pass: useAgainRate >= 60,  target: '≥ 75%', threshold: '≥ 60%' },
    { label: 'Recommendation Rate',  value: recRate,      unit: '%',  pass: recRate >= 60,       target: '≥ 70%', threshold: '≥ 60%' },
    { label: 'Bug-Free Rate',        value: bugFreeRate,  unit: '%',  pass: bugFreeRate >= 70,   target: '≥ 80%', threshold: '≥ 70%' },
  ]
  const passCount = n > 0 ? scorecard.filter(s => s.pass).length : 0

  if (n === 0) return (
    <div className="bg-white rounded-2xl p-12 card-shadow text-center">
      <div className="text-5xl mb-4">📋</div>
      <div className="font-display font-bold text-xl text-moove-brown mb-2">No Feedback Yet</div>
      <p className="text-sm text-moove-muted">Driver feedback will appear here once participants complete the survey.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Progress toward target */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex justify-between items-center mb-2">
          <SectionHeader>Participation Progress</SectionHeader>
          <span className="text-xs font-black text-moove-orange">{n} / {target} participants</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-moove-orange rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, pct(n, target))}%` }} />
        </div>
        <div className="text-xs text-moove-muted mt-1 text-right">{pct(n, target)}% of target reached</div>
      </div>

      {/* Executive summary */}
      <div>
        <SectionHeader>Executive Summary</SectionHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon="👥" label="Participants" value={String(n)} color="#F97316" />
          <StatCard icon="⭐" label="Avg Rating" value={`${avgRating}/5`} color="#FBBF24" />
          <StatCard icon="🧮" label="OUS Composite" value={`${ousScore}/5`} color="#22C55E" sub="Overall User Satisfaction" />
          <StatCard icon="📢" label="Recommend Rate" value={`${recRate}%`} color="#0EA5E9" />
          <StatCard icon="✅" label="Task Completion" value={`${successRate}%`} color="#22C55E" />
          <StatCard icon="🔄" label="Would Use Again" value={`${useAgainRate}%`} color="#A855F7" />
        </div>
      </div>

      {/* Validation Scorecard */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader>Validation Scorecard — Pass / Fail</SectionHeader>
          {n > 0 && (
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${passCount === scorecard.length ? 'bg-green-100 text-green-700' : passCount >= scorecard.length * 0.7 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
              {passCount}/{scorecard.length} PASSED
            </span>
          )}
        </div>
        <div className="space-y-2">
          {scorecard.map(s => {
            const display = s.unit === '/5' ? `${(s.value as number).toFixed(1)}${s.unit}` : `${s.value}${s.unit}`
            const color = n === 0 ? '#D1D5DB' : s.pass ? '#22C55E' : '#EF4444'
            const pctBar = s.unit === '/5' ? ((s.value as number) / 5) * 100 : Math.min(100, s.value as number)
            return (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <div className="text-xs text-moove-brown font-semibold w-40 shrink-0 truncate">{s.label}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${n > 0 ? pctBar : 0}%`, background: color }} />
                </div>
                <div className="text-xs font-black w-12 text-right" style={{ color }}>{n > 0 ? display : '—'}</div>
                <div className="text-[10px] text-moove-muted w-16 text-right shrink-0">{n > 0 ? (s.pass ? '✓ PASS' : '✗ FAIL') : s.threshold}</div>
              </div>
            )
          })}
        </div>
        {n > 0 && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-semibold text-center ${passCount === scorecard.length ? 'bg-green-50 text-green-700 border border-green-200' : passCount >= scorecard.length * 0.7 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {passCount === scorecard.length ? '🎉 All KPIs passed — prototype meets TRL 4 validation criteria.' : passCount >= Math.ceil(scorecard.length * 0.7) ? `⚠ ${passCount} of ${scorecard.length} KPIs passed — prototype partially meets criteria. Address failing metrics before next iteration.` : `❌ Only ${passCount} of ${scorecard.length} KPIs passed — significant improvements required before re-testing.`}
          </div>
        )}
      </div>

      {/* Rating breakdown */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <SectionHeader>Rating Breakdown</SectionHeader>
        <RatingBar label="Overall Rating" value={avgRating} color="#F97316" />
        <RatingBar label="First Impression" value={avgImpression} color="#FBBF24" />
        <RatingBar label="Ease of Navigation" value={avgEaseNav} color="#0EA5E9" />
        <RatingBar label="Ease of Learning" value={avgEaseLearn} color="#A855F7" />
        <RatingBar label="OUS Composite" value={ousScore} color="#22C55E" />
      </div>

      {/* Intent */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <SectionHeader>User Intent</SectionHeader>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Would Use Again', key: 'wouldUseAgain' as keyof FeedbackEntry, icon: '🔄', color: '#22C55E' },
            { label: 'Would Recommend', key: 'wouldRecommend' as keyof FeedbackEntry, icon: '📢', color: '#0EA5E9' },
            { label: 'Task Accomplished', key: 'accomplishedTask' as keyof FeedbackEntry, icon: '✅', color: '#A855F7' },
          ].map(s => {
            const yes = data.filter(f => f[s.key] === 'yes').length
            return (
              <div key={s.label} className="text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-display font-black text-xl" style={{ color: s.color }}>{yes}/{n}</div>
                <div className="text-xs text-moove-muted mb-1">{s.label}</div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct(yes, n)}%`, background: s.color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Config assumptions scorecard */}
      {config.assumptions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <SectionHeader>Assumption Validation Status</SectionHeader>
          <div className="space-y-3">
            {config.assumptions.map((a, i) => (
              <div key={a.id} className="border border-moove-border rounded-xl p-3">
                <div className="text-xs font-bold text-moove-orange mb-1">Assumption {i + 1}</div>
                <div className="text-sm text-moove-brown mb-1">{a.text || '—'}</div>
                <div className="flex gap-3 text-xs text-moove-muted">
                  <span>Metric: <strong>{a.metric || '—'}</strong></span>
                  <span>Target: <strong>{a.successCriteria || '—'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Insights ────────────────────────────────────────────────────────────

function InsightsTab({ data }: { data: FeedbackEntry[] }) {
  if (data.length === 0) return (
    <div className="bg-white rounded-2xl p-10 card-shadow text-center text-sm text-moove-muted">No feedback to analyze yet.</div>
  )

  const topUseful = mode(data.map(f => f.mostUsefulFeature))
  const topImprove = mode(data.map(f => f.needsImprovement))
  const topFeatureReq = mode(data.map(f => f.featureRequest).filter(Boolean))
  const confusingResponses = data.map(f => f.confusingPart).filter(Boolean)
  const positiveComments = data.map(f => f.additionalComments).filter(Boolean)
  const bugs = data.map(f => f.bugReport).filter(Boolean)

  const InsightCard = ({ emoji, title, color, children }: { emoji: string; title: string; color: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl p-5 card-shadow">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{emoji}</span>
        <div className="text-xs font-black tracking-widest" style={{ color }}>{title}</div>
      </div>
      {children}
    </div>
  )

  return (
    <div className="space-y-4">
      <InsightCard emoji="🏆" title="HIGHEST-RATED FEATURE" color="#22C55E">
        {topUseful.length === 0 ? <p className="text-sm text-moove-muted">No data yet.</p> : (
          <div className="space-y-2">
            {topUseful.slice(0, 3).map(([feature, count]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-moove-brown">{feature}</span>
                <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{count} votes</span>
              </div>
            ))}
          </div>
        )}
      </InsightCard>

      <InsightCard emoji="🔧" title="MOST NEEDS IMPROVEMENT" color="#F97316">
        {topImprove.length === 0 ? <p className="text-sm text-moove-muted">No data yet.</p> : (
          <div className="space-y-2">
            {topImprove.slice(0, 3).map(([feature, count]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-moove-brown">{feature}</span>
                <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{count} mentions</span>
              </div>
            ))}
          </div>
        )}
      </InsightCard>

      <InsightCard emoji="💡" title="MOST REQUESTED FEATURE" color="#A855F7">
        {topFeatureReq.length === 0 ? <p className="text-sm text-moove-muted">No feature requests yet.</p> : (
          <div className="space-y-2">
            {topFeatureReq.slice(0, 3).map(([req, count]) => (
              <div key={req} className="flex items-start gap-3">
                <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full shrink-0">{count}×</span>
                <span className="text-sm text-moove-brown">{req}</span>
              </div>
            ))}
          </div>
        )}
      </InsightCard>

      <InsightCard emoji="😵" title="MOST CONFUSING WORKFLOWS" color="#EF4444">
        {confusingResponses.length === 0 ? <p className="text-sm text-moove-muted">No confusion reported.</p> : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {confusingResponses.slice(0, 5).map((text, i) => (
              <div key={i} className="text-xs text-moove-brown bg-red-50 rounded-xl p-2 border border-red-100">{text}</div>
            ))}
          </div>
        )}
      </InsightCard>

      <InsightCard emoji="👍" title="POSITIVE FEEDBACK HIGHLIGHTS" color="#22C55E">
        {positiveComments.length === 0 ? <p className="text-sm text-moove-muted">No comments yet.</p> : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {positiveComments.slice(0, 5).map((text, i) => (
              <div key={i} className="text-xs text-moove-brown bg-green-50 rounded-xl p-2 border border-green-100">"{text}"</div>
            ))}
          </div>
        )}
      </InsightCard>

      {bugs.length > 0 && (
        <InsightCard emoji="🐛" title="BUG REPORTS" color="#EF4444">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {bugs.map((text, i) => (
              <div key={i} className="text-xs text-red-700 bg-red-50 rounded-xl p-2 border border-red-100">{text}</div>
            ))}
          </div>
        </InsightCard>
      )}
    </div>
  )
}

// ─── Tab: Classification ──────────────────────────────────────────────────────

const DESIRABILITY = ['User Satisfaction', 'Ease of Use', 'Interface Design', 'User Experience', 'Visual Appeal']
const FEASIBILITY = ['Bugs', 'Technical Issues', 'Performance', 'Missing Features', 'Reliability']
const VIABILITY = ['Long-term Usage', 'Adoption Potential', 'Sustainability', 'Deployment Readiness', 'Maintenance']

function ClassificationTab({ data }: { data: FeedbackEntry[] }) {
  const computeScore = (type: 'desirability' | 'feasibility' | 'viability') => {
    if (!data.length) return 0
    if (type === 'desirability') return avg(data.map(f => (f.overallRating + f.firstImpression + f.easeOfNavigation) / 3))
    if (type === 'feasibility') return avg(data.map(f => {
      const bugs = f.bugReport ? 2 : 5
      return (f.easeOfLearning + f.easeOfNavigation + bugs) / 3
    }))
    if (type === 'viability') return avg(data.map(f => {
      const rec = f.wouldRecommend === 'yes' ? 5 : f.wouldRecommend === 'maybe' ? 3 : 1
      const use = f.wouldUseAgain === 'yes' ? 5 : f.wouldUseAgain === 'maybe' ? 3 : 1
      return (rec + use) / 2
    }))
    return 0
  }

  const categories = [
    { key: 'desirability' as const, label: 'Desirability', icon: '❤️', color: '#F97316', subcategories: DESIRABILITY, score: computeScore('desirability') },
    { key: 'feasibility' as const, label: 'Feasibility', icon: '⚙️', color: '#0EA5E9', subcategories: FEASIBILITY, score: computeScore('feasibility') },
    { key: 'viability' as const, label: 'Viability', icon: '📈', color: '#22C55E', subcategories: VIABILITY, score: computeScore('viability') },
  ]

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat.key} className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{cat.icon}</span>
              <div className="text-xs font-black tracking-widest" style={{ color: cat.color }}>{cat.label.toUpperCase()}</div>
            </div>
            {data.length > 0 && (
              <div className="text-sm font-black" style={{ color: cat.color }}>{cat.score.toFixed(1)}/5</div>
            )}
          </div>
          {data.length > 0 && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(cat.score / 5) * 100}%`, background: cat.color }} />
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {cat.subcategories.map(sub => (
              <span key={sub} className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                style={{ color: cat.color, borderColor: `${cat.color}40`, background: `${cat.color}10` }}>
                {sub}
              </span>
            ))}
          </div>
          {data.length === 0 && (
            <p className="text-xs text-moove-muted mt-3">Scores will appear once feedback is collected.</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Tab: Action Plan ─────────────────────────────────────────────────────────

function ActionPlanTab() {
  const [items, setItems] = useState<ActionItem[]>(loadActions)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<ActionItem, 'id'>>({
    issue: '', priority: 'High', suggestedSolution: '', status: 'Open', retestRequired: false,
  })

  const save = (updated: ActionItem[]) => { setItems(updated); saveActions(updated) }
  const addItem = () => {
    if (!form.issue.trim()) return
    save([...items, { ...form, id: Date.now().toString() }])
    setForm({ issue: '', priority: 'High', suggestedSolution: '', status: 'Open', retestRequired: false })
    setShowForm(false)
  }
  const updateStatus = (id: string, status: ActionItem['status']) =>
    save(items.map(i => i.id === id ? { ...i, status } : i))
  const remove = (id: string) => save(items.filter(i => i.id !== id))

  const priorityColor = { High: '#EF4444', Medium: '#FBBF24', Low: '#22C55E' }
  const statusColor = { Open: '#F97316', 'In Progress': '#0EA5E9', Done: '#22C55E' }
  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-moove-brown focus:outline-none focus:border-moove-orange"

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-moove-muted">{items.length} action{items.length !== 1 ? 's' : ''} tracked</span>
        <button onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-xl bg-moove-orange text-white text-xs font-bold">
          + Add Action
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 card-shadow space-y-3">
          <SectionHeader>New Action Item</SectionHeader>
          <textarea rows={2} value={form.issue} onChange={e => setForm(f => ({ ...f, issue: e.target.value }))}
            placeholder="Issue description..." className={`${inputCls} resize-none`} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-moove-brown mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as ActionItem['priority'] }))} className={inputCls}>
                {(['High', 'Medium', 'Low'] as const).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-moove-brown mb-1 block">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ActionItem['status'] }))} className={inputCls}>
                {(['Open', 'In Progress', 'Done'] as const).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <textarea rows={2} value={form.suggestedSolution} onChange={e => setForm(f => ({ ...f, suggestedSolution: e.target.value }))}
            placeholder="Suggested solution..." className={`${inputCls} resize-none`} />
          <label className="flex items-center gap-2 text-sm text-moove-brown cursor-pointer">
            <input type="checkbox" checked={form.retestRequired}
              onChange={e => setForm(f => ({ ...f, retestRequired: e.target.checked }))}
              className="w-4 h-4 accent-orange-500" />
            Retest Required
          </label>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-moove-muted">Cancel</button>
            <button onClick={addItem} className="flex-1 py-2 rounded-xl bg-moove-orange text-white text-sm font-bold">Add</button>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl p-10 card-shadow text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm text-moove-muted">No action items yet. Add issues identified from feedback analysis.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-4 card-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: priorityColor[item.priority] }}>{item.priority}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full border" style={{ color: statusColor[item.status], borderColor: `${statusColor[item.status]}40`, background: `${statusColor[item.status]}10` }}>{item.status}</span>
                  {item.retestRequired && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">Retest</span>}
                </div>
                <button onClick={() => remove(item.id)} className="text-red-400 text-xs hover:text-red-600">✕</button>
              </div>
              <div className="text-sm font-semibold text-moove-brown mb-1">{item.issue}</div>
              {item.suggestedSolution && <div className="text-xs text-moove-muted mb-2">→ {item.suggestedSolution}</div>}
              <div className="flex gap-1.5">
                {(['Open', 'In Progress', 'Done'] as const).map(s => (
                  <button key={s} onClick={() => updateStatus(item.id, s)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all ${item.status === s ? 'text-white border-transparent' : 'border-gray-200 text-moove-muted hover:border-moove-orange'}`}
                    style={item.status === s ? { background: statusColor[s] } : undefined}>{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab: Iterations ──────────────────────────────────────────────────────────

function IterationsTab() {
  const [items, setItems] = useState<Iteration[]>(loadIterations)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<Iteration, 'id'>>({
    version: '', testingCycle: '', improvementsMade: '', retestingStatus: 'Pending',
  })

  const save = (updated: Iteration[]) => { setItems(updated); saveIterations(updated) }
  const addItem = () => {
    if (!form.version.trim()) return
    save([...items, { ...form, id: Date.now().toString() }])
    setForm({ version: '', testingCycle: '', improvementsMade: '', retestingStatus: 'Pending' })
    setShowForm(false)
  }
  const remove = (id: string) => save(items.filter(i => i.id !== id))
  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-moove-brown focus:outline-none focus:border-moove-orange"
  const statusColor = { Pending: '#FBBF24', 'In Progress': '#0EA5E9', Complete: '#22C55E' }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-moove-muted">{items.length} iteration{items.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-xl bg-moove-orange text-white text-xs font-bold">
          + Add Iteration
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 card-shadow space-y-3">
          <SectionHeader>New Prototype Iteration</SectionHeader>
          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-moove-brown mb-1 block">Prototype Version</label>
              <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="e.g. v1.1.0-TRL4" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-moove-brown mb-1 block">Testing Cycle</label>
              <input value={form.testingCycle} onChange={e => setForm(f => ({ ...f, testingCycle: e.target.value }))} placeholder="e.g. UNLEASH Round 2" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-moove-brown mb-1 block">Improvements Made</label>
            <textarea rows={3} value={form.improvementsMade} onChange={e => setForm(f => ({ ...f, improvementsMade: e.target.value }))}
              placeholder="List the changes and improvements applied in this iteration..."
              className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className="text-xs font-semibold text-moove-brown mb-1 block">Retesting Status</label>
            <select value={form.retestingStatus} onChange={e => setForm(f => ({ ...f, retestingStatus: e.target.value as Iteration['retestingStatus'] }))} className={inputCls}>
              {(['Pending', 'In Progress', 'Complete'] as const).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-moove-muted">Cancel</button>
            <button onClick={addItem} className="flex-1 py-2 rounded-xl bg-moove-orange text-white text-sm font-bold">Add</button>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl p-10 card-shadow text-center">
          <div className="text-4xl mb-3">🔄</div>
          <p className="text-sm text-moove-muted">No iterations logged yet. Track each prototype version and testing cycle here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 card-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-moove-orange bg-orange-50 px-2 py-0.5 rounded-full">v{item.version}</span>
                  <span className="text-xs text-moove-muted">{item.testingCycle}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
                    style={{ color: statusColor[item.retestingStatus], borderColor: `${statusColor[item.retestingStatus]}40`, background: `${statusColor[item.retestingStatus]}10` }}>
                    {item.retestingStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-moove-muted">#{idx + 1}</span>
                  <button onClick={() => remove(item.id)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                </div>
              </div>
              {item.improvementsMade && (
                <div className="text-xs text-moove-brown bg-moove-cream rounded-xl p-2.5 leading-relaxed">{item.improvementsMade}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab: Export ──────────────────────────────────────────────────────────────

function ExportTab({ data }: { data: FeedbackEntry[] }) {
  const config = useMemo(loadConfig, [])
  const actions = useMemo(loadActions, [])
  const n = data.length

  const exportCSV = () => {
    const headers = [
      'ID', 'Driver ID', 'Testing Session', 'Date', 'Time', 'Device', 'Browser', 'App Version',
      'Overall Rating', 'First Impression', 'Ease of Navigation', 'Ease of Learning',
      'Accomplished Task', 'Most Useful Feature', 'Needs Improvement', 'Confusing Part',
      'Bug Report', 'Would Use Again', 'Would Recommend', 'Additional Comments',
      'Feature Request', 'Submitted At',
    ]
    const rows = data.map(f => [
      f.id, f.driverId, f.testingSessionId, f.date, f.time, f.device, f.browser, f.appVersion,
      f.overallRating, f.firstImpression, f.easeOfNavigation, f.easeOfLearning,
      f.accomplishedTask, f.mostUsefulFeature, f.needsImprovement, f.confusingPart,
      f.bugReport, f.wouldUseAgain, f.wouldRecommend, f.additionalComments,
      f.featureRequest, f.submittedAt,
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `moove_unleash_feedback_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const exportReport = () => {
    const avgRating = n > 0 ? (data.reduce((s, f) => s + f.overallRating, 0) / n).toFixed(1) : '—'
    const recRate = n > 0 ? `${Math.round((data.filter(f => f.wouldRecommend === 'yes').length / n) * 100)}%` : '—'
    const successRate = n > 0 ? `${Math.round((data.filter(f => f.accomplishedTask === 'yes').length / n) * 100)}%` : '—'
    const topFeature = mode(data.map(f => f.mostUsefulFeature))[0]?.[0] ?? '—'
    const topImprove = mode(data.map(f => f.needsImprovement))[0]?.[0] ?? '—'

    const text = `MOOVE PROTOTYPE — UNLEASH TESTING REPORT
TRL 4 Evidence Document
Generated: ${new Date().toLocaleString()}

═══════════════════════════════════════════════
TESTING CONFIGURATION
═══════════════════════════════════════════════
Testing Method:  ${data[0]?.testingMethod ?? 'User Feedback Survey (In-App Feedback Module)'}
Session ID:      ${config.sessionId}
Prototype:       ${config.prototypeVersion}
Objective:       ${config.testingObjective || '—'}
User Group:      ${config.userGroup || '—'}
Environment:     ${config.environment || '—'}
Start Date:      ${config.startDate || '—'}
Target Size:     ${config.targetParticipants} participants
Success Criteria:${config.successCriteria || '—'}

═══════════════════════════════════════════════
EXECUTIVE SUMMARY
═══════════════════════════════════════════════
Total Participants:    ${n}
Average Rating:        ${avgRating} / 5
Recommendation Rate:   ${recRate}
User Success Rate:     ${successRate}
Highest-Rated Feature: ${topFeature}
Most Flagged Feature:  ${topImprove}

═══════════════════════════════════════════════
ASSUMPTIONS
═══════════════════════════════════════════════
${config.assumptions.length === 0 ? '(No assumptions defined)' : config.assumptions.map((a, i) => `${i + 1}. ${a.text}\n   Metric: ${a.metric}\n   Success: ${a.successCriteria}`).join('\n\n')}

═══════════════════════════════════════════════
ACTION PLAN
═══════════════════════════════════════════════
${actions.length === 0 ? '(No action items)' : actions.map((a, i) => `${i + 1}. [${a.priority}] ${a.issue}\n   Solution: ${a.suggestedSolution}\n   Status: ${a.status} | Retest: ${a.retestRequired ? 'Yes' : 'No'}`).join('\n\n')}

═══════════════════════════════════════════════
END OF REPORT
═══════════════════════════════════════════════
`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `moove_trl4_report_${new Date().toISOString().slice(0, 10)}.txt`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <SectionHeader>Export Testing Evidence</SectionHeader>
        <p className="text-xs text-moove-muted mb-5">
          Download testing data suitable as evidence for <strong>UNLEASH Testing</strong> and <strong>TRL 4 documentation</strong>.
        </p>
        <div className="space-y-3">
          <button onClick={exportCSV} disabled={n === 0}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-moove-orange text-moove-orange hover:bg-orange-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="text-2xl">📊</span>
            <div className="text-left">
              <div className="font-bold text-sm">Export Feedback Data — CSV</div>
              <div className="text-xs opacity-70">{n} submission{n !== 1 ? 's' : ''} · all raw responses and metadata</div>
            </div>
          </button>
          <button onClick={exportReport}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-blue-300 text-blue-700 hover:bg-blue-50 transition-all">
            <span className="text-2xl">📄</span>
            <div className="text-left">
              <div className="font-bold text-sm">Export TRL 4 Evidence Report — TXT</div>
              <div className="text-xs opacity-70">Testing config · executive summary · assumptions · action plan</div>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 card-shadow">
        <SectionHeader>Report Includes</SectionHeader>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            'Testing Configuration', 'Participant Summary', 'Executive Summary',
            'Rating Breakdown', 'Recommendation Rate', 'User Success Rate',
            'Top Insights', 'Feature Analysis', 'Assumption Tracking',
            'Action Plan', 'Prototype Version', 'Testing Cycle',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-xs text-moove-brown">
              <span className="text-green-500 font-bold">✓</span> {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'setup', label: 'Setup', icon: '⚙️' },
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'insights', label: 'Insights', icon: '💡' },
  { id: 'classification', label: 'Classification', icon: '🗂️' },
  { id: 'actions', label: 'Action Plan', icon: '📋' },
  { id: 'iterations', label: 'Iterations', icon: '🔄' },
  { id: 'export', label: 'Export', icon: '↓' },
]

export default function AdminFeedback() {
  const allFeedback = useMemo(loadFeedback, [])
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="p-4 max-w-5xl mx-auto pb-8">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-black text-white bg-moove-orange px-2 py-0.5 rounded-full">UNLEASH</span>
          <span className="text-xs font-black text-white bg-blue-500 px-2 py-0.5 rounded-full">TRL 4</span>
          <h1 className="font-display font-black text-2xl text-moove-brown">Testing Analysis Dashboard</h1>
        </div>
        <p className="text-sm text-moove-muted">
          {allFeedback.length} feedback submission{allFeedback.length !== 1 ? 's' : ''} collected ·
          Testing Method: <span className="font-semibold text-moove-brown">User Feedback Survey</span>
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto mb-5 pb-1 scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border-2 transition-all ${
              activeTab === tab.id
                ? 'bg-moove-orange text-white border-moove-orange'
                : 'bg-white text-moove-muted border-gray-200 hover:border-moove-orange'
            }`}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'setup' && <SetupTab />}
      {activeTab === 'overview' && <OverviewTab data={allFeedback} />}
      {activeTab === 'insights' && <InsightsTab data={allFeedback} />}
      {activeTab === 'classification' && <ClassificationTab data={allFeedback} />}
      {activeTab === 'actions' && <ActionPlanTab />}
      {activeTab === 'iterations' && <IterationsTab />}
      {activeTab === 'export' && <ExportTab data={allFeedback} />}
    </div>
  )
}
