// Gist Chat Completion Utility
const BASE_URL = 'https://api.gist.ai/v1';

async function gistChatCompletion({ messages, userId, temperature = 0.7 }) {
  const debug = { logs: [] };
  function log(...args) { debug.logs.push(args.map(String).join(' ')); }

  if (!process.env.GIST_API_KEY) {
    log('❌ GIST_API_KEY missing');
    throw new Error('GIST_API_KEY not configured');
  }
  if (!userId) {
    log('❌ userId missing');
    throw new Error('userId is required');
  }
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    log('❌ messages missing or invalid');
    throw new Error('messages is required');
  }

  const url = `${BASE_URL}/chat/completions`;
  const headers = {
    'accept': 'text/event-stream',
    'X-User-ID': userId,
    'Authorization': `Bearer ${process.env.GIST_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({ messages, temperature });
  log('POST', url, body);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body
  });
  log('Response status:', response.status);
  if (!response.ok) {
    const text = await response.text();
    log('❌ Error response:', text);
    throw new Error(`Gist API error: ${response.status} ${text}`);
  }

  // Parse streaming response
  let answer = '';
  let threadId = null;
  let turnId = null;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  while (!done) {
    const { value, done: streamDone } = await reader.read();
    if (streamDone) break;
    const chunk = decoder.decode(value);
    chunk.split('\n').forEach(line => {
      if (line.startsWith('event: metadata')) {
        // Next line should be data: {"threadId":..., "turnId":...}
        // We'll parse it below
      } else if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.threadId) threadId = data.threadId;
          if (data.turnId) turnId = data.turnId;
          if (data.content) answer += data.content;
        } catch (e) {
          log('Stream JSON parse error:', line);
        }
      }
    });
  }
  log('Answer:', answer.length, 'chars', 'Thread:', threadId, 'Turn:', turnId);
  return { answer, threadId, turnId, debug };
}

module.exports = { gistChatCompletion }; 