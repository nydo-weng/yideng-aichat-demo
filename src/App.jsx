import { useEffect, useRef, useState } from 'react'
import './App.css'
import { createAssistantReply, isWorkerConfigured } from './services/chatClient'

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      '你好，我是你的 AI 助手，已经准备好随时对话。直接开始输入你的问题吧！',
  },
]

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

function App() {
  const [messages, setMessages] = useState(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const bottomAnchorRef = useRef(null)

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isSending) return

    const userMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
    }

    const conversation = [...messages, userMessage]
    setMessages(conversation)
    setInputValue('')
    setError('')
    setIsSending(true)

    try {
      const assistantReply = await createAssistantReply(conversation)
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: assistantReply,
        },
      ])
    } catch (err) {
      setError(err.message || '发送失败，请检查网络或 API 配置')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setMessages(initialMessages)
    setError('')
  }

  return (
    <div className="chat-shell">
      <div className="chat-card">
        <header className="chat-card__header">
          <div>
            <p className="chat-card__title">AI Chat</p>
            <p className="chat-card__subtitle">
              {isWorkerConfigured
                ? '通过 Cloudflare Worker 与模型对话'
                : '当前为本地示例回复，仅用于界面预览'}
            </p>
          </div>
          <span
            className={`status-chip ${
              isWorkerConfigured ? 'status-live' : 'status-mock'
            }`}
          >
            {isWorkerConfigured ? 'Worker API' : 'Mock'}
          </span>
        </header>

        <section className="message-list">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`message message--${message.role}`}
            >
              <div className="avatar">
                {message.role === 'assistant' ? '🤖' : '🧑🏻'}
              </div>
              <div className="message__body">
                <p className="message__role">
                  {message.role === 'assistant' ? 'AI 助手' : '我'}
                </p>
                <p className="message__content">{message.content}</p>
              </div>
            </article>
          ))}

          {isSending && (
            <article className="message message--assistant">
              <div className="avatar">🤖</div>
              <div className="message__body">
                <p className="message__role">AI 助手</p>
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </article>
          )}
          <div ref={bottomAnchorRef} />
        </section>

        <footer className="composer">
          <textarea
            value={inputValue}
            placeholder="向 AI 提问，例如：帮我写一份市场调研大纲..."
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            rows={3}
          />
          <div className="composer__actions">
            <button
              type="button"
              className="ghost"
              onClick={handleClear}
              disabled={messages.length <= 1 || isSending}
            >
              清空
            </button>
            <button
              type="button"
              className="primary"
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
            >
              {isSending ? '发送中...' : '发送'}
            </button>
          </div>
          {error && <p className="inline-error">{error}</p>}
        </footer>
      </div>
    </div>
  )
}

export default App
