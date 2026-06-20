const { verifiedClaims } = require('../data/verifiedClaims');

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildResult(claim, match) {
  return {
    claim,
    verdict: match.verdict,
    riskScore: match.riskScore,
    explanation: match.explanation,
    safeAction: match.safeAction,
    sources: match.sources,
    category: match.category,
    matchedClaimId: match.id,
    matchType: 'verified_evidence_match',
  };
}

function verifyClaim(claim) {
  const normalizedClaim = normalizeText(claim);

  if (normalizedClaim.length < 3) {
    return {
      claim,
      verdict: 'unverified',
      riskScore: 1,
      explanation: 'Please send a longer message so getRyt can check it.',
      safeAction: 'Try sending the full claim or a screenshot caption.',
      sources: [],
      category: 'unknown',
      matchedClaimId: null,
      matchType: 'input_too_short',
    };
  }

  const match = verifiedClaims.find((entry) =>
    entry.matchPhrases.some((phrase) =>
      normalizedClaim.includes(normalizeText(phrase)),
    ),
  );

  if (match) {
    return buildResult(claim, match);
  }

  return {
    claim,
    verdict: 'unverified',
    riskScore: 25,
    explanation:
      'getRyt does not have enough verified evidence for this claim yet. Please do not share it as fact.',
    safeAction:
      'Check the original source, look for an official statement, or send a different claim from the demo topics.',
    sources: [],
    category: 'unknown',
    matchedClaimId: null,
    matchType: 'no_verified_match',
  };
}

module.exports = {
  normalizeText,
  verifyClaim,
};
