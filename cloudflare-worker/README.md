# ACB Calculator — voice proxy (Cloudflare Worker)

A tiny Cloudflare Worker that powers the calculator's **🎯 精準語音 / Precision**
voice mode. The browser POSTs a short WAV clip; the Worker runs OpenAI Whisper
on **Cloudflare Workers AI** and returns `{ "text": "..." }`.

**Why this exists:** the calculator is a public, static GitHub Pages site, so it
can't safely embed an API key. This Worker keeps the call server-side — and it
uses **no third-party key**: it calls Cloudflare's own model via the `AI`
binding, so the only account involved is yours. Users never set up anything.

## Deploy (one time, ~5 minutes)

You need a free [Cloudflare](https://dash.cloudflare.com/sign-up) account.

```bash
cd cloudflare-worker
npm install -g wrangler      # or: npm i -D wrangler
wrangler login               # opens a browser to authorise
wrangler deploy
```

`wrangler deploy` prints your Worker URL, e.g.:

```
https://acb-voice.<your-subdomain>.workers.dev
```

## Wire it into the app

Open `index.html`, find `_VOICE_PROXY_DEFAULT` (in the voice section) and paste
the URL:

```js
const _VOICE_PROXY_DEFAULT = 'https://acb-voice.<your-subdomain>.workers.dev';
```

Once set, the **🎯 精準語音** toggle appears next to the 🎤 button. (For quick
testing without editing the file you can instead run
`localStorage.setItem('acb-voice-proxy', 'https://…workers.dev')` in the
browser console.)

## Cost & abuse protection — read this

- **Workers AI is metered** (in "neurons"); there's a daily free allocation and
  Whisper is cheap, but a *public* proxy can be hit by anyone.
- The Worker already: restricts by `Origin`, caps request size (~5 MB).
- **You must also** set a usage/billing alert (and, if available, a hard limit)
  on **Workers AI** in the Cloudflare dashboard. The `Origin` header can be
  spoofed by non-browser clients, so the dashboard limit is your real financial
  backstop. Consider adding Cloudflare **Rate Limiting** rules on the route too.

## Tuning

- **Model:** defaults to `@cf/openai/whisper-large-v3-turbo` with an
  `initial_prompt` of representative anticholinergic drug names (`DRUG_PROMPT`)
  to bias decoding toward drug-name spelling. Edit `DRUG_PROMPT` to add names
  you find are commonly misheard (keep it under ~220 tokens). To trade accuracy
  for lower cost, switch `MODEL` to `@cf/openai/whisper` (the base model takes a
  byte array instead of base64 — revert the `AI.run` call to
  `{ audio: [...new Uint8Array(buf)] }`).
- **Allowed origins:** edit `ALLOWED_ORIGINS` in `worker.js` if you host the
  app on another domain.
- **Cost:** turbo uses more neurons per call than base, but a few-second clip is
  still tiny and stays within the Workers AI daily free allocation for normal
  use. Keep the dashboard usage limit set regardless.

## Privacy note for the app

In precision mode the recorded audio is sent to this Worker → Cloudflare Workers
AI for transcription, and is **not stored** here. The app's default voice mode
uses the browser's own STT and sends nothing to this proxy. Keep the app's
privacy text in sync with whatever you deploy.
