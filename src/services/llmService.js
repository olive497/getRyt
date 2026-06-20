const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a misinformation detection assistant. Analyze the user's claim and respond ONLY with a valid JSON object (no markdown, no backticks) using this exact schema:
{
  "verdict": "true" | "false" | "misleading" | "unverified",
  "riskScore": number between 1 and 100,
  "explanation": "2-3 sentence explanation",
  "sources": ["source1", "source2"]
}

Categories and risk ranges:
- False/scam claims: riskScore 81-100, verdict "false"
- Misleading/exaggerated: riskScore 41-80, verdict "misleading"
- Unverified/unclear: riskScore 11-40, verdict "unverified"
- True/verified: riskScore 1-10, verdict "true"

Focus on: financial scams, health misinformation, xenophobic rumors, conspiracy theories. Be objective. Cite general sources (e.g., "WHO", "FTC", "Reuters", "CDC").`;

async function analyzeMessage(userText) {
  if (!userText || userText.trim().length < 3) {
    return {
      verdict: 'unverified',
      riskScore: 1,
      explanation: 'Message too short to analyze.',
      sources: [],
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty LLM response');

    const parsed = JSON.parse(raw);
    return {
      verdict: ['true', 'false', 'misleading', 'unverified'].includes(parsed.verdict)
        ? parsed.verdict : 'unverified',
      riskScore: Math.min(100, Math.max(1, Math.round(parsed.riskScore))),
      explanation: parsed.explanation || 'No explanation provided.',
      sources: Array.isArray(parsed.sources) ? parsed.sources.slice(0, 5) : [],
    };
  } catch (err) {
    console.error('[LLM_ERROR]', err.message);
    return {
      verdict: 'unverified',
      riskScore: 50,
      explanation: err.message,
      sources: [],
    };
  }
}

module.exports = { analyzeMessage };
