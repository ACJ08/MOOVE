import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { fetchNotificationPrefs, upsertNotificationPrefs } from '@/lib/db'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: () => void; label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-moove-border last:border-0">
      <div>
        <div className="text-sm font-semibold text-moove-brown">{label}</div>
        {desc && <div className="text-xs text-moove-muted mt-0.5">{desc}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 shrink-0 ml-4 ${checked ? 'bg-moove-green' : 'bg-moove-border'}`}
      >
        <span className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [age, setAge] = useState(user?.age || '')
  const [vehicleType, setVehicleType] = useState(user?.vehicleType || '')
  const [goal, setGoal] = useState(user?.drivingGoal || '')
  const [saved, setSaved] = useState(false)

  const [prefs, setPrefs] = useState({
    exerciseReminders: true,
    breakAlerts: true,
    healthInsights: true,
    sessionSummaries: true,
    reminderInterval: '30',
  })

  useEffect(() => {
    if (!user) return
    fetchNotificationPrefs(user.id).then(p => {
      if (p) setPrefs(p)
    })
  }, [user?.id])

  const toggle = (key: keyof typeof prefs) => {
    if (key === 'reminderInterval') return
    const next = { ...prefs, [key]: !prefs[key as keyof typeof prefs] }
    setPrefs(next)
    if (user) upsertNotificationPrefs(user.id, next)
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    updateUser({ name, age, vehicleType, drivingGoal: goal })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Settings</h1>
        <p className="text-sm text-moove-muted">Manage your profile and application preferences.</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <span>✅</span> Profile updated successfully!
        </div>
      )}

      {/* Profile */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 card-shadow mb-5">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-moove-border">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center font-display font-black text-2xl text-moove-brown shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-display font-black text-lg text-moove-brown">{user?.name}</div>
            <div className="text-sm text-moove-muted">{user?.email}</div>
            <div className="text-xs text-moove-muted mt-0.5">Member since {user?.joinedDate}</div>
          </div>
        </div>

        <h2 className="font-display font-bold text-moove-brown mb-4">Profile Information</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-moove-brown mb-1.5">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-moove-border text-sm text-moove-brown focus:outline-none focus:ring-2 focus:ring-moove-orange/40 focus:border-moove-orange transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-moove-brown mb-1.5">Age</label>
            <input value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 32" className="w-full px-4 py-2.5 rounded-xl border border-moove-border text-sm text-moove-brown placeholder:text-moove-muted/60 focus:outline-none focus:ring-2 focus:ring-moove-orange/40 focus:border-moove-orange transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-moove-brown mb-1.5">Vehicle Type</label>
            <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-moove-border text-sm text-moove-brown focus:outline-none focus:ring-2 focus:ring-moove-orange/40 focus:border-moove-orange transition-all bg-white">
              <option value="">Select vehicle…</option>
              <option>Sedan</option>
              <option>SUV / Crossover</option>
              <option>Pickup Truck</option>
              <option>Van / MPV</option>
              <option>Motorcycle</option>
              <option>Public Utility Vehicle</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-moove-brown mb-1.5">Email</label>
            <input value={user?.email || ''} disabled className="w-full px-4 py-2.5 rounded-xl border border-moove-border text-sm text-moove-muted bg-moove-cream cursor-not-allowed" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-moove-brown mb-1.5">Wellness Goal</label>
            <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Reduce back pain from long drives" className="w-full px-4 py-2.5 rounded-xl border border-moove-border text-sm text-moove-brown placeholder:text-moove-muted/60 focus:outline-none focus:ring-2 focus:ring-moove-orange/40 focus:border-moove-orange transition-all" />
          </div>
        </div>
        <button type="submit" className="bg-moove-orange text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-all active:scale-95 text-sm">
          Save Changes
        </button>
      </form>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-6 card-shadow mb-5">
        <h2 className="font-display font-bold text-moove-brown mb-4">Notification Preferences</h2>
        <Toggle checked={prefs.exerciseReminders} onChange={() => toggle('exerciseReminders')} label="Exercise Reminders" desc="Receive context-aware exercise suggestions from Moo" />
        <Toggle checked={prefs.breakAlerts} onChange={() => toggle('breakAlerts')} label="Sedentary Break Alerts" desc="Alert when you've driven for more than 45 minutes" />
        <Toggle checked={prefs.healthInsights} onChange={() => toggle('healthInsights')} label="AI Health Insights" desc="Get personalized wellness tips and insights" />
        <Toggle checked={prefs.sessionSummaries} onChange={() => toggle('sessionSummaries')} label="Session Summaries" desc="Receive a summary after each driving session" />
      </div>

      {/* Moo tip */}
      <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 flex items-center gap-4 mb-5">
        <img src={mascotImg} alt="Moo" className="w-12 h-12 object-contain animate-float shrink-0" />
        <div>
          <div className="font-bold text-sm text-moove-brown mb-0.5">Moo's Privacy Promise</div>
          <p className="text-xs text-moove-muted leading-relaxed">Your health and driving data is private. MOOVE never sells, shares, or monetizes your personal information. Data is used only to personalize your wellness experience.</p>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-2xl p-6 card-shadow">
        <h2 className="font-display font-bold text-moove-brown mb-1">Account</h2>
        <p className="text-xs text-moove-muted mb-4">Sign out of your MOOVE account on this device.</p>
        <button
          onClick={() => { logout(); window.location.href = '/' }}
          className="bg-red-50 text-red-600 font-bold px-5 py-2.5 rounded-xl hover:bg-red-100 border border-red-200 transition-all text-sm active:scale-95"
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  )
}
