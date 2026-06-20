const { Router } = require('express');

const sanitizeInput = require('../middleware/sanitizer');
const webhookRateLimiter = require('../middleware/rateLimiter');
const { AppError, asyncHandler } = require('../utils/errors');
const { verifyClaim } = require('../services/verificationService');

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

    res.json(verifyClaim(Body));
  }),
);

module.exports = router;
