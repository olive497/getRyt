const { Router } = require('express');

const sanitizeInput = require('../middleware/sanitizer');
const verificationRateLimiter = require('../middleware/rateLimiter');
const { AppError, asyncHandler } = require('../utils/errors');
const { verifyClaim } = require('../services/verificationService');

const router = Router();

router.post(
  '/verify',
  verificationRateLimiter,
  sanitizeInput,
  asyncHandler(async (req, res) => {
    const { claim } = req.body;

    if (!claim || typeof claim !== 'string' || claim.trim().length === 0) {
      throw new AppError('Claim is required.', 400);
    }

    res.json(verifyClaim(claim));
  }),
);

module.exports = router;
