import React, { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isError?: boolean
}

interface ChatInterfaceProps {
  messages: Message[]
  input: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onClear: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  input,
  isLoading,
  onInputChange,
  onSend,
  onClear,
  onKeyPress
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [notification, setNotification] = useState<string | null>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showNotification('已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      showNotification('复制失败')
    }
  }

  // 显示通知
  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'} ${message.isError ? 'error' : ''}`}
          >
            {message.role === 'assistant' ? (
              <>
                <ReactMarkdown
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      const inline = !match
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                <button
                  onClick={() => copyToClipboard(message.content)}
                  className="copy-button"
                  title="复制回答"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message message-assistant">
            <div className="animate-pulse">AI 正在思考中...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 通知提示 */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
      
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="输入你的问题..."
            className="message-input resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            className="send-button"
          >
            发送
          </button>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {messages.length} 条消息
          </div>
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            清空对话
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface