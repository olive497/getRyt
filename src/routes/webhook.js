const express = require('express');
const { verifyClaim } = require('../services/verificationService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const body = typeof req.body?.Body === 'string' ? req.body.Body.trim() : '';
    const from = typeof req.body?.From === 'string' ? req.body.From.trim() : '';

    if (!body) {
      return res.status(400).json({
        error: 'invalid_request',
        message: 'Please send a message for getRyt to check.',
      });
    }

    const result = await verifyClaim(body);

    return res.status(200).json({
      from: from || null,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
