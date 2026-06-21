const { Router } = require('express');
const sanitizeInput = require('../middleware/sanitizer');
const verificationRateLimiter = require('../middleware/rateLimiter');
const { AppError, asyncHandler } = require('../utils/errors');
const { verifyClaim } = require('../services/verificationService');

const router = Router();

router.post(
  '/',
  verificationRateLimiter,
  sanitizeInput,
  asyncHandler(async (req, res) => {
    const claim = typeof req.body?.claim === 'string' ? req.body.claim.trim() : '';
    const userId = typeof req.body?.userId === 'string' ? req.body.userId.trim() : '';

    if (!claim) {
      throw new AppError('Claim is required.', 400);
    }

    const result = await verifyClaim(claim);

    res.json({
      userId: userId || null,
      ...result,
    });
  }),
);

module.exports = router;