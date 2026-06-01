// ACB Calculator — speech-to-text proxy (Cloudflare Worker)
// ----------------------------------------------------------------------------
// The browser records a short clip of the user saying a drug name, encodes it
// as a 16 kHz mono WAV, and POSTs the raw bytes here. This Worker runs OpenAI
// Whisper on Cloudflare Workers AI and returns { text }.
//
// Why a proxy at all: a public, static GitHub Pages site cannot safely hold an
// API key (the source is public). This Worker keeps the call server-side. It
// does NOT use a third-party key — it calls Cloudflare's OWN Workers AI model
// via the `AI` binding, so the only account involved is yours.
//
// Privacy: audio is forwarded to Cloudflare Workers AI for transcription and is
// not stored by this Worker. Disclose this in the app's privacy text.
//
// Abuse protection (a public proxy can be hit by anyone):
//   • Origin allow-list below (deters casual cross-site use).
//   • Hard request-size cap.
//   • IMPORTANT: also set a Workers AI usage/billing alert + limit in the
//     Cloudflare dashboard — the Origin header can be spoofed by non-browser
//     clients, so the dashboard limit is your real financial backstop.
// ----------------------------------------------------------------------------

const ALLOWED_ORIGINS = [
  'https://phd-center.github.io',  // production (GitHub Pages)
  'http://localhost:8765',         // local dev/preview
  'http://127.0.0.1:8765',
];

const MAX_BYTES = 5 * 1024 * 1024;            // ~5 MB (≈ 2.5 min of 16 kHz mono WAV)
const MODEL = '@cf/openai/whisper';           // swap to '@cf/openai/whisper-large-v3-turbo' for higher accuracy

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders(origin) });
    }
    // Reject obviously-foreign origins (browsers always send Origin cross-site).
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new Response('Forbidden origin', { status: 403, headers: corsHeaders(origin) });
    }

    const buf = await request.arrayBuffer();
    if (!buf || buf.byteLength === 0) {
      return Response.json({ error: 'empty audio' }, { status: 400, headers: corsHeaders(origin) });
    }
    if (buf.byteLength > MAX_BYTES) {
      return Response.json({ error: 'audio too large' }, { status: 413, headers: corsHeaders(origin) });
    }

    try {
      // @cf/openai/whisper takes the audio file bytes as an array of integers.
      const result = await env.AI.run(MODEL, { audio: [...new Uint8Array(buf)] });
      const text = (result && result.text ? String(result.text) : '').trim();
      return Response.json({ text }, { headers: corsHeaders(origin) });
    } catch (e) {
      return Response.json(
        { error: 'transcription failed', detail: String(e && e.message || e) },
        { status: 502, headers: corsHeaders(origin) },
      );
    }
  },
};
