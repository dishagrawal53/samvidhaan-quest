import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { leaderboardAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Skeleton, LevelBadge } from '../../components/common'

const TABS = [
  { key: 'xp', label: '⭐ XP' },
  { key: 'streak', label: '🔥 Streak' },
  { key: 'wins', label: '🏆 Wins' },
]

const RANK_ICONS = ['🥇', '🥈', '🥉']
const RANK_COLORS = ['text-yellow-400', 'text-gray-400', 'text-amber-600']

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
    if (tab === 'xp') return `${entry.xp?.toLocaleString()} XP`
    if (tab === 'streak') return `${entry.streak} days`
    if (tab === 'wins') return `${entry.multiplayerWins} wins`
    return ''
  }

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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border
              ${tab === t.key ? 'bg-primary/15 border-primary text-primary' : 'border-dark-border text-dark-muted hover:border-dark-text hover:text-dark-text'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {!loading && data.length >= 3 && (
        <div className="flex items-end gap-3 mb-6">
          {/* 2nd */}
          <div className="flex-1 card p-4 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-xl mx-auto">
              {data[1]?.username?.[0]?.toUpperCase()}
            </div>
            <p className="text-2xl">🥈</p>
            <p className="text-white font-bold text-sm truncate">{data[1]?.username}</p>
            <p className="text-gray-400 text-sm font-bold">{getValue(data[1])}</p>
          </div>
          {/* 1st */}
          <div className="flex-1 card p-4 text-center space-y-2 mb-4 !border-yellow-500/40" style={{ background: 'rgba(255,215,0,0.05)' }}>
            <p className="text-lg">👑</p>
            <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/60 flex items-center justify-center text-yellow-400 font-black text-2xl mx-auto">
              {data[0]?.username?.[0]?.toUpperCase()}
            </div>
            <p className="text-2xl">🥇</p>
            <p className="text-white font-bold text-sm truncate">{data[0]?.username}</p>
            <p className="text-yellow-400 font-bold">{getValue(data[0])}</p>
          </div>
          {/* 3rd */}
          <div className="flex-1 card p-4 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-xl mx-auto">
              {data[2]?.username?.[0]?.toUpperCase()}
            </div>
            <p className="text-2xl">🥉</p>
            <p className="text-white font-bold text-sm truncate">{data[2]?.username}</p>
            <p className="text-amber-600 text-sm font-bold">{getValue(data[2])}</p>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {loading
          ? Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)
          : data.slice(3).map((entry, i) => (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`card p-4 flex items-center gap-3 ${entry.username === user?.username ? '!border-primary/50 !bg-primary/5' : ''}`}
            >
              <span className="text-dark-muted font-bold w-8 text-sm">#{entry.rank}</span>
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold flex-shrink-0">
                {entry.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {entry.username}{entry.username === user?.username ? ' (You)' : ''}
                </p>
                <p className="text-dark-muted text-xs">Lv.{entry.level} · {entry.levelTitle}</p>
              </div>
              <p className="text-primary font-bold text-sm">{getValue(entry)}</p>
            </motion.div>
          ))}
      </div>
    </div>
  )
}