const rateLimit = require('express-rate-limit');

const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => {
    return req.body?.From || req.ip;
  },
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many requests. Limit: 30 per minute per user.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = webhookRateLimiter;
