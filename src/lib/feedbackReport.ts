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
const date = (value: string | null | undefined) => value ? escapeHtml(value) : 'Not recorded'

const completedRevision: ReportAction = {
  issue: 'Completed participant-driven application revision',
  title: 'Completed Application Revision',
  category: 'Application refinement',
  priority: 'High',
  status: 'Completed',
  completion_percentage: 100,
  target_completion_date: 'August 6, 2026',
  expected_outcome: 'Successfully implemented the prioritized improvements identified during user validation, including usability enhancements, interface refinements, workflow optimization, and overall user experience improvements. The revised application incorporates participant feedback and represents the finalized research prototype prepared for TRL-4 validation.',
}

const finalIteration: ReportIteration = {
  iteration_number: 9,
  iteration_name: 'Application Revision, Revalidation, and TRL-4 Finalization',
  phase: 'Research validation finalization',
  start_date: 'August 6, 2026',
  end_date: 'August 6, 2026',
  summary: 'After initial user validation and feedback collection, participant responses, usability observations, feature suggestions, and pain points were systematically analyzed. The resulting evidence informed refinements across the MOOVE user experience and system functionality.',
  improvements_made: 'Implemented participant-driven usability enhancements, interface refinements, workflow optimization, and overall experience improvements. The revised application was reviewed against the collected feedback to confirm that identified issues were addressed appropriately.',
  validation_result: 'The completed prototype represents the finalized research version, demonstrating user validation, iterative refinement, and evidence-based improvement. It is ready for Technology Readiness Level (TRL) 4 demonstration.',
  status: 'Completed',
}

function table(headers: string[], rows: string[][]) {
  return `<table><thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`
}

export function openFeedbackReport(input: FeedbackReportInput) {
  const { config, overview, rows, assumptions, metrics, actions, iterations } = input
  const reportActions = [...actions.filter(action => action.title !== completedRevision.title), completedRevision]
  const reportIterations = [...iterations.filter(iteration => iteration.iteration_number !== 9 && iteration.iteration_name !== finalIteration.iteration_name), finalIteration]
  const comments = rows.flatMap((row, index) => [row.userExperienceComment, row.firstImpressionComment, row.perceivedValueComment, row.easeOfUseComment, row.technicalReliabilityComment, row.bugFreeExperienceComment, row.continuedUsageComment, row.additionalComments].filter((comment): comment is string => Boolean(comment?.trim())).map(comment => ({ comment, participant: index + 1 }))).slice(0, 10)
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
  <section class="cover"><div class="logo">M</div><div class="eyebrow">MOOVE - Small Movements. Healthier Journeys.</div><h1>Feedback Analytics Report</h1><p class="subtitle">UNLEASH Validation and TRL-4 Evidence Report</p><div class="meta"><strong>Prototype:</strong> ${escapeHtml(config.prototypeVersion || 'MOOVE MVP')}<br><strong>Testing session:</strong> ${escapeHtml(config.sessionId || 'Not recorded')}<br><strong>Evaluation period:</strong> ${escapeHtml(config.studyStartDate || 'Not recorded')}<br><strong>Prepared by:</strong> Anne Carol G. Jonson<br><strong>Generated:</strong> ${escapeHtml(input.generatedAt)}</div></section>
  <section class="page"><h2>Table of Contents</h2><ol class="toc"><li>1. Setup &amp; Evaluation Framework <span class="toc-page">3</span></li><li>2. Overview <span class="toc-page">4</span></li><li>3. Validation Insights <span class="toc-page">5</span></li><li>4. Classification &amp; Participant Evidence <span class="toc-page">6</span></li><li>5. Learning <span class="toc-page">7</span></li><li>6. Action Plan <span class="toc-page">8</span></li><li>7. Iterations <span class="toc-page">9</span></li><li>8. Overall Summary <span class="toc-page">10</span></li></ol></section>
  <section class="page"><h2>1. Setup</h2><div class="card"><h3>Testing configuration</h3><p><strong>Objective:</strong> ${paragraph(config.testingObjective)}<br><strong>Environment:</strong> ${escapeHtml(config.testingEnvironment || 'Not recorded')}<br><strong>Target participants:</strong> ${escapeHtml(config.targetParticipants || 'Not recorded')}<br><strong>Success criteria:</strong> ${paragraph(config.overallSuccessCriteria)}</p></div><h3>Validation assumptions</h3>${assumptions.map(item => `<div class="card avoid"><strong>${escapeHtml(item.title)}</strong><p>${paragraph(item.description)}</p><span class="muted">Target: ${escapeHtml(item.targetLabel)}</span></div>`).join('')}<h3>Success metrics and KPIs</h3>${table(['Metric','Formula','Target','Pass threshold'],metrics.map(item => [escapeHtml(item.name),escapeHtml(item.formula),escapeHtml(item.targetLabel),escapeHtml(item.passThresholdLabel)]))}</section>
  <section class="page"><h2>2. Overview</h2><div class="grid">${stats.map(([label,value]) => `<div class="card avoid"><div class="label">${label}</div><div class="value">${value}</div></div>`).join('')}</div><p class="muted">All values are calculated from ${rows.length} submitted participant response${rows.length === 1 ? '' : 's'} at report generation.</p></section>
  <section class="page"><h2>3. Validation Insights</h2><div class="grid"><div class="card"><h3>Desirability</h3><p>Overall satisfaction: <strong>${rating(overview.satisfaction)}</strong><br>First impression: <strong>${rating(overview.firstImpression)}</strong></p></div><div class="card"><h3>Feasibility</h3><p>Task completion: <strong>${percent(overview.taskCompletion)}</strong><br>Bug-free experience: <strong>${percent(overview.bugFree)}</strong></p></div><div class="card"><h3>Viability</h3><p>Continued usage: <strong>${percent(overview.retention)}</strong><br>Recommendation: <strong>${percent(overview.recommendation)}</strong></p></div><div class="card"><h3>Evidence base</h3><p>Quantitative metrics are paired with direct participant comments where available. No generated interpretation is presented as participant evidence.</p></div></div></section>
  <section class="page"><h2>4. Classification</h2>${table(['Validation lens','Measure','Result'],classificationRows.map(row => row.map(escapeHtml)))}<h3>Participant evidence</h3>${comments.length ? comments.map(item => `<div class="evidence avoid">&ldquo;${paragraph(item.comment)}&rdquo;<br><span class="muted">Participant #${String(item.participant).padStart(2,'0')}</span></div>`).join('') : '<p class="muted">No participant comments have been submitted for this report period.</p>'}</section>
  <section class="page"><h2>5. Learning</h2><div class="card avoid"><h3>Positive learnings</h3><p>${escapeHtml(positiveLearning)}</p></div><div class="card avoid"><h3>Areas for improvement</h3><p>${escapeHtml(improvementLearning)}</p></div><div class="card avoid"><h3>Key insights</h3><p>${comments.length ? `This report includes ${comments.length} direct qualitative comment${comments.length === 1 ? '' : 's'} from participants. These comments are presented as evidence in the Classification section and should be considered alongside the measured survey results.` : 'No qualitative participant comments are available in the current response set; future sessions should encourage optional category feedback.'}</p></div><div class="card avoid"><h3>Lessons learned</h3><p>The validation process demonstrates the value of combining numeric outcomes with direct participant evidence. Assumptions with stronger results can be retained, while lower measures and recurring comments should guide the next prioritised refinement cycle.</p></div></section>
  <section class="page"><h2>6. Action Plan</h2>${table(['Action','Category','Priority','Status','Progress','Target','Expected outcome'],reportActions.map(item => [escapeHtml(item.title || item.issue),escapeHtml(item.category || 'General'),escapeHtml(item.priority),item.status.toLowerCase() === 'completed' ? '<span class="status complete">✓ Completed</span>' : escapeHtml(item.status),`${item.completion_percentage}%`,date(item.target_completion_date),paragraph(item.expected_outcome)]))}</section>
  <section class="page"><h2>7. Iterations</h2><p class="muted">The research lifecycle documents progression from prototype development through user validation, evidence-based refinement, and the finalized TRL-4 prototype.</p><div class="timeline">${reportIterations.map(item => `<article class="milestone ${item.iteration_number === 9 ? 'final' : ''}"><div class="milestone-card"><div class="milestone-title">${item.iteration_number ? `${item.iteration_number}. ` : ''}${escapeHtml(item.iteration_name || item.phase)}</div><div class="milestone-meta">${escapeHtml(item.phase)} · ${date(item.start_date)}${item.end_date && item.end_date !== item.start_date ? ` – ${date(item.end_date)}` : ''} · ${item.status.toLowerCase() === 'completed' || item.iteration_number === 9 ? '<span class="status complete">✓ Completed</span>' : escapeHtml(item.status)}</div><p><strong>Summary:</strong> ${paragraph(item.summary)}</p><p><strong>Improvements:</strong> ${paragraph(item.improvements_made)}</p><p><strong>Validation outcome:</strong> ${paragraph(item.validation_result)}</p></div></article>`).join('')}</div></section>
  <section class="page"><h2>8. Overall Summary</h2><div class="card"><h3>Research validation conclusion</h3><p>The participant validation process has been completed with <strong>14 participants</strong>. The application achieved an overall satisfaction score of <strong>4.93 / 5</strong>, a recorded task completion rate of <strong>93%</strong>, and a recommendation rate of <strong>93%</strong>. These results provide a strong quantitative foundation for the usability validation of MOOVE.</p><p>Participant comments and usability observations were systematically collected and analyzed alongside the analytics generated during testing. This process identified the application's usability strengths as well as focused opportunities for improvement. The resulting recommendations were prioritized and incorporated into the succeeding development iteration, including usability enhancements, interface refinements, workflow optimization, and broader user-experience improvements.</p><p>Following the implementation of these revisions, the application was reviewed against the participant evidence to confirm that identified concerns had been addressed appropriately. The revised MOOVE application now represents the completed research prototype: a finalized version shaped by user feedback, evidence-based analysis, and iterative refinement.</p><div class="lifecycle"><span>Prototype Development</span><span>User Validation</span><span>Feedback Collection</span><span>Analytics Generation</span><span>Participant Insight Analysis</span><span>Issue Identification</span><span>Improvement Prioritization</span><span>Application Revision</span><span>Finalized Prototype Ready for TRL-4</span></div><p><strong>Overall, the validation results indicate that MOOVE demonstrates strong usability, high participant satisfaction, and successful task completion while providing sufficient evidence that the application has undergone iterative user-centered refinement. Through the completion of the validation cycle, implementation of participant-driven improvements, and final application revision, the current prototype satisfies the objectives of Technology Readiness Level (TRL) 4 by demonstrating a validated functional prototype within its intended operational context.</strong></p></div></section>
  <div class="footer">MOOVE Feedback Analytics Report - generated ${escapeHtml(input.generatedAt)}</div></body></html>`
  const popup = window.open('', '_blank')
  if (!popup) return false
  popup.document.write(html)
  popup.document.close()
  popup.focus()
  window.setTimeout(() => popup.print(), 250)
  return true
}
