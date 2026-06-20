const form = document.querySelector('#claimForm');
const claimInput = document.querySelector('#claimInput');
const sendButton = document.querySelector('#sendButton');
const chatMessages = document.querySelector('#chatMessages');
const userMessageTemplate = document.querySelector('#userMessageTemplate');
const resultTemplate = document.querySelector('#resultTemplate');
const errorTemplate = document.querySelector('#errorTemplate');
const quickCheckButtons = document.querySelectorAll('[data-claim]');

const verdictPresentation = {
  true: { emoji: '✅', label: 'Likely true', className: 'verdict-badge--true' },
  false: { emoji: '❌', label: 'Likely false', className: 'verdict-badge--false' },
  misleading: { emoji: '⚠️', label: 'Misleading', className: 'verdict-badge--misleading' },
  unverified: { emoji: 'ℹ️', label: 'Not yet verified', className: 'verdict-badge--unverified' },
};

function scrollToLatest() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendUserMessage(claim) {
  const fragment = userMessageTemplate.content.cloneNode(true);
  fragment.querySelector('p').textContent = claim;
  chatMessages.append(fragment);
  scrollToLatest();
}

function appendTypingIndicator() {
  const message = document.createElement('article');
  message.className = 'message message--bot';
  message.dataset.typing = 'true';
  message.setAttribute('aria-label', 'getRyt is checking the claim');
  message.innerHTML = '<span class="typing-indicator" aria-hidden="true"><span></span><span></span><span></span></span>';
  chatMessages.append(message);
  scrollToLatest();
  return message;
}

function appendResult(result) {
  const fragment = resultTemplate.content.cloneNode(true);
  const presentation = verdictPresentation[result.verdict] || verdictPresentation.unverified;
  const badge = fragment.querySelector('.verdict-badge');
  const confidence = fragment.querySelector('.confidence');
  const explanation = fragment.querySelector('.result-card__explanation');
  const action = fragment.querySelector('.result-card__action');
  const sources = fragment.querySelector('.result-card__sources');

  badge.textContent = `${presentation.emoji} ${presentation.label}`;
  badge.classList.add(presentation.className);
  confidence.textContent = `Trust score: ${result.riskScore ?? 0}%`;
  explanation.textContent = result.explanation;
  action.textContent = `What to do: ${result.safeAction}`;

  for (const source of result.sources || []) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = `🔗 Source: ${source.title}`;
    item.append(link);
    sources.append(item);
  }

  if (!result.sources || result.sources.length === 0) {
    sources.hidden = true;
  }

  chatMessages.append(fragment);
  scrollToLatest();
}

function appendError() {
  chatMessages.append(errorTemplate.content.cloneNode(true));
  scrollToLatest();
}

async function submitClaim(claim) {
  const trimmedClaim = claim.trim();

  if (!trimmedClaim) {
    claimInput.focus();
    return;
  }

  appendUserMessage(trimmedClaim);
  claimInput.value = '';
  claimInput.focus();
  sendButton.disabled = true;
  sendButton.textContent = 'Checking…';
  const typing = appendTypingIndicator();

  try {
    const response = await fetch('/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: trimmedClaim, userId: 'web-demo' }),
    });

    if (!response.ok) {
      throw new Error(`Verification request failed with status ${response.status}`);
    }

    appendResult(await response.json());
  } catch (error) {
    console.error('[GETRYT_VERIFY_ERROR]', error);
    appendError();
  } finally {
    typing.remove();
    sendButton.disabled = false;
    sendButton.textContent = 'Check';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  submitClaim(claimInput.value);
});

quickCheckButtons.forEach((button) => {
  button.addEventListener('click', () => submitClaim(button.dataset.claim || ''));
});
