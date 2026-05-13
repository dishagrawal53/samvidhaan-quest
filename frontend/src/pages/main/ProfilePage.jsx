import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { userAPI } from '../../services/api'
import { TOPICS, getLevelInfo } from '../../utils/constants'
import { XPBar, StatCard, LevelBadge, Skeleton } from '../../components/common'
import { LogOut, MessageCircle, Calendar, Users, Target } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userAPI.getStats()
      .then(d => setStats(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Logged out. See you soon! 👋')
    navigate('/')
  }

  const levelInfo = getLevelInfo(user?.level || 1)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Profile</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-danger border border-danger/30 hover:bg-danger/10 px-3 py-2 rounded-xl text-sm font-semibold transition-all">
          <LogOut size={15} /> Logout
        </button>
      </div>

      {/* Profile card */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-black text-3xl flex-shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-white text-xl font-black">{user?.username}</h2>
              {user?.isGuest && (
                <span className="text-xs bg-warning/15 border border-warning/30 text-warning px-2 py-0.5 rounded-full">Guest</span>
              )}
            </div>
            <p className="text-dark-muted text-sm">{user?.email}</p>
            <LevelBadge level={user?.level || 1} title={user?.levelTitle} />
          </div>
          <div className="text-right">
            <p className="text-yellow-400 font-black text-2xl">⭐ {user?.xp?.toLocaleString()}</p>
            <p className="text-dark-muted text-xs">Total XP</p>
          </div>
        </div>
        <XPBar xp={user?.xp || 0} level={user?.level || 1} />
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-white font-bold mb-3">📊 Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon="🔥" value={user?.streak || 0} label="Day Streak" color="text-orange-400" />
          <StatCard icon="🎯" value={`${user?.accuracy || 0}%`} label="Accuracy" color="text-accent" />
          <StatCard icon="📝" value={user?.totalQuizzesPlayed || 0} label="Quizzes Played" color="text-primary" />
          <StatCard icon="✅" value={user?.correctAnswers || 0} label="Correct Answers" color="text-accent" />
          <StatCard icon="🏆" value={user?.multiplayerWins || 0} label="MP Wins" color="text-yellow-400" />
          <StatCard icon="📚" value={user?.completedTopics?.length || 0} label="Topics Done" color="text-primary" />
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-white font-bold mb-3">🎖️ Badges ({user?.badges?.length || 0})</h2>
        {!user?.badges?.length ? (
          <div className="card p-8 text-center text-dark-muted">Complete quizzes to earn badges!</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {user.badges.map(badge => (
              <motion.div key={badge.id} whileHover={{ scale: 1.02 }}
                className="card p-4 text-center space-y-2">
                <div className="text-4xl">{badge.icon}</div>
                <p className="text-white font-bold text-sm">{badge.name}</p>
                <p className="text-dark-muted text-xs">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Completed topics */}
      {user?.completedTopics?.length > 0 && (
        <div>
          <h2 className="text-white font-bold mb-3">✅ Completed Topics</h2>
          <div className="flex flex-wrap gap-2">
            {user.completedTopics.map(id => {
              const topic = TOPICS[id]
              if (!topic) return null
              return (
                <span key={id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border"
                  style={{ color: topic.color, borderColor: topic.color + '60', background: topic.color + '15' }}>
                  {topic.icon} {topic.label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {stats?.recentResults?.length > 0 && (
        <div>
          <h2 className="text-white font-bold mb-3">📋 Recent Activity</h2>
          <div className="space-y-2">
            {stats.recentResults.map((r, i) => (
              <div key={i} className="card p-4 flex items-center gap-4">
                <span className="text-2xl">{r.score >= 80 ? '🌟' : r.score >= 60 ? '✅' : '📝'}</span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{r.quiz?.title || r.topic || 'Quiz'}</p>
                  <p className="text-dark-muted text-xs">{r.correctAnswers}/{r.totalQuestions} correct</p>
                </div>
                <span className={`font-black text-lg ${r.score >= 70 ? 'text-accent' : 'text-warning'}`}>{r.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-white font-bold mb-3">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Ask Vidhi AI', icon: '🤖', to: '/chat' },
            { label: 'Daily Challenge', icon: '📅', to: '/daily' },
            { label: 'Multiplayer', icon: '👥', to: '/game/multiplayer' },
            { label: 'Scenarios', icon: '⚖️', to: '/scenarios' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.to)}
              className="card-hover p-4 flex items-center gap-3 text-left">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
