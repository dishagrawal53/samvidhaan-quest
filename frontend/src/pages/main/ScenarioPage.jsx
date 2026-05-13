import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { learnAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { XPBadge, FullPageLoader } from '../../components/common'
import { ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ScenarioPage() {
  const { addXP } = useAuthStore()
  const [scenarios, setScenarios] = useState([])
  const [index, setIndex] = useState(0)
  const [selArticle, setSelArticle] = useState(null)
  const [selPrinciple, setSelPrinciple] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [totalXP, setTotalXP] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    learnAPI.getScenarios()
      .then(d => setScenarios(d.scenarios || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!selArticle || !selPrinciple) return
    setSubmitting(true)
    try {
      const data = await learnAPI.submitScenario({
        scenarioId: scenarios[index].id,
        selectedArticle: selArticle,
        selectedPrinciple: selPrinciple,
      })
      setResult(data)
      if (data.xpEarned > 0) {
        addXP(data.xpEarned)
        setTotalXP(t => t + data.xpEarned)
        toast.success(`+${data.xpEarned} XP!`)
      }
    } catch (e) {
      toast.error('Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (index < scenarios.length - 1) {
      setIndex(i => i + 1)
      setSelArticle(null)
      setSelPrinciple(null)
      setResult(null)
    } else {
      setDone(true)
    }
  }

  if (loading) return <FullPageLoader />

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <div className="text-7xl">🎊</div>
        <h1 className="text-white text-3xl font-black">All Done!</h1>
        <p className="text-dark-muted">You completed all scenario challenges</p>
        <div className="badge-xp text-lg px-6 py-3 inline-block">Total XP: +{totalXP}</div>
        <button onClick={() => { setIndex(0); setDone(false); setTotalXP(0) }} className="btn-primary w-full py-4">
          Play Again 
        </button>
      </div>
    )
  }

  if (!scenarios.length) {
    return (
      <div className="text-center py-16 text-dark-muted">
 
        <p>No scenarios available yet.</p>
      </div>
    )
  }

  const sc = scenarios[index]

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">⚖️ Scenario Challenges</h1>
          <p className="text-dark-muted mt-1">Apply constitutional rights to real situations</p>
        </div>
        {totalXP > 0 && <div className="badge-xp">+{totalXP} XP</div>}
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-dark-muted">
          <span>Scenario {index + 1} of {scenarios.length}</span>
          <span>{Math.round(((index + 1) / scenarios.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full"
            animate={{ width: `${((index + 1) / scenarios.length) * 100}%` }}
            transition={{ duration: 0.4 }} />
        </div>
      </div>

      {/* Scenario */}
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 border text-center space-y-3"
        style={{ background: 'linear-gradient(135deg, #252545, #1A1A2E)', borderColor: '#2D2D4A' }}
      >
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/15 border border-primary/30 px-3 py-1 rounded-full">
          {sc.difficulty} · Scenario
        </span>
        <div className="text-5xl">⚖️</div>
        <h2 className="text-white text-xl font-black">{sc.title}</h2>
        <p className="text-dark-text leading-relaxed">{sc.description}</p>
      </motion.div>

      {/* Article selection */}
      <div>
        <p className="text-white font-bold mb-3">Which Article is violated?</p>
        <div className="flex flex-wrap gap-2">
          {sc.articles?.map(art => {
            const isCorrect = result && art === sc.correctArticle
            const isWrong = result && selArticle === art && art !== sc.correctArticle
            return (
              <button
                key={art}
                onClick={() => !result && setSelArticle(art)}
                disabled={!!result}
                className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all
                  ${isCorrect ? 'border-accent bg-accent/15 text-accent' :
                    isWrong ? 'border-danger bg-danger/10 text-danger' :
                    selArticle === art ? 'border-primary bg-primary/15 text-primary' :
                    'border-dark-border text-dark-muted hover:border-dark-text hover:text-dark-text'}`}
              >
                Article {art}
                {isCorrect && ' ✓'}
                {isWrong && ' ✗'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Principle selection */}
      <div>
        <p className="text-white font-bold mb-3">Which Constitutional Principle?</p>
        <div className="flex flex-wrap gap-2">
          {sc.principles?.map(p => {
            const isCorrect = result && p === sc.correctPrinciple
            const isWrong = result && selPrinciple === p && p !== sc.correctPrinciple
            return (
              <button
                key={p}
                onClick={() => !result && setSelPrinciple(p)}
                disabled={!!result}
                className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all
                  ${isCorrect ? 'border-accent bg-accent/15 text-accent' :
                    isWrong ? 'border-danger bg-danger/10 text-danger' :
                    selPrinciple === p ? 'border-primary bg-primary/15 text-primary' :
                    'border-dark-border text-dark-muted hover:border-dark-text hover:text-dark-text'}`}
              >
                {p}
                {isCorrect && ' ✓'}
                {isWrong && ' ✗'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-5 border text-center space-y-2
              ${result.isCorrect ? 'bg-accent/10 border-accent/30' : 'bg-dark-card border-dark-border'}`}
          >
            <div className="text-4xl">{result.isCorrect ? '🎉' : '📚'}</div>
            <p className={`font-black text-lg ${result.isCorrect ? 'text-accent' : 'text-white'}`}>
              {result.isCorrect ? 'Correct!' :
                result.articleCorrect || result.principleCorrect ? 'Partially correct!' : 'Not quite!'}
            </p>
            <p className="text-dark-text text-sm leading-relaxed">{result.explanation}</p>
            {result.xpEarned > 0 && <XPBadge amount={result.xpEarned} size="md" />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      {!result ? (
        <button
          onClick={handleSubmit}
          disabled={!selArticle || !selPrinciple || submitting}
          className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Checking...' : 'Submit Answer'}
        </button>
      ) : (
        <button onClick={handleNext} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
          {index < scenarios.length - 1 ? (<>Next Scenario <ChevronRight size={18} /></>) : 'Finish ✓'}
        </button>
      )}
    </div>
  )
}
