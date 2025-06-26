import { gistChatCompletion } from './utils/gistChat';
import { getCitations, getAttributions } from './utils/gistCitations';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const debug = { logs: [] };
  function log(...args) { debug.logs.push(args.map(String).join(' ')); }

  try {
    const { question, context } = req.body;
    if (!question || typeof question !== 'string') {
      log('❌ Missing or invalid question');
      return res.status(400).json({ error: 'Missing or invalid question', debug });
    }

    // Use a stable user ID for demo purposes (in production, use session/user info or device ID)
    let userId = req.headers['x-user-id'] || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'demo-user';
    if (Array.isArray(userId)) userId = userId[0];
    userId = String(userId);
    log('User ID:', userId);

    // Compose messages for Gist API
    let userPrompt = question;
    if (context && typeof context === 'string' && context.trim().length > 0) {
      userPrompt = `If the question is relating to the context of the website, use this URL: ${context} If not, just answer the question normally.\n\n${question}`;
    }
    const messages = [
      { role: 'user', content: userPrompt }
    ];
    log('Messages:', JSON.stringify(messages));

    // Call Gist chat completion utility
    const chatResult = await gistChatCompletion({ messages, userId });
    log('Gist chat result:', JSON.stringify({ threadId: chatResult.threadId, turnId: chatResult.turnId }));

    // Fetch citations and attributions
    let citations = [];
    let attributions = {};
    try {
      const citationsResult = await getCitations(chatResult.threadId, chatResult.turnId, userId);
      citations = citationsResult.citations;
      log('Citations:', Array.isArray(citations) ? citations.length : citations);
    } catch (e) {
      log('Citations fetch error:', e.message);
    }
    try {
      const attributionsResult = await getAttributions(chatResult.threadId, chatResult.turnId, userId);
      attributions = attributionsResult.attributions;
      log('Attributions:', Object.keys(attributions));
    } catch (e) {
      log('Attributions fetch error:', e.message);
    }

    return res.status(200).json({
      answer: chatResult.answer,
      citations,
      attributions,
      debug: { ...debug, chat: chatResult.debug }
    });
  } catch (error) {
    log('❌ API error:', error.message);
    return res.status(500).json({ error: 'Internal server error', details: error.message, debug });
  }
} 