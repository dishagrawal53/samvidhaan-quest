import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getLevelInfo } from '../../utils/constants'
import {
  Home, BookOpen, Trophy, User, MessageCircle,
  Snail, Users, Target, Menu, X, LogOut, Zap, ChevronRight
} from 'lucide-react'

const NAV = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/scenarios', icon: Target, label: 'Scenarios' },
  { to: '/game/snake', icon: Snail, label: 'Snake & Ladder' },
  { to: '/game/multiplayer', icon: Users, label: 'Multiplayer' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/chat', icon: MessageCircle, label: 'Ask Vidhi AI' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const levelInfo = getLevelInfo(user?.level || 1)
  const xpProgress = ((user?.xp || 0) % 500) / 500 * 100

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex min-h-screen bg-dark-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-dark-card border-r border-dark-border z-30 transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇮🇳</span>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Samvidhan</h1>
              <p className="text-primary text-sm font-semibold">Quest</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-dark-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* User card */}
        {user && (
          <div className="p-4 border-b border-dark-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user.username}</p>
                <p className="text-dark-muted text-xs">{levelInfo.icon} Lv.{user.level} {user.levelTitle || levelInfo.title}</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-bold text-sm">⭐{user.xp}</p>
              </div>
            </div>
            <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full xp-bar-fill" style={{ width: `${xpProgress}%` }} />
            </div>
            <p className="text-dark-muted text-xs mt-1 text-right">{user.xp % 500}/500 to next level</p>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                ${isActive
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-dark-muted hover:text-dark-text hover:bg-dark-cardlight'}`
              }
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-dark-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-muted hover:text-danger hover:bg-danger/5 transition-all w-full">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-dark-border bg-dark-card sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-dark-muted hover:text-white">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🇮🇳</span>
            <span className="text-white font-bold">Samvidhan Quest</span>
          </div>
          {user && (
            <div className="ml-auto flex items-center gap-2 text-yellow-400 font-bold text-sm">
              <Zap size={14} />
              {user.xp} XP
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
