const VERDICT_LABELS = {
  true: '✅ Verified',
  false: '❌ Likely false',
  misleading: '⚠️ Misleading',
  unverified: '⚠️ Not yet verified',
};

function trimForWhatsApp(text, maxLength = 3500) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

function formatWhatsAppReply(result) {
  const verdictLabel = VERDICT_LABELS[result?.verdict] || '⚠️ Not yet verified';
  const lines = [
    '*getRyt check*',
    verdictLabel,
    '',
    result?.explanation || 'getRyt could not verify this claim safely.',
    '',
    `*What to do:* ${
      result?.safeAction || 'Check a trusted official source before sharing this message.'
    }`,
  ];

  const primarySource = Array.isArray(result?.sources) ? result.sources[0] : null;

  if (primarySource?.url) {
    lines.push('', `🔗 *Source:* ${primarySource.title || 'Verified source'}`, primarySource.url);
  } else {
    lines.push(
      '',
      'ℹ️ getRyt did not find a verified match in its current demo evidence pack.',
    );
  }

  return trimForWhatsApp(lines.join('\n'));
}

function formatUnsupportedMessageReply() {
  return [
    '*getRyt check*',
    'ℹ️ This hackathon version can check text messages only.',
    'Please type or paste the claim you want getRyt to check.',
  ].join('\n');
}

module.exports = {
  formatUnsupportedMessageReply,
  formatWhatsAppReply,
};
