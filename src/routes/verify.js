const express = require('express');
const { verifyClaim } = require('../services/verificationService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const claim = typeof req.body?.claim === 'string' ? req.body.claim.trim() : '';
    const userId = typeof req.body?.userId === 'string' ? req.body.userId.trim() : '';

    if (!claim) {
      return res.status(400).json({
        error: 'invalid_request',
        message: 'Please send a claim for getRyt to check.',
      });
    }

    const result = await verifyClaim(claim);

    return res.status(200).json({
      userId: userId || null,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
