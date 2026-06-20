const MAX_TEXT_LENGTH = 2000;

function sanitizeInput(req, _res, next) {
  if (req.body && typeof req.body.Body === 'string') {
    req.body.Body = req.body.Body
      .replace(/<[^>]*>/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .trim()
      .slice(0, MAX_TEXT_LENGTH);
  }

  if (req.body && typeof req.body.From === 'string') {
    req.body.From = req.body.From.replace(/[^\w@:+\-]/g, '').trim();
  }

  next();
}

module.exports = sanitizeInput;
