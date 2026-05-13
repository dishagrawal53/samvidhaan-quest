import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { quizAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { AchievementModal, XPBadge, FullPageLoader } from '../../components/common'
import { RefreshCw, Home } from 'lucide-react'

export function QuizResultPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result
  const [badge, setBadge] = useState(null)

  useEffect(() => {
    if (!result) { navigate('/home'); return }
    if (result.newBadges?.length > 0) {
      setTimeout(() => setBadge(result.newBadges[0]), 1200)
    }
  }, [])

  if (!result) return null

  const scoreColor = result.score >= 90 ? 'text-yellow-400' : result.score >= 70 ? 'text-accent' : result.score >= 50 ? 'text-warning' : 'text-danger'
  const emoji = result.score >= 90 ? '🏆' : result.score >= 70 ? '🎉' : result.score >= 50 ? '👍' : '📚'
  const message = result.score >= 90 ? 'Outstanding!' : result.score >= 70 ? 'Great job!' : result.score >= 50 ? 'Keep it up!' : 'Keep learning!'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3 py-6">
        <div className="text-7xl">{emoji}</div>
        <h1 className="text-white text-3xl font-black">{message}</h1>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
          className={`text-7xl font-black ${scoreColor}`}
        >
          {result.score}%
        </motion.div>
        <p className="text-dark-muted">{result.correctAnswers} out of {result.totalQuestions} correct</p>
      </motion.div>

      {result.xpEarned > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="border border-yellow-500/30 bg-yellow-500/5 rounded-2xl p-6 text-center space-y-2">
          <p className="text-dark-muted text-sm font-semibold">XP EARNED</p>
          <p className="text-yellow-400 text-4xl font-black">+{result.xpEarned} ⭐</p>
          {result.leveledUp && (
            <div className="mt-2 bg-primary/15 border border-primary/30 rounded-xl px-4 py-2 inline-block">
              <p className="text-primary font-bold">🎊 Level Up! You are now Level {result.level}</p>
            </div>
          )}
        </motion.div>
      )}

      {result.newBadges?.length > 0 && (
        <div className="card p-5 space-y-3">
          <p className="text-yellow-400 font-bold">🎖️ New Badges!</p>
          {result.newBadges.map(b => (
            <div key={b.id} className="flex items-center gap-3">
              <span className="text-3xl">{b.icon}</span>
              <div>
                <p className="text-white font-bold">{b.name}</p>
                <p className="text-dark-muted text-sm">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-dark-muted text-xs font-bold uppercase tracking-widest">Review</p>
        {result.gradedAnswers?.map((a, i) => (
          <div key={i} className={`rounded-xl p-4 border ${a.isCorrect ? 'bg-accent/10 border-accent/30' : 'bg-danger/5 border-danger/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{a.isCorrect ? '✅' : '❌'}</span>
              <span className="text-dark-muted text-sm font-semibold">Q{i + 1}</span>
            </div>
            {a.explanation && <p className="text-dark-text text-sm leading-relaxed">{a.explanation}</p>}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/quiz/random')} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <RefreshCw size={16} /> Play Again
        </button>
        <button onClick={() => navigate('/home')} className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <Home size={16} /> Home
        </button>
      </div>

      <AchievementModal badge={badge} onClose={() => setBadge(null)} />
    </div>
  )
}

export function DailyChallengePage() {
  const navigate = useNavigate()
  const { addXP } = useAuthStore()
  const [quiz, setQuiz] = useState(null)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    quizAPI.getDaily()
      .then(d => { setQuiz(d.quiz); setAlreadyDone(d.alreadyCompleted) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <FullPageLoader />

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="text-dark-muted hover:text-white text-sm mb-6 transition-colors">← Back</button>
      <div className="card p-8 text-center space-y-6">
        <div className="text-7xl">📅</div>
        <div>
          <h1 className="text-white text-2xl font-black">{quiz?.title || 'Daily Challenge'}</h1>
          <p className="text-dark-muted mt-2">Complete today's challenge to maintain your streak!</p>
        </div>
        <div className="flex justify-center gap-6">
          {[['❓', quiz?.questions?.length || 0, 'Questions'], ['⭐', quiz?.xpReward || 150, 'XP Reward'], ['⏱️', '30s', 'Per Question']].map(([icon, val, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl">{icon}</p>
              <p className="text-saffron font-black text-xl">{val}</p>
              <p className="text-dark-muted text-xs">{label}</p>
            </div>
          ))}
        </div>
        {alreadyDone ? (
          <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6 space-y-2">
            <div className="text-5xl">✅</div>
            <p className="text-accent font-bold text-lg">Already completed today!</p>
            <p className="text-dark-muted text-sm">Come back tomorrow for a new challenge</p>
          </div>
        ) : (
          <button
            onClick={() => navigate(`/quiz/${quiz?._id}`, { state: { mode: 'daily' } })}
            className="w-full py-4 text-lg font-bold rounded-xl text-white gradient-saffron hover:opacity-90 transition-opacity"
          >
            Start Daily Challenge 🚀
          </button>
        )}
      </div>
    </div>
  )
}

export default QuizResultPage