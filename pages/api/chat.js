// Chat API using Gist API with full debugging
const BASE_URL = 'https://api.gist.ai/v1';
const requestCounts = new Map();
const RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT || '20');
const RATE_WINDOW = 60 * 1000; // 1 minute

// Debug: Log basic info on module load
console.log('🔧 Chat API module loaded - Gist API mode');
console.log('🔧 Environment check:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - CHAT_RATE_LIMIT:', process.env.CHAT_RATE_LIMIT || 'default(20)');

export default async function handler(req, res) {
  const debug = { logs: [], timings: {} };
  const startTime = Date.now();
  function log(...args) {
    debug.logs.push(args.map(String).join(' '));
    console.log('[GIST-DEBUG]', ...args);
  }

  log('Request received:', req.method, req.url);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    log('OPTIONS preflight');
    return res.status(200).end();
  }

  if (!process.env.GIST_API_KEY) {
    log('❌ GIST_API_KEY missing in environment');
    return res.status(500).json({ error: 'GIST_API_KEY not configured', debug });
  }

  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const clientRequests = requestCounts.get(clientIP) || { count: 0, resetTime: now + RATE_WINDOW };
  if (now > clientRequests.resetTime) {
    clientRequests.count = 0;
    clientRequests.resetTime = now + RATE_WINDOW;
  }
  clientRequests.count++;
  requestCounts.set(clientIP, clientRequests);
  if (clientRequests.count > RATE_LIMIT) {
    log('429 Too many requests from', clientIP);
    return res.status(429).json({ error: 'Too many requests. Please try again later.', retryAfter: Math.ceil((clientRequests.resetTime - now) / 1000), debug });
  }

  if (req.method !== 'POST') {
    log('405 Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed', debug });
  }

  let question, context;
  try {
    ({ question, context } = req.body);
    log('Request body:', JSON.stringify(req.body));
  } catch (e) {
    log('400 Invalid JSON body');
    return res.status(400).json({ error: 'Invalid JSON body', debug });
  }
  if (!question) {
    log('400 Missing question');
    return res.status(400).json({ error: 'Question is required', debug });
  }

  // Generate a user ID for this session
  const userId = req.headers['x-user-id'] || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  log('User ID:', userId);

  // 1. Create chat
  let thread_id, turn_id, chatDebug = {};
  try {
    const chatPayload = { user_prompt: question, temperature: 0.7 };
    log('POST', BASE_URL + '/chat', chatPayload);
    const chatRes = await fetch(BASE_URL + '/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GIST_API_KEY}`,
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      body: JSON.stringify(chatPayload)
    });
    chatDebug.status = chatRes.status;
    chatDebug.headers = Object.fromEntries(chatRes.headers.entries());
    const chatData = await chatRes.json().catch(() => ({}));
    chatDebug.body = chatData;
    log('Chat response:', chatRes.status, chatData);
    if (!chatRes.ok) throw new Error('Gist chat error: ' + chatRes.status);
    thread_id = chatData.thread_id;
    turn_id = chatData.turn_id;
    if (!thread_id || !turn_id) throw new Error('Missing thread_id/turn_id');
  } catch (err) {
    log('❌ Error creating chat:', err.message, chatDebug);
    return res.status(500).json({ error: 'Failed to create chat', debug: { ...debug, chatDebug } });
  }

  // 2. Stream response
  let answer = '', streamDebug = {};
  try {
    const url = `${BASE_URL}/chat/response/${thread_id}/${turn_id}`;
    log('GET', url);
    const streamRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.GIST_API_KEY}`,
        'X-User-ID': userId
      }
    });
    streamDebug.status = streamRes.status;
    streamDebug.headers = Object.fromEntries(streamRes.headers.entries());
    if (!streamRes.ok) throw new Error('Gist stream error: ' + streamRes.status);
    const reader = streamRes.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    while (!done) {
      const { value, done: streamDone } = await reader.read();
      if (streamDone) break;
      const chunk = decoder.decode(value);
      chunk.split('\n').forEach(line => {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) answer += data.content;
          } catch (e) {
            log('Stream JSON parse error:', line);
          }
        }
      });
    }
    log('Streamed answer:', answer.length, 'chars');
  } catch (err) {
    log('❌ Error streaming response:', err.message, streamDebug);
    return res.status(500).json({ error: 'Failed to stream answer', debug: { ...debug, streamDebug } });
  }

  // 3. Get citations
  let citations = [], citationsDebug = {};
  try {
    const url = `${BASE_URL}/chat/citations/${thread_id}/${turn_id}`;
    log('GET', url);
    const citRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.GIST_API_KEY}`,
        'X-User-ID': userId
      }
    });
    citationsDebug.status = citRes.status;
    citationsDebug.headers = Object.fromEntries(citRes.headers.entries());
    if (citRes.ok) {
      citations = await citRes.json();
      log('Citations:', Array.isArray(citations) ? citations.length : citations);
    } else {
      log('Citations fetch error:', citRes.status);
    }
  } catch (err) {
    log('❌ Error fetching citations:', err.message, citationsDebug);
  }

  // 4. Get attributions
  let attributions = {}, attributionsDebug = {};
  try {
    const url = `${BASE_URL}/chat/attributions/${thread_id}/${turn_id}`;
    log('GET', url);
    const attrRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.GIST_API_KEY}`,
        'X-User-ID': userId
      }
    });
    attributionsDebug.status = attrRes.status;
    attributionsDebug.headers = Object.fromEntries(attrRes.headers.entries());
    if (attrRes.ok) {
      attributions = await attrRes.json();
      log('Attributions:', Object.keys(attributions));
    } else {
      log('Attributions fetch error:', attrRes.status);
    }
  } catch (err) {
    log('❌ Error fetching attributions:', err.message, attributionsDebug);
  }

  debug.timings.total = Date.now() - startTime;
  log('Total time:', debug.timings.total, 'ms');

  return res.status(200).json({
    success: true,
    answer,
    threadId: thread_id,
    turnId: turn_id,
    citations,
    attributions,
    model: 'gist-ai',
    responseTime: debug.timings.total,
    debug
  });
}

// Export config for Next.js API routes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: false
  }
}; 