import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { guestLogin, isLoading } = useAuthStore()

  const handleGuest = async () => {
    const r = await guestLogin()
    if (r.success) navigate('/home')
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-8xl mb-4">🇮🇳</div>
          <h1 className="text-5xl font-black text-white mb-1">Samvidhan</h1>
          <h1 className="text-5xl font-black text-primary mb-4">Quest</h1>
          <p className="text-dark-muted text-lg">Master the Constitution of India through play, quizzes & AI</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3">
          {[['⚖️','Learn Rights'],['🎮','Play Games'],['🤖','AI Tutor'],['🏆','Compete']].map(([icon,text]) => (
            <div key={text} className="flex items-center gap-2 bg-dark-card border border-dark-border px-4 py-2 rounded-full text-sm text-dark-text">
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-3">
          <button onClick={() => navigate('/signup')} className="btn-primary w-full text-lg py-4">
            Get Started Free 🚀
          </button>
          <button onClick={() => navigate('/login')} className="btn-secondary w-full">
            I already have an account
          </button>
          <button onClick={handleGuest} disabled={isLoading} className="text-dark-muted hover:text-dark-text text-sm transition-colors py-2">
            {isLoading ? 'Loading...' : 'Continue as Guest →'}
          </button>
        </motion.div>

        <p className="text-dark-muted text-xs">Jai Hind 🇮🇳</p>
      </div>
    </div>
  )
}
