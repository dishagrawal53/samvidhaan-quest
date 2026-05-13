import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

import WelcomePage from './pages/auth/WelcomePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import Layout from './components/layout/Layout'
import HomePage from './pages/main/HomePage'
import LearnPage from './pages/main/LearnPage'
import TopicDetailPage from './pages/main/TopicDetailPage'
import LeaderboardPage from './pages/main/LeaderboardPage'
import ProfilePage from './pages/main/ProfilePage'
import ScenarioPage from './pages/main/ScenarioPage'
import QuizPage from './pages/quiz/QuizPage'
import QuizResultPage from './pages/quiz/QuizResultPage'
import DailyChallengePage from './pages/quiz/DailyChallengePage'
import SnakeLadderPage from './pages/game/SnakeLadderPage'
import MultiplayerPage from './pages/game/MultiplayerPage'
import ChatPage from './pages/chat/ChatPage'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/" replace />
}

export default function App() {
  const { initAuth, isAuthenticated } = useAuthStore()

  useEffect(() => { initAuth() }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'toast-dark',
          duration: 3000,
          style: { background: '#1A1A2E', color: '#E8E8F0', border: '1px solid #2D2D4A' },
        }}
      />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="home" element={<HomePage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="learn/:topicId" element={<TopicDetailPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="scenarios" element={<ScenarioPage />} />
          <Route path="quiz/:quizId" element={<QuizPage />} />
          <Route path="quiz/random" element={<QuizPage />} />
          <Route path="quiz/result" element={<QuizResultPage />} />
          <Route path="daily" element={<DailyChallengePage />} />
          <Route path="game/snake" element={<SnakeLadderPage />} />
          <Route path="game/multiplayer" element={<MultiplayerPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
