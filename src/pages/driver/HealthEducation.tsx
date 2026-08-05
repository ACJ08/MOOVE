import { useState } from 'react'
import { mockEducationArticles } from '@/data/mockData'

function ArticleModal({ article, onClose }: { article: typeof mockEducationArticles[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto card-shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${article.color}15` }}>
                {article.emoji}
              </div>
              <div>
                <div className="text-xs font-bold text-moove-muted">{article.readTime}</div>
                <h2 className="font-display font-bold text-moove-brown text-base leading-snug">{article.title}</h2>
              </div>
            </div>
            <button onClick={onClose} className="text-moove-muted hover:text-moove-brown text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-moove-cream ml-2 shrink-0">×</button>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5 text-xs text-amber-700">
            ⚕️ This content is educational only and does not constitute medical advice. Consult a healthcare professional for personal health concerns.
          </div>

          <div className="text-sm text-moove-muted leading-relaxed whitespace-pre-line">{article.content}</div>

          <button onClick={onClose} className="w-full mt-6 bg-moove-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-all active:scale-95 text-sm">
            Close Article
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HealthEducation() {
  const [open, setOpen] = useState<typeof mockEducationArticles[0] | null>(null)
  const [read, setRead] = useState<Set<number>>(new Set())

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-black text-2xl text-moove-brown mb-1">Health Education</h1>
        <p className="text-sm text-moove-muted">Evidence-based articles on preventive health for drivers — no medical claims.</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3">
        <span className="shrink-0 text-blue-500 mt-0.5">ℹ️</span>
        <div className="text-xs text-blue-700 leading-relaxed">
          All education content covers preventive wellness topics only. MOOVE does not make medical claims, diagnose conditions, or recommend treatment. Content is for informational purposes only.
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {mockEducationArticles.map(article => (
          <div key={article.id} className="bg-white rounded-2xl p-5 card-shadow hover-lift flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${article.color}15` }}>
                {article.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-moove-muted mb-0.5">{article.readTime}</div>
                <h2 className="font-display font-bold text-sm text-moove-brown leading-snug">{article.title}</h2>
              </div>
            </div>

            <p className="text-xs text-moove-muted leading-relaxed flex-1">{article.summary}</p>

            <button
              onClick={() => { setOpen(article); setRead(prev => new Set(prev).add(article.id)) }}
              className="w-full font-bold text-sm py-2.5 rounded-xl transition-all active:scale-95"
              style={{
                background: read.has(article.id) ? `${article.color}15` : article.color,
                color: read.has(article.id) ? article.color : 'white',
              }}
            >
              {read.has(article.id) ? '✓ Read Again' : 'Read Article →'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-moove-cream rounded-2xl p-5 text-center">
        <div className="text-2xl mb-2">📚</div>
        <div className="font-display font-bold text-moove-brown mb-1">More Content Coming Soon</div>
        <p className="text-xs text-moove-muted">Our team is continuously adding new evidence-based articles on driver wellness, posture, and preventive health.</p>
      </div>

      {open && <ArticleModal article={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
