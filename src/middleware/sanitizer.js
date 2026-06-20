const MAX_TEXT_LENGTH = 2000;
const CONTROL_CHARACTERS = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;
const HTML_TAGS = /<[^>]*>/g;

function cleanText(value) {
  return value
    .replace(HTML_TAGS, '')
    .replace(CONTROL_CHARACTERS, '')
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

function sanitizeInput(req, _res, next) {
  if (req.body && typeof req.body.Body === 'string') {
    req.body.Body = cleanText(req.body.Body);
  }

  if (req.body && typeof req.body.claim === 'string') {
    req.body.claim = cleanText(req.body.claim);
  }

  if (req.body && typeof req.body.From === 'string') {
    req.body.From = req.body.From.replace(/[^\w@:+-]/g, '').trim();
  }

  if (req.body && typeof req.body.userId === 'string') {
    req.body.userId = req.body.userId.replace(/[^\w@:+-]/g, '').trim();
  }

  next();
}

module.exports = sanitizeInput;
