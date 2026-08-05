import { useState } from 'react'
import mascotImg from '@/imports/_MASCOT_REMOVE_BG__MOOVE_CHARACTER.png'

const QUESTIONS = [
  { id: 1, category: 'First Impressions', question: 'What are your first impressions when you open the MOOVE application?', prompt: 'Think out loud — describe what you see, what you feel, and what you notice first.' },
  { id: 2, category: 'Interface Understanding', question: 'Looking at the interface, what do you think this application is meant to do?', prompt: 'Tell us what you understand about the app\'s purpose just from looking at it.' },
  { id: 3, category: 'Feature Discovery', question: 'Which feature or section stands out to you the most?', prompt: 'Explore the app and describe what catches your attention.' },
  { id: 4, category: 'AI Recommendations', question: 'Why do you think the AI recommended that specific exercise for you?', prompt: 'Look at the AI Recommendations section — what\'s your interpretation of the suggestion?' },
  { id: 5, category: 'Usability', question: 'Was there anything confusing or unclear while navigating the app?', prompt: 'Describe any moments where you felt lost or uncertain about what to do next.' },
  { id: 6, category: 'Exercise Flow', question: 'Walk us through how you would perform the Shoulder Rolls exercise using MOOVE.', prompt: 'Open the Guided Exercises and think aloud as you navigate through it.' },
  { id: 7, category: 'Dashboard Understanding', question: 'What does the Dashboard tell you about your health today?', prompt: 'Look at your Dashboard and describe what information you find most useful.' },
  { id: 8, category: 'Realistic Use', question: 'Would you realistically use MOOVE while driving? Why or why not?', prompt: 'Be honest — describe the scenarios where you would or would not use this app.' },
  { id: 9, category: 'Safety Perception', question: 'Do you feel the safety guidelines in MOOVE are clear enough?', prompt: 'Review the safety context badges on exercises and share your perception.' },
  { id: 10, category: 'Overall Impression', question: 'After exploring MOOVE, what would you change or keep the same?', prompt: 'Give your honest final impression of the application.' },
]

interface ResponseEntry {
  sessionId: string
  participantId: string
  questionId: number
  question: string
  response: string
  timestamp: string
  duration: number
}

function loadResponses(): ResponseEntry[] {
  try { return JSON.parse(localStorage.getItem('moove_thinkaloud_responses') || '[]') } catch { return [] }
}

function saveResponse(entry: ResponseEntry) {
  const existing = loadResponses()
  localStorage.setItem('moove_thinkaloud_responses', JSON.stringify([...existing, entry]))
}

export default function ThinkAloud() {
  const [participantId, setParticipantId] = useState('')
  const [sessionId] = useState(() => `ta_${Date.now()}`)
  const [currentQ, setCurrentQ] = useState(0)
  const [response, setResponse] = useState('')
  const [responses, setResponses] = useState<ResponseEntry[]>([])
  const [started, setStarted] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [completed, setCompleted] = useState(false)
  const [moderatorNote, setModeratorNote] = useState('')

  const handleStart = () => {
    if (!participantId.trim()) return
    setStarted(true)
    setQuestionStartTime(Date.now())
  }

  const handleNext = () => {
    const duration = Math.round((Date.now() - questionStartTime) / 1000)
    const entry: ResponseEntry = {
      sessionId,
      participantId,
      questionId: QUESTIONS[currentQ].id,
      question: QUESTIONS[currentQ].question,
      response: response.trim(),
      timestamp: new Date().toISOString(),
      duration,
    }
    saveResponse(entry)
    setResponses(prev => [...prev, entry])

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1)
      setResponse('')
      setModeratorNote('')
      setQuestionStartTime(Date.now())
    } else {
      setCompleted(true)
    }
  }

  if (completed) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex flex-col items-center text-center gap-6 min-h-[60vh] justify-center">
        <div className="animate-float">
          <img src={mascotImg} alt="Moo" className="w-28 h-28 object-contain" style={{ filter: 'drop-shadow(0 8px 24px rgba(34,197,94,0.3))' }} />
        </div>
        <div>
          <h2 className="font-display font-black text-2xl text-moove-brown mb-2">Session Complete! 🎉</h2>
          <p className="text-moove-muted text-sm">Think-aloud session for <strong>{participantId}</strong> has been recorded. {responses.length} responses saved.</p>
        </div>
        <div className="bg-white rounded-2xl p-5 w-full card-shadow">
          <div className="text-xs font-bold text-moove-muted mb-3">SESSION SUMMARY</div>
          <div className="flex flex-col gap-2">
            {responses.map(r => (
              <div key={r.questionId} className="text-left p-3 rounded-xl bg-moove-cream">
                <div className="text-xs font-bold text-moove-brown mb-0.5">Q{r.questionId}: {r.question.slice(0, 60)}…</div>
                <div className="text-xs text-moove-muted">{r.response ? `"${r.response.slice(0, 80)}${r.response.length > 80 ? '…' : ''}"` : '(No response)'}</div>
                <div className="text-xs text-moove-orange mt-0.5">{r.duration}s</div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => { setStarted(false); setCompleted(false); setCurrentQ(0); setResponses([]); setParticipantId(''); setResponse('') }}
          className="bg-moove-orange text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-all active:scale-95"
        >
          Start New Session
        </button>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-7">
          <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Think-Aloud Testing</h1>
          <p className="text-sm text-moove-muted">Moderator mode — facilitates usability testing sessions with participants.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-xs text-amber-700">
          <div className="font-bold mb-1">🎤 Moderator Instructions</div>
          <ul className="space-y-1 list-disc list-inside leading-relaxed">
            <li>Ask the participant to think aloud while interacting with MOOVE</li>
            <li>Do not guide or suggest answers — let them explore naturally</li>
            <li>Record verbatim responses or key observations in the text area</li>
            <li>Use the moderator note field for your own observations (not stored in participant data)</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow">
          <h2 className="font-display font-bold text-moove-brown mb-4">Session Setup</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-moove-brown mb-1.5">Participant ID *</label>
              <input
                type="text"
                placeholder="e.g. P001, Participant_1, etc."
                value={participantId}
                onChange={e => setParticipantId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-moove-border text-sm text-moove-brown focus:outline-none focus:ring-2 focus:ring-moove-orange/40 focus:border-moove-orange"
              />
              <p className="text-xs text-moove-muted mt-1">Use an anonymous ID — do not include personally identifiable information.</p>
            </div>
            <div className="bg-moove-cream rounded-xl p-4">
              <div className="text-xs font-bold text-moove-brown mb-2">Session Info</div>
              <div className="text-xs text-moove-muted flex flex-col gap-1">
                <span>Session ID: <code className="font-mono text-moove-brown">{sessionId}</code></span>
                <span>Questions: {QUESTIONS.length} questions across {new Set(QUESTIONS.map(q => q.category)).size} categories</span>
                <span>Estimated duration: 15–20 minutes</span>
              </div>
            </div>
            <button
              onClick={handleStart}
              disabled={!participantId.trim()}
              className="bg-moove-orange text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              ▶ Start Think-Aloud Session
            </button>
          </div>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[currentQ]
  const progress = ((currentQ) / QUESTIONS.length) * 100

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-xs font-bold text-moove-muted">Participant: {participantId}</div>
          <h1 className="font-display font-bold text-moove-brown">Think-Aloud Testing</h1>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-moove-muted">Question</div>
          <div className="font-display font-black text-2xl text-moove-brown">{currentQ + 1} / {QUESTIONS.length}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-moove-border rounded-full overflow-hidden mb-6">
        <div className="h-full bg-moove-orange rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="bg-white rounded-2xl p-6 card-shadow mb-4">
        <div className="text-xs font-bold text-moove-orange mb-1 tracking-wide">{q.category.toUpperCase()}</div>
        <h2 className="font-display font-bold text-xl text-moove-brown mb-3 leading-snug">{q.question}</h2>
        <div className="bg-blue-50 rounded-xl p-3 mb-5 text-xs text-blue-700">
          💡 <span className="font-semibold">Prompt for participant: </span>{q.prompt}
        </div>

        <label className="block text-xs font-bold text-moove-brown mb-1.5">Participant Response (verbatim or summary)</label>
        <textarea
          value={response}
          onChange={e => setResponse(e.target.value)}
          placeholder="Record what the participant says while thinking aloud…"
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-moove-border text-sm text-moove-brown placeholder:text-moove-muted/60 focus:outline-none focus:ring-2 focus:ring-moove-orange/40 focus:border-moove-orange resize-none transition-all mb-4"
        />

        <label className="block text-xs font-bold text-moove-muted mb-1.5">Moderator Note (not stored)</label>
        <textarea
          value={moderatorNote}
          onChange={e => setModeratorNote(e.target.value)}
          placeholder="Your personal observation or note for this question…"
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-dashed border-moove-border text-sm text-moove-brown placeholder:text-moove-muted/60 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none transition-all"
        />
      </div>

      <div className="flex gap-3">
        {currentQ > 0 && (
          <button
            onClick={() => { setCurrentQ(q => q - 1); setResponse('') }}
            className="px-5 py-3 rounded-xl border border-moove-border text-sm font-bold text-moove-muted hover:bg-moove-cream transition-all"
          >
            ← Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 bg-moove-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-all active:scale-95 shadow-md text-sm"
        >
          {currentQ < QUESTIONS.length - 1 ? 'Next Question →' : 'Complete Session ✓'}
        </button>
      </div>
    </div>
  )
}
