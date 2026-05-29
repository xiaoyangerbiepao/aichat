# AI 聊天助手

基于 React 19 + TypeScript + Vite 开发的 AI 聊天应用，集成智谱 AI API，支持流式对话和 Markdown 渲染。

## 功能特性

- 🤖 智能对话：调用智谱 AI API 进行对话
- 💬 流式输出：AI 回答逐字显示，提供更好的用户体验
- 📝 Markdown 支持：支持 Markdown 格式和代码高亮
- 💾 本地存储：对话历史保存在 localStorage 中
- 🎨 现代界面：类似微信的聊天界面设计

## 技术栈

- 前端：React 19 + TypeScript + Vite
- 样式：Tailwind CSS
- Markdown 渲染：react-markdown + react-syntax-highlighter

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件，填入你的智谱 AI API 密钥：

```env
VITE_API_KEY=your_zhipu_api_key_here
VITE_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问应用

打开浏览器访问 `http://localhost:5173`

## 项目结构

```
aichat/
├── src/
│   ├── App.tsx          # 主应用组件
│   ├── main.tsx         # 应用入口
│   └── index.css        # 全局样式
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── tailwind.config.js   # Tailwind 配置
├── vite.config.js       # Vite 配置
└── tsconfig.json        # TypeScript 配置
```

## 开发脚本

```bash
# 启动前端开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 注意事项

1. 确保已正确配置 API 密钥
2. 对话历史保存在浏览器的 localStorage 中
3. 生产环境部署时请配置 HTTPS

## 许可证

MIT