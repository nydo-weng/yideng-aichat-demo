# AI Chat Demo (React)

一个纯前端的 AI Chat UI，参考 ChatGPT 等主流产品的交互与视觉，仅用 React + Vite 搭建，方便快速嵌入到你的业务中。

## 功能亮点

- ✅ 简洁单列对话框：保留必要的标题 + 消息列表 + 输入框
- ✅ Dummy 接口：未配置 Worker 时自动返回占位内容，方便本地开发
- ✅ 一键切换：配置 `VITE_WORKER_API_URL` 即可接入 Cloudflare Worker
- ✅ GraphQL + Cloudflare Worker（Serverless）代理 DeepSeek 模型
- ✅ UX 小细节：输入框回车发送、发送中动效、错误提示

> 需求简单、无需后端，本项目完全运行在浏览器端；只要你有能直接调用的 AI 接口即可接入。

## 快速开始

```bash
npm install
npm run dev
```

打开控制台输出的网址（默认 `http://localhost:5173`）即可体验。

## 接入 Cloudflare Worker（GraphQL）

1. 在项目根目录创建 `.env.local`
2. 写入以下变量：

```bash
VITE_WORKER_API_URL=https://your-worker.demo
```

3. 重新运行 `npm run dev`，右上角状态标记会显示 `Worker API`

> Worker 需要接受 GraphQL `POST` 请求，body 结构为 `{ query, variables }`，其中 `query` 是 `mutation Ask($question: String!, $messages: [MessageInput!]!) { ask(...) { reply } }`，`variables` 中包含 `question` 与完整 `messages`。请在 Worker 中解析 GraphQL 并返回 `{ "data": { "ask": { "reply": "..." }}}` 结构。

## 目录结构

```
├─ src
│  ├─ App.jsx            # 核心单列对话框
│  ├─ App.css            # 视觉样式
│  ├─ services
│  │  └─ chatClient.js   # Dummy/Worker API 调度
│  └─ main.jsx
├─ public                # 静态资源
└─ vite.config.js
```

## 常见问题

- **需要后端吗？**  
  不需要。只要你的 AI 平台提供 HTTP 接口，就可以直接在浏览器端调用。

- **如何自定义快捷提示、UI？**  
  修改 `src/App.jsx` 中的 `starterPrompts`、`initialMessages`，以及 `src/App.css` 中的样式即可。

- **可以扩展多会话 / 历史记录吗？**  
  可以，在当前结构基础上添加本地存储或后端存储层即可。
