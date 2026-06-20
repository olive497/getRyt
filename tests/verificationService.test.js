const test = require('node:test');
const assert = require('node:assert/strict');

const { verifyClaim } = require('../src/services/verificationService');

test('matches the NSFAS application-fee scam claim', () => {
  const result = verifyClaim('Do I need to pay a fee to apply for NSFAS?');

  assert.equal(result.verdict, 'false');
  assert.equal(result.matchedClaimId, 'nsfas-application-fee');
  assert.equal(result.matchType, 'verified_evidence_match');
  assert.equal(result.sources.length, 1);
});

test('matches the antibiotics-and-flu health claim', () => {
  const result = verifyClaim('Antibiotics cure flu quickly.');

  assert.equal(result.verdict, 'false');
  assert.equal(result.matchedClaimId, 'antibiotics-cure-flu');
  assert.equal(result.category, 'health_misinformation');
});

test('returns unverified instead of inventing an answer', () => {
  const result = verifyClaim('Drinking blue tea will double my exam marks.');

  assert.equal(result.verdict, 'unverified');
  assert.equal(result.matchedClaimId, null);
  assert.equal(result.sources.length, 0);
  assert.equal(result.matchType, 'no_verified_match');
});
