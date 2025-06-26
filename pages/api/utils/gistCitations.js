// Gist Citations & Attributions Utility
const BASE_URL = 'https://api.gist.ai/v1';

async function getCitations(threadId, turnId, userId) {
  const debug = { logs: [] };
  function log(...args) { debug.logs.push(args.map(String).join(' ')); }
  if (!process.env.GIST_API_KEY) throw new Error('GIST_API_KEY not configured');
  if (!threadId || !turnId || !userId) throw new Error('threadId, turnId, and userId are required');
  const url = `${BASE_URL}/chat/citations/${threadId}/${turnId}`;
  log('GET', url);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.GIST_API_KEY}`,
      'X-User-ID': userId
    }
  });
  log('Response status:', res.status);
  if (!res.ok) {
    const text = await res.text();
    log('❌ Error response:', text);
    throw new Error(`Gist API error: ${res.status} ${text}`);
  }
  const data = await res.json();
  log('Citations:', Array.isArray(data) ? data.length : data);
  return { citations: data, debug };
}

async function getAttributions(threadId, turnId, userId) {
  const debug = { logs: [] };
  function log(...args) { debug.logs.push(args.map(String).join(' ')); }
  if (!process.env.GIST_API_KEY) throw new Error('GIST_API_KEY not configured');
  if (!threadId || !turnId || !userId) throw new Error('threadId, turnId, and userId are required');
  const url = `${BASE_URL}/chat/attributions/${threadId}/${turnId}`;
  log('GET', url);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.GIST_API_KEY}`,
      'X-User-ID': userId
    }
  });
  log('Response status:', res.status);
  if (!res.ok) {
    const text = await res.text();
    log('❌ Error response:', text);
    throw new Error(`Gist API error: ${res.status} ${text}`);
  }
  const data = await res.json();
  log('Attributions:', Object.keys(data));
  return { attributions: data, debug };
}

module.exports = { getCitations, getAttributions }; 