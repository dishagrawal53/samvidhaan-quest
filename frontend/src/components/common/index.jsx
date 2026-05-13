import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy } from 'lucide-react'
import { TOPICS, getLevelInfo } from '../../utils/constants'

export function XPBar({ xp = 0, level = 1 }) {
  const progress = (xp % 500) / 500 * 100
  return (
    <div className="space-y-1">
      <div className="h-2 bg-dark-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <p className="text-dark-muted text-xs text-right">{xp % 500} / 500 XP to Level {level + 1}</p>
    </div>
  )
}

export function XPBadge({ amount, size = 'sm' }) {
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-1.5' }
  return (
    <span className={`badge-xp font-bold ${sizes[size]}`}>+{amount} XP</span>
  )
}

export function StatCard({ icon, value, label, color = 'text-white' }) {
  return (
    <div className="card p-4 flex flex-col items-center gap-1 text-center">
      <span className="text-2xl">{icon}</span>
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className="text-dark-muted text-xs">{label}</span>
    </div>
  )
}

export function DiffBadge({ difficulty }) {
  const map = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' }
  const labels = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' }
  return <span className={map[difficulty] || 'badge-easy'}>{labels[difficulty] || difficulty}</span>
}

export function TopicBadge({ topicId, onClick, active }) {
  const topic = TOPICS[topicId] || { label: topicId, icon: '📚', color: '#5b72f2' }
  return (
    <button
      onClick={onClick}
      style={active ? { borderColor: topic.color, backgroundColor: topic.color + '20', color: topic.color } : {}}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all
        ${active ? '' : 'border-dark-border text-dark-muted hover:border-dark-text hover:text-dark-text'}`}
    >
      <span>{topic.icon}</span>
      <span>{topic.label}</span>
    </button>
  )
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-dark-cardlight rounded-xl animate-pulse ${className}`} />
  )
}

export function AchievementModal({ badge, onClose }) {
  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            onClick={e => e.stopPropagation()}
            className="card p-8 max-w-sm w-full text-center space-y-4"
          >
            <div className="text-7xl">{badge.icon}</div>
            <div>
              <p className="text-yellow-400 font-bold text-sm uppercase tracking-wide mb-1">Achievement Unlocked!</p>
              <h3 className="text-white text-2xl font-black">{badge.name}</h3>
              <p className="text-dark-muted mt-2">{badge.description}</p>
            </div>
            <button onClick={onClose} className="btn-primary w-full">Awesome! 🎉</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function PageHeader({ title, subtitle, backTo, children }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-black text-white">{title}</h1>
        {subtitle && <p className="text-dark-muted mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
      <p className="text-dark-muted mb-6">{desc}</p>
      {action}
    </div>
  )
}

export function LevelBadge({ level, title }) {
  const info = getLevelInfo(level)
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary/15 border border-primary/30 text-primary text-sm font-bold px-3 py-1 rounded-full">
      {info.icon} Lv.{level} — {title || info.title}
    </span>
  )
}

export function LoadingSpinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${s[size]} border-2 border-dark-border border-t-primary rounded-full animate-spin`} />
  )
}

export function FullPageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-dark-muted">Loading...</p>
      </div>
    </div>
  )
}
