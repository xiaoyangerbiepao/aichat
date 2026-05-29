# AI 聊天助手开发指令

## 项目概述

使用 React + TypeScript 开发的 AI 聊天助手，调用智谱 AI API 实现对话功能。

## 开发规范

- 使用 TypeScript，确保类型安全
- 使用 Tailwind CSS 编写样式
- API Key 从环境变量读取，不要硬编码
- 错误要有友好的提示

## 功能要求

- 实现流式输出，AI 回答要逐字显示
- 支持多轮对话，要把历史消息发送给 API
- 对话历史要保存在 LocalStorage
- 支持 Markdown 渲染和代码高亮

## 注意事项

- 要处理 API 调用失败的情况
- 加载时要有明确的提示
- 输入框在发送时要禁用，避免重复发送

## OpenSpec 规范

### 文档归类
- `openspec/project.md`: 项目概述和技术栈
- `openspec/specs/`: 功能规格文档
- `openspec/designs/`: 技术设计文档
- `openspec/plans/`: 开发计划文档

### 变更管理
- 使用 OpenSpec 的 change 系统管理功能变更
- 每个变更需要有 proposal、design、tasks 等文档
- 变更完成后归档到设计文档中