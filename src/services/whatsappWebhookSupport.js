const crypto = require('crypto');

function constantTimeEquals(left, right) {
  const leftBuffer = Buffer.from(left || '', 'utf8');
  const rightBuffer = Buffer.from(right || '', 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function isValidWebhookVerification({ mode, verifyToken, expectedVerifyToken }) {
  return (
    mode === 'subscribe' &&
    Boolean(expectedVerifyToken) &&
    constantTimeEquals(verifyToken, expectedVerifyToken)
  );
}

function isValidMetaSignature({ rawBody, signature, appSecret }) {
  if (!rawBody || !signature || !appSecret) {
    return false;
  }

  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')}`;

  return constantTimeEquals(signature, expectedSignature);
}

function extractIncomingWhatsAppMessages(payload) {
  if (payload?.object !== 'whatsapp_business_account') {
    return [];
  }

  const messages = [];

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};

      for (const message of value.messages || []) {
        messages.push({
          id: message.id || null,
          from: message.from || null,
          type: message.type || 'unknown',
          text: message.type === 'text' ? message.text?.body?.trim() || '' : '',
        });
      }
    }
  }

  return messages.filter((message) => Boolean(message.from));
}

module.exports = {
  extractIncomingWhatsAppMessages,
  isValidMetaSignature,
  isValidWebhookVerification,
};
