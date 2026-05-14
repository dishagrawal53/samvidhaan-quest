import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore } from '../../store/gameStores'
import { useAuthStore } from '../../store/authStore'
import { quizAPI } from '../../services/api'
import { X, Clock } from 'lucide-react'

const LABELS = ['A', 'B', 'C', 'D']

export default function QuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { loadQuiz, loadRandom, questions, currentIndex, answerQuestion, submitQuiz, isLoading, isComplete, reset } = useQuizStore()
  const { addXP } = useAuthStore()

  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null) // { isCorrect, correctIndex }
  const [timeLeft, setTimeLeft] = useState(30)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef(null)

 useEffect(() => {
  reset()
  clearInterval(timerRef.current)

  if (quizId && quizId !== 'random') {
    loadQuiz(quizId)
  } else {
    const params = location.state || {}
    loadRandom({ topic: params.topic || 'all', count: 10 })
  }

  return () => {
    clearInterval(timerRef.current)
  }
}, [location.key])

  useEffect(() => {
    if (questions.length > 0 && !isComplete) startQuestion()
  }, [currentIndex, questions.length])

  useEffect(() => {
    if (isComplete) handleSubmit()
  }, [isComplete])

  const startQuestion = () => {
    setSelected(null)
    setFeedback(null)
    setTimeLeft(30)
    setTimerActive(true)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const handleTimeout = () => {
    if (selected !== null) return
    clearInterval(timerRef.current)
    setTimerActive(false)
    const q = questions[currentIndex]
    const correctIdx = q?.options?.findIndex(o => o.isCorrect) ?? -1
    setFeedback({ isCorrect: false, correctIndex: correctIdx })
    setTimeout(() => { setFeedback(null); answerQuestion(-1) }, 2200)
  }

  const handleSelect = (idx) => {
    if (selected !== null || feedback) return
    clearInterval(timerRef.current)
    setTimerActive(false)
    setSelected(idx)
    const q = questions[currentIndex]
    const correct = q?.options?.[idx]?.isCorrect || false
    const correctIdx = q?.options?.findIndex(o => o.isCorrect) ?? -1
    setFeedback({ isCorrect: correct, correctIndex: correctIdx })
    setTimeout(() => { setFeedback(null); answerQuestion(idx) }, 2000)
  }

  const handleSubmit = async () => {
    const result = await submitQuiz()
    if (result) {
      if (result.xpEarned > 0) addXP(result.xpEarned)
      navigate('/quiz/result', { state: { result }, replace: true })
    }
  }

  if (isLoading || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-3">
      
          <p className="text-white font-bold text-lg">Loading quiz...</p>
        </div>
      </div>
    )
  }

  const q = questions[currentIndex]
  if (!q) return null
  const progress = (currentIndex / questions.length) * 100
  const timerPct = (timeLeft / 30) * 100
  const timerColor = timeLeft <= 10 ? 'bg-danger' : timeLeft <= 20 ? 'bg-warning' : 'bg-accent'

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => { reset(); navigate(-1) }} className="p-2 rounded-xl border border-dark-border text-dark-muted hover:text-white transition-colors">
          <X size={18} />
        </button>
        <div className="flex-1 h-2 bg-dark-border rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold transition-colors
          ${timeLeft <= 10 ? 'border-danger/60 text-danger bg-danger/10' : 'border-dark-border text-dark-text'}`}>
          <Clock size={14} /> {timeLeft}s
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-dark-border rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${timerColor}`} animate={{ width: `${timerPct}%` }} transition={{ duration: 0.5 }} />
      </div>

      {/* Question */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="card p-6 space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-dark-muted text-sm font-semibold">Question {currentIndex + 1}/{questions.length}</span>
          {q.articleRef && (
            <span className="text-xs bg-primary/15 border border-primary/30 text-primary px-2 py-1 rounded-full font-semibold">
              📜 Article {q.articleRef}
            </span>
          )}
        </div>
        <h2 className="text-white text-lg font-bold leading-relaxed">{q.question}</h2>
      </motion.div>

      {/* Options */}
      <div className="space-y-3">
        {q.options?.map((opt, idx) => {
          let cls = 'option-btn'
          if (feedback) {
            if (idx === feedback.correctIndex) cls += ' !border-accent !bg-accent/10'
            else if (idx === selected && !feedback.isCorrect) cls += ' !border-danger !bg-danger/10'
            else cls += ' opacity-40'
          } else if (selected === idx) {
            cls += ' option-selected'
          }
          return (
            <motion.button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={!!feedback}
              whileHover={!feedback ? { scale: 1.01 } : {}}
              whileTap={!feedback ? { scale: 0.99 } : {}}
              className={`${cls} flex items-center gap-3`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors
                ${feedback && idx === feedback.correctIndex ? 'bg-accent/30 text-accent' :
                  feedback && idx === selected && !feedback.isCorrect ? 'bg-danger/30 text-danger' :
                  'bg-dark-cardlight text-dark-muted'}`}>
                {LABELS[idx]}
              </div>
              <span className={`text-sm leading-snug ${feedback && idx === feedback.correctIndex ? 'text-white font-semibold' : 'text-dark-text'}`}>
                {opt.text}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 rounded-2xl border font-bold text-lg z-50
              ${feedback.isCorrect ? 'bg-accent/20 border-accent text-white' : 'bg-danger/20 border-danger text-white'}`}
          >
            {feedback.isCorrect ? ' Correct!' : ' Wrong!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
