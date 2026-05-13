import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const result = await login(email.trim().toLowerCase(), password)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/home')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
        <Link to="/" className="flex items-center gap-2 text-dark-muted hover:text-white mb-8 transition-colors">
          <ArrowLeft size={18} /> Back
        </Link>

        <div className="text-center mb-8">
          
          <h2 className="text-3xl font-black text-white">Welcome back!</h2>
          <p className="text-dark-muted mt-2">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/40 text-danger text-sm px-4 py-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}
          <div>
            <label className="block text-dark-text text-sm font-semibold mb-2">Email</label>
            <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-dark-text text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <input className="input pr-12" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-base mt-2">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-dark-muted mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  )
}

export function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { signup, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const strength = form.password.length === 0 ? null : form.password.length < 6 ? 'weak' : form.password.length < 10 ? 'medium' : 'strong'
  const strengthColors = { weak: 'bg-danger', medium: 'bg-warning', strong: 'bg-accent' }
  const strengthWidths = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const result = await signup(form.username.trim(), form.email.trim().toLowerCase(), form.password)
    if (result.success) {
      toast.success('Account created! Welcome to Samvidhan Quest 🇮🇳')
      navigate('/home')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
        <Link to="/" className="flex items-center gap-2 text-dark-muted hover:text-white mb-8 transition-colors">
          <ArrowLeft size={18} /> Back
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white">Join the Quest!</h2>
          <p className="text-dark-muted mt-2">Start your constitutional journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/40 text-danger text-sm px-4 py-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}
          <div>
            <label className="block text-dark-text text-sm font-semibold mb-2">Username</label>
            <input className="input" placeholder="YourName123" value={form.username} onChange={e => set('username', e.target.value)} required minLength={3} maxLength={20} />
            <p className="text-dark-muted text-xs mt-1">Letters, numbers, underscores. 3–20 chars.</p>
          </div>
          <div>
            <label className="block text-dark-text text-sm font-semibold mb-2">Email</label>
            <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div>
            <label className="block text-dark-text text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <input className="input pr-12" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {strength && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-dark-border rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${strengthColors[strength]} ${strengthWidths[strength]}`} />
                </div>
                <span className={`text-xs font-semibold ${strength === 'weak' ? 'text-danger' : strength === 'medium' ? 'text-warning' : 'text-accent'}`}>
                  {strength.charAt(0).toUpperCase() + strength.slice(1)}
                </span>
              </div>
            )}
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-base mt-2">
            {isLoading ? 'Creating account...' : 'Create Account '}
          </button>
          <p className="text-dark-muted text-xs text-center">No spam, ever. No ads, ever.</p>
        </form>

        <p className="text-center text-dark-muted mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
