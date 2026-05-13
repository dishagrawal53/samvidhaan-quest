import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoomStore } from '../../store/gameStores'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { TOPICS } from '../../utils/constants'
import { TopicBadge } from '../../components/common'
import { Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const LABELS = ['A', 'B', 'C', 'D']

export default function MultiplayerPage() {
  const { user, addXP } = useAuthStore()
  const { room, roomCode, isHost, currentQuestion, questionIndex, totalQuestions, scores, gameStatus, myAnswer, answerResult, timeLeft, results, error, isConnecting, connect, createRoom, joinRoom, setReady, submitAnswer, leaveRoom, clearError } = useRoomStore()
  const navigate = useNavigate()

  const [view, setView] = useState('lobby') // lobby | create | join
  const [joinCode, setJoinCode] = useState('')
  const [topic, setTopic] = useState('mixed')
  const [difficulty, setDifficulty] = useState('medium')
  const [copied, setCopied] = useState(false)

  useEffect(() => { connect() }, [])
  useEffect(() => { if (error) { toast.error(error); clearError() } }, [error])
  useEffect(() => {
    if (gameStatus === 'finished' && results) {
      const myResult = results.find(r => r.username === user?.username)
      if (myResult?.rank === 1) { addXP(200); toast.success('🏆 You won! +200 XP') }
      else { addXP(50); toast('Good game! +50 XP') }
    }
  }, [gameStatus, results])

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    toast.success('Code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (gameStatus === 'finished' && results) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center py-6 space-y-2">
          <div className="text-6xl">{results[0]?.username === user?.username ? '🏆' : '🎮'}</div>
          <h1 className="text-white text-3xl font-black">Game Over!</h1>
        </div>
        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={r.username} className={`card p-4 flex items-center gap-4 ${r.username === user?.username ? '!border-primary/50' : ''}`}>
              <span className="text-2xl">{['🥇','🥈','🥉','4️⃣'][i] || `#${i+1}`}</span>
              <div className="flex-1">
                <p className="text-white font-bold">{r.username}{r.username === user?.username ? ' (You)' : ''}</p>
                <p className="text-dark-muted text-sm">{r.correctAnswers} correct</p>
              </div>
              <p className="text-primary font-black text-lg">{r.score} pts</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => { leaveRoom(); setView('lobby') }} className="btn-primary flex-1">Play Again</button>
          <button onClick={() => { leaveRoom(); navigate('/home') }} className="btn-secondary flex-1">Home</button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'active' || gameStatus === 'starting') {
    if (gameStatus === 'starting') return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4 animate-bounce-in">
          <div className="text-7xl">⚡</div>
          <h1 className="text-white text-3xl font-black">Get Ready!</h1>
        </div>
      </div>
    )

    const timerColor = timeLeft <= 10 ? 'text-danger' : timeLeft <= 20 ? 'text-warning' : 'text-accent'

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-dark-muted text-sm">Q{questionIndex + 1}/{totalQuestions}</span>
          <span className={`font-black text-2xl ${timerColor}`}>{timeLeft}s</span>
        </div>
        <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(timeLeft/30)*100}%` }} />
        </div>

        {currentQuestion && (
          <>
            <div className="card p-5">
              {currentQuestion.articleRef && <p className="text-primary text-xs font-bold mb-2">📜 Article {currentQuestion.articleRef}</p>}
              <h2 className="text-white text-lg font-bold leading-relaxed">{currentQuestion.question}</h2>
            </div>
            <div className="space-y-2">
              {currentQuestion.options?.map((opt, idx) => {
                let cls = 'option-btn flex items-center gap-3'
                if (myAnswer !== null) {
                  if (answerResult?.correctOption === idx) cls += ' !border-accent !bg-accent/10'
                  else if (myAnswer === idx && !answerResult?.isCorrect) cls += ' !border-danger !bg-danger/10 opacity-60'
                  else cls += ' opacity-30'
                } else if (myAnswer === idx) cls += ' option-selected'
                return (
                  <button key={idx} className={cls} onClick={() => submitAnswer(idx)} disabled={myAnswer !== null}>
                    <div className="w-7 h-7 rounded-full bg-dark-cardlight flex items-center justify-center text-dark-muted font-bold text-sm flex-shrink-0">
                      {LABELS[idx]}
                    </div>
                    <span className="text-sm text-dark-text">{opt.text}</span>
                  </button>
                )
              })}
            </div>
            {answerResult && (
              <div className={`rounded-xl p-3 text-center font-bold ${answerResult.isCorrect ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>
                {answerResult.isCorrect ? `🎉 Correct! +${answerResult.score} pts` : '❌ Wrong!'}
              </div>
            )}
          </>
        )}

        <div className="card p-4 space-y-2">
          <p className="text-dark-muted text-xs font-bold uppercase tracking-wide">Live Scores</p>
          {[...scores].sort((a,b) => b.score-a.score).map((p,i) => (
            <div key={p.username} className="flex items-center gap-2">
              <span className="text-dark-muted text-sm w-4">#{i+1}</span>
              <span className="flex-1 text-white text-sm font-medium">{p.username}</span>
              <span className="text-primary font-bold">{p.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (room) {
    const myPlayer = room.players?.find(p => p.username === user?.username)
    const allReady = room.players?.length >= 2 && room.players?.every(p => p.isReady)
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="text-center">
          <p className="text-dark-muted text-sm font-bold uppercase tracking-wide mb-1">Room Code</p>
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-primary text-5xl font-black tracking-widest">{roomCode}</h1>
            <button onClick={copyCode} className="p-2 rounded-xl border border-dark-border text-dark-muted hover:text-white transition-colors">
              {copied ? <Check size={18} className="text-accent" /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-dark-muted text-sm mt-1">Share this code with friends</p>
        </div>

        <div className="card p-4 space-y-3">
          <p className="text-white font-bold">Players ({room.players?.length}/{room.maxPlayers})</p>
          {room.players?.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold">
                {p.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">{p.username}{p.username === user?.username ? ' (You)' : ''}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.isReady ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-dark-border text-dark-muted'}`}>
                {p.isReady ? '✓ Ready' : 'Waiting'}
              </span>
            </div>
          ))}
          {Array(Math.max(0,(room.maxPlayers||4)-(room.players?.length||0))).fill(0).map((_,i) => (
            <div key={i} className="flex items-center gap-3 opacity-30">
              <div className="w-9 h-9 rounded-full bg-dark-border flex items-center justify-center text-dark-muted font-bold">?</div>
              <span className="text-dark-muted text-sm">Waiting for player...</span>
            </div>
          ))}
        </div>

        {!myPlayer?.isReady && (
          <button onClick={setReady} className="btn-primary w-full py-4 text-lg">✓ I'm Ready!</button>
        )}
        {myPlayer?.isReady && !allReady && (
          <div className="card p-4 text-center text-dark-muted">⏳ Waiting for others to get ready...</div>
        )}
        {allReady && (
          <div className="card p-4 text-center text-accent font-bold border-accent/30">All ready! Game starting...</div>
        )}
        <button onClick={() => { leaveRoom(); setView('lobby') }} className="btn-ghost w-full text-danger hover:text-danger">Leave Room</button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {view === 'lobby' && (
        <>
          <div className="text-center space-y-3 py-4">
            <div className="text-7xl">👥</div>
            <h1 className="text-white text-2xl font-black">Battle Mode</h1>
            <p className="text-dark-muted">Challenge friends in live constitutional battles!</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setView('create')} className="gradient-primary p-6 rounded-2xl text-center space-y-2 hover:opacity-90 transition-opacity">
              <div className="text-4xl">➕</div>
              <p className="text-white font-bold">Create Room</p>
              <p className="text-white/70 text-sm">Host a new game</p>
            </button>
            <button onClick={() => setView('join')} className="gradient-teal p-6 rounded-2xl text-center space-y-2 hover:opacity-90 transition-opacity">
              <div className="text-4xl">🔑</div>
              <p className="text-white font-bold">Join Room</p>
              <p className="text-white/70 text-sm">Enter a code</p>
            </button>
          </div>
          <div className="card p-5 space-y-2">
            <p className="text-white font-bold">How it works</p>
            {['🏠 Host creates a room and shares the code','👥 Up to 4 players join','❓ 10 synchronized questions for all','⏱️ 30 seconds per question','🏆 Winner gets +200 XP!'].map((t,i) => (
              <p key={i} className="text-dark-muted text-sm">{t}</p>
            ))}
          </div>
        </>
      )}

      {view === 'create' && (
        <>
          <button onClick={() => setView('lobby')} className="text-primary text-sm hover:underline">← Back</button>
          <h2 className="text-white font-bold text-lg">Create Room</h2>
          <div>
            <p className="text-dark-text text-sm font-semibold mb-2">Topic</p>
            <div className="flex flex-wrap gap-2">
              {['mixed','fundamentalRights','parliament','judiciary','emergency','amendments'].map(t => (
                <TopicBadge key={t} topicId={t} active={topic === t} onClick={() => setTopic(t)} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-dark-text text-sm font-semibold mb-2">Difficulty</p>
            <div className="flex gap-2">
              {['easy','medium','hard'].map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${difficulty === d ? 'bg-primary border-primary text-white' : 'border-dark-border text-dark-muted hover:border-dark-text'}`}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => createRoom({ topic, difficulty, maxPlayers: 4 })} disabled={isConnecting} className="btn-primary w-full py-4">
            {isConnecting ? 'Connecting...' : '🚀 Create Room'}
          </button>
        </>
      )}

      {view === 'join' && (
        <>
          <button onClick={() => setView('lobby')} className="text-primary text-sm hover:underline">← Back</button>
          <div className="card p-8 text-center space-y-5">
            <div className="text-6xl">🔑</div>
            <h2 className="text-white text-xl font-black">Enter Room Code</h2>
            <input
              className="input text-center text-3xl font-black tracking-widest uppercase py-4"
              placeholder="ABCD12"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoFocus
            />
            <button onClick={() => joinRoom(joinCode)} disabled={joinCode.length < 4 || isConnecting} className="btn-primary w-full py-4">
              Join Room →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
