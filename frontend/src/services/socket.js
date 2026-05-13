import { io } from 'socket.io-client'
import { SOCKET_URL } from '../utils/constants'

let socket = null

export const connectSocket = () => {
  if (socket?.connected) return socket
  const token = localStorage.getItem('token')
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
  })
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null }
}

export const createRoom = (options = {}) => socket?.emit('room:create', options)
export const joinRoom = (code) => socket?.emit('room:join', { code })
export const setReady = () => socket?.emit('room:ready')
export const submitAnswer = (data) => socket?.emit('quiz:answer', data)
export const leaveRoom = () => socket?.emit('room:leave')
