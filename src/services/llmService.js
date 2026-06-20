const OpenAI = require('openai');

const VALID_VERDICTS = new Set([
  'true',
  'false',
  'misleading',
  'unverified',
]);

const SYSTEM_PROMPT = `
You are a misinformation detection assistant.

Analyze the user's claim and respond only with a valid JSON object using this schema:

{
  "verdict": "true" | "false" | "misleading" | "unverified",
  "riskScore": number,
  "explanation": "2-3 sentence explanation",
  "sources": ["source1", "source2"]
}

Focus on financial scams, health misinformation, xenophobic rumours, and conspiracy theories.
Do not invent sources.
`;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new OpenAI({ apiKey });
}

function normalizeResult(parsed) {
  return {
    verdict: VALID_VERDICTS.has(parsed.verdict)
      ? parsed.verdict
      : 'unverified',
    riskScore: Math.min(100, Math.max(1, Math.round(parsed.riskScore || 50))),
    explanation: parsed.explanation || 'No explanation provided.',
    sources: Array.isArray(parsed.sources) ? parsed.sources.slice(0, 5) : [],
  };
}

async function analyzeMessage(userText) {
  if (!userText || userText.trim().length < 3) {
    return {
      verdict: 'unverified',
      riskScore: 1,
      explanation: 'Message is too short to analyse.',
      sources: [],
    };
  }

  const openai = getOpenAIClient();

  if (!openai) {
    return {
      verdict: 'unverified',
      riskScore: 50,
      explanation:
        'AI analysis is not configured. This demo can still verify claims from the local evidence pack.',
      sources: [],
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userText,
        },
      ],
      response_format: {
        type: 'json_object',
      },
      temperature: 0.1,
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      throw new Error('Empty LLM response.');
    }

    return normalizeResult(JSON.parse(raw));
  } catch (error) {
    console.error('[LLM_ERROR]', error.message);

    return {
      verdict: 'unverified',
      riskScore: 50,
      explanation:
        'We could not analyse this claim right now. Please check a trusted source before sharing it.',
      sources: [],
    };
  }
}

module.exports = {
  analyzeMessage,
};