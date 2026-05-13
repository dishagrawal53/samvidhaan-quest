import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { quizAPI, learnAPI } from '../../services/api'
import { getLevelInfo, TOPICS } from '../../utils/constants'
import { XPBar, StatCard, XPBadge, Skeleton } from '../../components/common'
import { Zap, Flame, Target, Trophy, Brain, Gamepad2, Users, MessageCircle, ChevronRight, Calendar } from 'lucide-react'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function HomePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [dailyQuiz, setDailyQuiz] = useState(null)
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      quizAPI.getDaily().catch(() => null),
      learnAPI.getTopics().catch(() => ({ topics: [] })),
    ]).then(([daily, topicsData]) => {
      setDailyQuiz(daily?.quiz)
      setTopics(topicsData.topics?.slice(0, 4) || [])
    }).finally(() => setLoading(false))
  }, [])

  const levelInfo = getLevelInfo(user?.level || 1)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const quickActions = [
    { label: 'Random Quiz', icon: '🎲', desc: 'Test your knowledge', color: 'from-primary to-primary-dark', action: () => navigate('/quiz/random') },
    { label: 'Snake & Ladder', icon: '🐍', desc: 'Play the board game', color: 'from-accent to-teal-700', action: () => navigate('/game/snake') },
    { label: 'Multiplayer', icon: '👥', desc: 'Battle friends live', color: 'from-purple-500 to-purple-700', action: () => navigate('/game/multiplayer') },
    { label: 'Ask Vidhi AI', icon: '🤖', desc: 'AI constitutional tutor', color: 'from-saffron to-orange-600', action: () => navigate('/chat') },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

      {/* Greeting */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">{greeting}, {user?.username}! 👋</h1>
          <p className="text-dark-muted mt-1">Ready to learn the Constitution?</p>
        </div>
        {user?.streak > 0 && (
          <div className="flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 px-3 py-2 rounded-xl">
            <Flame size={18} className="text-orange-400" />
            <span className="text-orange-400 font-bold">{user.streak} day streak</span>
          </div>
        )}
      </motion.div>

      {/* Level card */}
      <motion.div variants={item} className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dark-muted text-sm">{levelInfo.icon} Level {user?.level}</p>
            <h2 className="text-white text-xl font-black">{user?.levelTitle || levelInfo.title}</h2>
          </div>
          <div className="text-right">
            <p className="text-dark-muted text-xs">Total XP</p>
          </div>
        </div>
        <XPBar xp={user?.xp || 0} level={user?.level || 1} />
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="🔥" value={user?.streak || 0} label="Day Streak" color="text-orange-400" />
        <StatCard icon="🎯" value={`${user?.accuracy || 0}%`} label="Accuracy" color="text-accent" />
        <StatCard icon="📝" value={user?.totalQuizzesPlayed || 0} label="Quizzes" color="text-primary" />
        <StatCard icon="🏆" value={user?.multiplayerWins || 0} label="MP Wins" color="text-yellow-400" />
      </motion.div>

      {/* Daily challenge */}
      {dailyQuiz && (
        <motion.div variants={item}>
          <button
            onClick={() => navigate('/daily')}
            className="w-full text-left p-6 rounded-2xl gradient-saffron hover:opacity-90 transition-opacity group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-white/70" />
                  <span className="text-white/70 text-xs font-bold uppercase tracking-wide">Today's Challenge</span>
                </div>
                <h3 className="text-white text-xl font-black">{dailyQuiz.title}</h3>
                <p className="text-white/70 text-sm">{dailyQuiz.questions?.length} questions · {dailyQuiz.difficulty}</p>
              </div>
              <div className="text-center bg-white/20 rounded-xl p-3">
                <p className="text-white font-black text-2xl">{dailyQuiz.xpReward}</p>
                <p className="text-white/80 text-xs font-bold">XP</p>
              </div>
            </div>
            <p className="text-white font-semibold mt-3 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Play Now <ChevronRight size={16} />
            </p>
          </button>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div variants={item}>
        <h2 className="text-white font-bold mb-3"> Quick Play</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={a.action}
              className={`bg-gradient-to-br ${a.color} p-5 rounded-2xl text-left hover:opacity-90 active:scale-95 transition-all group`}
            >
              <div className="text-3xl mb-2">{a.icon}</div>
              <p className="text-white font-bold text-sm">{a.label}</p>
              <p className="text-white/70 text-xs mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Continue learning */}
      {topics.length > 0 && (
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold">Continue Learning</h2>
            <button onClick={() => navigate('/learn')} className="text-primary text-sm hover:underline">See all →</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => navigate(`/learn/${topic.id}`)}
                className="card-hover p-4 flex items-center gap-4 text-left"
                style={{ borderLeftColor: topic.color, borderLeftWidth: 3 }}
              >
                <span className="text-3xl">{topic.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{topic.title}</p>
                  <p className="text-dark-muted text-xs mt-0.5 truncate">{topic.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <XPBadge amount={topic.xpReward} />
                  {topic.completed && <span className="text-accent text-xs font-bold">✓ Done</span>}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <motion.div variants={item}>
          <h2 className="text-white font-bold mb-3"> Recent Badges</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {user.badges.slice(-6).map((badge) => (
              <div key={badge.id} className="card flex-shrink-0 p-4 flex flex-col items-center gap-2 w-28">
                <span className="text-3xl">{badge.icon}</span>
                <span className="text-dark-text text-xs font-semibold text-center leading-tight">{badge.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
