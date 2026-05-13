import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { learnAPI, quizAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { XPBadge, DiffBadge, FullPageLoader } from '../../components/common'
import { ChevronDown, ChevronUp, MessageCircle, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TopicDetailPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { addXP } = useAuthStore()
  const [topic, setTopic] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    Promise.all([
      learnAPI.getTopicById(topicId),
      quizAPI.getByTopic(topicId).catch(() => ({ quizzes: [] })),
    ]).then(([td, qd]) => {
      setTopic(td.topic)
      setQuizzes(qd.quizzes || [])
    }).finally(() => setLoading(false))
  }, [topicId])

  const handleComplete = async () => {
    try {
      await learnAPI.markComplete(topicId)
      addXP(topic.xpReward)
      setTopic(t => ({ ...t, completed: true }))
      toast.success(`Topic complete! +${topic.xpReward} XP `)
    } catch (e) { toast.error('Failed to mark complete') }
  }

  if (loading) return <FullPageLoader />
  if (!topic) return <div className="text-dark-muted p-8 text-center">Topic not found</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/learn')} className="text-dark-muted hover:text-white text-sm flex items-center gap-1 transition-colors">
        ← Back to Learn
      </button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-8 text-center border space-y-3"
        style={{ background: `linear-gradient(135deg, ${topic.color}25, ${topic.color}08)`, borderColor: topic.color + '40' }}
      >
        <div className="text-6xl">{topic.icon}</div>
        <h1 className="text-white text-2xl font-black">{topic.title}</h1>
        <p className="text-dark-muted text-sm">{topic.articleRange}</p>
        <p className="text-dark-text">{topic.description}</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-dark-muted text-sm">{topic.lessons?.length || 0} lessons</span>
          <XPBadge amount={topic.xpReward} size="md" />
          {topic.completed && (
            <span className="text-accent text-sm font-bold bg-accent/10 border border-accent/30 px-3 py-1 rounded-full">✓ Completed</span>
          )}
        </div>
      </motion.div>

      {/* Lessons */}
      <div>
        <h2 className="text-white font-bold mb-3 flex items-center gap-2"><BookOpen size={18} /> Lessons</h2>
        <div className="space-y-2">
          {(topic.lessons || []).map((lesson, i) => (
            <div
              key={lesson.id}
              className="card overflow-hidden"
              style={expanded === lesson.id ? { borderColor: topic.color + '60' } : {}}
            >
              <button
                onClick={() => setExpanded(expanded === lesson.id ? null : lesson.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-dark-cardlight/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: topic.color + '25', color: topic.color }}>
                  {i + 1}
                </div>
                <span className="text-white font-semibold flex-1">{lesson.title}</span>
                {expanded === lesson.id ? <ChevronUp size={18} className="text-dark-muted" /> : <ChevronDown size={18} className="text-dark-muted" />}
              </button>

              <AnimatePresence>
                {expanded === lesson.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-dark-border pt-4">
                      <p className="text-dark-text text-sm leading-relaxed">{lesson.content}</p>
                      {lesson.keyPoints?.length > 0 && (
                        <div className="bg-dark-cardlight rounded-xl p-4 space-y-2">
                          <p className="text-primary font-bold text-sm">Key Points</p>
                          {lesson.keyPoints.map((kp, ki) => (
                            <p key={ki} className="text-dark-text text-sm flex gap-2">
                              <span className="text-primary mt-0.5">•</span> {kp}
                            </p>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => navigate('/chat', { state: { initialMessage: `Explain ${lesson.title} simply` } })}
                        className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
                      >
                        <MessageCircle size={15} /> Ask Vidhi AI to explain this
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <div>
          <h2 className="text-white font-bold mb-3"> Practice Quizzes</h2>
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <button
                key={quiz._id}
                onClick={() => navigate(`/quiz/${quiz._id}`)}
                className="card-hover w-full flex items-center gap-4 p-4 text-left"
              >
                <div className="flex-1">
                  <p className="text-white font-semibold">{quiz.title}</p>
                  <p className="text-dark-muted text-sm">{quiz.questions?.length || 0} questions</p>
                </div>
                <DiffBadge difficulty={quiz.difficulty} />
                <XPBadge amount={quiz.xpReward} />
              </button>
            ))}
          </div>
        </div>
      )}

      {!topic.completed && (
        <button
          onClick={handleComplete}
          className="btn-primary w-full py-4"
          style={{ background: `linear-gradient(135deg, ${topic.color}, ${topic.color}cc)` }}
        >
          Mark Topic Complete (+{topic.xpReward} XP)
        </button>
      )}
    </div>
  )
}
