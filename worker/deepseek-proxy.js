/**
 * DealClaw DeepSeek API Proxy - Cloudflare Worker
 *
 * Forwards chat completion requests to DeepSeek API while keeping
 * the API key server-side. Includes CORS handling and basic rate limiting.
 *
 * Environment variable required:
 *   DEEPSEEK_API_KEY - Your DeepSeek API key (set via wrangler secret)
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const ALLOWED_ORIGIN = 'https://wangyangmingsss.github.io';
const RATE_LIMIT_MAX = 10;       // max requests per window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute window

// ---------------------------------------------------------------------------
// In-memory rate limiter (resets on worker restart / new isolate)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map(); // ip -> { count, resetAt }

function isRateLimited(ip) {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip);
  }

  entry.count += 1;
  rateLimitMap.set(ip, entry);

  return entry.count > RATE_LIMIT_MAX;
}

// Periodically prune stale entries to avoid unbounded growth
function pruneRateLimitMap() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}

// ---------------------------------------------------------------------------
// CORS helpers
// ---------------------------------------------------------------------------
function corsHeaders(origin) {
  const allowedOrigin = origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

// ---------------------------------------------------------------------------
// Request handler
// ---------------------------------------------------------------------------
export default {
  async fetch(request, env, _ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Only accept POST /api/chat
    if (url.pathname !== '/api/chat') {
      return jsonResponse({ error: 'Not found' }, 404, origin);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, origin);
    }

    // Rate limiting by client IP
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(clientIP)) {
      return jsonResponse(
        { error: 'Rate limit exceeded. Max 10 requests per minute.' },
        429,
        origin,
      );
    }

    // Prune stale rate-limit entries occasionally
    if (Math.random() < 0.1) {
      pruneRateLimitMap();
    }

    // Validate API key is configured
    const apiKey = env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: 'Server misconfiguration: API key not set' }, 500, origin);
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400, origin);
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      return jsonResponse({ error: 'Missing or invalid "messages" array' }, 400, origin);
    }

    // Forward to DeepSeek API
    try {
      const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: body.model || 'deepseek-chat',
          messages: body.messages,
          max_tokens: body.max_tokens || 300,
          temperature: body.temperature ?? 0.3,
        }),
      });

      const responseData = await deepseekResponse.json();

      if (!deepseekResponse.ok) {
        return jsonResponse(
          { error: 'DeepSeek API error', status: deepseekResponse.status, detail: responseData },
          deepseekResponse.status,
          origin,
        );
      }

      return jsonResponse(responseData, 200, origin);
    } catch (err) {
      return jsonResponse(
        { error: 'Failed to reach DeepSeek API', detail: err.message },
        502,
        origin,
      );
    }
  },
};
