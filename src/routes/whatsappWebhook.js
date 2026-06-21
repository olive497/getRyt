const express = require('express');
const { verifyClaim } = require('../services/verificationService');
const { sendWhatsAppTextMessage } = require('../services/whatsappCloudClient');
const {
  formatUnsupportedMessageReply,
  formatWhatsAppReply,
} = require('../services/whatsappReplyFormatter');
const {
  extractIncomingWhatsAppMessages,
  isValidMetaSignature,
  isValidWebhookVerification,
} = require('../services/whatsappWebhookSupport');

const router = express.Router();

function isWhatsAppCloudApiEnabled() {
  return process.env.WHATSAPP_CLOUD_API_ENABLED === 'true';
}

async function processIncomingMessages(messages) {
  for (const message of messages) {
    try {
      if (message.type !== 'text' || !message.text) {
        await sendWhatsAppTextMessage({
          to: message.from,
          body: formatUnsupportedMessageReply(),
        });
        continue;
      }

      const result = await verifyClaim(message.text);

      await sendWhatsAppTextMessage({
        to: message.from,
        body: formatWhatsAppReply(result),
      });
    } catch (error) {
      console.error('[WHATSAPP_REPLY_FAILED]', {
        messageId: message.id,
        reason: error.message,
      });
    }
  }
}

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const verifyToken = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const valid = isValidWebhookVerification({
    mode,
    verifyToken,
    expectedVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
  });

  if (!valid) {
    return res.sendStatus(403);
  }

  return res.status(200).type('text/plain').send(challenge);
});

router.post('/', (req, res) => {
  if (!isWhatsAppCloudApiEnabled()) {
    return res.sendStatus(200);
  }

  const signature = req.get('x-hub-signature-256');
  const validSignature = isValidMetaSignature({
    rawBody: req.rawBody,
    signature,
    appSecret: process.env.META_APP_SECRET,
  });

  if (!validSignature) {
    return res.sendStatus(401);
  }

  const messages = extractIncomingWhatsAppMessages(req.body);

  // Acknowledge Meta immediately. Message processing then continues without
  // logging message text, source phone numbers, or access tokens.
  res.sendStatus(200);

  void processIncomingMessages(messages);
});

module.exports = router;
