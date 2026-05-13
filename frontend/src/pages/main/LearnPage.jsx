import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { learnAPI } from '../../services/api'
import { XPBadge, Skeleton, PageHeader } from '../../components/common'
import { ChevronRight, Target } from 'lucide-react'

export default function LearnPage() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    learnAPI.getTopics()
      .then(d => setTopics(d.topics || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="📚 Learn" subtitle="Master the Constitution of India" />

      {/* Scenario banner */}
      <button
        onClick={() => navigate('/scenarios')}
        className="w-full mb-6 p-5 rounded-2xl gradient-purple text-left hover:opacity-90 transition-opacity flex items-center gap-4"
      >
        <span className="text-3xl">⚖️</span>
        <div className="flex-1">
          <p className="text-white font-bold">Scenario Challenges</p>
          <p className="text-white/70 text-sm">Apply constitutional rights to real-life situations</p>
        </div>
        <ChevronRight className="text-white/70" />
      </button>

      <p className="text-dark-muted text-xs font-bold uppercase tracking-widest mb-4">All Topics</p>

      {loading ? (
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <motion.div className="space-y-3" initial="hidden" animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
          {topics.map((topic) => (
            <motion.button
              key={topic.id}
              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
              onClick={() => navigate(`/learn/${topic.id}`)}
              className="card-hover w-full text-left p-5"
              style={{ borderLeftColor: topic.color, borderLeftWidth: 4 }}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{topic.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-bold">{topic.title}</h3>
                    {topic.completed && (
                      <span className="text-accent text-xs font-bold bg-accent/10 border border-accent/30 px-2 py-0.5 rounded-full">✓ Completed</span>
                    )}
                  </div>
                  <p className="text-dark-muted text-xs mt-0.5">{topic.articleRange}</p>
                  <p className="text-dark-text text-sm mt-1">{topic.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <XPBadge amount={topic.xpReward} />
                  <p className="text-dark-muted text-xs">{topic.lessons?.length || 0} lessons</p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
