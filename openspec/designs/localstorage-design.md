# LocalStorage 对话历史设计文档

## 概述

实现对话历史的本地存储功能，确保用户对话数据在页面刷新后仍然可用。

## 数据存储设计

### 存储结构
```typescript
interface ChatStorage {
  messages: Message[]           // 当前对话消息
  messageRecords: MessageRecord[]  // 消息记录
  timestamp: number             // 最后更新时间
  version: string              // 数据版本号
}
```

### 存储键名
- 主键：`chat-history`
- 备份键：`chat-history-backup`
- 版本键：`chat-history-version`

## 功能实现

### 1. 自动保存功能

#### 保存时机
- 用户发送消息后
- AI 回复完成后
- 页面卸载前 (beforeunload 事件)
- 定时自动保存 (每30秒)

#### 保存逻辑
```typescript
const saveChatHistory = () => {
  const data: ChatStorage = {
    messages,
    messageRecords,
    timestamp: Date.now(),
    version: '1.0'
  }
  
  try {
    localStorage.setItem('chat-history', JSON.stringify(data))
    // 创建备份
    localStorage.setItem('chat-history-backup', JSON.stringify(data))
  } catch (error) {
    console.error('保存失败:', error)
    // 处理存储空间不足
  }
}
```

### 2. 页面加载读取

#### 读取时机
- 组件挂载时 (useEffect)
- 页面加载完成时

#### 读取逻辑
```typescript
const loadChatHistory = (): ChatStorage | null => {
  try {
    const saved = localStorage.getItem('chat-history')
    if (saved) {
      const data = JSON.parse(saved) as ChatStorage
      // 数据验证
      if (validateStorageData(data)) {
        return data
      }
    }
  } catch (error) {
    console.error('加载失败:', error)
    // 尝试从备份恢复
    return restoreFromBackup()
  }
  return null
}
```

#### 数据验证
```typescript
const validateStorageData = (data: any): boolean => {
  return (
    data &&
    Array.isArray(data.messages) &&
    Array.isArray(data.messageRecords) &&
    typeof data.timestamp === 'number'
  )
}
```

### 3. 清空对话功能

#### 清空逻辑
```typescript
const clearChatHistory = () => {
  // 确认操作
  if (window.confirm('确定要清空所有对话历史吗？')) {
    setMessages([])
    setMessageRecords([])
    
    // 清除 LocalStorage
    localStorage.removeItem('chat-history')
    localStorage.removeItem('chat-history-backup')
    
    // 显示提示
    showNotification('对话历史已清空')
  }
}
```

## 集成到主应用

### App.tsx 修改

#### 状态管理
```typescript
const [messages, setMessages] = useState<Message[]>([])
const [messageRecords, setMessageRecords] = useState<MessageRecord[]>([])
```

#### 页面加载时读取
```typescript
useEffect(() => {
  const savedData = loadChatHistory()
  if (savedData) {
    setMessages(savedData.messages)
    setMessageRecords(savedData.messageRecords)
  }
}, [])
```

#### 消息更新时保存
```typescript
// 在消息更新后调用
useEffect(() => {
  if (messages.length > 0 || messageRecords.length > 0) {
    saveChatHistory()
  }
}, [messages, messageRecords])
```

#### 清空按钮功能
```typescript
const handleClear = () => {
  clearChatHistory()
}
```

## 性能优化

### 防抖保存
```typescript
const debouncedSave = debounce(saveChatHistory, 1000)

// 在消息更新时使用
useEffect(() => {
  debouncedSave()
}, [messages, messageRecords])
```

### 增量更新
- 只保存变化的部分
- 减少序列化开销
- 提升保存速度

### 数据压缩
- 对大量消息进行压缩
- 减少 LocalStorage 占用
- 提升读写性能

## 错误处理

### 存储空间不足
```typescript
try {
  localStorage.setItem('chat-history', JSON.stringify(data))
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // 清理旧数据
    cleanupOldData()
    // 重试保存
    localStorage.setItem('chat-history', JSON.stringify(data))
  }
}
```

### 数据格式错误
```typescript
try {
  const data = JSON.parse(saved)
  if (!validateStorageData(data)) {
    throw new Error('数据格式错误')
  }
} catch (error) {
  // 使用备份数据
  return restoreFromBackup()
}
```

### 备份恢复
```typescript
const restoreFromBackup = (): ChatStorage | null => {
  const backup = localStorage.getItem('chat-history-backup')
  if (backup) {
    try {
      const data = JSON.parse(backup)
      if (validateStorageData(data)) {
        // 恢复主数据
        localStorage.setItem('chat-history', backup)
        return data
      }
    } catch (error) {
      console.error('备份恢复失败:', error)
    }
  }
  return null
}
```

## 用户体验优化

### 保存状态提示
- 静默保存，不打扰用户
- 错误时显示提示
- 成功时可选提示

### 加载动画
- 大量数据加载时显示进度
- 防止界面卡顿

### 数据同步
- 考虑多标签页同步
- 防止数据冲突

## 安全考虑

### 数据隐私
- 只存储必要信息
- 不存储敏感数据
- 考虑数据加密

### 数据清理
- 定期清理过期数据
- 防止 LocalStorage 满
- 用户可控的数据管理

## 测试策略

### 功能测试
- ✅ 自动保存功能
- ✅ 页面加载读取
- ✅ 清空对话功能
- ✅ 数据验证逻辑

### 边界测试
- ✅ 空数据处理
- ✅ 大量数据存储
- ✅ 存储空间不足
- ✅ 数据格式错误

### 兼容性测试
- ✅ 不同浏览器支持
- ✅ 私密浏览模式
- ✅ 移动端兼容性

## 后续优化

### 功能增强
- 对话历史管理界面
- 导出/导入功能
- 数据同步功能
- 多设备同步

### 性能优化
- 数据压缩算法
- 增量更新策略
- 异步保存机制

### 用户体验
- 保存进度指示
- 数据恢复提示
- 存储空间管理