import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'
import logoImg from '@/imports/_REMOVE_BG__MOOVE.png'
import profilePicImg from '@/imports/profile_pic.jpg'
import abreyImg from '@/imports/abrey.jpg'

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'About', href: '#about-us' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-blur bg-white/80 shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 shrink-0">
          <img src={logoImg} alt="MOOVE" className="h-9 w-auto" />
        </a>
        <div className="hidden lg:flex items-center gap-5">
          <a href="#" className="text-sm font-medium text-moove-brown/70 hover:text-moove-orange transition-colors">Home</a>
          {links.map(l => (
            <a key={l.label} href={l.href} className="text-sm font-medium text-moove-brown/70 hover:text-moove-orange transition-colors">{l.label}</a>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/auth/login" className="text-sm font-semibold text-moove-brown px-4 py-2 rounded-full border border-moove-border hover:bg-moove-peach transition-colors">Sign In</Link>
          <Link to="/auth/register" className="text-sm font-semibold text-white bg-moove-orange px-5 py-2 rounded-full hover:bg-orange-600 transition-colors shadow-sm">Create Account</Link>
        </div>
        <button className="lg:hidden p-2 text-moove-brown" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <div className="w-5 h-0.5 bg-moove-brown mb-1 transition-all origin-center" style={{ transform: open ? 'rotate(45deg) translateY(6px)' : 'none' }} />
          <div className="w-5 h-0.5 bg-moove-brown mb-1" style={{ opacity: open ? 0 : 1 }} />
          <div className="w-5 h-0.5 bg-moove-brown transition-all origin-center" style={{ transform: open ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-white/98 nav-blur border-t border-moove-border px-6 py-5 flex flex-col gap-3">
          {links.map(l => (
            <a key={l.label} href={l.href} className="text-sm font-semibold text-moove-brown py-1.5 border-b border-moove-border/40 last:border-0" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/auth/login" className="flex-1 text-center text-sm font-bold text-moove-brown py-2.5 rounded-full border border-moove-border">Sign In</Link>
            <Link to="/auth/register" className="flex-1 text-center text-sm font-bold text-white bg-moove-orange py-2.5 rounded-full">Create Account</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
const rotatingWords = ['Movement', 'Mobility', 'Prevention', 'Stretching', 'Recovery', 'Comfort', 'Energy', 'Health']

function AnimatedWord() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setIdx(i => (i + 1) % rotatingWords.length); setVisible(true) }, 300)
    }, 2600)
    return () => clearInterval(timer)
  }, [])
  return (
    <span
      className="gradient-text inline-block"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-8px)', transition: 'opacity 0.3s ease, transform 0.3s ease', minWidth: '8ch', display: 'inline-block' }}
    >
      {rotatingWords[idx]}
    </span>
  )
}

const featureChips = [
  { icon: '🤖', label: 'AI Motion Coaching' },
  { icon: '🚦', label: 'Traffic Break Exercises' },
  { icon: '😴', label: 'Fatigue Monitoring' },
  { icon: '⭐', label: 'Daily Wellness Score' },
  { icon: '🪑', label: 'Posture Analysis' },
  { icon: '📊', label: 'Sedentary Tracking' },
]

const floatingIndicators = [
  { label: 'Wellness Score', value: '94', unit: '%', icon: '💚', top: '10%', right: '-4%' },
  { label: 'Stretch Streak', value: '7', unit: ' days', icon: '🔥', bottom: '22%', right: '-2%' },
  { label: 'Session Done', value: '3 min', unit: '', icon: '✅', top: '42%', left: '-4%' },
]

function Hero() {
  return (
    <section className="min-h-screen pt-20 pb-16 flex items-center overflow-hidden relative" style={{ background: 'linear-gradient(160deg, #FEFAF5 0%, #FFF4EA 60%, #F0F9FF 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #F97316, transparent 70%)' }} />
        <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #A855F7, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #22C55E, transparent 70%)' }} />
      </div>
      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-[40%_60%] gap-10 items-center relative z-10">
        {/* Left 40% — text + CTAs */}
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-semibold text-moove-orange border border-orange-100 card-shadow mb-6">
            <span>🐄</span> Small Movements. Healthier Journeys.
          </div>
          <h1 className="font-display text-5xl lg:text-5xl font-black text-moove-brown leading-tight mb-4" style={{ lineHeight: 1.15 }}>
            Turn Every Drive Into a <AnimatedWord /> Journey
          </h1>
          <p className="text-base text-moove-muted font-body leading-relaxed mb-6 max-w-md">
            MOOVE is an AI-assisted preventive health platform that transforms unavoidable driving breaks into opportunities for safe, guided micro-movement exercises — designed exclusively for Filipino drivers.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <Link to="/auth/register" className="inline-flex items-center gap-2 bg-moove-orange text-white font-bold px-7 py-3.5 rounded-full hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 active:scale-95">
              Get Started Free <span aria-hidden>→</span>
            </Link>
            <Link to="/auth/login" className="inline-flex items-center gap-2 bg-white text-moove-brown font-bold px-7 py-3.5 rounded-full hover:bg-moove-peach transition-all card-shadow border border-moove-border active:scale-95">
              Sign In
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {featureChips.map(chip => (
              <div key={chip.label} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 text-xs font-semibold text-moove-brown card-shadow border border-moove-border hover-lift cursor-default">
                <span>{chip.icon}</span>{chip.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right 60% — Moo dominant visual */}
        <div className="flex justify-center items-center relative min-h-[540px]">
          {/* Large background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[480px] h-[480px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.20) 0%, rgba(168,85,247,0.10) 45%, transparent 72%)' }} />
          </div>
          {/* Spinning orbit rings */}
          {[1, 2, 3].map(i => (
            <div key={i} className="absolute rounded-full border border-dashed border-orange-200 animate-spin-slow pointer-events-none" style={{ width: `${280 + i * 90}px`, height: `${280 + i * 90}px`, animationDuration: `${14 + i * 5}s`, animationDirection: i % 2 === 0 ? 'reverse' : 'normal', opacity: 0.45 - i * 0.08 }} />
          ))}
          {/* Moo — primary focal point, extra large */}
          <div className="relative z-10 animate-float">
            <img src={mascotImg} alt="Moo — MOOVE AI health companion" className="w-80 h-80 lg:w-[420px] lg:h-[420px] object-contain drop-shadow-2xl" loading="eager" />
          </div>
          {/* Floating stat cards */}
          {floatingIndicators.map((ind, i) => (
            <div key={ind.label} className="absolute bg-white rounded-2xl px-4 py-3 card-shadow-lg animate-float-slow flex items-center gap-3 min-w-max" style={{ top: ind.top, bottom: ind.bottom, left: ind.left, right: ind.right, animationDelay: `${i * 1.3}s`, zIndex: 20 }}>
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-lg">{ind.icon}</div>
              <div>
                <div className="text-xs text-moove-muted font-medium">{ind.label}</div>
                <div className="font-black text-moove-brown font-display text-lg leading-tight">{ind.value}<span className="text-xs font-semibold text-moove-muted">{ind.unit}</span></div>
              </div>
            </div>
          ))}
          {/* Floating exercise / health emoji icons */}
          {['🧘', '💪', '❤️‍🔥', '⚡', '🏃', '🩺', '🤸'].map((emoji, i) => (
            <div key={i} className="absolute text-2xl animate-float-slow select-none pointer-events-none" aria-hidden style={{ top: `${10 + i * 12}%`, left: i % 2 === 0 ? `${2 + i * 1.5}%` : undefined, right: i % 2 !== 0 ? `${2 + i * 1.5}%` : undefined, animationDelay: `${i * 0.6}s`, animationDuration: `${3.5 + i * 0.8}s` }}>
              {emoji}
            </div>
          ))}
          {/* Exercise label chips floating */}
          {[
            { label: 'Neck Stretch', color: '#22C55E', top: '8%', left: '5%' },
            { label: 'Shoulder Rolls', color: '#F97316', bottom: '18%', left: '3%' },
            { label: 'Wrist Flex', color: '#A855F7', top: '15%', right: '3%' },
          ].map((chip, i) => (
            <div key={chip.label} className="absolute animate-float-slow pointer-events-none" style={{ top: chip.top, bottom: chip.bottom, left: chip.left, right: chip.right, animationDelay: `${i * 1.8}s`, zIndex: 15 }}>
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-bold border" style={{ color: chip.color, borderColor: `${chip.color}30` }}>
                <div className="w-2 h-2 rounded-full" style={{ background: chip.color }} />
                {chip.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Marquee — 80% faster: 10s ───────────────────────────────────────────────
const marqueeItems = [
  { icon: '🤖', text: 'AI Coaching' },
  { icon: '🧘', text: 'Stretch Breaks' },
  { icon: '🚗', text: 'Driving Wellness' },
  { icon: '⚠️', text: 'Fatigue Alerts' },
  { icon: '📊', text: 'Session Tracking' },
  { icon: '📚', text: 'Exercise Library' },
  { icon: '📱', text: 'Movement Monitoring' },
  { icon: '🎯', text: 'Personalized Plans' },
  { icon: '🚦', text: 'Traffic Wellness' },
  { icon: '💯', text: 'Wellness Scores' },
  { icon: '🩺', text: 'Preventive Health' },
  { icon: '🏆', text: 'Daily Streaks' },
]

// ─── Why Moo? ───────────────────────────────────────────────────────────────
const mooStories = [
  { icon: '🐄', accent: '#F97316', title: 'Why “Moo”?', description: 'MOOVE is inspired by the familiar “moo” of cattle and the word “move” — a reminder that small movements can create healthier journeys.', detail: 'A playful name with a meaningful purpose: making wellness feel easy to begin.' },
  { icon: '🐃', accent: '#A855F7', title: 'Why the Carabao?', description: 'Moo is a carabao, the national animal of the Philippines — a trusted symbol of strength, resilience, patience, and hard work.', detail: 'Like Filipino drivers, the carabao keeps communities, families, and businesses moving through quiet dedication.' },
  { icon: '💙', accent: '#0EA5E9', title: 'Why MOOVE?', description: 'Moo pairs a friendly identity with a simple message: true endurance is supported by proper self-care.', detail: 'Guided stretches and healthier driving habits help you stay comfortable, active, and ready for the road ahead.' },
]

function WhyMoo() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.12 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="why-moo" ref={sectionRef} className="relative overflow-hidden px-6 py-24 sm:py-28" style={{ background: 'linear-gradient(145deg, #FFF9F3 0%, #FFF0E5 48%, #F6F1FF 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-28 left-[8%] h-72 w-72 rounded-full opacity-50 blur-3xl" style={{ background: '#FDD5B8' }} />
        <div className="absolute bottom-0 right-[6%] h-80 w-80 rounded-full opacity-45 blur-3xl" style={{ background: '#DDD6FE' }} />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <header className={`mx-auto mb-14 max-w-3xl text-center why-moo-reveal ${visible ? 'is-visible' : ''}`}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/75 px-4 py-2 text-sm font-bold text-moove-orange shadow-sm backdrop-blur"><span aria-hidden="true">🐃</span> Why Moo?</div>
          <h2 className="font-display text-4xl font-black leading-tight text-moove-brown sm:text-5xl">More Than a Mascot—<br className="hidden sm:block" /> A Symbol of Every Filipino Driver.</h2>
          <div className="mx-auto mt-5 h-1 w-20 rounded-full why-moo-underline" />
          <p className="mt-6 text-base leading-relaxed text-moove-muted sm:text-lg">Behind every healthy journey is a story. MOOVE brings movement, wellness, and Filipino resilience together in Moo: a friendly carabao companion for every driver on the road.</p>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div className={`relative mx-auto flex min-h-[330px] w-full max-w-[440px] items-center justify-center why-moo-reveal ${visible ? 'is-visible' : ''}`} style={{ transitionDelay: '100ms' }}>
            <div className="absolute h-[290px] w-[290px] rounded-full border border-orange-200/80 bg-white/40 shadow-inner backdrop-blur-sm sm:h-[350px] sm:w-[350px]" />
            <div className="absolute h-[340px] w-[340px] rounded-full border border-dashed border-orange-300/70 animate-spin-slow sm:h-[410px] sm:w-[410px]" style={{ animationDuration: '28s' }} />
            <div className="absolute -left-1 top-12 rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-xs font-bold text-moove-orange shadow-lg backdrop-blur sm:-left-8">Built for the road</div>
            <div className="absolute -right-1 bottom-12 rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-xs font-bold text-moove-purple shadow-lg backdrop-blur sm:-right-8">Rooted in resilience</div>
            <div className="relative z-10 animate-float" style={{ filter: 'drop-shadow(0 24px 24px rgba(137, 65, 19, 0.22))' }}><img src={mascotImg} alt="Moo, MOOVE’s welcoming carabao wellness companion" className="h-72 w-72 object-contain sm:h-80 sm:w-80" loading="lazy" /></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {mooStories.map((story, index) => (
              <article key={story.title} className={`group relative overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_12px_36px_rgba(62,31,13,0.08)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:bg-white hover:shadow-[0_20px_44px_rgba(62,31,13,0.13)] why-moo-reveal ${visible ? 'is-visible' : ''}`} style={{ transitionDelay: `${180 + index * 110}ms` }}>
                <div className="absolute inset-y-0 left-0 w-1" style={{ background: story.accent }} />
                <div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: `${story.accent}18` }} aria-hidden="true">{story.icon}</div><div><h3 className="font-display text-xl font-black text-moove-brown">{story.title}</h3><p className="mt-2 text-sm leading-relaxed text-moove-muted">{story.description}</p><p className="mt-3 text-sm font-semibold leading-relaxed" style={{ color: story.accent }}>{story.detail}</p></div></div>
              </article>
            ))}
          </div>
        </div>

        <blockquote className={`relative mt-14 overflow-hidden rounded-3xl border border-white/40 bg-moove-brown px-7 py-9 text-center text-white shadow-xl sm:px-12 why-moo-reveal ${visible ? 'is-visible' : ''}`} style={{ transitionDelay: '540ms' }}>
          <div className="absolute inset-0 opacity-75" style={{ background: 'radial-gradient(circle at 15% 30%, rgba(249,115,22,0.62), transparent 30%), radial-gradient(circle at 85% 70%, rgba(168,85,247,0.55), transparent 28%)' }} aria-hidden="true" />
          <div className="relative"><span className="font-display text-6xl leading-none text-moove-yellow" aria-hidden="true">“</span><p className="mx-auto max-w-3xl font-display text-2xl font-extrabold leading-snug sm:text-3xl">Because every healthy journey begins with one small move.</p><footer className="mt-4 text-sm font-semibold text-white/65">— Moo, your wellness companion</footer></div>
        </blockquote>
      </div>
    </section>
  )
}

function Marquee() {
  const doubled = [...marqueeItems, ...marqueeItems]
  return (
    <section className="py-4 bg-moove-brown overflow-hidden" aria-hidden="true">
      <div className="flex whitespace-nowrap gap-0" style={{ animation: 'marquee 10s linear infinite' }}>
        {doubled.map((item, i) => (
          <div key={i} className="inline-flex items-center gap-2 px-6 text-white/90 font-semibold text-sm shrink-0">
            <span className="text-base">{item.icon}</span>
            <span>{item.text}</span>
            <span className="ml-4 text-orange-400">✦</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: 12500, suffix: '+', label: 'Drivers Supported', icon: '🚗', color: '#F97316' },
  { value: 10, suffix: '', label: 'Guided Exercises', icon: '🧘', color: '#22C55E' },
  { value: 98, suffix: '%', label: 'User Satisfaction', icon: '⭐', color: '#FBBF24' },
  { value: 3, suffix: ' min', label: 'Avg Session Time', icon: '⏱️', color: '#0EA5E9' },
  { value: 45, suffix: 's', label: 'Quick Break Duration', icon: '⚡', color: '#A855F7' },
  { value: 7, suffix: 'x', label: 'Daily Wellness Moments', icon: '🔥', color: '#EC4899' },
]

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    const start = performance.now()
    const raf = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * target))
      if (progress < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [target, duration, active])
  return count
}

function StatCard({ stat, active }: { stat: typeof stats[0]; active: boolean }) {
  const count = useCountUp(stat.value, 1800, active)
  return (
    <div className="bg-white rounded-3xl p-7 card-shadow hover-lift text-center flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${stat.color}18` }}>{stat.icon}</div>
      <div className="font-display font-black text-4xl text-moove-brown">{count.toLocaleString()}{stat.suffix}</div>
      <div className="text-sm font-semibold text-moove-muted">{stat.label}</div>
    </div>
  )
}

function Stats() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect() } }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <section id="benefits" className="py-20 px-6" style={{ background: '#FFF8F2' }}>
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-50 rounded-full px-4 py-1.5 text-sm font-bold text-moove-orange mb-4">📈 Platform Impact</div>
          <h2 className="font-display font-black text-4xl text-moove-brown mb-3">Moving the Needle on Driver Wellness</h2>
          <p className="text-moove-muted max-w-xl mx-auto">Real numbers from real drivers doing small movements that add up to big health changes.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map(s => <StatCard key={s.label} stat={s} active={active} />)}
        </div>
      </div>
    </section>
  )
}

// ─── MVP Features ─────────────────────────────────────────────────────────────
const mvpFeatures = [
  { icon: '🚗', color: '#F97316', title: 'Driving Session Tracking', desc: 'Track driving duration, sedentary periods, and daily history to identify prolonged sedentary patterns and enable context-aware recommendations.', badges: ['Duration Tracking', 'Sedentary Alerts', 'History'] },
  { icon: '🧘', color: '#22C55E', title: 'Guided Micro-Movements', desc: '10 clinically-validated exercises for drivers — from chin tucks to glute stretches — delivered at the right moment: before, during, or after your drive.', badges: ['10 Exercises', 'Safety Rated', 'Expert-Designed'] },
  { icon: '🤖', color: '#A855F7', title: 'AI-Assisted Recommendations', desc: "Moo's AI provides personalized health insights and behavioral summaries — suggesting the right exercise when you've been sitting too long, without medical claims.", badges: ['Personalized', 'Preventive Only', 'Behavioral'] },
  { icon: '📊', color: '#0EA5E9', title: 'Sedentary Behavior Monitoring', desc: 'Daily monitoring of sedentary duration, exercise completion, and preventive health engagement — with trend summaries to encourage lasting change.', badges: ['Daily Tracking', 'Trend Analysis', 'Progress'] },
  { icon: '💡', color: '#FBBF24', title: 'Preventive Health Dashboard', desc: 'Clean wellness dashboard showing total sedentary time, movement streaks, weekly activities, driving statistics, and engagement metrics.', badges: ['Streak Tracker', 'Wellness Stats', 'Weekly View'] },
  { icon: '📚', color: '#EC4899', title: 'Health Education', desc: 'Evidence-based educational content covering risks of prolonged sitting, benefits of micro-movement, safe stretching, and preventive health recommendations.', badges: ['Evidence-Based', 'No Medical Claims', 'Practical Tips'] },
  { icon: '📝', color: '#3E1F0D', title: 'Feedback & Validation', desc: 'Integrated feedback module collecting usability ratings and intervention usefulness data — powering TRL-4 validation and continuous improvement.', badges: ['TRL-4', 'Usability', 'Research'] },
]

function Ecosystem() {
  const [hovered, setHovered] = useState<number | null>(null)
  return (
    <section id="features" className="py-20 px-6 bg-moove-cream">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-purple-50 rounded-full px-4 py-1.5 text-sm font-bold text-moove-purple mb-4">🌐 MVP Features</div>
          <h2 className="font-display font-black text-4xl lg:text-5xl text-moove-brown mb-4">Seven Features. <span className="gradient-text-green">One Mission.</span></h2>
          <p className="text-moove-muted max-w-2xl mx-auto text-lg">MOOVE's official MVP — purposefully scoped to what Filipino drivers actually need, and nothing more.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mvpFeatures.map((f, i) => (
            <div key={f.title} className="bg-white rounded-3xl p-6 card-shadow cursor-default transition-all duration-300 flex flex-col gap-4 border-2" style={{ transform: hovered === i ? 'translateY(-6px)' : 'none', borderColor: hovered === i ? `${f.color}30` : 'transparent' }} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${f.color}18` }}>{f.icon}</div>
              <div>
                <h3 className="font-display font-bold text-lg text-moove-brown mb-2">{f.title}</h3>
                <p className="text-sm text-moove-muted leading-relaxed">{f.desc}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {f.badges.map(b => <span key={b} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${f.color}12`, color: f.color }}>{b}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Who It's For — Driver only ───────────────────────────────────────────────
const driverFeatures = [
  { icon: '🎯', title: 'Personalized Wellness', desc: 'AI-curated exercise suggestions based on your unique driving patterns and sedentary behavior.' },
  { icon: '🚦', title: 'Traffic Exercises', desc: 'Safe micro-movements during red lights — chin tucks, shoulder rolls, lumbar stretches.' },
  { icon: '🔔', title: 'Smart Stretch Reminders', desc: "Context-aware nudges that know when you've been sitting too long." },
  { icon: '😴', title: 'Fatigue Monitoring', desc: 'Real-time sedentary duration tracking with personalized rest recommendations.' },
  { icon: '📊', title: 'Progress Dashboard', desc: 'Visual streaks, weekly summaries, and engagement metrics to keep you motivated.' },
  { icon: '🤖', title: 'AI Coach Moo', desc: "Moo learns your schedule and proactively suggests the right exercise at the right time." },
  { icon: '📚', title: 'Health Education', desc: 'Bite-sized educational cards on the science of sedentary health and safe movement.' },
  { icon: '📝', title: 'Feedback & Research', desc: 'Contribute to TRL-4 research validation by sharing your usability experience.' },
]

function WhoItsFor() {
  return (
    <section className="py-20 px-6" style={{ background: '#F8F4FF' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-1.5 text-sm font-bold text-moove-purple mb-4">🚗 Built for Drivers</div>
          <h2 className="font-display font-black text-4xl text-moove-brown mb-3">Everything a Driver Needs to Stay Healthy</h2>
          <p className="text-moove-muted max-w-xl mx-auto">Designed exclusively for Filipino drivers who spend significant time on the road each day.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {driverFeatures.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-5 card-shadow hover-lift">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-display font-bold text-moove-brown mb-1.5 text-sm">{f.title}</h3>
              <p className="text-xs text-moove-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const steps = [
  { n: '01', icon: '👤', color: '#F97316', title: 'Create & Sign Up', desc: 'Register free in under 30 seconds — just your name, email, and password. No credit card, no hassle.', highlights: ['30 seconds', 'Free forever', 'Privacy first'] },
  { n: '02', icon: '🎯', color: '#A855F7', title: 'Quick Personalization', desc: '8 quick questions help Moo understand your driving habits, tired areas, and reminder preferences. Takes about 1 minute.', highlights: ['8 questions', '~1 minute', 'Fully tailored'] },
  { n: '03', icon: '🌅', color: '#0EA5E9', title: 'Warm Up Before Driving', desc: 'Start each session with optional 2-minute warm-up exercises designed to prep your body for the road ahead.', highlights: ['Optional warm-up', 'Guided steps', 'Safety-first'] },
  { n: '04', icon: '🚗', color: '#22C55E', title: 'Start Your Session', desc: "Hit the road with smart reminders. Moo tracks your driving time and nudges you at the right moment to take a break.", highlights: ['Smart reminders', 'Custom intervals', 'Demo mode'] },
  { n: '05', icon: '🤸', color: '#FBBF24', title: 'Take Movement Breaks', desc: 'When safely stopped, Moo recommends a quick micro-exercise — seated, safe, and done in under 60 seconds.', highlights: ['Safely stopped', 'Context-aware', 'Under 60 sec'] },
  { n: '06', icon: '📊', color: '#EC4899', title: 'Review Your Progress', desc: 'Each session ends with an AI-generated summary and updates to your health dashboard — streaks, scores, and insights.', highlights: ['Session report', 'AI summary', 'Health dashboard'] },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-moove-cream">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-4 py-1.5 text-sm font-bold text-moove-green mb-4">🗺️ How It Works</div>
          <h2 className="font-display font-black text-4xl text-moove-brown mb-3">Your MOOVE Journey</h2>
          <p className="text-moove-muted max-w-xl mx-auto">From sign-up to your first session — here's exactly how MOOVE works.</p>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-200 via-purple-200 to-green-200 -translate-x-px" />
          <div className="flex flex-col gap-10">
            {steps.map((step, i) => (
              <div key={step.n} className={`flex flex-col lg:flex-row items-center gap-6 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1 bg-white rounded-3xl p-7 card-shadow hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${step.color}18` }}>{step.icon}</div>
                    <div>
                      <div className="font-display font-black text-xs tracking-widest mb-1" style={{ color: step.color }}>STEP {step.n}</div>
                      <h3 className="font-display font-bold text-xl text-moove-brown mb-2">{step.title}</h3>
                      <p className="text-sm text-moove-muted leading-relaxed mb-4">{step.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {step.highlights.map(h => <span key={h} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${step.color}12`, color: step.color }}>✓ {h}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex w-12 h-12 rounded-full items-center justify-center font-display font-black text-white text-sm shrink-0 z-10" style={{ background: step.color }}>{step.n}</div>
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Safety — Moo replaces car ────────────────────────────────────────────────
const safetyItems = [
  { icon: '😴', title: 'Fatigue Detection', desc: 'Tracks sedentary duration and triggers timely rest prompts before exhaustion sets in.' },
  { icon: '✅', title: 'Safe Exercise Only', desc: 'All exercises classified by context — Traffic, Parked, Before, or After driving.' },
  { icon: '🛑', title: 'Driving Break Guidance', desc: 'Moo recommends breaks at safe intervals based on your personal driving history.' },
  { icon: '⏰', title: 'Adaptive Reminders', desc: 'Smart notifications that avoid reminders during active navigation.' },
  { icon: '🔒', title: 'AI Personalization', desc: 'Exercise selection considers your unique profile, avoiding contraindicated moves.' },
  { icon: '🛡️', title: 'Privacy Protection', desc: 'Your health data stays private. MOOVE never sells or shares wellness data.' },
  { icon: '⚕️', title: 'Preventive — Not Medical', desc: 'Preventive wellness support only — not clinical diagnosis or treatment.' },
  { icon: '⚡', title: 'Context-Aware Safety', desc: 'Every exercise carries a safety matrix rating for each driving context.' },
]

function Safety() {
  return (
    <section className="py-20 px-6" style={{ background: '#F0FDF4' }}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-1.5 text-sm font-bold text-moove-green mb-6">🛡️ Safety First</div>
          <h2 className="font-display font-black text-4xl text-moove-brown mb-4">Your Safety Is <span className="gradient-text-green">Non-Negotiable</span></h2>
          <p className="text-moove-muted mb-8 leading-relaxed">Every MOOVE feature is designed with road safety as the primary constraint. No exercise is ever recommended that could compromise your ability to drive.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {safetyItems.map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-4 card-shadow flex items-start gap-3">
                <div className="text-xl shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <div className="font-bold text-sm text-moove-brown mb-0.5">{item.title}</div>
                  <div className="text-xs text-moove-muted leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="relative flex flex-col items-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.18) 0%, rgba(249,115,22,0.10) 50%, transparent 72%)' }} />
            </div>
            <div className="animate-float" style={{ filter: 'drop-shadow(0 24px 48px rgba(34,197,94,0.25))' }}>
              <img src={mascotImg} alt="Moo ensures every exercise is safe for drivers" className="w-72 h-72 lg:w-96 lg:h-96 object-contain relative z-10" loading="lazy" />
            </div>
            <div className="mt-4 bg-white rounded-2xl px-6 py-4 card-shadow text-center max-w-xs z-10">
              <div className="font-display font-black text-moove-brown text-base mb-1">Moo Is Always With You</div>
              <p className="text-xs text-moove-muted">Your AI health companion monitors wellness and guides safe movements every step of your journey.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'What is MOOVE?', a: "MOOVE is an AI-assisted, context-aware preventive health platform designed for drivers. It transforms unavoidable sedentary driving periods into micro-movement opportunities through guided exercises, personalized recommendations, and real-time wellness monitoring." },
  { q: 'Is MOOVE free?', a: "Yes — MOOVE is completely free to use. No subscription, no payment details, and no hidden costs. Simply create your account and start your wellness journey." },
  { q: 'Can I use MOOVE while driving?', a: "Some exercises — like chin tucks, shoulder rolls, and seated lumbar side stretches — are safe at a full stop at a red light with hands on the wheel. MOOVE clearly labels every exercise with its safety context and will never recommend an unsafe movement during active driving." },
  { q: 'Is MOOVE a medical application?', a: "No. MOOVE is a preventive wellness platform, not a medical application. It provides exercise guidance and health education for preventive purposes only. MOOVE does not diagnose conditions, prescribe medications, or provide clinical treatment. Always consult a healthcare professional for medical concerns." },
  { q: "How does Moo's AI recommendation work?", a: "Moo analyzes your daily driving duration, sedentary patterns, and exercise history to generate personalized micro-movement suggestions. For example: \"You've been driving 90 minutes. Consider a 30-second shoulder break before your next trip.\" All recommendations are strictly preventive wellness guidance." },
  { q: 'What exercises are included?', a: "MOOVE includes 10 clinically-validated exercises: Chin Tucks, Upper Trapezius Stretch, Shoulder Rolls, Wrist Flexor Stretch, Seated Figure-4 Glute Stretch, Seated Heel Raise and Toe Raise, Standing Hip Flexor & Calf Stretch, Seated Lateral Lumbar Side Stretch, 20-20-20 Ocular Reset & Eye Blink, and Seated Knee Extension & Quad Squeeze." },
  { q: 'Is my data private?', a: "Absolutely. MOOVE does not sell, share, or monetize your personal health or driving data. Your information is used solely to improve your personalized wellness experience within the platform." },
]

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  return (
    <section id="faq" className="py-20 px-6" style={{ background: '#FFF8F2' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-50 rounded-full px-4 py-1.5 text-sm font-bold text-moove-orange mb-4">❓ FAQ</div>
          <h2 className="font-display font-black text-4xl text-moove-brown mb-3">Frequently Asked Questions</h2>
          <p className="text-moove-muted">Everything you need to know before getting started.</p>
        </div>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i
            return (
              <div key={i} className="bg-white rounded-2xl card-shadow overflow-hidden transition-all duration-200" style={{ borderLeft: `3px solid ${isOpen ? '#F97316' : 'transparent'}` }}>
                <button className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-moove-orange" onClick={() => setOpenIdx(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className="font-display font-bold text-moove-brown text-sm leading-snug">{faq.q}</span>
                  <span className="shrink-0 w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-moove-orange font-bold text-sm transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }} aria-hidden>+</span>
                </button>
                <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? '400px' : '0px', opacity: isOpen ? 1 : 0 }}>
                  <p className="px-6 pb-5 text-sm text-moove-muted leading-relaxed">{faq.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── About Us ─────────────────────────────────────────────────────────────────
interface TeamMember {
  name: string
  position: string
  professionalRole: string
  image: string
  bio: string
  highlights: string[]
  color: string
  badge: string
  links: { href: string; icon: string; label: string }[]
}

const team: TeamMember[] = [
  {
    name: 'Anne Carol G. Jonson',
    position: 'CEO & Founder',
    professionalRole: 'Full-Stack Developer · Lead Software Engineer',
    image: profilePicImg,
    bio: 'Anne Carol is the visionary behind MOOVE, serving as its CEO, Founder, and Lead Software Engineer. She conceptualized the platform, created the MOOVE brand identity and the Moo mascot, and leads the end-to-end technical development of the application. With expertise spanning full-stack development, software architecture, AI integration, database engineering, and UI/UX design, she transformed MOOVE from a research concept into a production-ready preventive health platform. She oversees every aspect of the system—from frontend and backend implementation to intelligent features, user experience, and overall software quality—ensuring the platform is scalable, intuitive, technically robust, and research-driven.',
    highlights: ['Full-Stack Development', 'Software Architecture', 'Lead Software Engineering', 'AI Integration', 'UI/UX Engineering', 'Branding & Product Design', 'Preventive Health Platform'],
    color: '#F97316',
    badge: '💻 Lead Developer',
    links: [
      { href: 'https://github.com/ACJ08', icon: '🐙', label: 'GitHub' },
      { href: 'mailto:annecaroljonson1108@gmail.com', icon: '📧', label: 'Email' },
      { href: 'https://www.linkedin.com/in/annecaroljonson/', icon: '💼', label: 'LinkedIn' },
    ],
  },
  {
    name: 'Jean-Abrey S. Serva',
    position: 'Co-Founder',
    professionalRole: 'Lead Exercise Animation Designer',
    image: abreyImg,
    bio: 'Jean-Abrey leads the exercise animation design of MOOVE, bringing each guided movement to life through engaging and easy-to-follow visual demonstrations. He specializes in creating smooth exercise animations that help drivers correctly perform stretching and mobility routines before, during, and after driving sessions. Through his expertise in motion graphics, exercise visualization, animation design, and visual storytelling, he ensures that every exercise is intuitive, accessible, and visually engaging, enhancing both the usability and educational value of the platform.',
    highlights: ['Exercise Animation', 'Motion Graphics', 'Exercise Visualization', 'Animation Design', 'Visual Storytelling', 'UX Illustration'],
    color: '#A855F7',
    badge: '🎨 Design Lead',
    links: [
      { href: 'https://github.com/Jabrey14', icon: '🐙', label: 'GitHub' },
      { href: 'mailto:jeanabreyserva@gmail.com', icon: '📧', label: 'Email' },
    ],
  },
]

function AboutUs() {
  return (
    <section id="about-us" className="py-20 px-6" style={{ background: 'linear-gradient(160deg, #F8F4FF 0%, #FFF8F2 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-1.5 text-sm font-bold text-moove-purple mb-4">👋 Meet the Team</div>
          <h2 className="font-display font-black text-4xl text-moove-brown mb-3">The People Behind MOOVE</h2>
          <p className="text-moove-muted max-w-xl mx-auto">A dedicated team combining software engineering, preventive health research, and multimedia design.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {team.map(member => (
            <article key={member.name} className="group min-h-full bg-white rounded-3xl p-6 sm:p-8 card-shadow-lg hover-lift flex flex-col items-center text-center gap-5 border-2 border-transparent transition-all duration-300" onMouseEnter={e => (e.currentTarget.style.borderColor = `${member.color}40`)} onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}>
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 shadow-lg transition-transform duration-300 group-hover:scale-[1.03]" style={{ borderColor: member.color }}>
                  <img src={member.image} alt={`Portrait of ${member.name}`} className="w-full h-full object-cover object-top" loading="lazy" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold px-3 py-1 rounded-full text-white shadow-md" style={{ background: member.color }}>{member.badge}</div>
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-display font-black text-xl text-moove-brown mb-0.5">{member.name}</h3>
                <p className="font-bold text-sm mb-1" style={{ color: member.color }}>{member.position}</p>
                <p className="text-xs font-semibold text-moove-muted mb-4">{member.professionalRole}</p>
                <p className="text-sm text-moove-muted leading-6 mb-5">{member.bio}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-auto" aria-label={`${member.name} areas of expertise`}>
                  {member.highlights.map(h => <span key={h} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${member.color}12`, color: member.color }}>{h}</span>)}
                </div>
              </div>
              <nav className="flex gap-2.5 mt-auto pt-2" aria-label={`${member.name} contact links`}>
                {member.links.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('mailto') ? undefined : '_blank'}
                    rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    aria-label={`${member.name} ${link.label}`}
                    title={link.label}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ background: `${member.color}15`, color: member.color }}
                  >
                    {link.icon}
                  </a>
                ))}
              </nav>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-3 opacity-70">
          <img src={mascotImg} alt="Moo" className="w-14 h-14 object-contain animate-float" loading="lazy" />
          <p className="text-xs text-moove-muted text-center max-w-sm">And <strong>Moo</strong>, MOOVE's AI health companion who guides every driver through their wellness journey. 🐄</p>
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #2A1208 0%, #4A1E08 40%, #3E1F0D 70%, #1A0A04 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #F97316, transparent 65%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #A855F7, transparent 65%)' }} />
      </div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.5) 0%, transparent 70%)', filter: 'blur(20px)', transform: 'scale(1.3)' }} />
          <div className="relative animate-float" style={{ filter: 'drop-shadow(0 0 24px rgba(249,115,22,0.6)) drop-shadow(0 8px 32px rgba(0,0,0,0.5))' }}>
            <img src={mascotImg} alt="Moo" className="w-28 h-28 object-contain relative z-10" loading="lazy" />
          </div>
        </div>
        <h2 className="font-display font-black text-5xl text-white mb-4 leading-tight">Your Healthiest Drive <span style={{ color: '#FBBF24' }}>Starts Now</span></h2>
        <p className="text-white/75 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">Join thousands of Filipino drivers turning their daily commute into a wellness opportunity. No gym, no extra time — just small movements that lead to a healthier life.</p>
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <Link to="/auth/register" className="inline-flex items-center gap-2 bg-moove-orange text-white font-bold px-9 py-4 rounded-full hover:bg-orange-400 transition-all shadow-xl shadow-orange-900/40 text-lg active:scale-95">Create Free Account <span aria-hidden>→</span></Link>
          <Link to="/auth/login" className="inline-flex items-center gap-2 bg-white/15 text-white font-bold px-9 py-4 rounded-full hover:bg-white/25 transition-all border border-white/30 text-lg active:scale-95">Sign In</Link>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/55">
          {['No payment required', 'Privacy First', 'AI Assisted', 'Responsive Everywhere', 'Preventive Only', 'TRL-4 Validated'].map(t => (
            <span key={t} className="flex items-center gap-1.5"><span className="text-moove-green">✓</span> {t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-moove-brown text-white/80 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <img src={logoImg} alt="MOOVE" className="h-10 w-auto mb-4 brightness-0 invert" />
            <p className="text-sm leading-relaxed text-white/60 max-w-xs mb-5">AI-powered micro-movement wellness for drivers. Turn every traffic stop into a healthier moment.</p>
            <div className="flex gap-3">
              {['𝕏', '📘', '📷', '💼'].map((s, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm cursor-pointer hover:bg-white/20 transition-colors" aria-label="Social link">{s}</div>
              ))}
            </div>
          </div>
          {[
            { heading: 'Platform', links: ['Features', 'How It Works', 'Exercises', 'Dashboard'] },
            { heading: 'Resources', links: ['Help Center', 'Exercise Library', 'Health Education', 'Community'] },
            { heading: 'Company', links: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'] },
          ].map(col => (
            <div key={col.heading}>
              <div className="font-display font-bold text-white text-sm mb-4 tracking-wide">{col.heading}</div>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(l => <li key={l}><a href="#" className="text-sm text-white/60 hover:text-moove-orange transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div>© 2026 MOOVE. All rights reserved.</div>
          <div className="flex items-center gap-1">Built with <span className="text-red-400 mx-1">❤️</span> for smarter mobility and healthier driving.</div>
        </div>
      </div>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Navbar />
      <Hero />
      <WhyMoo />
      <Marquee />
      <Stats />
      <Ecosystem />
      <WhoItsFor />
      <HowItWorks />
      <Safety />
      <FAQ />
      <AboutUs />
      <FinalCTA />
      <Footer />
    </div>
  )
}
