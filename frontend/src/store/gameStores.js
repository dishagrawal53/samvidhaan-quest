import { create } from 'zustand'
import { quizAPI } from '../services/api'
import { connectSocket, createRoom, joinRoom, setReady, submitAnswer, leaveRoom } from '../services/socket'

export const useQuizStore = create((set, get) => ({
  currentQuiz: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  isLoading: false,
  isComplete: false,
  result: null,
  startTime: null,
  questionStartTime: null,
  error: null,

  loadQuiz: async (quizId) => {
    set({ isLoading: true, error: null })
    try {
      const data = await quizAPI.getById(quizId)
      set({ currentQuiz: data.quiz, questions: data.quiz.questions, currentIndex: 0, answers: [], isComplete: false, result: null, startTime: Date.now(), questionStartTime: Date.now(), isLoading: false })
    } catch (err) { set({ error: err.message, isLoading: false }) }
  },

  loadRandom: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const data = await quizAPI.getRandom(params)
      set({ currentQuiz: null, questions: data.questions, currentIndex: 0, answers: [], isComplete: false, result: null, startTime: Date.now(), questionStartTime: Date.now(), isLoading: false })
    } catch (err) { set({ error: err.message, isLoading: false }) }
  },

  answerQuestion: (selectedOption) => {
    const { questions, currentIndex, answers, questionStartTime } = get()
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000)
    const newAnswers = [...answers, { selectedOption, timeTaken, questionIndex: currentIndex }]
    const nextIndex = currentIndex + 1
    const isComplete = nextIndex >= questions.length
    set({ answers: newAnswers, currentIndex: nextIndex, isComplete, questionStartTime: Date.now() })
    return { isComplete, answers: newAnswers }
  },

  submitQuiz: async () => {
    const { currentQuiz, answers, startTime } = get()
    if (!currentQuiz) return
    set({ isLoading: true })
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000)
      const data = await quizAPI.submit({ quizId: currentQuiz._id, answers, timeTaken })
      set({ result: data.result, isLoading: false })
      return data.result
    } catch (err) { set({ error: err.message, isLoading: false }) }
  },

  reset: () => set({ currentQuiz: null, questions: [], currentIndex: 0, answers: [], isComplete: false, result: null, startTime: null, questionStartTime: null, error: null }),
}))

export const useRoomStore = create((set, get) => ({
  room: null, roomCode: null, isHost: false,
  currentQuestion: null, questionIndex: 0, totalQuestions: 0,
  scores: [], gameStatus: 'idle', results: null,
  myAnswer: null, answerResult: null, timeLeft: 30,
  timer: null, error: null, isConnecting: false,

  connect: async () => {
    set({ isConnecting: true })
    try {
      const socket = connectSocket()
      get().setupListeners(socket)
      set({ isConnecting: false })
    } catch { set({ error: 'Failed to connect', isConnecting: false }) }
  },

  setupListeners: (socket) => {
    const events = ['room:created','room:joined','room:updated','game:starting','game:question','room:scores','quiz:answered','game:ended','error']
    events.forEach(e => socket.off(e))

    socket.on('room:created', ({ code, room }) => set({ room, roomCode: code, isHost: true, gameStatus: 'waiting' }))
    socket.on('room:joined', ({ code, room }) => set({ room, roomCode: code, gameStatus: 'waiting' }))
    socket.on('room:updated', ({ room }) => set({ room }))
    socket.on('game:starting', () => set({ gameStatus: 'starting' }))
    socket.on('game:question', ({ question, questionIndex, total }) => {
      const { timer } = get()
      if (timer) clearInterval(timer)
      let timeLeft = 30
      const newTimer = setInterval(() => { timeLeft -= 1; set({ timeLeft }); if (timeLeft <= 0) clearInterval(newTimer) }, 1000)
      set({ currentQuestion: question, questionIndex, totalQuestions: total, gameStatus: 'active', myAnswer: null, answerResult: null, timeLeft: 30, timer: newTimer })
    })
    socket.on('room:scores', ({ players }) => set({ scores: players }))
    socket.on('quiz:answered', ({ isCorrect, score, correctOption }) => set({ answerResult: { isCorrect, score, correctOption } }))
    socket.on('game:ended', ({ results }) => { const { timer } = get(); if (timer) clearInterval(timer); set({ results, gameStatus: 'finished', timer: null }) })
    socket.on('error', ({ message }) => set({ error: message }))
  },

  createRoom: (options) => createRoom(options),
  joinRoom: (code) => joinRoom(code),
  setReady: () => setReady(),
  submitAnswer: (selectedOption) => {
    const { questionIndex, myAnswer, timeLeft } = get()
    if (myAnswer !== null) return
    submitAnswer({ questionIndex, selectedOption, timeTaken: 30 - timeLeft })
    set({ myAnswer: selectedOption })
  },
  leaveRoom: () => {
    leaveRoom()
    const { timer } = get()
    if (timer) clearInterval(timer)
    set({ room: null, roomCode: null, isHost: false, currentQuestion: null, gameStatus: 'idle', results: null, timer: null })
  },
  clearError: () => set({ error: null }),
}))
