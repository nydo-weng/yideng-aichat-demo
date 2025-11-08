# AI Chat Demo (React)

一个纯前端的 AI Chat UI，参考 ChatGPT 等主流产品的交互与视觉，仅用 React + Vite 搭建，方便快速嵌入到你的业务中。

## 功能亮点

- ✅ ChatGPT 风格的布局：侧边快捷提示、顶部状态、气泡式对话区
- ✅ Dummy 接口：未配置真实 API 时自动返回占位内容，方便本地开发
- ✅ 一键切换：配置 `VITE_CHAT_API_URL` / `VITE_CHAT_API_KEY` 即可接入真实后端
- ✅ UX 小细节：输入框回车发送、发送中动效、错误提示、快速提示按钮

> 需求简单、无需后端，本项目完全运行在浏览器端；只要你有能直接调用的 AI 接口即可接入。

## 快速开始

```bash
npm install
npm run dev
```

打开控制台输出的网址（默认 `http://localhost:5173`）即可体验。

## 接入自己的 API

1. 在项目根目录创建 `.env.local`
2. 写入以下变量（示例为兼容 OpenAI 风格接口）：

```bash
VITE_CHAT_API_URL=https://your-ai-provider.com/v1/chat/completions
VITE_CHAT_API_KEY=sk-your-token
# 可选项
VITE_CHAT_MODEL=gpt-4o-mini
VITE_CHAT_TEMPERATURE=0.7
VITE_CHAT_MAX_TOKENS=512
```

3. 重新运行 `npm run dev`，右上角状态标记会显示 `Live API`

> 真实接口需要能接受 `POST` JSON 请求，入参中包含 `messages`（role/content）即可。如果返回值字段不同，可在 `src/services/chatClient.js` 中调整解析逻辑。

## 目录结构

```
├─ src
│  ├─ App.jsx            # 核心页面与交互逻辑
│  ├─ App.css            # Chat UI 相关样式
│  ├─ services
│  │  └─ chatClient.js   # Dummy/真实 API 调度
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
