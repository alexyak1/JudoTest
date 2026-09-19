// Landing-page copy for the quiz, per language.
//
// The ranking query that matters ("judo quiz") is typed into google.se in
// Swedish, and the site we are competing with is Swedish. An English-only page
// concedes the language and geo relevance signal before the race starts, so the
// Swedish landing page at /sv is a real translation rather than a stub.
//
// Belt counts come from the live API (/techniques?belt=...), not from the 2022
// SQL dump, which disagrees with it.

export const QUIZ_PATHS = { en: '/', sv: '/sv' };

// hreflang set shared by both translations. x-default points at the English
// page, which is what a searcher outside Sweden should land on.
export const QUIZ_ALTERNATES = {
  en: QUIZ_PATHS.en,
  sv: QUIZ_PATHS.sv,
  'x-default': QUIZ_PATHS.en,
};

const TOTAL_TECHNIQUES = 81;

export const QUIZ_COPY = {
  en: {
    lang: 'en',
    seo: {
      title: 'Judo Quiz - Test Your Judo Techniques by Belt | JudoQuiz',
      description:
        'Free judo quiz with video questions. Test your knowledge of judo techniques from yellow to brown belt, name every throw and track your progress.',
    },
    titleA: 'Judo',
    titleB: 'Quiz',
    tagline:
      'Test your knowledge and perfect your understanding of judo techniques across all belt levels',
    howHeading: 'How the judo quiz works',
    howBody1:
      "Pick a belt above and the quiz builds a round from that belt's technique list. Every question plays a short video of one technique — a throw, a hold-down, a strangle or an armlock — and asks you to name it from four options. You see whether you were right before the next question, and at the end you get a score for the round.",
    howBody2Pre: 'Nothing is hidden behind a sign-up: the quiz is free and starts on the first click. If you ',
    howBody2Link: 'log in',
    howBody2Post:
      ', each round is saved to your profile so you can watch a belt improve over weeks instead of guessing. Coaches can see the same results for the students in their club.',
    beltsHeading: 'What each belt covers',
    beltUnit: 'techniques',
    allBeltsPre: 'Choosing ',
    allBeltsStrong: 'All Belts',
    allBeltsPost: ` runs the complete list of ${TOTAL_TECHNIQUES} techniques in one round, which is the closest thing here to a full grading rehearsal. The same techniques are listed with their videos on the `,
    techniquesLink: 'judo techniques',
    allBeltsMid: ' page if you want to study before testing yourself, and the ',
    kataLink: 'kata',
    allBeltsEnd: ' page groups them by series.',
    faqHeading: 'Frequently asked questions',
    otherLangLabel: 'Svenska',
    belts: [
      {
        belt: 'Yellow belt',
        count: 12,
        summary: 'The first throws and hold-downs',
        examples:
          'O-goshi, O-soto-otoshi, O-uchi-gari, Ko-uchi-gari, Hiza-guruma, Kuzure-kesa-gatame, Kami-shiho-gatame',
      },
      {
        belt: 'Orange belt',
        count: 20,
        summary: 'Shoulder and hip throws, plus the first strangles and armlocks',
        examples:
          'Ippon-seoi-nage, Harai-goshi, Uchi-mata, Tai-otoshi, O-soto-gari, Kata-juji-jime, Juji-gatame',
      },
      {
        belt: 'Green belt',
        count: 19,
        summary: 'Sacrifice throws, foot sweeps and a wider ne-waza syllabus',
        examples:
          'Tomoe-nage, Sasae-tsuri-komi-ashi, Tani-otoshi, Okuri-ashi-harai, Hadaka-jime, Okuri-eri-jime',
      },
      {
        belt: 'Blue belt',
        count: 24,
        summary: 'Counters, wheels and the full range of strangles and locks',
        examples:
          'Hane-goshi, Ura-nage, Ushiro-goshi, Soto-makikomi, Uki-waza, Sankaku-jime, Kata-gatame',
      },
      {
        belt: 'Brown belt',
        count: 6,
        summary: 'The hand techniques and transitions that finish the grading list',
        examples:
          'Kata-guruma, Uki-otoshi, Sumi-otoshi, Utsuri-goshi, O-soto-guruma, Yoko-wakare',
      },
    ],
    faq: [
      {
        q: 'Is the judo quiz free?',
        a: 'Yes. The whole quiz is free and you can start straight away without an account. Logging in is only needed if you want your results saved to a profile.',
      },
      {
        q: 'How many questions are in each quiz?',
        a: `One question per technique on the belt you choose, so 12 for yellow belt up to 24 for blue belt. Picking All Belts runs all ${TOTAL_TECHNIQUES} techniques in one sitting.`,
      },
      {
        q: 'What do the questions look like?',
        a: 'Each question plays a short video of a single technique and gives you four Japanese names to choose from. You find out immediately whether you were right before moving on.',
      },
      {
        q: 'Can I use it to prepare for a grading?',
        a: 'That is what it is built for. The techniques are grouped by belt, so you can drill exactly the list you are being graded on and repeat it until the names come automatically.',
      },
    ],
  },

  sv: {
    lang: 'sv',
    seo: {
      title: 'Judoquiz - Testa dina judotekniker bälte för bälte | JudoQuiz',
      description:
        'Gratis judoquiz med videofrågor. Testa dina kunskaper om judotekniker från gult till brunt bälte, namnge varje kast och följ din utveckling.',
    },
    titleA: 'Judo',
    titleB: 'Quiz',
    tagline:
      'Testa dina kunskaper och lär dig judoteknikerna på alla bältesnivåer',
    howHeading: 'Så fungerar vårt judoquiz',
    howBody1:
      'Välj ett bälte ovan så bygger quizet en omgång från just det bältets tekniklista. Varje fråga spelar upp en kort video på en teknik — ett kast, en fasthållning, en strypning eller ett armlås — och du ska namnge den bland fyra alternativ. Du ser direkt om du svarade rätt, och på slutet får du ett resultat för omgången.',
    howBody2Pre: 'Ingenting gömmer sig bakom en registrering: quizet är gratis och startar vid första klicket. Om du ',
    howBody2Link: 'loggar in',
    howBody2Post:
      ' sparas varje omgång i din profil, så att du kan följa utvecklingen vecka för vecka i stället för att gissa. Tränare ser samma resultat för sina elever i klubben.',
    beltsHeading: 'Vad varje bälte omfattar',
    beltUnit: 'tekniker',
    allBeltsPre: 'Väljer du ',
    allBeltsStrong: 'Alla bälten',
    allBeltsPost: ` körs hela listan på ${TOTAL_TECHNIQUES} tekniker i en enda omgång, vilket är det närmaste en fullständig graderingsrepetition du kommer här. Samma tekniker finns listade med video på sidan `,
    techniquesLink: 'judotekniker',
    allBeltsMid: ' om du vill plugga innan du testar dig själv, och sidan ',
    kataLink: 'kata',
    allBeltsEnd: ' grupperar dem serie för serie.',
    faqHeading: 'Vanliga frågor',
    otherLangLabel: 'English',
    belts: [
      {
        belt: 'Gult bälte',
        count: 12,
        summary: 'De första kasten och fasthållningarna',
        examples:
          'O-goshi, O-soto-otoshi, O-uchi-gari, Ko-uchi-gari, Hiza-guruma, Kuzure-kesa-gatame, Kami-shiho-gatame',
      },
      {
        belt: 'Orange bälte',
        count: 20,
        summary: 'Axel- och höftkast, plus de första strypningarna och armlåsen',
        examples:
          'Ippon-seoi-nage, Harai-goshi, Uchi-mata, Tai-otoshi, O-soto-gari, Kata-juji-jime, Juji-gatame',
      },
      {
        belt: 'Grönt bälte',
        count: 19,
        summary: 'Offerkast, fotsvepningar och en bredare ne-waza-repertoar',
        examples:
          'Tomoe-nage, Sasae-tsuri-komi-ashi, Tani-otoshi, Okuri-ashi-harai, Hadaka-jime, Okuri-eri-jime',
      },
      {
        belt: 'Blått bälte',
        count: 24,
        summary: 'Kontringar, hjulkast och hela bredden av strypningar och lås',
        examples:
          'Hane-goshi, Ura-nage, Ushiro-goshi, Soto-makikomi, Uki-waza, Sankaku-jime, Kata-gatame',
      },
      {
        belt: 'Brunt bälte',
        count: 6,
        summary: 'Handteknikerna och övergångarna som avslutar graderingslistan',
        examples:
          'Kata-guruma, Uki-otoshi, Sumi-otoshi, Utsuri-goshi, O-soto-guruma, Yoko-wakare',
      },
    ],
    faq: [
      {
        q: 'Är judoquizet gratis?',
        a: 'Ja. Hela quizet är gratis och du kan börja direkt utan konto. Du behöver bara logga in om du vill spara dina resultat i en profil.',
      },
      {
        q: 'Hur många frågor är det i varje quiz?',
        a: `En fråga per teknik på det bälte du väljer, alltså 12 för gult bälte upp till 24 för blått bälte. Väljer du Alla bälten får du alla ${TOTAL_TECHNIQUES} tekniker i ett svep.`,
      },
      {
        q: 'Hur ser frågorna ut?',
        a: 'Varje fråga spelar upp en kort video på en enskild teknik och ger dig fyra japanska namn att välja mellan. Du får veta direkt om du svarade rätt innan du går vidare.',
      },
      {
        q: 'Kan jag använda det för att plugga inför gradering?',
        a: 'Det är precis vad det är byggt för. Teknikerna är grupperade efter bälte, så du kan träna exakt den lista du ska graderas på och repetera tills namnen sitter.',
      },
    ],
  },
};
