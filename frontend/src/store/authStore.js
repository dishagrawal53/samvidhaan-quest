import { create } from 'zustand'
import { authAPI } from '../services/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      set({ token })
      const data = await authAPI.me()
      set({ user: data.user, isAuthenticated: true })
    } catch {
      localStorage.removeItem('token')
      set({ token: null, isAuthenticated: false })
    }
  },

  signup: async (username, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authAPI.signup({ username, email, password })
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authAPI.login({ email, password })
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },

  guestLogin: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await authAPI.guest()
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
  addXP: (amount) => set((s) => {
    if (!s.user) return {}
    const newXP = s.user.xp + amount
    const newLevel = Math.floor(newXP / 500) + 1
    return { user: { ...s.user, xp: newXP, level: newLevel } }
  }),
  clearError: () => set({ error: null }),
}))
