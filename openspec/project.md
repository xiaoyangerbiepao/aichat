# AI 聊天助手项目

## 项目概述
基于 React 19 + TypeScript + Vite 开发的 AI 聊天应用，集成智谱 AI API，支持流式对话和 Markdown 渲染。

## 技术栈
- **主要语言**: TypeScript
- **前端框架**: React 19
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **包管理器**: npm
- **AI 服务**: 智谱 AI API

## 项目结构
```
aichat/
├── src/
│   ├── App.tsx          # 主应用组件
│   ├── main.tsx         # 应用入口
│   └── index.css        # 全局样式
├── openspec/            # OpenSpec 规范文档
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── tailwind.config.js   # Tailwind 配置
├── vite.config.js       # Vite 配置
└── tsconfig.json        # TypeScript 配置
```

## 开发约定
- 使用 TypeScript 确保类型安全
- 使用 Tailwind CSS 编写样式
- API Key 从环境变量读取，不要硬编码
- 错误要有友好的提示
- 遵循 OpenSpec 规范管理文档

## 外部依赖
- 智谱 AI API: 用于 AI 对话功能
- LocalStorage: 用于本地存储对话历史