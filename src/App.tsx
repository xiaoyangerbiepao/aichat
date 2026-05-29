import React, { useState, useEffect } from 'react'
import { ChatInterface, Message } from './components'
import { saveChatHistory, loadChatHistory, clearChatHistory } from './utils/storage'

export interface MessageRecord {
  id: string
  message: Message
  timestamp: number
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messageRecords, setMessageRecords] = useState<MessageRecord[]>([])
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)

  // 从 localStorage 加载对话历史
  useEffect(() => {
    const savedData = loadChatHistory()
    if (savedData) {
      setMessages(savedData.messages)
      setMessageRecords(savedData.messageRecords)
    }
  }, [])

  // 保存对话历史到 localStorage
  useEffect(() => {
    if (messages.length > 0 || messageRecords.length > 0) {
      saveChatHistory(messages, messageRecords)
    }
  }, [messages, messageRecords])

  // 添加消息记录
  const addMessageRecord = (message: Message) => {
    const record: MessageRecord = {
      id: Date.now().toString(),
      message: { ...message },
      timestamp: Date.now()
    }
    setMessageRecords(prev => [record, ...prev])
  }

  // 查看消息详情
  const viewMessageDetail = (id: string) => {
    setActiveMessageId(id)
  }



  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    const allMessages = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content
    }))

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    addMessageRecord(userMessage)
    setInput('')
    setIsLoading(true)

    const apiUrl = import.meta.env.VITE_API_BASE_URL
    const apiKey = import.meta.env.VITE_API_KEY

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: allMessages,
          stream: true
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API 请求失败: ${response.status} - ${errorText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      }

      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)
      addMessageRecord(assistantMessage)

      let buffer = ''
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              assistantMessage = {
                ...assistantMessage,
                content: assistantMessage.content + content
              }
              const updatedMessagesList = [
                  ...newMessages,
                  { ...assistantMessage }
                ]
                setMessages(updatedMessagesList)
            }
          } catch (e) {
            console.error('解析数据失败:', e)
          }
        }
      }
    } catch (error) {
      console.error('请求失败:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}。请稍后重试。`,
        timestamp: Date.now()
      }
      const errorMessages = [...newMessages, errorMessage]
      setMessages(errorMessages)
      addMessageRecord(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    if (window.confirm('确定要清空所有对话历史吗？')) {
      setMessages([])
      setMessageRecords([])
      clearChatHistory()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <ChatInterface
          messages={messages}
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSend={handleSend}
          onClear={handleClear}
          onKeyPress={handleKeyPress}
        />
      </div>
      
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="flex justify-between items-center">
            <span className="sidebar-title">消息记录</span>
            <button
              onClick={handleClear}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              清空记录
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {messageRecords.map(record => (
            <div
              key={record.id}
              className={`conversation-item ${record.id === activeMessageId ? 'active' : ''}`}
              onClick={() => viewMessageDetail(record.id)}
            >
              <div className="conversation-preview">
                {record.message.role === 'user' ? '👤 ' : '🤖 '}
                {record.message.content.substring(0, 30)}
                {record.message.content.length > 30 ? '...' : ''}
              </div>
              <div className="conversation-time">
                {new Date(record.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App