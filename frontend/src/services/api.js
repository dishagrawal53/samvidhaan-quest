import axios from 'axios'
import { API_URL } from '../utils/constants'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Network error'
    return Promise.reject(new Error(message))
  }
)

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  guest: () => api.post('/auth/guest'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
}

export const quizAPI = {
  getByTopic: (topic, params) => api.get(`/quiz/topic/${topic}`, { params }),
  getById: (id) => api.get(`/quiz/${id}`),
  getDaily: () => api.get('/quiz/daily'),
  getRandom: (params) => api.get('/quiz/random', { params }),
  submit: (data) => api.post('/quiz/submit', data),
}

export const learnAPI = {
  getTopics: () => api.get('/learn/topics'),
  getTopicById: (id) => api.get(`/learn/topics/${id}`),
  markComplete: (topicId) => api.post(`/learn/topics/${topicId}/complete`),
  getScenarios: (params) => api.get('/learn/scenarios', { params }),
  submitScenario: (data) => api.post('/learn/scenarios/submit', data),
}

export const chatAPI = {
  send: (data) => api.post('/chat', data),
  explainArticle: (num, params) => api.get(`/chat/explain/${num}`, { params }),
}

export const leaderboardAPI = {
  get: (params) => api.get('/leaderboard', { params }),
}

export const userAPI = {
  getStats: () => api.get('/users/stats'),
  addXP: (data) => api.post('/users/xp', data),
}

export const gameAPI = {
  getBoard: () => api.get('/game/board'),
  saveResult: (data) => api.post('/game/result', data),
}

export default api
