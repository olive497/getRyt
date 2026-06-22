const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getPublicGameQuestions,
  gradeGameAnswer,
} = require('../src/data/gameQuestions');

test('public game questions do not expose answer keys or feedback', () => {
  const questions = getPublicGameQuestions();

  assert.equal(questions.length, 3);

  for (const question of questions) {
    assert.equal('correctOptionId' in question, false);
    assert.equal('correctTactic' in question, false);
    assert.equal('explanation' in question, false);
    assert.equal(question.options.length, 3);
  }
});

test('game answer grading returns educational feedback', () => {
  const result = gradeGameAnswer('fake-expert', 'fake-expert');

  assert.deepEqual(result, {
    questionId: 'fake-expert',
    correct: true,
    correctOptionId: 'fake-expert',
    correctTactic: 'Fake expert',
    explanation:
      'The message uses a vague authority figure but gives no verifiable institution, study, or official source. Check the claim with a recognised health authority before sharing it.',
  });
});

test('unknown game questions return null', () => {
  assert.equal(gradeGameAnswer('missing-question', 'anything'), null);
});
