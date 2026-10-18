import { useState } from 'react'
import { request, setToken } from '../../utils/index.js'

interface LoginProps {
  onSuccess: (token: string) => void
}

export default function Login({ onSuccess }: LoginProps) {
  const [username, setUsername] = useState('student01')
  const [password, setPassword] = useState('Student@123456')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError('')

    try {
      const data = await request('POST', '/auth/login', { username, password })
      if (!data?.access_token) {
        throw new Error('登录失败：接口没有返回 token')
      }

      setToken(data.access_token)
      onSuccess(data.access_token)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">AI 聊天助手</h1>

        <input
          className="login-input"
          type="text"
          value={username}
          placeholder="用户名"
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          value={password}
          placeholder="密码"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="login-error">{error}</p>}

        <button
          className="login-button"
          type="submit"
          disabled={isLoading || !username || !password}
        >
          {isLoading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  )
}
