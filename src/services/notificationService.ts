// Notification service — dispatches break reminders based on user reminder_style preference.
// Supports: popup (Web Notifications), sound (Web Audio API), vibration, and silent (in-app only).
// All methods gracefully degrade when the API is unavailable.

export type ReminderStyle = 'popup' | 'sound' | 'vibration' | 'silent'

function getUserPrefs(): Record<string, string | string[]> {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('moove_user_preferences_'))
    if (!keys.length) return {}
    const raw = localStorage.getItem(keys[0]) ?? '{}'
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function getReminderStyle(): ReminderStyle {
  const prefs = getUserPrefs()
  const style = prefs['reminder_style'] as string | undefined
  if (style === 'popup' || style === 'sound' || style === 'vibration' || style === 'silent') return style
  return 'popup'
}

function isNotificationsEnabled(): boolean {
  const prefs = getUserPrefs()
  return prefs['notifications'] !== 'no'
}

// ── Sound ─────────────────────────────────────────────────────────────────────

function playAlertSound(): void {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const beep = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, ctx.currentTime + start)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.05)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + dur)
    }
    beep(880, 0, 0.15)
    beep(1100, 0.2, 0.15)
    beep(880, 0.4, 0.25)
  } catch {
    // Audio API not available
  }
}

// ── Vibration ─────────────────────────────────────────────────────────────────

function vibrate(): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400])
    }
  } catch {
    // Vibration not available
  }
}

// ── Browser Notification ───────────────────────────────────────────────────────

async function showBrowserNotification(title: string, body: string): Promise<void> {
  if (!('Notification' in window)) return
  if (Notification.permission === 'denied') return
  if (Notification.permission !== 'granted') {
    const result = await Notification.requestPermission()
    if (result !== 'granted') return
  }
  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'moove-break-reminder',
      requireInteraction: false,
    })
  } catch {
    // Notification failed
  }
}

// ── Request permission proactively ────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// ── Primary trigger ───────────────────────────────────────────────────────────

export async function triggerBreakReminder(elapsedMins: number): Promise<void> {
  if (!isNotificationsEnabled()) return

  const style = getReminderStyle()
  const title = "🤸 Time for a Movement Break!"
  const body = `You've been driving for ${elapsedMins} minutes. Moo says: stretch it out!`

  switch (style) {
    case 'popup':
      await showBrowserNotification(title, body)
      playAlertSound()
      break
    case 'sound':
      playAlertSound()
      break
    case 'vibration':
      vibrate()
      break
    case 'silent':
      // In-app indicator only — no audio or system notification
      break
  }
}

// ── Exercise-phase sounds ─────────────────────────────────────────────────────

export function playExerciseStartSound(): void {
  const style = getReminderStyle()
  if (style === 'silent') return
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 660; osc.type = 'sine'
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
    osc.start(); osc.stop(ctx.currentTime + 0.3)
  } catch { /* ignore */ }
}

export function playRestStartSound(): void {
  const style = getReminderStyle()
  if (style === 'silent') return
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 440; osc.type = 'sine'
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)
    osc.start(); osc.stop(ctx.currentTime + 0.4)
  } catch { /* ignore */ }
}

export function playCompleteSound(): void {
  const style = getReminderStyle()
  if (style === 'silent') return
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'sine'
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12)
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.12 + 0.05)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.12 + 0.25)
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 0.25)
    })
  } catch { /* ignore */ }
}
