const assert = require('node:assert/strict');
const crypto = require('crypto');
const test = require('node:test');

const {
  extractIncomingWhatsAppMessages,
  isValidMetaSignature,
  isValidWebhookVerification,
} = require('../src/services/whatsappWebhookSupport');
const {
  formatWhatsAppReply,
} = require('../src/services/whatsappReplyFormatter');

test('extractIncomingWhatsAppMessages reads incoming text and skips status-only payloads', () => {
  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  id: 'wamid.demo',
                  from: '27820000000',
                  type: 'text',
                  text: { body: ' Is NSFAS application free? ' },
                },
              ],
            },
          },
        ],
      },
    ],
  };

  assert.deepEqual(extractIncomingWhatsAppMessages(payload), [
    {
      id: 'wamid.demo',
      from: '27820000000',
      type: 'text',
      text: 'Is NSFAS application free?',
    },
  ]);

  assert.deepEqual(
    extractIncomingWhatsAppMessages({
      object: 'whatsapp_business_account',
      entry: [{ changes: [{ value: { statuses: [{ id: 'wamid.status' }] } }] }],
    }),
    [],
  );
});

test('isValidWebhookVerification only accepts the configured verify token', () => {
  assert.equal(
    isValidWebhookVerification({
      mode: 'subscribe',
      verifyToken: 'getryt-dev-token',
      expectedVerifyToken: 'getryt-dev-token',
    }),
    true,
  );

  assert.equal(
    isValidWebhookVerification({
      mode: 'subscribe',
      verifyToken: 'wrong-token',
      expectedVerifyToken: 'getryt-dev-token',
    }),
    false,
  );
});

test('isValidMetaSignature verifies a Meta-style sha256 signature', () => {
  const rawBody = Buffer.from('{"object":"whatsapp_business_account"}', 'utf8');
  const appSecret = 'test-secret';
  const signature = `sha256=${crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')}`;

  assert.equal(
    isValidMetaSignature({ rawBody, signature, appSecret }),
    true,
  );
  assert.equal(
    isValidMetaSignature({ rawBody, signature: 'sha256=wrong', appSecret }),
    false,
  );
});

test('formatWhatsAppReply keeps the verdict and verified source visible', () => {
  const text = formatWhatsAppReply({
    verdict: 'false',
    explanation: 'NSFAS applications are free.',
    safeAction: 'Use the official NSFAS website.',
    sources: [
      {
        title: 'NSFAS guideline',
        url: 'https://example.org/nsfas',
      },
    ],
  });

  assert.match(text, /Likely false/);
  assert.match(text, /NSFAS guideline/);
  assert.match(text, /https:\/\/example.org\/nsfas/);
});
