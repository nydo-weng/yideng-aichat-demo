const WORKER_URL = import.meta.env.VITE_WORKER_API_URL?.trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isWorkerConfigured = Boolean(WORKER_URL);

const ASK_MUTATION = `
  mutation Ask($question: String!, $messages: [MessageInput!]!) {
    ask(question: $question, messages: $messages) {
      reply
    }
  }
`;

export async function createAssistantReply(messages) {
  if (!isWorkerConfigured) {
    await sleep(600);
    const lastUserMessage =
      [...messages].reverse().find((msg) => msg.role === 'user')?.content ||
      '（暂未输入内容）';

    return [
      '现在是本地 Demo 模式，暂未连上 Cloudflare Worker～',
      '',
      '你刚刚说的是：',
      lastUserMessage,
      '',
      '把 VITE_WORKER_API_URL 配成你的 Worker 地址就能和 DeepSeek 真正开聊啦 🚀',
    ].join('\n');
  }

  const latestUserInput =
    [...messages].reverse().find((msg) => msg.role === 'user')?.content || '';

  const variables = {
    question: latestUserInput,
    messages: messages.map(({ role, content }) => ({ role, content })),
  };

  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: ASK_MUTATION, variables }),
  });

  if (!response.ok) {
    const fallback = await safeReadText(response);
    throw new Error(`GraphQL 接口错误：${response.status} ${fallback}`);
  }

  const result = await safeReadJson(response);

  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message || 'GraphQL 请求出错');
  }

  const reply = result?.data?.ask?.reply;
  if (!reply) {
    throw new Error('GraphQL 响应缺少 ask.reply 字段');
  }

  return String(reply).trim();
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
