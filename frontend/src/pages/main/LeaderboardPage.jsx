
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { leaderboardAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Skeleton } from '../../components/common'

const TABS = [
  { key: 'xp', label: '⭐ XP' },
  { key: 'streak', label: '🔥 Streak' },
  { key: 'wins', label: '🏆 Wins' },
]

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [data, setData] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [tab, setTab] = useState('xp')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    leaderboardAPI.get({ type: tab, limit: 50 })
      .then(d => { setData(d.leaderboard || []); setUserRank(d.userRank) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tab])

  const getValue = (entry) => {
    if (tab === 'xp') return `${(entry.xp || 0).toLocaleString()} XP`
    if (tab === 'streak') return `${entry.streak || 0} days`
    if (tab === 'wins') return `${entry.multiplayerWins || 0} wins`
    return ''
  }

  const showPodium = !loading && data.length >= 3

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">🏆 Leaderboard</h1>
          <p className="text-dark-muted mt-1">Top constitutional scholars</p>
        </div>
        {userRank && (
          <div className="bg-primary/15 border border-primary/30 px-3 py-2 rounded-xl">
            <p className="text-primary font-bold text-sm">Your rank: #{userRank}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border
              ${tab === t.key ? 'bg-primary/15 border-primary text-primary' : 'border-dark-border text-dark-muted hover:border-dark-text hover:text-dark-text'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {!loading && data.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="text-5xl">🏆</div>
          <p className="text-white font-bold text-lg">No players yet</p>
          <p className="text-dark-muted text-sm">Complete quizzes to appear here!</p>
        </div>
      )}

      {showPodium && (
        <div className="flex items-end gap-3 mb-6">
          <div className="flex-1 card p-4 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-xl mx-auto">
              {data[1]?.username?.[0]?.toUpperCase()}
            </div>
            <p className="text-2xl">🥈</p>
            <p className="text-white font-bold text-sm truncate">{data[1]?.username}</p>
            <p className="text-gray-300 text-sm font-bold">{getValue(data[1])}</p>
          </div>
          <div className="flex-1 card p-4 text-center space-y-2 !border-yellow-500/40" style={{ background: 'rgba(255,215,0,0.05)', marginBottom: '-8px' }}>
            <p className="text-lg">👑</p>
            <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/60 flex items-center justify-center text-yellow-400 font-black text-2xl mx-auto">
              {data[0]?.username?.[0]?.toUpperCase()}
            </div>
            <p className="text-2xl">🥇</p>
            <p className="text-white font-bold text-sm truncate">{data[0]?.username}</p>
            <p className="text-yellow-400 font-bold">{getValue(data[0])}</p>
          </div>
          <div className="flex-1 card p-4 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-xl mx-auto">
              {data[2]?.username?.[0]?.toUpperCase()}
            </div>
            <p className="text-2xl">🥉</p>
            <p className="text-white font-bold text-sm truncate">{data[2]?.username}</p>
            <p className="text-amber-500 text-sm font-bold">{getValue(data[2])}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {loading ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)
        ) : (
          (showPodium ? data.slice(3) : data).map((entry, i) => {
            const rankNum = showPodium ? i + 4 : i + 1
            const isMe = entry.username === user?.username
            return (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`card p-4 flex items-center gap-3 ${isMe ? '!border-primary/50 !bg-primary/5' : ''}`}
              >
                <span className="text-dark-muted font-bold w-8 text-center text-sm flex-shrink-0">
                  #{rankNum}
                </span>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0
                  ${isMe ? 'bg-primary/30 border-2 border-primary text-primary' : 'bg-primary/20 border border-primary/40 text-primary'}`}>
                  {entry.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {entry.username}
                    {isMe && <span className="text-primary text-xs ml-1">(You)</span>}
                  </p>
                  <p className="text-dark-muted text-xs">Lv.{entry.level} · {entry.levelTitle}</p>
                </div>
                <p className={`font-bold text-sm ${isMe ? 'text-primary' : 'text-dark-text'}`}>
                  {getValue(entry)}
                </p>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}