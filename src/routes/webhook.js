const { Router } = require('express');
const { asyncHandler, AppError } = require('../utils/errors');
const { analyzeMessage } = require('../services/llmService');
const sanitizeInput = require('../middleware/sanitizer');
const webhookRateLimiter = require('../middleware/rateLimiter');

const router = Router();

router.post(
  '/webhook',
  webhookRateLimiter,
  sanitizeInput,
  asyncHandler(async (req, res) => {
    const { Body, From } = req.body;

    if (!Body || typeof Body !== 'string' || Body.trim().length === 0) {
      throw new AppError('Message body is required.', 400);
    }
    if (!From || typeof From !== 'string') {
      throw new AppError('Sender identifier (From) is required.', 400);
    }

    const result = await analyzeMessage(Body);

    res.json({
      verdict: result.verdict,
      riskScore: result.riskScore,
      explanation: result.explanation,
      sources: result.sources,
    });
  })
);

module.exports = router;
