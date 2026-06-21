const OpenAI = require('openai');

const GEMINI_OPENAI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/openai/';

const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
const MIN_CONFIDENCE = 0.8;
const REQUEST_TIMEOUT_MS = 8_000;

function isSemanticMatchingEnabled() {
  return (
    process.env.GEMINI_SEMANTIC_MATCHING_ENABLED !== 'false' &&
    Boolean(process.env.GEMINI_API_KEY)
  );
}

function createGeminiClient() {
  if (!isSemanticMatchingEnabled()) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: GEMINI_OPENAI_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
    maxRetries: 0,
  });
}

function buildCandidateSummary(candidates) {
  return candidates.map((candidate) => ({
    id: candidate.id,
    category: candidate.category,
    matchPhrases: candidate.matchPhrases,
  }));
}

function parseModelSelection(rawContent, allowedIds) {
  if (!rawContent) {
    return null;
  }

  let parsed;

  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return null;
  }

  const matchedClaimId =
    typeof parsed.matchedClaimId === 'string' ? parsed.matchedClaimId : null;
  const confidence = Number(parsed.confidence);

  if (
    !matchedClaimId ||
    !allowedIds.has(matchedClaimId) ||
    !Number.isFinite(confidence) ||
    confidence < MIN_CONFIDENCE
  ) {
    return null;
  }

  return {
    matchedClaimId,
    confidence: Math.min(1, Math.max(0, confidence)),
  };
}

/**
 * Gemini is a constrained semantic router, not the truth source.
 * It can select only one ID from the provided evidence candidates, or null.
 */
async function selectEvidenceMatchWithGemini({ claim, candidates }) {
  const client = createGeminiClient();

  if (!client || !Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  const candidateSummary = buildCandidateSummary(candidates);
  const allowedIds = new Set(candidates.map((candidate) => candidate.id));

  const systemPrompt = [
    'You are a strict semantic matcher for a misinformation demo.',
    'Your only task is to decide whether the user claim means the same thing as exactly one approved evidence candidate.',
    'You are not allowed to decide truth, write an explanation, add a source, or infer a new claim.',
    'Return JSON only in this exact shape:',
    '{"matchedClaimId":"one approved id or null","confidence":0.0}',
    'Return null when the claim is unrelated, ambiguous, incomplete, or not clearly equivalent.',
    `Approved candidates: ${JSON.stringify(candidateSummary)}`,
  ].join('\n');

  try {
    const completion = await client.chat.completions.create({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      temperature: 0,
      response_format: {
        type: 'json_object',
      },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: claim },
      ],
    });

    return parseModelSelection(
      completion.choices[0]?.message?.content,
      allowedIds,
    );
  } catch (error) {
    // Availability failures must preserve the deterministic "unverified" fallback.
    console.warn('[GEMINI_SEMANTIC_MATCH_SKIPPED]', error.message);
    return null;
  }
}

module.exports = {
  DEFAULT_MODEL,
  MIN_CONFIDENCE,
  isSemanticMatchingEnabled,
  parseModelSelection,
  selectEvidenceMatchWithGemini,
};
