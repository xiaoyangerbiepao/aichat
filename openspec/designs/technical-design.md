# AI 聊天助手技术设计

## 技术栈

### 前端框架
- React 19: 用于构建用户界面
- TypeScript: 提供类型安全
- Vite: 构建工具和开发服务器

### 样式框架
- Tailwind CSS: 实用优先的 CSS 框架
- 自定义组件样式: 使用 @layer components 定义

### Markdown 渲染
- react-markdown: Markdown 渲染引擎
- react-syntax-highlighter: 代码语法高亮

### AI 服务
- 智谱 AI API: 提供 AI 对话能力
- SSE 流式输出: 实现逐字显示效果

## 数据结构

### Message 接口
```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}
```

### MessageRecord 接口
```typescript
interface MessageRecord {
  id: string
  message: Message
  timestamp: number
}
```

## 组件架构

### App 组件
- 主应用组件，包含所有状态和逻辑
- 管理消息列表、输入状态、加载状态
- 处理 API 调用和消息记录

### 消息显示组件
- 使用 ReactMarkdown 渲染 AI 回答
- 支持代码语法高亮
- 用户消息和 AI 消息不同样式

### 右侧消息记录面板
- 显示所有消息记录列表
- 支持点击查看消息详情
- 显示消息预览和时间

## 状态管理

### 主要状态
- `messages`: 当前对话消息列表
- `input`: 输入框内容
- `isLoading`: 加载状态
- `messageRecords`: 消息记录列表
- `activeMessageId`: 当前选中的消息 ID

### LocalStorage 存储
- `message-records`: 消息记录数据
- 自动保存和加载

## API 调用设计

### 智谱 AI API
- **端点**: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- **认证**: Bearer Token
- **模型**: glm-4-flash
- **模式**: 流式输出 (stream: true)

### 请求格式
```json
{
  "model": "glm-4-flash",
  "messages": [
    {"role": "user", "content": "问题内容"}
  ],
  "stream": true
}
```

### 响应格式
SSE 流式响应，每条数据格式：
```json
{
  "choices": [
    {
      "delta": {
        "content": "回复内容片段"
      }
    }
  ]
}
```

## 样式设计

### 布局结构
- 主区域: 聊天消息显示
- 右侧边栏: 消息记录面板
- 底部区域: 输入框和控制按钮

### 颜色方案
- 用户消息: 蓝色背景，白色文字
- AI 消息: 白色背景，灰色边框
- 右侧边栏: 浅灰色背景

### 响应式设计
- 使用 Tailwind CSS 的响应式类
- 适配不同屏幕尺寸

## 错误处理

### API 错误
- 网络请求失败时显示错误消息
- 详细的错误信息展示
- 自动重试机制

### 输入验证
- 空消息不允许发送
- 发送时禁用输入框
- 加载状态提示

## 性能优化

### 流式处理
- 使用 SSE 实现流式输出
- 逐字更新消息内容
- 避免一次性渲染大量内容

### 状态更新
- 使用 React 的状态管理
- 避免不必要的重新渲染
- 优化消息更新逻辑

## 安全考虑

### API 密钥
- 从环境变量读取，不硬编码
- 不提交到版本控制系统
- 生产环境使用安全的密钥管理

### 数据存储
- LocalStorage 存储敏感数据
- 考虑数据加密（未来扩展）
- 用户隐私保护