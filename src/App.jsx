import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  createAssistantReply,
  isRealApiConfigured,
} from './services/chatClient'

const starterPrompts = [
  '总结一下这段会议纪要的重点，并给出行动项',
  '根据“AI 产品”这个主题写一段宣传文案',
  '用要点形式解释一下向量数据库的核心概念',
  '帮我生成一个学习 React 的 7 天计划',
]

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      '你好，我是你的 AI 助手，已经准备好随时对话。可以直接输入问题，或点击左侧的快捷提示。',
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

  const handlePromptInsert = (prompt) => {
    setInputValue(prompt)
    setError('')
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
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="brand-icon">AI</div>
          <div>
            <p className="brand-title">AI Chat Demo</p>
            <p className="brand-subtitle">灵感、总结、翻译都可以问我</p>
          </div>
        </div>
        <div className="sidebar__section">
          <p className="section-title">快速提示</p>
          <div className="suggestion-list">
            {starterPrompts.map((prompt) => (
              <button
                type="button"
                key={prompt}
                className="suggestion-chip"
                onClick={() => handlePromptInsert(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
        <div className="sidebar__section muted">
          <p>
            当前为
            {isRealApiConfigured ? '真实接口模式 ✅' : '本地模拟模式 🧪'}
          </p>
          <p>
            在根目录创建<code>.env.local</code>并写入
            <code>VITE_CHAT_API_URL</code> 即可接入你自己的 API。
          </p>
        </div>
      </aside>

      <main className="chat-panel">
        <header className="chat-toolbar">
          <div>
            <p className="chat-title">AI Chat</p>
            <p className="chat-subtitle">
              {isRealApiConfigured
                ? '已连接到真实 AI 接口'
                : '模拟模式：用于 UI 预览 & 开发联调'}
            </p>
          </div>
          <span
            className={`status-chip ${
              isRealApiConfigured ? 'status-live' : 'status-mock'
            }`}
          >
            {isRealApiConfigured ? 'Live API' : 'Mock 模式'}
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
      </main>
    </div>
  )
}

export default App
