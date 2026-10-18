import { useState } from 'react'
import { ChatInterface } from './components'
import type { Message } from './components'
import Login from './components/Login'
import { getToken, request } from '../utils/index.js'

// 走 vite 代理，实际请求的是 http://localhost:8000/qa/chat/stream
const STREAM_URL = '/qa/chat/stream'

export default function App() {
  const [token, setToken] = useState(getToken())
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 后端每帧形如 {"type":"token","content":"..."}，
  // progress / meta / done 三类帧不带正文，直接忽略
  const getDelta = (chunk: any): string => (chunk?.type === 'token' ? chunk.content : '')

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setInput('')
    setIsLoading(true)
    // 先插入用户消息和一条空的 AI 消息，流式内容不断往空消息上追加
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text, timestamp: Date.now() },
      { role: 'assistant', content: '', timestamp: Date.now() }
    ])

    try {
      await request(
        'POST',
        STREAM_URL,
        { session_id: 'string', message: text, enable_web_search: false },
        {
          stream: true,
          onMessage: (chunk) => {
            console.log('SSE 帧:', chunk)
            const delta = getDelta(chunk)
            if (!delta) return

            // 必须用函数式更新：回调闭包里的 messages 永远是旧快照，直接取值会丢掉前面的增量
            setMessages((prev) => {
              const next = [...prev]
              const last = next[next.length - 1]
              next[next.length - 1] = { ...last, content: last.content + delta }
              return next
            })
          }
        }
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : '请求失败'
      setMessages((prev) => {
        const next = [...prev]
        next[next.length - 1] = { ...next[next.length - 1], content: message, isError: true }
        return next
      })
    } finally {
      // 流结束（或出错）才解除禁用，避免重复发送
      setIsLoading(false)
    }
  }

  // 没登录过（LocalStorage 里没有 token）就先显示登录页
  if (!token) {
    return <Login onSuccess={setToken} />
  }

  return (
    <ChatInterface
      messages={messages}
      input={input}
      isLoading={isLoading}
      onInputChange={setInput}
      onSend={handleSend}
      onClear={() => setMessages([])}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          handleSend()
        }
      }}
    />
  )
}
