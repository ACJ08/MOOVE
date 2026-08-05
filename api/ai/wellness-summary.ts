/** Vercel serverless endpoint. GROQ_API_KEY is server-only: never use a VITE_ prefix. */
type RequestBody = {
  weeklyDrivingMinutes: number
  completedExercises: number
  completedSessions: number
  exerciseCompletionRate: number
  tiredAreas?: string[]
}

const fallback = (data: RequestBody) => `This week you recorded ${data.weeklyDrivingMinutes} minutes of driving across ${data.completedSessions} session${data.completedSessions === 1 ? '' : 's'} and completed ${data.completedExercises} exercise${data.completedExercises === 1 ? '' : 's'}. Take movement breaks only when safely parked, and consult a qualified professional for any persistent pain or health concerns.`

function valid(body: unknown): body is RequestBody {
  if (!body || typeof body !== 'object') return false
  const value = body as Record<string, unknown>
  return ['weeklyDrivingMinutes', 'completedExercises', 'completedSessions', 'exerciseCompletionRate']
    .every(key => typeof value[key] === 'number' && Number.isFinite(value[key]) && (value[key] as number) >= 0)
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!valid(req.body)) return res.status(400).json({ error: 'Invalid wellness summary request' })
  const body = req.body as RequestBody
  const key = process.env.GROQ_API_KEY
  if (!key) return res.status(200).json({ summary: fallback(body), source: 'fallback' })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 9_000)
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', signal: controller.signal,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', temperature: 0.35, max_tokens: 150,
        messages: [
          { role: 'system', content: 'You are Moo, a preventive wellness coach for drivers. Write one concise, encouraging wellness summary. Do not diagnose, prescribe, claim medical outcomes, or give advice while driving. Recommend breaks only when safely parked. Plain text only.' },
          { role: 'user', content: JSON.stringify(body) },
        ],
      }),
    })
    if (!response.ok) throw new Error(`Groq returned ${response.status}`)
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const summary = data.choices?.[0]?.message?.content?.trim()
    if (!summary || summary.length > 1_000) throw new Error('Invalid Groq response')
    return res.status(200).json({ summary, source: 'groq' })
  } catch (error) {
    console.error('[wellness-summary] provider unavailable', error instanceof Error ? error.name : 'unknown')
    return res.status(200).json({ summary: fallback(body), source: 'fallback' })
  } finally { clearTimeout(timeout) }
}
