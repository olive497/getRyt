require('dotenv/config');

const path = require('path');
const express = require('express');
const helmet = require('helmet');

const verifyRouter = require('./routes/verify');
const webhookRouter = require('./routes/webhook');
const whatsappWebhookRouter = require('./routes/whatsappWebhook');
const gameRouter = require('./routes/game');
const { errorHandler } = require('./utils/errors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        frameAncestors: ["'self'", 'https://huggingface.co'],
      },
    },
    xFrameOptions: false,
  }),
);

app.use(
  express.json({
    limit: '4kb',
    verify: (req, _res, buffer) => {
      req.rawBody = Buffer.from(buffer);
    },
  }),
);

app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }

  return next(err);
});

app.use('/verify', verifyRouter);
app.use('/webhook', webhookRouter);
app.use('/webhooks/whatsapp', whatsappWebhookRouter);
app.use('/game', gameRouter);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.all('*', (req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[getRyt] Server running on port ${PORT}`);
});
