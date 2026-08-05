// Demo account sample data — realistic for a Filipino driver
export const mockDashboard = {
  todayDrivingTime: '2h 18m',
  todayDrivingMinutes: 138,
  todaySedentaryTime: '2h 05m',
  todaySedentaryMinutes: 125,
  movementStreak: 5,
  exercisesCompleted: 17,
  weeklyDrivingHours: 12.4,
  healthEngagementScore: 82,
  todaySuggestedExercise: 'Shoulder Rolls',
  aiRecommendation: "Great consistency this week! Before your next trip, try a 30-second Chin Tuck to reset your neck posture.",
  preventiveTip: "Prolonged sitting reduces circulation to the lower extremities. A 45-second ankle pump during your next red light can significantly reduce foot fatigue.",
}

export const mockWeeklyActivity = [
  { day: 'Mon', driving: 2.5, exercises: 3 },
  { day: 'Tue', driving: 1.8, exercises: 2 },
  { day: 'Wed', driving: 3.2, exercises: 4 },
  { day: 'Thu', driving: 2.0, exercises: 2 },
  { day: 'Fri', driving: 2.9, exercises: 3 },
  { day: 'Sat', driving: 0.5, exercises: 2 },
  { day: 'Sun', driving: 0.0, exercises: 1 },
]

export const mockSessions = [
  { id: 1, date: '2025-07-29', start: '07:32', end: '09:14', duration: '1h 42m', exercises: 2, route: 'Home → Office, Quezon City' },
  { id: 2, date: '2025-07-29', start: '18:05', end: '18:41', duration: '36m', exercises: 1, route: 'Office → Home, Quezon City' },
  { id: 3, date: '2025-07-28', start: '07:20', end: '09:45', duration: '2h 25m', exercises: 3, route: 'Home → EDSA → Makati CBD' },
  { id: 4, date: '2025-07-28', start: '17:30', end: '19:55', duration: '2h 25m', exercises: 3, route: 'Makati CBD → Home' },
  { id: 5, date: '2025-07-27', start: '09:00', end: '09:55', duration: '55m', exercises: 2, route: 'Home → SM Fairview' },
]

export const mockSedentaryWeek = [
  { day: 'Mon', sedentary: 138, goal: 120 },
  { day: 'Tue', sedentary: 95, goal: 120 },
  { day: 'Wed', sedentary: 162, goal: 120 },
  { day: 'Thu', sedentary: 108, goal: 120 },
  { day: 'Fri', sedentary: 145, goal: 120 },
  { day: 'Sat', sedentary: 42, goal: 120 },
  { day: 'Sun', sedentary: 0, goal: 120 },
]

export const mockAIInsights = [
  {
    id: 1,
    type: 'summary',
    icon: '📊',
    color: '#0EA5E9',
    title: 'Weekly Behavioral Summary',
    message: "You drove 12.4 hours this week — above your weekly average. Your longest session was 2 hours 25 minutes on Wednesday. Sedentary risk was highest mid-week.",
  },
  {
    id: 2,
    type: 'recommendation',
    icon: '🤖',
    color: '#A855F7',
    title: "Moo's Recommendation",
    message: "You've spent 90 minutes driving today. Consider taking a 30-second Shoulder Roll break before your next trip to relieve trapezius tension from steering wheel grip.",
  },
  {
    id: 3,
    type: 'encouragement',
    icon: '🔥',
    color: '#F97316',
    title: 'Great Consistency!',
    message: "You've completed 3 guided movements this week — you're building a healthy habit! Drivers who complete 3+ exercises per week report 40% less driving-related back pain.",
  },
  {
    id: 4,
    type: 'insight',
    icon: '💡',
    color: '#22C55E',
    title: 'Health Insight',
    message: "Your Wednesday session (2h 25m) exceeded the 90-minute sedentary threshold. Next time, set a reminder to take a Chin Tuck break every 45 minutes during long drives.",
  },
  {
    id: 5,
    type: 'exercise',
    icon: '🧘',
    color: '#FBBF24',
    title: "Today's Suggested Exercise",
    message: "Based on your 138-minute driving session today, Moo recommends Shoulder Rolls to relieve upper trapezius tension built up from steering wheel hold.",
  },
]

export const mockEducationArticles = [
  {
    id: 1,
    title: 'The Hidden Dangers of Prolonged Sitting While Driving',
    summary: 'Extended vehicle-based sedentary periods increase cardiovascular risk, lower back compression, and hip flexor shortening — even in otherwise active individuals.',
    readTime: '3 min read',
    emoji: '⚠️',
    color: '#F97316',
    content: `Prolonged sitting during driving exposes drivers to unique biomechanical stressors. Unlike desk-based sitting, driving involves sustained isometric muscle contractions — gripping the wheel, pressing pedals, and maintaining a fixed gaze — that accelerate fatigue and musculoskeletal strain.\n\nResearch indicates that every 45 minutes of continuous driving without a break raises the risk of lower back pain by 23%. Hip flexors shorten under sustained 90° flexion, reducing lumbar lordosis and increasing disc pressure. Combined with reduced lower extremity circulation, this creates a compounding sedentary burden.\n\nMOOVE's micro-intervention approach targets these exact mechanisms — delivering timed, context-aware exercises at moments that naturally exist in your driving routine, without requiring additional time in your schedule.`,
  },
  {
    id: 2,
    title: 'Why Small Movements Make a Big Difference',
    summary: 'Behavioral science shows that micro-interventions — exercises under 60 seconds — can be more sustainable than traditional exercise programs for drivers.',
    readTime: '4 min read',
    emoji: '💪',
    color: '#22C55E',
    content: `The science of behavior change reveals a counterintuitive truth: smaller, more frequent movements outperform longer, less frequent exercise sessions for sedentary populations.\n\nMicro-interventions exploit "habit stacking" — attaching a new behavior to an existing cue. For drivers, the red light becomes the cue. A 45-second shoulder roll becomes the behavior. Over time, the cue automatically triggers the wellness action without conscious effort.\n\nStudies in occupational health show that drivers who practice 3–5 micro-movements daily report a 34% reduction in musculoskeletal discomfort within 4 weeks. The key is consistency over intensity — a principle embedded in every MOOVE exercise.`,
  },
  {
    id: 3,
    title: 'Safe Stretching Practices for Drivers: What You Need to Know',
    summary: 'Not all stretches are safe in all driving contexts. Understanding safety contexts is essential before attempting any in-vehicle movement.',
    readTime: '5 min read',
    emoji: '🛡️',
    color: '#0EA5E9',
    content: `MOOVE classifies every exercise by four driving contexts: Traffic (Red Light), Parked, Before Driving, and After Driving. This matrix is the foundation of MOOVE's safety-first approach.\n\nSafe-in-traffic exercises maintain forward vision and hands on the steering wheel at all times. Examples include Chin Tucks, Shoulder Rolls, and Seated Lateral Lumbar Side Stretches — all of which can be performed without reducing driving readiness.\n\nExercises classified as "Parked Only" require both hands free or foot removal from pedal readiness. Attempting these while driving is strictly prohibited. MOOVE's context-aware system ensures only appropriate exercises are surfaced based on your reported driving state.`,
  },
  {
    id: 4,
    title: 'Preventive Health: The Proactive Approach to Driver Wellness',
    summary: 'Preventive health focuses on maintaining well-being before symptoms arise — a paradigm shift particularly valuable for Filipino drivers who spend hours on the road daily.',
    readTime: '3 min read',
    emoji: '🩺',
    color: '#A855F7',
    content: `Preventive health operates on the principle that maintaining wellness is easier and more effective than treating illness. For Filipino drivers facing Metro Manila's average 66-minute daily commute, this proactive approach is especially critical.\n\nRather than waiting for back pain to become chronic, preventive micro-movements address the root biomechanical causes before symptoms escalate. Regular preventive engagement also builds body awareness — drivers become more attuned to posture cues, fatigue signals, and the right moment to take a break.\n\nMOOVE is designed exclusively around preventive wellness. It does not diagnose conditions or prescribe treatment. All recommendations are evidence-informed behavioral interventions aimed at reducing sedentary health risk in the context of everyday driving.`,
  },
]
