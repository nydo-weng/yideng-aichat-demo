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
      '当前处于本地模拟模式，尚未连接 GraphQL Worker。',
      '',
      '你刚刚提到：',
      lastUserMessage,
      '',
      '提示：设置 VITE_WORKER_API_URL 指向你的 Cloudflare Worker 即可使用真实回复。',
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
