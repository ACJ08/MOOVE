import { useState, useEffect } from 'react'
import { fetchTestingConfig, saveTestingConfig, type TestingConfig } from '@/lib/db'

interface StudyConfig {
  participantQuota: number
  studyPhase: string
  dataRetentionDays: number
  sedentaryAlertThreshold: number
  breakReminderInterval: number
  exportAnonymized: boolean
}

const STORAGE_KEY = 'moove_admin_settings'

function loadConfig(): StudyConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultConfig(), ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaultConfig()
}

function defaultConfig(): StudyConfig {
  return {
    participantQuota: 30,
    studyPhase: 'alpha',
    dataRetentionDays: 90,
    sedentaryAlertThreshold: 45,
    breakReminderInterval: 60,
    exportAnonymized: true,
  }
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: () => void; label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-semibold text-moove-brown">{label}</div>
        {desc && <div className="text-xs text-moove-muted mt-0.5">{desc}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 shrink-0 ml-4 ${checked ? 'bg-purple-500' : 'bg-moove-border'}`}
      >
        <span className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

function NumInput({ label, value, onChange, min, max, unit }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-moove-brown mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-24 px-3 py-2 rounded-xl border border-moove-border text-sm text-moove-brown focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
        />
        {unit && <span className="text-xs text-moove-muted">{unit}</span>}
      </div>
    </div>
  )
}

const DEFAULT_TESTING: TestingConfig = {
  sessionId: 'UNLEASH-2026',
  prototypeVersion: 'v0.49-TRL4',
  userGroup: 'Alpha Testers',
  testingEnvironment: 'Controlled Lab',
  studyStartDate: '',
  targetParticipants: '30',
  testingObjective: 'Validate MOOVE TRL-4 prototype for driver preventive health engagement.',
  overallSuccessCriteria: '≥70% usability satisfaction, ≥3/5 average rating across all metrics.',
}

export default function AdminSettings() {
  const [config, setConfig] = useState<StudyConfig>(loadConfig)
  const [testing, setTesting] = useState<TestingConfig>(DEFAULT_TESTING)
  const [saved, setSaved] = useState(false)
  const [testingSaved, setTestingSaved] = useState(false)

  useEffect(() => {
    fetchTestingConfig().then(cfg => setTesting(cfg))
  }, [])

  const update = <K extends keyof StudyConfig>(key: K, val: StudyConfig[K]) =>
    setConfig(c => ({ ...c, [key]: val }))

  const updateTesting = <K extends keyof TestingConfig>(key: K, val: TestingConfig[K]) =>
    setTesting(c => ({ ...c, [key]: val }))

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSaveTesting = async () => {
    await saveTestingConfig(testing)
    setTestingSaved(true)
    setTimeout(() => setTestingSaved(false), 3000)
  }

  const handleReset = () => {
    const d = defaultConfig()
    setConfig(d)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
  }

  const clearTestData = () => {
    if (!confirm('Clear all test session data from localStorage? This cannot be undone.')) return
    localStorage.removeItem('moove_session_history')
    localStorage.removeItem('moove_feedback_responses')
    alert('Test data cleared.')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Settings</h1>
        <p className="text-sm text-moove-muted">Configure research parameters, notifications, and system preferences.</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          ✅ Settings saved successfully.
        </div>
      )}

      {/* Study Configuration */}
      <div className="bg-white rounded-2xl p-6 card-shadow mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl">🧪</div>
          <div>
            <div className="font-display font-bold text-moove-brown">Study Configuration</div>
            <div className="text-xs text-moove-muted">Set participant quotas and study parameters.</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <NumInput label="Participant Quota" value={config.participantQuota} onChange={v => update('participantQuota', v)} min={1} max={1000} unit="participants" />
          <div>
            <label className="block text-xs font-bold text-moove-brown mb-1.5">Study Phase</label>
            <select
              value={config.studyPhase}
              onChange={e => update('studyPhase', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-moove-border text-sm text-moove-brown focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            >
              <option value="alpha">Alpha (Internal)</option>
              <option value="beta">Beta (Limited)</option>
              <option value="pilot">Pilot Study</option>
              <option value="full">Full Deployment</option>
            </select>
          </div>
          <NumInput label="Data Retention" value={config.dataRetentionDays} onChange={v => update('dataRetentionDays', v)} min={30} max={365} unit="days" />
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="bg-white rounded-2xl p-6 card-shadow mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">🔔</div>
          <div>
            <div className="font-display font-bold text-moove-brown">Notification Thresholds</div>
            <div className="text-xs text-moove-muted">Configure alert thresholds for driver interventions.</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <NumInput
            label="Sedentary Alert Threshold"
            value={config.sedentaryAlertThreshold}
            onChange={v => update('sedentaryAlertThreshold', v)}
            min={15} max={120} unit="minutes"
          />
          <NumInput
            label="Break Reminder Interval"
            value={config.breakReminderInterval}
            onChange={v => update('breakReminderInterval', v)}
            min={15} max={180} unit="minutes"
          />
        </div>
      </div>

      {/* Export Settings */}
      <div className="bg-white rounded-2xl p-6 card-shadow mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">📊</div>
          <div>
            <div className="font-display font-bold text-moove-brown">Export Settings</div>
            <div className="text-xs text-moove-muted">Configure CSV export and anonymization settings.</div>
          </div>
        </div>

        <Toggle
          checked={config.exportAnonymized}
          onChange={() => update('exportAnonymized', !config.exportAnonymized)}
          label="Anonymize Exports"
          desc="Replace user IDs with anonymous codes in CSV exports"
        />
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-2xl p-6 card-shadow mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-xl">🗑️</div>
          <div>
            <div className="font-display font-bold text-moove-brown">Data Management</div>
            <div className="text-xs text-moove-muted">Clear test data and manage local storage.</div>
          </div>
        </div>

        <button
          onClick={clearTestData}
          className="text-sm font-bold px-5 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all active:scale-95"
        >
          🗑 Clear Test Data
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-10">
        <button
          onClick={handleSave}
          className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition-all active:scale-95 text-sm shadow-md"
        >
          Save Settings
        </button>
        <button
          onClick={handleReset}
          className="bg-moove-cream text-moove-brown font-bold px-6 py-3 rounded-xl hover:bg-orange-100 border border-moove-border transition-all active:scale-95 text-sm"
        >
          Reset to Defaults
        </button>
      </div>

      {/* ─── Testing Session Configuration ─────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="font-display font-black text-lg text-moove-brown mb-1">Testing Session Configuration</h2>
        <p className="text-xs text-moove-muted mb-4">
          This configuration is the <strong>single source of truth</strong> — changes here propagate automatically to every Driver Feedback screen.
        </p>
      </div>

      {testingSaved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          ✅ Testing configuration saved and synced to Supabase.
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 card-shadow mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">🧪</div>
          <div>
            <div className="font-display font-bold text-moove-brown">Session Identity</div>
            <div className="text-xs text-moove-muted">Identifiers shown on driver feedback forms.</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            ['Session ID', 'sessionId', 'e.g. UNLEASH-2026'],
            ['Prototype Version', 'prototypeVersion', 'e.g. v0.49-TRL4'],
            ['User Group', 'userGroup', 'e.g. Alpha Testers'],
            ['Testing Environment', 'testingEnvironment', 'e.g. Controlled Lab'],
            ['Study Start Date', 'studyStartDate', 'YYYY-MM-DD'],
            ['Target Participants', 'targetParticipants', 'e.g. 30'],
          ] as [string, keyof TestingConfig, string][]).map(([label, key, placeholder]) => (
            <div key={key}>
              <label className="block text-xs font-bold text-moove-brown mb-1.5">{label}</label>
              <input
                value={testing[key]}
                onChange={e => updateTesting(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-xl border border-moove-border text-sm text-moove-brown focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-moove-orange"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 card-shadow mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">🎯</div>
          <div>
            <div className="font-display font-bold text-moove-brown">Objectives & Criteria</div>
            <div className="text-xs text-moove-muted">Displayed in feedback summaries and research exports.</div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-moove-brown mb-1.5">Testing Objective</label>
            <textarea
              value={testing.testingObjective}
              onChange={e => updateTesting('testingObjective', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-moove-border text-sm text-moove-brown focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-moove-orange resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-moove-brown mb-1.5">Overall Success Criteria</label>
            <textarea
              value={testing.overallSuccessCriteria}
              onChange={e => updateTesting('overallSuccessCriteria', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-moove-border text-sm text-moove-brown focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-moove-orange resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-xs text-amber-800">
        <span className="font-bold">How sync works:</span> Saving here writes to both localStorage (instant, offline) and Supabase <code>admin_settings</code> (persistent, cross-device). Drivers load the config from localStorage cache — updated automatically the next time they load the feedback page.
      </div>

      <button
        onClick={handleSaveTesting}
        className="bg-moove-orange text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-all active:scale-95 text-sm shadow-md"
      >
        💾 Save & Sync Testing Configuration
      </button>
    </div>
  )
}
