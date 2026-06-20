const rateLimit = require('express-rate-limit');

const verificationRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.body?.userId || req.body?.From || req.ip,
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many requests. Limit: 30 per minute per user.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = verificationRateLimiter;
