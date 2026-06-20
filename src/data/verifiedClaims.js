const verifiedClaims = [
  {
    id: 'nsfas-application-fee',
    category: 'nsfas_scam',
    verdict: 'false',
    riskScore: 95,
    matchPhrases: [
      'pay a fee to apply for nsfas',
      'pay an application fee for nsfas',
      'nsfas charges an application fee',
      'nsfas application fee',
      'pay money to submit my nsfas application',
    ],
    explanation:
      'NSFAS says financial-aid applications are free. Be careful of anyone asking you to pay to apply or to submit an application for you.',
    safeAction:
      'Use the official NSFAS website or myNSFAS portal. Do not share your password, PIN, or one-time password with anyone.',
    sources: [
      {
        title: 'NSFAS 2026 Bursary Guidelines',
        url: 'https://www.nsfas.org.za/content/downloads/Annexure%20A_NSFAS%202026%20Bursary%20Guidelines.pdf',
      },
    ],
  },
  {
    id: 'antibiotics-cure-flu',
    category: 'health_misinformation',
    verdict: 'false',
    riskScore: 90,
    matchPhrases: [
      'antibiotics cure flu',
      'antibiotics treat flu',
      'antibiotics will cure flu',
      'antibiotics cure a cold',
      'antibiotics treat a cold',
      'antibiotics work for viral infections',
    ],
    explanation:
      'Antibiotics treat bacterial infections, not viral infections such as flu and most colds. Taking them when they are not needed can contribute to antibiotic resistance.',
    safeAction:
      'Speak to a doctor, pharmacist, or clinic before taking antibiotics. Do not use someone else’s medicine.',
    sources: [
      {
        title: 'World Health Organization: Antimicrobial resistance',
        url: 'https://www.who.int/europe/news-room/fact-sheets/item/antimicrobial-resistance',
      },
    ],
  },
  {
    id: 'vote-without-registration',
    category: 'election_misinformation',
    verdict: 'false',
    riskScore: 85,
    matchPhrases: [
      'i can vote without registering',
      'you can vote without registering',
      'do not need to register to vote',
      'dont need to register to vote',
      'no voter registration is needed',
    ],
    explanation:
      'South African voters must be registered on the voters’ roll before voting. Check your details with the Electoral Commission instead of relying on a forwarded message.',
    safeAction:
      'Use the official Electoral Commission voter-information service to check or update your registration details.',
    sources: [
      {
        title: 'Electoral Commission of South Africa: How do I register?',
        url: 'https://www.elections.org.za/pw/voter/How-Do-I-Register',
      },
    ],
  },
  {
    id: 'demand-nationality-proof',
    category: 'xenophobic_rumour',
    verdict: 'false',
    riskScore: 90,
    matchPhrases: [
      'you can demand proof of nationality from someone in the street',
      'people can demand proof of nationality in the street',
      'we are allowed to ask foreigners for their documents in the street',
      'ask people in the street to prove their nationality',
    ],
    explanation:
      'No private person may confront someone in the street and demand proof of nationality. Claims that encourage this can put people at risk and should not be spread.',
    safeAction:
      'Do not confront or target people. Report immediate danger to the appropriate emergency services or local authorities.',
    sources: [
      {
        title: 'The Presidency: Address on migration',
        url: 'https://www.thepresidency.gov.za/address-president-cyril-ramaphosa-migration-union-buildings-tshwane',
      },
    ],
  },
];

module.exports = {
  verifiedClaims,
};
