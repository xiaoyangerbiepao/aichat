# 发送消息功能设计文档

## 功能概述

实现完整的消息发送功能，包括用户消息处理、API 调用、流式输出和多轮对话支持。

## 消息处理流程

### 1. 用户输入消息
```
用户输入 → 输入框更新 → 准备发送
```

### 2. 发送消息
```
点击发送/按Enter → 验证消息 → 添加到消息列表 → 调用API
```

### 3. API 调用
```
构建消息历史 → 发送请求 → 接收流式响应 → 逐字更新
```

### 4. 完成处理
```
响应结束 → 更新状态 → 恢复输入框
```

## 技术实现

### 消息状态管理
```typescript
const [messages, setMessages] = useState<Message[]>([])
const [input, setInput] = useState('')
const [isLoading, setIsLoading] = useState(false)
```

### 消息发送函数
```typescript
const handleSend = async () => {
  if (!input.trim() || isLoading) return
  
  // 1. 创建用户消息
  const userMessage: Message = {
    role: 'user',
    content: input,
    timestamp: Date.now()
  }
  
  // 2. 添加到消息列表
  const newMessages = [...messages, userMessage]
  setMessages(newMessages)
  setInput('')
  setIsLoading(true)
  
  // 3. 调用 API
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        stream: true
      })
    })
    
    // 4. 处理流式响应
    // ...
  } catch (error) {
    // 5. 错误处理
    // ...
  } finally {
    setIsLoading(false)
  }
}
```

### 流式响应处理
```typescript
const reader = response.body?.getReader()
const decoder = new TextDecoder()
let buffer = ''

// 创建 AI 消息占位符
let assistantMessage: Message = {
  role: 'assistant',
  content: '',
  timestamp: Date.now()
}
setMessages([...newMessages, assistantMessage])

// 逐字处理响应
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
        // 更新消息列表
        setMessages(prev => [
          ...prev.slice(0, -1),
          { ...assistantMessage }
        ])
      }
    } catch (e) {
      console.error('解析数据失败:', e)
    }
  }
}
```

## 多轮对话实现

### 消息历史管理
- 每次发送包含完整的消息历史
- AI 能够理解上下文关系
- 支持连续的对话交互

### 消息格式转换
```typescript
const allMessages = messages.map(m => ({
  role: m.role,
  content: m.content
}))
```

## 加载状态处理

### 输入框禁用
```typescript
<textarea
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyPress={handleKeyPress}
  placeholder="输入你的问题..."
  className="message-input resize-none"
  rows={1}
  disabled={isLoading}  // 加载时禁用
/>
```

### 加载提示显示
```typescript
{isLoading && (
  <div className="message message-assistant">
    <div className="animate-pulse">AI 正在思考中...</div>
  </div>
)}
```

## 错误处理

### 网络错误
```typescript
try {
  const response = await fetch(apiUrl, { /* ... */ })
  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`)
  }
  // 处理响应
} catch (error) {
  const errorMessage: Message = {
    role: 'assistant',
    content: `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}`,
    timestamp: Date.now()
  }
  setMessages(prev => [...prev, errorMessage])
}
```

### API 错误响应
- 检查 HTTP 状态码
- 读取错误详情
- 显示友好的错误信息

## 用户体验优化

### 自动滚动
- 新消息添加后自动滚动到底部
- 使用平滑滚动动画

### 输入验证
- 空消息不允许发送
- 发送时禁用输入框
- 防止重复发送

### 状态反馈
- 加载状态明确提示
- 错误信息友好显示
- 消息发送成功确认

## 性能考虑

### 消息历史长度
- 考虑限制消息历史长度
- 避免发送过大的请求体
- 优化内存使用

### 流式输出性能
- 使用缓冲区处理数据
- 避免频繁的状态更新
- 优化渲染性能

## 安全考虑

### API 密钥
- 从环境变量读取
- 不暴露到客户端代码
- 生产环境使用安全的密钥管理

### 输入验证
- 验证消息内容
- 防止恶意输入
- 考虑消息长度限制

## 测试策略

### 单元测试
- 消息发送函数测试
- 流式响应处理测试
- 错误处理测试

### 集成测试
- 完整消息发送流程
- 多轮对话功能
- 加载状态测试

### 用户体验测试
- 输入框交互测试
- 消息显示测试
- 错误提示测试

## 后续优化

### 功能增强
- 消息发送状态指示
- 对话历史管理
- 消息编辑功能
- 消息删除功能

### 性能优化
- 虚拟滚动处理大量消息
- 消息历史压缩
- 流式输出优化

### 用户体验
- 消息动画效果
- 输入框自动高度调整
- 快捷键支持