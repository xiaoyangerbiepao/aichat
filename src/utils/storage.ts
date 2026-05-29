import { Message } from '../components'
import { MessageRecord } from '../App'

interface ChatStorage {
  messages: Message[]
  messageRecords: MessageRecord[]
  timestamp: number
  version: string
}

const STORAGE_KEY = 'chat-history'
const BACKUP_KEY = 'chat-history-backup'
const VERSION = '1.0'

// 验证存储数据格式
const validateStorageData = (data: any): boolean => {
  return (
    data &&
    Array.isArray(data.messages) &&
    Array.isArray(data.messageRecords) &&
    typeof data.timestamp === 'number'
  )
}

// 保存对话历史到 LocalStorage
export const saveChatHistory = (messages: Message[], messageRecords: MessageRecord[]): void => {
  const data: ChatStorage = {
    messages,
    messageRecords,
    timestamp: Date.now(),
    version: VERSION
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    // 创建备份
    localStorage.setItem(BACKUP_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('保存失败:', error)
    // 处理存储空间不足
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      cleanupOldData()
      // 重试保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (retryError) {
        console.error('重试保存失败:', retryError)
      }
    }
  }
}

// 从 LocalStorage 加载对话历史
export const loadChatHistory = (): ChatStorage | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
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

// 从备份恢复数据
const restoreFromBackup = (): ChatStorage | null => {
  const backup = localStorage.getItem(BACKUP_KEY)
  if (backup) {
    try {
      const data = JSON.parse(backup)
      if (validateStorageData(data)) {
        // 恢复主数据
        localStorage.setItem(STORAGE_KEY, backup)
        return data
      }
    } catch (error) {
      console.error('备份恢复失败:', error)
    }
  }
  return null
}

// 清理旧数据（存储空间不足时）
const cleanupOldData = (): void => {
  try {
    // 删除备份
    localStorage.removeItem(BACKUP_KEY)
    // 可以添加更多清理逻辑
  } catch (error) {
    console.error('清理数据失败:', error)
  }
}

// 清空对话历史
export const clearChatHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(BACKUP_KEY)
  } catch (error) {
    console.error('清空历史失败:', error)
  }
}

// 检查是否有保存的数据
export const hasSavedHistory = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) !== null
}