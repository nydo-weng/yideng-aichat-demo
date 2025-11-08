const WORKER_URL = import.meta.env.VITE_WORKER_API_URL?.trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isWorkerConfigured = Boolean(WORKER_URL);

/**
 * Send the conversation to the Cloudflare Worker and return its reply.
 * Falls back to a deterministic mock response when no Worker endpoint is provided yet.
 */
export async function createAssistantReply(messages) {
  if (!isWorkerConfigured) {
    await sleep(800);
    const lastUserMessage =
      [...messages].reverse().find((msg) => msg.role === 'user')?.content ||
      '（暂未输入内容）';

    return [
      '这是一个占位回复，接入 Cloudflare Worker 后这里会替换成真正的 AI 回答。',
      '',
      '你刚刚提到：',
      lastUserMessage,
      '',
      '提示：创建 .env 文件并配置 VITE_WORKER_API_URL 指向你的 Worker 接口，即可切换到真实接口。',
    ].join('\n');
  }

  const latestUserInput =
    [...messages].reverse().find((msg) => msg.role === 'user')?.content || '';

  const payload = {
    question: latestUserInput,
    messages: messages.map(({ role, content }) => ({ role, content })),
  };

  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
    data?.choices?.[0]?.message?.content;

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
