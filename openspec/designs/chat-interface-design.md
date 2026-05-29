# ChatInterface 组件设计文档

## 组件概述

ChatInterface 组件是一个独立的聊天界面组件，负责显示消息列表和输入区域，提供类似微信的聊天体验。

## 组件接口

### Props 定义
```typescript
interface ChatInterfaceProps {
  // 消息数据
  messages: Message[]
  
  // 输入状态
  input: string
  isLoading: boolean
  
  // 事件处理
  onInputChange: (value: string) => void
  onSend: () => void
  onClear: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
}
```

### Message 接口
```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}
```

## 组件结构

### DOM 结构
```
ChatInterface
├── 消息容器 (chat-messages)
│   ├── 消息列表
│   │   ├── 用户消息 (message-user)
│   │   └── AI 消息 (message-assistant)
│   ├── 加载提示 (loading)
│   └── 滚动锚点
└── 输入容器 (input-container)
    ├── 输入区域 (input-wrapper)
    │   ├── 文本输入框
    │   └── 发送按钮
    └── 控制区域
        ├── 消息计数
        └── 清空按钮
```

## 样式设计

### 布局样式
```css
/* 主容器 */
.chat-container {
  @apply h-screen flex flex-col;
}

/* 消息区域 */
.chat-messages {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
}

/* 消息样式 */
.message {
  @apply max-w-md lg:max-w-2xl px-4 py-2 rounded-lg;
}

/* 用户消息 - 右对齐 */
.message-user {
  @apply ml-auto bg-blue-500 text-white;
}

/* AI 消息 - 左对齐 */
.message-assistant {
  @apply mr-auto bg-white border border-gray-200;
}

/* 输入区域 */
.input-container {
  @apply p-4 border-t border-gray-200 bg-white;
}

/* 输入框 */
.message-input {
  @apply flex-1 px-4 py-2 border border-gray-300 rounded-lg;
}

/* 发送按钮 */
.send-button {
  @apply px-4 py-2 bg-blue-500 text-white rounded-lg;
}
```

### 颜色方案
- **用户消息**: 蓝色背景 (#3B82F6)，白色文字
- **AI 消息**: 白色背景，灰色边框 (#E5E7EB)
- **输入区域**: 白色背景，灰色边框
- **按钮**: 蓝色背景，白色文字

## 消息显示逻辑

### 消息渲染
1. 遍历消息数组
2. 根据 role 区分用户/AI 消息
3. 应用不同的样式和布局
4. AI 消息使用 Markdown 渲染

### Markdown 渲染
```typescript
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
```

## 输入处理

### 键盘事件
- Enter 键发送消息
- Shift+Enter 换行
- 发送时禁用输入框

### 输入验证
- 空消息不允许发送
- 发送时显示加载状态
- 自动聚焦到输入框

## 响应式设计

### 断点设置
- `sm`: 640px 以下
- `md`: 768px 以上
- `lg`: 1024px 以上

### 自适应布局
- 消息最大宽度自适应
- 输入区域固定底部
- 消息区域可滚动

## 性能优化

### 虚拟滚动
- 大量消息时使用虚拟滚动
- 只渲染可见区域的消息
- 减少 DOM 节点数量

### 渲染优化
- 使用 React.memo 优化组件
- 避免不必要的重新渲染
- 使用 key 优化列表渲染

## 可访问性

### 键盘导航
- 支持 Tab 键导航
- Enter 键发送消息
- Escape 键清空输入

### 屏幕阅读器
- 添加适当的 ARIA 标签
- 语义化的 HTML 结构
- 清晰的消息角色标识

## 测试策略

### 单元测试
- 消息渲染测试
- 输入处理测试
- 事件处理测试

### 集成测试
- 组件集成测试
- 样式验证测试
- 响应式测试

## 使用示例

```typescript
import ChatInterface from './components/ChatInterface'

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <ChatInterface
      messages={messages}
      input={input}
      isLoading={isLoading}
      onInputChange={setInput}
      onSend={handleSend}
      onClear={handleClear}
      onKeyPress={handleKeyPress}
    />
  )
}
```

## 后续优化

### 功能增强
- 消息动画效果
- 输入框自动高度调整
- 消息发送状态指示
- 消息已读状态

### 性能优化
- 虚拟滚动实现
- 图片懒加载
- 消息分页加载
- 缓存优化