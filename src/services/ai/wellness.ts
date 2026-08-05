export type WellnessSummaryInput = {
  weeklyDrivingMinutes: number
  completedExercises: number
  completedSessions: number
  exerciseCompletionRate: number
  tiredAreas?: string[]
}

export type WellnessSummaryResponse = { summary: string; source: 'groq' | 'fallback' }

export async function fetchWellnessSummary(input: WellnessSummaryInput): Promise<WellnessSummaryResponse> {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  const response = await fetch(`${base}/api/ai/wellness-summary`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error('Unable to generate wellness summary')
  const data = await response.json() as WellnessSummaryResponse
  if (!data.summary || (data.source !== 'groq' && data.source !== 'fallback')) throw new Error('Invalid wellness summary response')
  return data
}
