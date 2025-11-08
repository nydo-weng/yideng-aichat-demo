const API_URL = import.meta.env.VITE_CHAT_API_URL?.trim();
const API_KEY = import.meta.env.VITE_CHAT_API_KEY?.trim();
const DEFAULT_MODEL = import.meta.env.VITE_CHAT_MODEL?.trim() || 'gpt-4o-mini';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isRealApiConfigured = Boolean(API_URL);

/**
 * Send the conversation to the configured API and return the assistant reply.
 * Falls back to a deterministic mock response when no API is provided yet.
 */
export async function createAssistantReply(messages) {
  if (!isRealApiConfigured) {
    await sleep(800);
    const lastUserMessage =
      [...messages].reverse().find((msg) => msg.role === 'user')?.content ||
      '（暂未输入内容）';

    return [
      '这是一个占位回复，接入真实 API 后这里会替换成真正的 AI 回答。test 更新仓库',
      '',
      '你刚刚提到：',
      lastUserMessage,
      '',
      '提示：创建 .env 文件并配置 VITE_CHAT_API_URL / VITE_CHAT_API_KEY 即可切换到真实接口。',
    ].join('\n');
  }

  const payload = {
    messages: messages.map(({ role, content }) => ({ role, content })),
    model: DEFAULT_MODEL,
    temperature: Number(import.meta.env.VITE_CHAT_TEMPERATURE ?? 0.7),
    max_tokens: Number(import.meta.env.VITE_CHAT_MAX_TOKENS ?? 512),
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await safeReadText(response);
    throw new Error(`API 请求失败：${response.status} ${errorText}`);
  }

  const data = await safeReadJson(response);
  const candidate =
    data?.reply ||
    data?.message ||
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text;

  if (!candidate) {
    throw new Error('API 响应中没有找到可用的回复内容');
  }

  return candidate.trim();
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

async function safeReadJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
