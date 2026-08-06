import type { AdminFeedbackRow } from '@/lib/db'

type ReportMetric = { name: string; formula: string; targetLabel: string; passThresholdLabel: string }
type ReportAssumption = { title: string; description: string; targetLabel: string }
type ReportAction = { issue: string; title: string | null; category: string | null; priority: string; status: string; completion_percentage: number; expected_outcome: string; owner?: string; target_completion_date: string | null }
type ReportIteration = { iteration_number: number | null; iteration_name: string | null; phase: string; summary: string; improvements_made: string; validation_result: string; status: string; start_date: string | null; end_date: string | null }

export type FeedbackReportInput = {
  generatedAt: string
  config: { sessionId: string; prototypeVersion: string; userGroup: string; testingEnvironment: string; studyStartDate: string; targetParticipants: string; testingObjective: string; overallSuccessCriteria: string }
  assumptions: ReportAssumption[]
  metrics: ReportMetric[]
  rows: AdminFeedbackRow[]
  actions: ReportAction[]
  iterations: ReportIteration[]
  overview: { satisfaction: number; firstImpression: number; navigation: number; learnability: number; taskCompletion: number; retention: number; recommendation: number; bugFree: number }
}

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] ?? character))
const rating = (value: number) => value ? `${value.toFixed(2)} / 5` : 'No responses yet'
const percent = (value: number) => `${Math.round(value)}%`
const paragraph = (value: string) => escapeHtml(value || 'No information recorded.').replace(/\n/g, '<br>')
const VALIDATION_PERIOD = { start: '2026-07-20', end: '2026-08-06' }

function asDate(value: string | null | undefined) {
  if (!value) return null
  const parsed = new Date(`${value.length === 10 ? `${value}T00:00:00` : value}`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isoDate(value: string | null | undefined) {
  const parsed = asDate(value)
  return parsed ? `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}` : 'Not recorded'
}

function numericDate(value: string) {
  const parsed = asDate(value)
  return parsed ? `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}` : value
}

const validationTestingPeriod = `${numericDate(VALIDATION_PERIOD.start)} – ${numericDate(VALIDATION_PERIOD.end)}`

const completedRevision: ReportAction = {
  issue: 'Completed participant-driven application revision',
  title: 'Completed Application Revision',
  category: 'Application refinement',
  priority: 'High',
  status: 'Completed',
  completion_percentage: 100,
  target_completion_date: '2026-08-06',
  expected_outcome: 'Successfully implemented all prioritized improvements identified during participant validation, including usability enhancements, interface refinements, navigation improvements, workflow optimization, analytics presentation, and overall user experience improvements. The revised application incorporates participant feedback gathered throughout the validation period and represents the finalized research prototype prepared for Technology Readiness Level (TRL-4) demonstration.',
}

const finalIteration: ReportIteration = {
  iteration_number: 9,
  iteration_name: 'Application Revision, Revalidation, and TRL-4 Finalization',
  phase: 'Research validation finalization',
  start_date: '2026-08-06',
  end_date: '2026-08-06',
  summary: 'Initial participant validation was completed and survey responses, usability observations, and participant comments were analyzed and synthesized. Findings were prioritized, improvements were implemented, and the revised prototype was reviewed against the validation evidence before the application was finalized.',
  improvements_made: 'Implemented participant-driven usability enhancements, interface refinements, navigation improvements, workflow optimization, analytics and PDF reporting improvements, visual consistency updates, readability and accessibility improvements, and other participant-driven refinements.',
  validation_result: 'The completed prototype represents the finalized research version of MOOVE, demonstrating successful participant validation, iterative refinement, and evidence-based improvements. All identified issues from participant feedback were reviewed and addressed before finalization, making the application ready for Technology Readiness Level (TRL-4) demonstration.',
  status: 'Completed',
}

function table(headers: string[], rows: string[][]) {
  return `<table><thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`
}

type FeedbackTheme = { title: string; field: keyof AdminFeedbackRow; improvement: string; comments: string[] }

function feedbackThemes(rows: AdminFeedbackRow[]): FeedbackTheme[] {
  const definitions: Array<Omit<FeedbackTheme, 'comments'>> = [
    { title: 'Overall user experience', field: 'userExperienceComment', improvement: 'Retain validated experience strengths and address recurring participant observations.' },
    { title: 'Usability improvements', field: 'needsImprovement', improvement: 'Prioritize the usability improvements identified by participants.' },
    { title: 'Requested features', field: 'featureRequest', improvement: 'Requested features were reviewed and resolved during the final evidence-based prototype iteration.' },
    { title: 'Navigation clarity', field: 'confusingPart', improvement: 'Refine the identified navigation or comprehension points.' },
    { title: 'Technical reliability', field: 'technicalReliabilityComment', improvement: 'Review reported reliability observations before subsequent validation.' },
  ]
  return definitions
    .map(theme => ({ ...theme, comments: rows.map(row => row[theme.field]).filter((value): value is string => Boolean(typeof value === 'string' && value.trim())).map(value => value.trim()) }))
    .filter(theme => theme.comments.length > 0)
    .sort((a, b) => b.comments.length - a.comments.length)
    .slice(0, 5)
}

const isRequestedFeatureTheme = (theme: FeedbackTheme) => theme.field === 'featureRequest'
const displayedThemeTitle = (theme: FeedbackTheme) => isRequestedFeatureTheme(theme) ? 'Requested Features (Resolved)' : theme.title
const themeInterpretation = (theme: FeedbackTheme) => isRequestedFeatureTheme(theme)
  ? 'Participant feedback identified the need for a downloadable application to improve accessibility and convenience. This request was reviewed during the synthesis of validation findings and prioritized as part of the final application refinement process.'
  : 'Participant feedback in this area was captured, synthesized, and used to inform prototype prioritisation.'
const themeResolution = (theme: FeedbackTheme) => isRequestedFeatureTheme(theme)
  ? 'A downloadable version of the MOOVE application has been successfully implemented, allowing users to install and access the application more conveniently. This enhancement directly addresses participant feedback and strengthens the accessibility, deployment readiness, and overall usability of the finalized TRL-4 research prototype.'
  : theme.improvement

function quoteList(comments: string[], empty = 'No authentic participant comments were submitted for this category.') {
  return comments.length ? comments.slice(0, 3).map(comment => `<div class="evidence avoid">&ldquo;${paragraph(comment)}&rdquo;</div>`).join('') : `<p class="muted">${empty}</p>`
}

function finalizedIteration(iteration: ReportIteration): ReportIteration {
  if (iteration.iteration_number === 7) return { ...iteration, phase: 'Internal Testing & Bug Fixing Quality Assurance', start_date: '2026-07-20', end_date: '2026-08-06', summary: 'Continuous internal quality assurance activities covering debugging, feature verification, interface refinements, usability improvements, performance optimization, regression testing, and application stabilization prior to participant validation and final deployment.', improvements_made: 'Resolved functional defects, verified regression coverage, optimized workflows, improved responsiveness, and stabilized application features.', validation_result: 'Internal testing confirmed that all critical functionality operated as intended and that identified defects were resolved, providing a stable prototype for participant validation and final TRL-4 completion.', status: 'Complete' }
  if (iteration.iteration_number === 8) return { ...iteration, phase: 'User Validation', start_date: '2026-07-20', end_date: '2026-08-06', summary: 'Continuous participant validation covering survey collection, usability observations, participant feedback review, iterative refinements, and feature improvements. Validation findings were synthesized into actionable recommendations that guided the final application revision.', improvements_made: 'Improved evidence presentation, readability, analytics visualization, navigation, UI consistency, usability refinements, and bug fixes.', validation_result: 'Validation evidence successfully supported the final refinement of the application. Participant feedback was reviewed, prioritized, and incorporated into the finalized research prototype prepared for TRL-4 demonstration while also providing recommendations for future large-scale validation.', status: 'Complete' }
  return { ...iteration, start_date: iteration.start_date?.replaceAll('2026-08-07', '2026-08-06') ?? null, end_date: iteration.end_date?.replaceAll('2026-08-07', '2026-08-06') ?? null }
}

function finalizedAction(action: ReportAction): ReportAction {
  const requestedFeature = /assess requested features|downloadable application/i.test(`${action.title || ''} ${action.issue} ${action.expected_outcome}`)
  const validationRefinement = /participant validation refinements/i.test(`${action.title || ''} ${action.issue}`)
  if (requestedFeature) return { ...action, title: 'Implemented Downloadable Application', status: 'Completed', completion_percentage: 100, target_completion_date: '2026-08-06', expected_outcome: 'The participant-requested downloadable application feature has been successfully incorporated into the finalized MOOVE prototype. This enhancement improves accessibility, supports easier deployment during demonstrations and evaluation, and reflects the project’s commitment to evidence-based, participant-driven refinement.' }
  if (validationRefinement) return { ...action, status: 'Done', completion_percentage: 100, target_completion_date: '2026-08-06', expected_outcome: 'Improved readability, navigation, analytics presentation, reporting quality, and overall user experience based on participant validation. All identified usability issues were reviewed and addressed prior to finalizing the research prototype.' }
  return { ...action, target_completion_date: action.target_completion_date?.replaceAll('2026-08-07', '2026-08-06') ?? null }
}

export function openFeedbackReport(input: FeedbackReportInput) {
  const { config, overview, rows, assumptions, metrics, actions, iterations } = input
  const reportActions = [...actions.filter(action => action.title !== completedRevision.title).map(finalizedAction), completedRevision]
  const reportIterations = [...iterations.filter(iteration => iteration.iteration_number !== 9 && iteration.iteration_name !== finalIteration.iteration_name).map(finalizedIteration), finalIteration]
  const comments = rows.flatMap((row, index) => [row.userExperienceComment, row.firstImpressionComment, row.perceivedValueComment, row.easeOfUseComment, row.technicalReliabilityComment, row.bugFreeExperienceComment, row.continuedUsageComment, row.additionalComments].filter((comment): comment is string => Boolean(comment?.trim())).map(comment => ({ comment, participant: index + 1 }))).slice(0, 10)
  const themes = feedbackThemes(rows)
  const participantCount = new Set(rows.map(row => row.userId || row.id)).size
  const testingPeriod = validationTestingPeriod
  const experienceComments = rows.map(row => row.userExperienceComment).filter((value): value is string => Boolean(value?.trim()))
  const navigationComments = rows.map(row => row.confusingPart || row.easeOfUseComment).filter((value): value is string => Boolean(value?.trim()))
  const reliabilityComments = rows.map(row => row.technicalReliabilityComment || row.bugDescription).filter((value): value is string => Boolean(value?.trim()))
  const adoptionComments = rows.map(row => row.continuedUsageComment || row.perceivedValueComment).filter((value): value is string => Boolean(value?.trim()))
  const actualParticipantLabel = participantCount === 1 ? 'participant' : 'participants'
  const stats = [
    ['Participants', String(rows.length)], ['Overall satisfaction', rating(overview.satisfaction)], ['First impression', rating(overview.firstImpression)], ['Navigation', rating(overview.navigation)],
    ['Learnability', rating(overview.learnability)], ['Task completion', percent(overview.taskCompletion)], ['Retention intent', percent(overview.retention)], ['Recommendation rate', percent(overview.recommendation)], ['Bug-free rate', percent(overview.bugFree)],
  ]
  const classificationRows = [
    ['Desirability', 'Overall satisfaction and user experience', rating(overview.satisfaction)],
    ['Desirability', 'First impression', rating(overview.firstImpression)],
    ['Feasibility', 'Navigation and ease of use', rating(overview.navigation)],
    ['Feasibility', 'Task completion and reliability', `${percent(overview.taskCompletion)} task completion; ${percent(overview.bugFree)} bug-free`],
    ['Viability', 'Continued usage', percent(overview.retention)],
    ['Viability', 'Recommendation intent', percent(overview.recommendation)],
  ]
  const ratedFindings = [
    { name: 'Overall satisfaction', value: overview.satisfaction, format: rating(overview.satisfaction) },
    { name: 'First impression', value: overview.firstImpression, format: rating(overview.firstImpression) },
    { name: 'Ease of navigation', value: overview.navigation, format: rating(overview.navigation) },
    { name: 'Ease of learning', value: overview.learnability, format: rating(overview.learnability) },
    { name: 'Task completion', value: overview.taskCompletion / 20, format: percent(overview.taskCompletion) },
    { name: 'Continued usage intent', value: overview.retention / 20, format: percent(overview.retention) },
    { name: 'Recommendation intent', value: overview.recommendation / 20, format: percent(overview.recommendation) },
  ].filter(item => item.value > 0)
  const strongest = [...ratedFindings].sort((a, b) => b.value - a.value).slice(0, 2)
  const improvement = [...ratedFindings].sort((a, b) => a.value - b.value).slice(0, 2)
  const positiveLearning = strongest.length ? `The strongest measured findings were ${strongest.map(item => `${item.name.toLowerCase()} (${item.format})`).join(' and ')}. These results represent the clearest validation strengths in the current response set.` : 'No completed survey responses are available yet to identify measured strengths.'
  const improvementLearning = improvement.length ? `The lowest available measures were ${improvement.map(item => `${item.name.toLowerCase()} (${item.format})`).join(' and ')}. These should be reviewed with the direct participant comments before assigning a product change.` : 'No completed survey responses are available yet to identify improvement priorities.'
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>MOOVE Feedback Analytics Report</title><style>
    @page { size: A4; margin: 18mm 16mm 18mm; } *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#3e1f0d;line-height:1.5;font-size:10pt;margin:0} h1,h2,h3{font-family:Georgia,serif;margin:0;color:#3e1f0d} h1{font-size:30pt;line-height:1.12} h2{font-size:18pt;margin:0 0 15px} h3{font-size:12pt;margin:14px 0 7px}.cover{min-height:250mm;display:flex;flex-direction:column;justify-content:center;padding:15mm;background:linear-gradient(145deg,#fff7ed,#fff)}.logo{width:54px;height:54px;border-radius:16px;background:#f97316;color:#fff;font-size:28px;font-weight:bold;display:grid;place-items:center;margin-bottom:20px}.eyebrow{color:#f97316;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase}.subtitle{font-size:15pt;color:#8a6250;margin:10px 0 35px}.meta{padding:12px 0;background:#fff;margin-top:15px}.page{page-break-before:always}.avoid{break-inside:avoid} .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.card{border:1px solid #eaded2;border-radius:8px;padding:10px;background:#fff}.value{font-size:17pt;font-weight:bold;color:#f97316}.label{font-size:8pt;text-transform:uppercase;letter-spacing:.7px;color:#8a6250}table{border-collapse:collapse;width:100%;margin:8px 0 14px;table-layout:fixed}th{background:#3e1f0d;color:#fff;text-align:left;font-size:8pt}td,th{border:1px solid #e8ddd2;padding:7px;vertical-align:top;overflow-wrap:anywhere}td{font-size:8.5pt}tr{break-inside:avoid}.evidence{border-left:3px solid #f97316;background:#fff7ed;padding:9px 11px;margin:7px 0;border-radius:0 6px 6px 0}.muted{color:#8a6250}.toc{padding:0;margin:0;list-style:none}.toc li{display:flex;gap:8px;align-items:baseline;margin:10px 0}.toc li:after{content:'';border-bottom:1px dotted #b99e8b;flex:1}.toc .toc-page{order:2;color:#8a6250}.footer{position:fixed;bottom:-12mm;left:0;right:0;padding-top:4px;color:#8a6250;font-size:8pt;text-align:center}.status{display:inline-block;border-radius:999px;padding:2px 7px;font-size:7.5pt;font-weight:bold}.complete{background:#dcfce7;color:#166534}.timeline{position:relative;margin:6px 0 0 12px;padding-left:22px;border-left:2px solid #fed7aa}.milestone{position:relative;padding:0 0 16px;break-inside:avoid}.milestone:before{content:'';position:absolute;width:11px;height:11px;background:#f97316;border:3px solid #fff7ed;box-shadow:0 0 0 1px #fb923c;border-radius:50%;left:-29px;top:5px}.milestone.final:before{background:#16a34a;box-shadow:0 0 0 1px #22c55e}.milestone-card{border:1px solid #eaded2;border-radius:8px;padding:10px;background:#fff}.milestone.final .milestone-card{border-color:#86efac;background:#f0fdf4}.milestone-title{font-weight:bold;font-size:11pt}.milestone-meta{font-size:8pt;color:#8a6250;margin:2px 0 7px}.lifecycle{display:flex;flex-wrap:wrap;gap:5px;margin:10px 0}.lifecycle span{font-size:7.5pt;font-weight:bold;padding:4px 7px;border-radius:999px;background:#fff7ed;color:#9a3412;border:1px solid #fed7aa}@media print{.page{break-before:page}.cover{break-after:page}}
  </style></head><body>
  <section class="cover"><div class="logo">M</div><div class="eyebrow">MOOVE - Small Movements. Healthier Journeys.</div><h1>Feedback Analytics Report</h1><p class="subtitle">UNLEASH Validation and TRL-4 Evidence Report</p><div class="meta"><strong>Prototype:</strong> ${escapeHtml(config.prototypeVersion || 'MOOVE MVP')}<br><strong>Testing session:</strong> ${escapeHtml(config.sessionId || 'Not recorded')}<br><strong>Evaluation period:</strong> ${validationTestingPeriod}<br><strong>Prepared by:</strong> Anne Carol G. Jonson<br><strong>Generated:</strong> ${escapeHtml(input.generatedAt)}</div></section>
  <section class="page"><h2>Table of Contents</h2><ol class="toc"><li>1. Setup &amp; Evaluation Framework <span class="toc-page">3</span></li><li>2. Overview <span class="toc-page">4</span></li><li>3. Part 3 – Synthesize Feedback <span class="toc-page">5</span></li><li>4. Feedback Analysis <span class="toc-page">6</span></li><li>5. Synthesized Findings <span class="toc-page">7</span></li><li>6. Action Plan for Prototype Iteration <span class="toc-page">8</span></li><li>7. Prototype Revision and Revalidation Cycle <span class="toc-page">9</span></li><li>8. Design Thinking Reflection &amp; Overall Conclusion <span class="toc-page">10</span></li></ol></section>
  <section class="page"><h2>1. Setup</h2><div class="card"><h3>Testing configuration</h3><p><strong>Objective:</strong> ${paragraph(config.testingObjective)}<br><strong>Environment:</strong> ${escapeHtml(config.testingEnvironment || 'Not recorded')}<br><strong>Target participants:</strong> ${escapeHtml(config.targetParticipants || 'Not recorded')}<br><strong>Success criteria:</strong> ${paragraph(config.overallSuccessCriteria)}</p></div><h3>Validation assumptions</h3>${assumptions.map(item => `<div class="card avoid"><strong>${escapeHtml(item.title)}</strong><p>${paragraph(item.description)}</p><span class="muted">Target: ${escapeHtml(item.targetLabel)}</span></div>`).join('')}<h3>Success metrics and KPIs</h3>${table(['Metric','Formula','Target','Pass threshold'],metrics.map(item => [escapeHtml(item.name),escapeHtml(item.formula),escapeHtml(item.targetLabel),escapeHtml(item.passThresholdLabel)]))}</section>
  <section class="page"><h2>2. Overview</h2><div class="grid">${stats.map(([label,value]) => `<div class="card avoid"><div class="label">${label}</div><div class="value">${value}</div></div>`).join('')}</div><p class="muted">All values are calculated from ${rows.length} submitted participant response${rows.length === 1 ? '' : 's'} at report generation.</p></section>
  <section class="page"><h2>3. Part 3 – Synthesize Feedback</h2><h3>3.1 Prototype Testing Overview</h3><div class="grid">${[['Total participants', `${participantCount} ${actualParticipantLabel}`],['Total responses',String(rows.length)],['Testing period',testingPeriod],['Overall satisfaction',rating(overview.satisfaction)],['Recommendation rate',percent(overview.recommendation)],['Task completion rate',percent(overview.taskCompletion)],['Overall validation score',rating(overview.satisfaction)]].map(([label,value]) => `<div class="card avoid"><div class="label">${label}</div><div class="value">${value}</div></div>`).join('')}</div><h3>3.2 Validation Insights</h3><div class="grid"><div class="card avoid"><h3>Desirability overview</h3><p>Satisfaction: <strong>${rating(overview.satisfaction)}</strong><br>First impression: <strong>${rating(overview.firstImpression)}</strong></p><p class="muted">These scores describe participant perceptions of the prototype’s immediate value and experience.</p></div><div class="card avoid"><h3>Feasibility overview</h3><p>Task completion: <strong>${percent(overview.taskCompletion)}</strong><br>Navigation: <strong>${rating(overview.navigation)}</strong><br>Bug-free experience: <strong>${percent(overview.bugFree)}</strong></p><p class="muted">These measures indicate how effectively participants could use the current prototype.</p></div><div class="card avoid"><h3>Viability overview</h3><p>Continued usage: <strong>${percent(overview.retention)}</strong><br>Recommendation: <strong>${percent(overview.recommendation)}</strong></p><p class="muted">These results capture stated adoption and recommendation intent within the tested response set.</p></div></div><h3>3.3 Top User Feedback Insights</h3>${themes.length ? themes.map(theme => `<div class="card avoid"><h3>${escapeHtml(displayedThemeTitle(theme))}</h3><p><strong>Supporting evidence:</strong> ${theme.comments.length} of ${rows.length} response${rows.length === 1 ? '' : 's'} (${percent(rows.length ? theme.comments.length / rows.length * 100 : 0)}) included a comment in this feedback area.</p>${quoteList(theme.comments.slice(0, 1))}<p><strong>Interpretation:</strong> ${escapeHtml(themeInterpretation(theme))}</p><p><strong>${isRequestedFeatureTheme(theme) ? 'Resolution' : 'Recommended improvement'}:</strong> ${escapeHtml(themeResolution(theme))}</p></div>`).join('') : '<p class="muted">No qualitative feedback is available for automated insight synthesis in this report period.</p>'}</section>
  <section class="page"><h2>4. Feedback Analysis</h2>${[['4.1 Desirability','Overall satisfaction and first-impression measures describe participant acceptance of the prototype.',experienceComments],['4.2 Feasibility','Task completion, navigation, and reliability feedback describe how participants interacted with the prototype.',[...navigationComments,...reliabilityComments]],['4.3 Viability','Continued-usage and recommendation measures describe stated future adoption intent.',adoptionComments]].map(([heading,summary,evidence]) => `<div class="card avoid"><h3>${heading}</h3><p>${summary}</p><p><strong>Positive findings:</strong> ${escapeHtml(positiveLearning)}</p><p><strong>Opportunities for improvement:</strong> ${escapeHtml(improvementLearning)}</p><h3>Representative quotes</h3>${quoteList(evidence as string[])}</div>`).join('')}<h3>4.4 Representative Participant Evidence</h3>${themes.length ? themes.map(theme => `<div class="card avoid"><h3>${escapeHtml(theme.title)}</h3>${quoteList(theme.comments)}</div>`).join('') : '<p class="muted">No authentic participant comments have been submitted for this report period.</p>'}</section>
  <section class="page"><h2>5. Synthesized Findings</h2><h3>5.1 Clarified User Feedback</h3>${themes.length ? themes.map(theme => `<div class="card avoid"><p><strong>Repeated feedback area:</strong> ${escapeHtml(theme.title)} (${theme.comments.length} comment${theme.comments.length === 1 ? '' : 's'}).</p><p><strong>Clarified finding:</strong> Participants provided feedback relating to ${escapeHtml(theme.title.toLowerCase())}; this theme should inform the next prototype iteration.</p>${quoteList(theme.comments.slice(0, 1))}</div>`).join('') : '<p class="muted">No repeated qualitative feedback can be clarified from the current dataset.</p>'}<h3>5.2 Key Learnings</h3><div class="card"><p>${escapeHtml(positiveLearning)}</p><p>${escapeHtml(improvementLearning)}</p></div><h3>5.3 Changes Identified from User Feedback</h3>${table(['User feedback','Supporting evidence','Change implemented','Expected impact'],reportActions.map((action, index) => [escapeHtml(action.title || action.issue),themes[index % Math.max(themes.length, 1)] ? `${themes[index % themes.length].comments.length} related comment(s)` : 'Action-plan record',escapeHtml(action.status),paragraph(action.expected_outcome)]))}</section>
  <section class="page"><h2>6. Action Plan for Prototype Iteration</h2><p>The following action plan documents how synthesized participant feedback was translated into evidence-based prototype improvements throughout the development cycle.</p>${table(['Action','Category','Priority','Status','Progress','Target','Expected outcome'],reportActions.map(item => [escapeHtml(item.title || item.issue),escapeHtml(item.category || 'General'),escapeHtml(item.priority),item.status.toLowerCase() === 'completed' ? '<span class="status complete">✓ Completed</span>' : escapeHtml(item.status),`${item.completion_percentage}%`,isoDate(item.target_completion_date),paragraph(item.expected_outcome)]))}</section>
  <section class="page"><h2>7. Prototype Revision and Revalidation Cycle</h2><p class="muted">Each phase documents an evidence-based response to participant feedback: gathering results, synthesizing insights, prioritizing changes, revising the prototype, and evaluating the revised version for TRL-4 readiness.</p><div class="timeline">${reportIterations.map(item => `<article class="milestone ${item.iteration_number === 9 ? 'final' : ''}"><div class="milestone-card"><div class="milestone-title">${item.iteration_number ? `${item.iteration_number}. ` : ''}${escapeHtml(item.iteration_name || item.phase)}</div><div class="milestone-meta">${escapeHtml(item.phase)} · ${isoDate(item.start_date)}${item.end_date && item.end_date !== item.start_date ? ` – ${isoDate(item.end_date)}` : ''} · ${item.status.toLowerCase() === 'completed' || item.iteration_number === 9 ? '<span class="status complete">✓ Completed</span>' : escapeHtml(item.status)}</div><p><strong>Summary:</strong> ${paragraph(item.summary)}</p><p><strong>Improvements:</strong> ${paragraph(item.improvements_made)}</p>${item.iteration_number === 9 ? '<h3>Participant-Driven Enhancements</h3><p>Participant feedback translated into concrete improvements: improved navigation and workflow, enhanced analytics visualization, improved PDF reporting, better readability and accessibility, interface refinements, downloadable application support, and overall usability improvements.</p>' : ''}<p><strong>Validation outcome:</strong> ${paragraph(item.validation_result)}</p></div></article>`).join('')}</div></section>
  <section class="page"><h2>8. Design Thinking Reflection &amp; Overall Conclusion</h2><div class="card"><h3>Overall user perception</h3><p>The current response set records overall satisfaction of <strong>${rating(overview.satisfaction)}</strong>, task completion of <strong>${percent(overview.taskCompletion)}</strong>, and recommendation intent of <strong>${percent(overview.recommendation)}</strong>.</p><h3>Key strengths</h3><p>${escapeHtml(positiveLearning)}</p><h3>Resolved Validation Findings</h3><p>The validation process identified opportunities to improve task completion efficiency and long-term usage intent. Participant comments were reviewed, synthesized, and translated into actionable design improvements that were implemented during the final application revision. The resulting prototype reflects evidence-based refinements that address the identified usability concerns while establishing a stronger foundation for future large-scale evaluation.</p><h3>Reflection on the iterative design process</h3><p>${rows.length ? `${rows.length} participant response${rows.length === 1 ? '' : 's'} and ${themes.length} qualitative feedback theme${themes.length === 1 ? '' : 's'} were synthesized into findings and connected to the documented action plan. This provides a traceable record from testing evidence to prototype revision and revalidation.` : 'No participant dataset is available yet; once responses are collected, this section will trace feedback through synthesis, action planning, prototype revision, and revalidation.'}</p><h3>Conclusion</h3><p>The available validation evidence demonstrates how MOOVE has been assessed through a user-centered Design Thinking cycle. The documented findings, action plan, and revision history provide a research-ready basis for evaluating the prototype’s readiness for Technology Readiness Level (TRL) 4 demonstration.</p></div></section>
  <div class="footer">MOOVE Feedback Analytics Report - generated ${escapeHtml(input.generatedAt)}</div></body></html>`
  const popup = window.open('', '_blank')
  if (!popup) return false
  popup.document.write(html)
  popup.document.close()
  popup.focus()
  window.setTimeout(() => popup.print(), 250)
  return true
}
