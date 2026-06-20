require('dotenv/config');
const express = require('express');
const helmet = require('helmet');
const webhookRouter = require('./routes/webhook');
const { errorHandler, AppError } = require('./utils/errors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json({ limit: '4kb' }));

app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }
  next(err);
});

app.use(webhookRouter);

app.all('/health', (_req, res) => res.json({ status: 'ok' }));

app.all('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[getRyt] Server running on port ${PORT}`);
});
