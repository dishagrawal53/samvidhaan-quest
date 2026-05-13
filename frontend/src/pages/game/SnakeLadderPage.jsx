import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { gameAPI, quizAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { XPBadge } from '../../components/common'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const CELL_TYPES = {
  snake_head: { bg: 'bg-red-500/20 border-red-500/40', symbol: '🐍' },
  ladder_bottom: { bg: 'bg-green-500/20 border-green-500/40', symbol: '🪜' },
  quiz: { bg: 'bg-primary/20 border-primary/40', symbol: '❓' },
  xp_bonus: { bg: 'bg-yellow-500/20 border-yellow-500/40', symbol: '⭐' },
  ai_challenge: { bg: 'bg-orange-500/20 border-orange-500/40', symbol: '🤖' },
  scenario: { bg: 'bg-purple-500/20 border-purple-500/40', symbol: '⚖️' },
  start: { bg: 'bg-green-500/20 border-green-500/40', symbol: '🚀' },
  end: { bg: 'bg-yellow-500/20 border-yellow-500/40', symbol: '🏆' },
  default: { bg: 'bg-dark-card border-dark-border', symbol: null },
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export default function SnakeLadderPage() {
  const navigate = useNavigate()
  const { addXP } = useAuthStore()
  const [board, setBoard] = useState(null)
  const [position, setPosition] = useState(0)
  const [dice, setDice] = useState(null)
  const [diceDisplay, setDiceDisplay] = useState('🎲')
  const [rolling, setRolling] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [event, setEvent] = useState(null)
  const [quizModal, setQuizModal] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [history, setHistory] = useState([])
  const rollAnimRef = useRef(null)

  useEffect(() => {
    gameAPI.getBoard().then(d => setBoard(d.board)).catch(console.error)
    return () => clearInterval(rollAnimRef.current)
  }, [])

  const getCellType = (pos) => {
    if (!board) return 'default'
    if (board.snakes?.find(s => s.head === pos)) return 'snake_head'
    if (board.ladders?.find(l => l.bottom === pos)) return 'ladder_bottom'
    const sp = board.specialTiles?.find(t => t.position === pos)
    if (sp) return sp.type
    if (pos === 1) return 'start'
    if (pos === 100) return 'end'
    return 'default'
  }

  const getBoardPos = (pos) => {
    if (pos === 0) return { row: 9, col: 0 }
    const idx = pos - 1
    const row = Math.floor(idx / 10)
    const col = row % 2 === 0 ? idx % 10 : 9 - (idx % 10)
    return { row: 9 - row, col }
  }

  const rollDice = () => {
    if (rolling || gameOver) return
    setRolling(true)
    let count = 0
    rollAnimRef.current = setInterval(() => {
      setDiceDisplay(DICE_FACES[Math.floor(Math.random() * 6)])
      count++
      if (count >= 10) {
        clearInterval(rollAnimRef.current)
        const value = Math.floor(Math.random() * 6) + 1
        setDice(value)
        setDiceDisplay(DICE_FACES[value - 1])
        setTimeout(() => movePiece(value), 400)
      }
    }, 80)
  }

  const movePiece = (steps) => {
    setPosition(prev => {
      let newPos = prev + steps
      if (newPos > 100) newPos = 100 - (newPos - 100)

      const snake = board?.snakes?.find(s => s.head === newPos)
      const ladder = board?.ladders?.find(l => l.bottom === newPos)
      const special = board?.specialTiles?.find(t => t.position === newPos)

      let finalPos = newPos
      let evt = null

      if (snake) { finalPos = snake.tail; evt = { type: 'snake', from: newPos, to: snake.tail, data: snake } }
      else if (ladder) { finalPos = ladder.top; evt = { type: 'ladder', from: newPos, to: ladder.top, data: ladder } }
      else if (special) { evt = { type: special.type, position: newPos, data: special } }

      setHistory(h => [...h, { roll: steps, landed: newPos, final: finalPos }])

      setTimeout(() => {
        setRolling(false)
        if (finalPos >= 100) { setGameOver(true); setEvent({ type: 'win' }); return }
        if (evt) handleEvent(evt, finalPos)
        else setEvent(null)
      }, 600)

      return finalPos
    })
  }

  const handleEvent = (evt, finalPos) => {
    if (evt.type === 'snake' || evt.type === 'ladder' || evt.type === 'xp_bonus') {
      if (evt.type === 'ladder' || evt.type === 'xp_bonus') {
        const xp = evt.data?.xpReward || 15
        setXpEarned(e => e + xp)
        addXP(xp)
      }
      setEvent(evt)
    } else if (evt.type === 'quiz') {
      loadQuizQuestion(evt.data?.topic, evt.data?.xpReward)
    } else if (evt.type === 'ai_challenge') {
      navigate('/chat', { state: { initialMessage: 'Give me a constitutional challenge question' } })
    }
  }

  const loadQuizQuestion = async (topic, xpReward) => {
    try {
      const data = await quizAPI.getRandom({ topic, count: 1 })
      if (data.questions?.[0]) {
        setQuizModal({ ...data.questions[0], xpReward: xpReward || 20 })
        setSelectedAnswer(null)
        setAnswerResult(null)
      }
    } catch (e) { console.error(e) }
  }

  const handleQuizAnswer = (idx) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(idx)
    const correct = quizModal.options?.[idx]?.isCorrect || false
    setAnswerResult(correct)
    if (correct) {
      setXpEarned(e => e + quizModal.xpReward)
      addXP(quizModal.xpReward)
      toast.success(`+${quizModal.xpReward} XP!`)
    }
  }

  const resetGame = () => {
    setPosition(0); setDice(null); setDiceDisplay('🎲'); setRolling(false)
    setXpEarned(0); setEvent(null); setQuizModal(null); setGameOver(false); setHistory([])
  }

  const playerPos = getBoardPos(position)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white text-xl font-black">🐍 Samvidhan Quest Board</h1>
        <div className="flex items-center gap-3">
          <div className="badge-xp">⭐ {xpEarned} XP earned</div>
          <button onClick={resetGame} className="btn-ghost flex items-center gap-1 text-sm">
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        {/* Board */}
        <div className="card p-3">
          <div className="grid grid-cols-10 gap-0.5">
            {Array.from({ length: 100 }).map((_, i) => {
              const row = Math.floor(i / 10)
              const col = row % 2 === 0 ? i % 10 : 9 - (i % 10)
              const pos = (9 - row) * 10 + col + 1
              const type = getCellType(pos)
              const cellInfo = CELL_TYPES[type] || CELL_TYPES.default
              const isPlayer = position === pos

              return (
                <div
                  key={pos}
                  className={`relative aspect-square border rounded flex items-center justify-center text-xs font-bold transition-all
                    ${cellInfo.bg} ${isPlayer ? '!border-primary !bg-primary/30 ring-2 ring-primary' : ''}`}
                >
                  {isPlayer && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center z-10"
                    >
                      <span className="text-base">🔵</span>
                    </motion.div>
                  )}
                  {!isPlayer && cellInfo.symbol && (
                    <span className="text-xs absolute top-0 left-0.5">{cellInfo.symbol}</span>
                  )}
                  <span className="text-dark-muted text-[8px] absolute bottom-0 right-0.5">{pos}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Control panel */}
        <div className="space-y-4">
          {/* Dice */}
          <div className="card p-5 text-center space-y-3">
            <motion.div
              key={diceDisplay}
              animate={{ rotate: rolling ? [0, 15, -15, 10, -10, 0] : 0 }}
              className="text-7xl cursor-pointer select-none"
              onClick={rollDice}
            >
              {diceDisplay}
            </motion.div>
            {dice && <p className="text-dark-muted text-sm">Rolled: <span className="text-white font-bold">{dice}</span></p>}
            <div className="text-sm text-dark-muted">Position: <span className="text-white font-bold">{position}/100</span></div>

            {gameOver ? (
              <div className="space-y-2">
                <p className="text-yellow-400 font-black text-lg">🎊 You won!</p>
                <button onClick={resetGame} className="btn-primary w-full">Play Again</button>
              </div>
            ) : (
              <button onClick={rollDice} disabled={rolling} className="btn-primary w-full">
                {rolling ? 'Rolling...' : '🎲 Roll Dice'}
              </button>
            )}
          </div>

          {/* Legend */}
          <div className="card p-4 space-y-2">
            <p className="text-dark-muted text-xs font-bold uppercase tracking-wide">Legend</p>
            {[['🐍','Snake (slide down)','text-red-400'],['🪜','Ladder (climb up!)','text-green-400'],['❓','Quiz tile','text-primary'],['⭐','Bonus XP','text-yellow-400'],['🤖','AI Challenge','text-orange-400']].map(([sym,label,color]) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <span>{sym}</span>
                <span className={color}>{label}</span>
              </div>
            ))}
          </div>

          {/* Recent moves */}
          {history.length > 0 && (
            <div className="card p-4 space-y-2">
              <p className="text-dark-muted text-xs font-bold uppercase tracking-wide">Recent Moves</p>
              {history.slice(-5).reverse().map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-dark-muted">Rolled {h.roll}</span>
                  <span className="text-white">→ {h.final}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event modal */}
      <AnimatePresence>
        {event && event.type !== 'win' && !quizModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
            onClick={() => setEvent(null)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="card max-w-sm w-full p-8 text-center space-y-3 mb-4">
              {event.type === 'snake' && (<>
                <div className="text-6xl">🐍</div>
                <h3 className="text-white text-xl font-black">Oh no! Snake!</h3>
                <p className="text-primary font-bold">{event.data?.name}</p>
                <p className="text-dark-muted text-sm">{event.data?.description}</p>
                <p className="text-danger font-bold">{event.from} → {event.to}</p>
              </>)}
              {event.type === 'ladder' && (<>
                <div className="text-6xl">🪜</div>
                <h3 className="text-white text-xl font-black">Ladder! Climb up!</h3>
                <p className="text-primary font-bold">{event.data?.name}</p>
                <p className="text-dark-muted text-sm">{event.data?.description}</p>
                <p className="text-accent font-bold">{event.from} → {event.to}</p>
              </>)}
              {event.type === 'xp_bonus' && (<>
                <div className="text-6xl">⭐</div>
                <h3 className="text-white text-xl font-black">XP Bonus!</h3>
                <p className="text-dark-muted">{event.data?.message}</p>
                <XPBadge amount={event.data?.xpReward || 15} size="lg" />
              </>)}
              <button onClick={() => setEvent(null)} className="btn-primary w-full">Continue</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz modal */}
      <AnimatePresence>
        {quizModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="card max-w-lg w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="text-center">
                <div className="text-4xl mb-2">❓</div>
                <p className="text-primary text-sm font-bold">Quiz Tile!</p>
                {quizModal.articleRef && <p className="text-dark-muted text-xs mt-1">📜 Article {quizModal.articleRef}</p>}
              </div>
              <h3 className="text-white font-bold text-lg leading-snug">{quizModal.question}</h3>
              <div className="space-y-2">
                {quizModal.options?.map((opt, i) => {
                  let cls = 'option-btn text-sm'
                  if (selectedAnswer !== null) {
                    if (opt.isCorrect) cls += ' !border-accent !bg-accent/10 text-white font-semibold'
                    else if (i === selectedAnswer) cls += ' !border-danger !bg-danger/10'
                    else cls += ' opacity-40'
                  }
                  return (
                    <button key={i} className={cls} onClick={() => handleQuizAnswer(i)} disabled={selectedAnswer !== null}>
                      {opt.text}
                    </button>
                  )
                })}
              </div>
              {answerResult !== null && (
                <div className={`rounded-xl p-3 text-center font-bold ${answerResult ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>
                  {answerResult ? `✅ Correct! +${quizModal.xpReward} XP` : '❌ Wrong! No XP'}
                </div>
              )}
              {selectedAnswer !== null && (
                <button onClick={() => { setQuizModal(null); setEvent(null) }} className="btn-primary w-full">Continue</button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
