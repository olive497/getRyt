const express = require('express');
const {
  getPublicGameQuestions,
  gradeGameAnswer,
} = require('../data/gameQuestions');

const router = express.Router();

router.get('/questions', (_req, res) => {
  res.status(200).json({
    questions: getPublicGameQuestions(),
  });
});

router.post('/answer', (req, res) => {
  const questionId =
    typeof req.body?.questionId === 'string' ? req.body.questionId.trim() : '';
  const optionId =
    typeof req.body?.optionId === 'string' ? req.body.optionId.trim() : '';

  if (!questionId || !optionId) {
    return res.status(400).json({
      error: 'invalid_request',
      message: 'Please send a question ID and an option ID.',
    });
  }

  const result = gradeGameAnswer(questionId, optionId);

  if (!result) {
    return res.status(404).json({
      error: 'question_not_found',
      message: 'That game question does not exist.',
    });
  }

  return res.status(200).json(result);
});

module.exports = router;
