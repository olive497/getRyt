const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeText,
  verifyClaim,
} = require('../src/services/verificationService');
const {
  parseModelSelection,
} = require('../src/services/groqSemanticMatcher');

test('normalizes punctuation and whitespace', () => {
  assert.equal(
    normalizeText(' NSFAS — APPLICATION fee?! '),
    'nsfas application fee',
  );
});

test('returns local evidence before calling the semantic matcher', async () => {
  let matcherCalled = false;

  const result = await verifyClaim(
    'Do I need to pay a fee to apply for NSFAS?',
    {
      semanticMatcher: async () => {
        matcherCalled = true;
        return null;
      },
    },
  );

  assert.equal(result.verdict, 'false');
  assert.equal(result.matchedClaimId, 'nsfas-application-fee');
  assert.equal(result.matchType, 'verified_evidence_match');
  assert.equal(matcherCalled, false);
});

test('accepts an approved high-confidence Groq selection', async () => {
  const result = await verifyClaim(
    'Someone told me I must send R250 before NSFAS will process my application.',
    {
      semanticMatcher: async () => ({
        matchedClaimId: 'nsfas-application-fee',
        confidence: 0.91,
      }),
    },
  );

  assert.equal(result.verdict, 'false');
  assert.equal(result.matchedClaimId, 'nsfas-application-fee');
  assert.equal(result.matchType, 'semantic_evidence_match');
  assert.equal(result.sources.length, 1);
});

test('returns unverified when no semantic match is accepted', async () => {
  const result = await verifyClaim('Blue tea doubles your exam marks.', {
    semanticMatcher: async () => null,
  });

  assert.equal(result.verdict, 'unverified');
  assert.equal(result.matchedClaimId, null);
  assert.equal(result.matchType, 'no_verified_match');
  assert.deepEqual(result.sources, []);
});

test('rejects unknown, malformed, and low-confidence model selections', () => {
  const allowedIds = new Set(['nsfas-application-fee']);

  assert.equal(
    parseModelSelection(
      '{"matchedClaimId":"unknown-id","confidence":0.99}',
      allowedIds,
    ),
    null,
  );

  assert.equal(
    parseModelSelection(
      '{"matchedClaimId":"nsfas-application-fee","confidence":0.3}',
      allowedIds,
    ),
    null,
  );

  assert.equal(parseModelSelection('not json', allowedIds), null);
});

test('returns an input-too-short response without calling the matcher', async () => {
  let matcherCalled = false;

  const result = await verifyClaim('ok', {
    semanticMatcher: async () => {
      matcherCalled = true;
      return {
        matchedClaimId: 'nsfas-application-fee',
        confidence: 0.99,
      };
    },
  });

  assert.equal(result.matchType, 'input_too_short');
  assert.equal(matcherCalled, false);
});
