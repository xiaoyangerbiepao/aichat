import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 后端没配 CORS，浏览器直连 localhost:8000 会因预检 OPTIONS 返回 405 被拦截，
      // 交给 dev server 代理就是同源请求，不触发预检
      '/qa': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})