const form = document.querySelector('#claimForm');
const claimInput = document.querySelector('#claimInput');
const sendButton = document.querySelector('#sendButton');
const chatMessages = document.querySelector('#chatMessages');
const userMessageTemplate = document.querySelector('#userMessageTemplate');
const resultTemplate = document.querySelector('#resultTemplate');
const typingTemplate = document.querySelector('#typingTemplate');
const errorTemplate = document.querySelector('#errorTemplate');
const quickCheckButtons = document.querySelectorAll('[data-claim]');
const modeTabs = document.querySelectorAll('[data-mode]');
const checkPanel = document.querySelector('#checkPanel');
const gamePanel = document.querySelector('#gamePanel');

const gameProgress = document.querySelector('#gameProgress');
const gamePrompt = document.querySelector('#gamePrompt');
const gameQuestion = document.querySelector('#gameQuestion');
const gameOptions = document.querySelector('#gameOptions');
const gameFeedback = document.querySelector('#gameFeedback');
const nextGameButton = document.querySelector('#nextGameButton');
const gameComplete = document.querySelector('#gameComplete');
const gameScore = document.querySelector('#gameScore');
const restartGameButton = document.querySelector('#restartGameButton');

const GAME_SCORE_KEY = 'getryt-find-the-fake-score';
const gameState = {
  questions: [],
  currentIndex: 0,
  roundScore: 0,
  answered: false,
};

const verdictPresentation = {
  true: { emoji: '✅', label: 'Likely true', className: 'verdict-badge--true' },
  false: { emoji: '❌', label: 'Likely false', className: 'verdict-badge--false' },
  misleading: {
    emoji: '⚠️',
    label: 'Misleading',
    className: 'verdict-badge--misleading',
  },
  unverified: {
    emoji: 'ℹ️',
    label: 'Not yet verified',
    className: 'verdict-badge--unverified',
  },
};

function getOrCreateDemoUserId() {
  const existing = window.localStorage.getItem('getryt-demo-user-id');

  if (existing) {
    return existing;
  }

  const userId =
    typeof crypto?.randomUUID === 'function'
      ? `web-${crypto.randomUUID()}`
      : `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem('getryt-demo-user-id', userId);
  return userId;
}

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
  const fragment = typingTemplate.content.cloneNode(true);
  const element = fragment.querySelector('.typing-message');
  chatMessages.append(fragment);
  scrollToLatest();
  return element;
}

function appendResult(result) {
  const fragment = resultTemplate.content.cloneNode(true);
  const presentation =
    verdictPresentation[result.verdict] || verdictPresentation.unverified;
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
    link.textContent = `Source: ${source.title}`;
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
      body: JSON.stringify({
        claim: trimmedClaim,
        userId: getOrCreateDemoUserId(),
      }),
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

function switchMode(mode) {
  const showingGame = mode === 'game';

  checkPanel.hidden = showingGame;
  checkPanel.classList.toggle('panel--active', !showingGame);
  gamePanel.hidden = !showingGame;
  gamePanel.classList.toggle('panel--active', showingGame);

  modeTabs.forEach((tab) => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle('mode-tab--active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  if (showingGame && gameState.questions.length === 0) {
    loadGame();
  }
}

function renderGameQuestion() {
  const question = gameState.questions[gameState.currentIndex];

  if (!question) {
    renderGameComplete();
    return;
  }

  gameProgress.textContent = `Question ${gameState.currentIndex + 1} of ${gameState.questions.length}`;
  gamePrompt.textContent = question.prompt;
  gameQuestion.textContent = question.question;
  gameOptions.replaceChildren();
  gameFeedback.hidden = true;
  gameFeedback.replaceChildren();
  nextGameButton.hidden = true;
  gameState.answered = false;

  for (const option of question.options) {
    const button = document.createElement('button');
    button.className = 'game-option';
    button.type = 'button';
    button.textContent = option.label;
    button.addEventListener('click', () => submitGameAnswer(question.id, option.id));
    gameOptions.append(button);
  }
}

async function loadGame() {
  gameProgress.textContent = 'Loading game…';

  try {
    const response = await fetch('/game/questions');

    if (!response.ok) {
      throw new Error(`Game request failed with status ${response.status}`);
    }

    const payload = await response.json();
    gameState.questions = payload.questions || [];
    gameState.currentIndex = 0;
    gameState.roundScore = 0;
    gameComplete.hidden = true;
    document.querySelector('#gameCard').hidden = false;
    renderGameQuestion();
  } catch (error) {
    console.error('[GETRYT_GAME_LOAD_ERROR]', error);
    gameProgress.textContent = 'The game could not load right now. Please try again.';
  }
}

async function submitGameAnswer(questionId, optionId) {
  if (gameState.answered) {
    return;
  }

  gameState.answered = true;
  const optionButtons = gameOptions.querySelectorAll('button');

  optionButtons.forEach((button) => {
    button.disabled = true;
  });

  try {
    const response = await fetch('/game/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, optionId }),
    });

    if (!response.ok) {
      throw new Error(`Game grading failed with status ${response.status}`);
    }

    const result = await response.json();
    const selected = [...optionButtons].find((button) => button.textContent);

    optionButtons.forEach((button) => {
      const question = gameState.questions[gameState.currentIndex];
      const option = question.options.find((entry) => entry.label === button.textContent);

      if (option?.id === result.correctOptionId) {
        button.classList.add('game-option--correct');
      }

      if (option?.id === optionId && !result.correct) {
        button.classList.add('game-option--incorrect');
      }
    });

    if (result.correct) {
      gameState.roundScore += 1;
    }

    gameFeedback.hidden = false;
    gameFeedback.className = `game-feedback ${result.correct ? 'game-feedback--correct' : 'game-feedback--learn'}`;
    gameFeedback.innerHTML = '';

    const title = document.createElement('strong');
    title.textContent = result.correct
      ? `Correct: ${result.correctTactic}`
      : `Look for: ${result.correctTactic}`;

    const explanation = document.createElement('p');
    explanation.textContent = result.explanation;

    gameFeedback.append(title, explanation);
    nextGameButton.hidden = false;
    nextGameButton.textContent =
      gameState.currentIndex === gameState.questions.length - 1
        ? 'See my score'
        : 'Next question';
  } catch (error) {
    console.error('[GETRYT_GAME_ANSWER_ERROR]', error);
    gameFeedback.hidden = false;
    gameFeedback.className = 'game-feedback game-feedback--learn';
    gameFeedback.textContent = 'We could not grade that answer. Please restart the game.';
    nextGameButton.hidden = false;
    nextGameButton.textContent = 'Restart game';
  }
}

function renderGameComplete() {
  const total = gameState.questions.length;
  const history = Number.parseInt(
    window.localStorage.getItem(GAME_SCORE_KEY) || '0',
    10,
  );

  window.localStorage.setItem(GAME_SCORE_KEY, String(history + gameState.roundScore));

  document.querySelector('#gameCard').hidden = true;
  gameComplete.hidden = false;
  gameProgress.textContent = 'Round complete';
  gameScore.textContent = `You spotted ${gameState.roundScore} out of ${total} tactics.`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  submitClaim(claimInput.value);
});

quickCheckButtons.forEach((button) => {
  button.addEventListener('click', () => submitClaim(button.dataset.claim || ''));
});

modeTabs.forEach((tab) => {
  tab.setAttribute('aria-selected', String(tab.classList.contains('mode-tab--active')));
  tab.addEventListener('click', () => switchMode(tab.dataset.mode));
});

nextGameButton.addEventListener('click', () => {
  if (!gameState.answered) {
    return;
  }

  if (gameState.currentIndex >= gameState.questions.length - 1) {
    renderGameComplete();
    return;
  }

  gameState.currentIndex += 1;
  renderGameQuestion();
});

restartGameButton.addEventListener('click', () => {
  gameState.currentIndex = 0;
  gameState.roundScore = 0;
  gameComplete.hidden = true;
  document.querySelector('#gameCard').hidden = false;
  renderGameQuestion();
});
