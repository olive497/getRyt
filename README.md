---
title: getRyt
emoji: 🛡️
colorFrom: green
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
---

# getRyt

getRyt is a web-based misinformation-checking demo for South African claims.

## What it does

- Checks a small, verified local evidence pack first.
- Uses Groq only to recognise paraphrased versions of approved claim types.
- Returns **Not yet verified** when it does not have enough approved evidence.
- Includes a short **Find the Fake** game that teaches common misinformation tactics.

## Trust boundary

getRyt does not use a language model as the source of truth. Verdicts, safe actions, and source links come from the local verified evidence pack. The hosted demo is limited to its seeded claim categories.

## Hosted configuration

Set these in the Hugging Face Space Settings:

- Secret: `GROQ_API_KEY`
- Variable: `GROQ_MODEL=llama-3.1-8b-instant`
- Variable: `GROQ_SEMANTIC_MATCHING_ENABLED=true`
- Variable: `WHATSAPP_CLOUD_API_ENABLED=false`

Do not add WhatsApp, Meta, or local `.env` credentials to this Space.

## Local run

```bash
npm ci
npm test
npm run dev
```

Open `http://localhost:3000`.
