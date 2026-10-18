// 把对象拼接成查询字符串，用于 GET 请求
const buildQueryString = (params) => {
  const search = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.append(key, value)
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

// 登录后拿到的 token 存这里，刷新页面也还在
const TOKEN_KEY = 'aichat-token'

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// 处理一条 SSE 事件（服务端用空行分隔的一条消息）
const handleSSEEvent = (event, onMessage) => {
  // 一条事件可能有多行字段，只有 data: 开头的才是数据
  // event: / id: / retry: 等字段这里用不到，注释行（以 : 开头）也要忽略
  const dataLines = event
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())

  if (!dataLines.length) return

  // 多行 data 按规范用 \n 拼接后再解析
  const data = dataLines.join('\n')
  // 约定：[DONE] 是结束标记，不是 JSON
  if (data === '[DONE]') return

  // 后端可能推 JSON，也可能直接推一段纯文本，两种都兼容
  try {
    onMessage(JSON.parse(data))
  } catch {
    onMessage(data)
  }
}

// 读取流式响应：SSE 是服务端持续分块推送，必须边收边解析，不能等整个响应体结束
const readSSEStream = async (response, onMessage) => {
  const reader = response.body.getReader()
  // 中文是多字节的，chunk 可能在半个汉字处断开，所以用 TextDecoder 的解码缓冲
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    // 一个 chunk 可能只包含半条消息，也可能包含好几条，先攒进缓冲区
    buffer += decoder.decode(value, { stream: true })

    // 按空行切成完整事件（分隔符可能是 \n\n 也可能是 \r\n\r\n），
    // 最后一段可能被截断，留到下一次再拼
    const events = buffer.split(/\r?\n\r?\n/)
    buffer = events.pop()
    events.forEach((event) => handleSSEEvent(event, onMessage))
  }

  // 流结束时，缓冲区里可能还剩下最后一条没有以空行结尾的消息
  if (buffer.trim()) handleSSEEvent(buffer, onMessage)
}

/**
 * 调用接口
 * @param {'GET' | 'POST'} method 请求方式，仅支持 get / post
 * @param {string} url 请求路径
 * @param {object} params 请求参数，GET 作为查询参数，POST 作为请求体
 * @param {object} [options] 可选配置
 * @param {boolean} [options.stream] 是否按 SSE 流式接收
 * @param {object} [options.headers] 额外请求头，比如 Authorization
 * @param {(chunk: any) => void} [options.onMessage] 流式回调，每收到一帧调用一次
 * @returns {Promise<any>} 非流式时返回接口数据，流式时返回 undefined
 */
export const request = async (method, url, params = {}, { stream = false, headers = {}, onMessage } = {}) => {
  const requestMethod = String(method).toUpperCase()
  if (requestMethod !== 'GET' && requestMethod !== 'POST') {
    throw new Error(`不支持的请求方式: ${method}`)
  }

  // 已登录就自动带上 token，业务侧不用每次手动传
  const token = getToken()
  const options = {
    method: requestMethod,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  }

  let targetUrl = url
  if (requestMethod === 'GET') {
    targetUrl += buildQueryString(params)
  } else {
    options.body = JSON.stringify(params)
  }

  try {
    const response = await fetch(targetUrl, options)

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      // FastAPI 的错误体是 detail 字段，取出来更友好
      throw new Error((error && (error.message || error.detail)) || `请求失败(${response.status})`)
    }

    // 流式：每收到一段就回调一次，适合边生成边渲染
    if (stream && typeof onMessage === 'function') {
      await readSSEStream(response, onMessage)
      return
    }

    return await response.json().catch(() => null)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('网络异常，请检查网络后重试')
    }
    throw error
  }
}
