import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { chatAPI } from '../../services/api'
import { Send, Bot } from 'lucide-react'

const QUICK = ['Explain Article 21 simply','What are Fundamental Rights?','How does Parliament work?','Tell me about the Preamble','What is Basic Structure Doctrine?','Explain writ of Habeas Corpus','What are Directive Principles?','Difference between Lok Sabha and Rajya Sabha']

export default function ChatPage() {
  const location = useLocation()
  const [messages, setMessages] = useState([{
    id: '1', role: 'assistant', timestamp: new Date(),
    content: "Namaste! 🙏 I'm **Vidhi**, your AI guide to the Constitution of India!\n\nAsk me anything about Fundamental Rights, Parliament, Judiciary, Emergency Provisions, Amendments — or any Article.\n\nWhat would you like to learn today?",
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggested, setSuggested] = useState([])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const init = location.state?.initialMessage
    if (init) { setTimeout(() => sendMessage(init), 400) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setSuggested([])

    const userMsg = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const data = await chatAPI.send({ message: msg, history })
      setMessages(prev => [...prev, {
        id: (Date.now()+1).toString(), role: 'assistant',
        content: data.reply, timestamp: new Date(),
        articles: data.relevantArticles,
      }])
      setSuggested(data.suggestedTopics || [])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now()+1).toString(), role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again! 🔄",
        timestamp: new Date(), isError: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-dark-border mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
          <Bot size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-white font-bold">Vidhi AI ⚖️</h1>
          <p className="text-dark-muted text-xs">Constitutional Expert · Powered by AI</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-accent text-xs font-semibold">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">⚖️</span>
              </div>
            )}
            <div className={`max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : `bg-dark-card border border-dark-border text-dark-text rounded-bl-sm ${msg.isError ? '!border-danger/40' : ''}`
                }`}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
              {msg.articles?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.articles.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(`Explain Article ${a.number} in detail`)}
                      className="text-xs bg-primary/15 border border-primary/30 text-primary px-2 py-0.5 rounded-full hover:bg-primary/25 transition-colors"
                    >
                      {a.number ? `Art. ${a.number}` : a.title}
                    </button>
                  ))}
                </div>
              )}
              <span className="text-dark-muted text-xs">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">⚖️</span>
            </div>
            <div className="bg-dark-card border border-dark-border px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 bg-dark-muted rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggested.length > 0 && !loading && (
          <div className="flex flex-wrap gap-2 pl-11">
            {suggested.map(s => (
              <button key={s} onClick={() => sendMessage(`Tell me more about ${s}`)}
                className="text-xs bg-dark-card border border-dark-border text-primary px-3 py-1 rounded-full hover:border-primary/50 transition-colors">
                📚 {s}
              </button>
            ))}
          </div>
        )}

        {/* Quick prompts for first message */}
        {messages.length === 1 && !loading && (
          <div className="pl-11 space-y-2">
            <p className="text-dark-muted text-xs">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-xs bg-dark-card border border-dark-border text-dark-text px-3 py-2 rounded-xl hover:border-primary/40 hover:text-primary transition-colors max-w-xs text-left">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-dark-border pt-4 mt-4">
        <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="flex gap-3">
          <input
            ref={inputRef}
            className="input flex-1"
            placeholder="Ask about any Article or topic..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            maxLength={500}
          />
          <button type="submit" disabled={!input.trim() || loading}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all
              ${input.trim() && !loading ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-dark-card border border-dark-border text-dark-muted cursor-not-allowed'}`}>
            <Send size={18} />
          </button>
        </form>
        <p className="text-dark-muted text-xs mt-2 text-center">Powered by AI · Constitutional knowledge grounded in actual articles</p>
      </div>
    </div>
  )
}
