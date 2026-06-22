const gameQuestions = [
  {
    id: 'fake-expert',
    prompt:
      'A forwarded message says: “Dr Musa, the world-famous medical professor, says this herbal mix cures every virus. Share it with everyone.”',
    question: 'Which warning sign is strongest here?',
    options: [
      {
        id: 'fake-expert',
        label: 'It uses an expert claim that cannot be checked.',
      },
      {
        id: 'official-source',
        label: 'It links to an official health authority.',
      },
      {
        id: 'balanced-evidence',
        label: 'It explains limits and possible risks.',
      },
    ],
    correctOptionId: 'fake-expert',
    correctTactic: 'Fake expert',
    explanation:
      'The message uses a vague authority figure but gives no verifiable institution, study, or official source. Check the claim with a recognised health authority before sharing it.',
  },
  {
    id: 'urgency-and-fear',
    prompt:
      'A message says: “URGENT! Your NSFAS funding will disappear tonight unless you pay R250 now. Do not tell anyone.”',
    question: 'Which tactic is the message using?',
    options: [
      {
        id: 'urgency-and-fear',
        label: 'Urgency and fear to stop you from checking.',
      },
      {
        id: 'transparent-process',
        label: 'A clear official application process.',
      },
      {
        id: 'neutral-reporting',
        label: 'Neutral reporting with evidence.',
      },
    ],
    correctOptionId: 'urgency-and-fear',
    correctTactic: 'Urgency and fear',
    explanation:
      'Scams often create panic so that you act before checking. Slow down, do not pay, and use the official NSFAS website or myNSFAS portal.',
  },
  {
    id: 'conspiracy-framing',
    prompt:
      'A post says: “The media will never tell you the truth. They are all hiding the real election results.”',
    question: 'Which tactic is most likely being used?',
    options: [
      {
        id: 'conspiracy-framing',
        label: 'Conspiracy framing that rejects all trusted sources.',
      },
      {
        id: 'verifiable-evidence',
        label: 'A claim supported by transparent evidence.',
      },
      {
        id: 'correction',
        label: 'A correction that names its source.',
      },
    ],
    correctOptionId: 'conspiracy-framing',
    correctTactic: 'Conspiracy framing',
    explanation:
      'This tries to make every independent source look untrustworthy without giving evidence. Check official election information and credible reporting from more than one source.',
  },
];

function getPublicGameQuestions() {
  return gameQuestions.map(({ correctOptionId, correctTactic, explanation, ...question }) => question);
}

function gradeGameAnswer(questionId, optionId) {
  const question = gameQuestions.find((entry) => entry.id === questionId);

  if (!question) {
    return null;
  }

  return {
    questionId: question.id,
    correct: optionId === question.correctOptionId,
    correctOptionId: question.correctOptionId,
    correctTactic: question.correctTactic,
    explanation: question.explanation,
  };
}

module.exports = {
  gameQuestions,
  getPublicGameQuestions,
  gradeGameAnswer,
};
