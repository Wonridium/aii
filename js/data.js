/* CANDLE ICE — static data: attributes, skills, speakers, thoughts. */
(function () {
  'use strict';
  var C = (window.CANDLE = window.CANDLE || {});

  // Story files register their script text here; the engine parses them at boot.
  C.sources = C.sources || [];
  C.script = function (src) { C.sources.push(src); };

  C.ATTRS = {
    REASON: { name: 'Reason', color: 'var(--reason)', blurb: 'The cold light of the mind. Deduction, memory, argument, imagination.' },
    SOUL: { name: 'Soul', color: 'var(--soul)', blurb: 'The lantern inside. Intuition, feeling, will, and the weight of office.' },
    FLESH: { name: 'Flesh', color: 'var(--flesh)', blurb: 'The body that remembers. Appetite, fear, weather, strength.' },
    NERVE: { name: 'Nerve', color: 'var(--nerve)', blurb: 'The steady hand. Perception, composure, grace, dexterity.' }
  };

  C.ATTR_ORDER = ['REASON', 'SOUL', 'FLESH', 'NERVE'];

  C.SKILLS = {
    LEDGER: { attr: 'REASON', name: 'Ledger', desc: 'Logic and deduction. Keeps the books of the world balanced, and takes it personally when they are not.' },
    ARCHIVE: { attr: 'REASON', name: 'Archive', desc: 'Memory for statute, history and trivia. A basement full of index cards, some of them useful.' },
    OBJECTION: { attr: 'REASON', name: 'Objection', desc: 'Argument, cross-examination, the scent of a lie. The barrister who lives behind your teeth.' },
    CONJECTURE: { attr: 'REASON', name: 'Conjecture', desc: 'Imagination. Reconstructs scenes, invents theories, paints pictures in the dark. Sometimes correctly.' },
    UNDERTOW: { attr: 'SOUL', name: 'Undertow', desc: 'Intuition and the uncanny. Hears what objects mean and what the dead want. It came up out of the water with you.' },
    TENDERNESS: { attr: 'SOUL', name: 'Tenderness', desc: 'Empathy. Reads the grief under the anger, and the fear under the grief.' },
    KEEL: { attr: 'SOUL', name: 'Keel', desc: 'Will. The thing that keeps you upright in weather. Guards your Morale.' },
    GRAVITAS: { attr: 'SOUL', name: 'Gravitas', desc: 'Authority and the dignity of office. The dead are owed a correct form, and you are the form.' },
    APPETITE: { attr: 'FLESH', name: 'Appetite', desc: 'Hunger, pleasure, warmth, intoxicants. Wants everything, and especially the cake.' },
    HACKLES: { attr: 'FLESH', name: 'Hackles', desc: 'Fear and the instinct for danger. The animal that watches the hands of every man in the room.' },
    BAROMETER: { attr: 'FLESH', name: 'Barometer', desc: 'The body’s sense of weather, ice and place. Feels the city breathe. Feels the pressure fall.' },
    SINEW: { attr: 'FLESH', name: 'Sinew', desc: 'Strength and endurance. Guards your Health. You have shoulders; you only forgot.' },
    SCRUTINY: { attr: 'NERVE', name: 'Scrutiny', desc: 'Perception. Notices the chisel marks, the stain, the missing button, the lie in a coat.' },
    STARCH: { attr: 'NERVE', name: 'Starch', desc: 'Composure. Keeps the face shut and the collar straight, whatever is happening underneath.' },
    DECORUM: { attr: 'NERVE', name: 'Decorum', desc: 'Grace, manners, the art of entering a room. Would very much like you to dance.' },
    SLEIGHT: { attr: 'NERVE', name: 'Sleight', desc: 'Dexterity and quick hands. Knots, locks, pockets, catching what falls.' }
  };

  C.SKILL_ORDER = [
    'LEDGER', 'ARCHIVE', 'OBJECTION', 'CONJECTURE',
    'UNDERTOW', 'TENDERNESS', 'KEEL', 'GRAVITAS',
    'APPETITE', 'HACKLES', 'BAROMETER', 'SINEW',
    'SCRUTINY', 'STARCH', 'DECORUM', 'SLEIGHT'
  ];

  // Non-skill speakers. `cls` controls styling.
  C.SPEAKERS = {
    YOU: { name: 'YOU', cls: 'you' },
    ILSE: { name: 'ILSE VARGA' },
    PIM: { name: 'PIM VANDERSLOOT' },
    MOTH: { name: 'PERRIN MOTH' },
    ODILE: { name: 'ODILE CASTELLANE' },
    BRAN: { name: 'BRANNOCK KELL' },
    AINO: { name: 'AINO SARRE' },
    QUELL: { name: 'TOBIAS QUELL' },
    HESPER: { name: 'DEACONESS HESPER' },
    MARTA: { name: 'MARTA VARGA' },
    BENNY: { name: 'BENNY TWELVETREES' },
    GULL: { name: 'GULL' },
    CROWD: { name: 'THE CROWD' },
    CUTTER: { name: 'A CUTTER' },
    FISHWIFE: { name: 'A FISHWIFE' },
    WAITER: { name: 'A WAITER' },
    DANCER: { name: 'A DANCER' },
    LOTTE: { name: 'LOTTE' },
    FENWICK: { name: 'FENWICK' },
    TOMASZ: { name: 'TOMASZ WICK' },
    SAARI: { name: 'MA SAARI' },
    OSKAR: { name: 'OSKAR' },
    IB: { name: 'GRANDFATHER IB' },
    DAGNY: { name: 'DAGNY' },
    'YOUR MOTHER': { name: 'YOUR MOTHER', cls: 'mother' },
    SARRE: { name: 'AILO SARRE' },
    'THE COLD': { name: 'THE COLD', cls: 'cold' },
    FELIKS: { name: 'FELIKS', cls: 'feliks' },
    DRAWER: { name: 'THE DRAWER', cls: 'sys' },
    DOC: { name: '', cls: 'doc' }
  };

  C.ALIGN = {
    mutualist: { name: 'Mutualist', motto: 'We carry each other; the Mutual carries us all.' },
    actuarian: { name: 'Actuarian', motto: 'Everything has a price, and a price is a kind of justice.' },
    hearther: { name: 'Hearther', motto: 'The Lantern, the Hearth, and the old ways that kept us warm.' },
    unpriced: { name: 'Unpriced', motto: 'No one is a number. Not him. Not you.' }
  };

  // The Drawer: thoughts. `time` is in in-game minutes.
  C.THOUGHTS = {
    knock: {
      name: 'Knock Knock',
      time: 60,
      during: { STARCH: -1 },
      after: { UNDERTOW: 1 },
      problem: 'Three knocks, from underneath. You have heard them on four hundred and some nights. You have never once asked who was knocking — only how to make it stop. Perhaps the question is the wrong way up.',
      solution: 'It is not a ghost. The Rime-folk say the drowned knock for a year and a day, asking to be let into the light; the Lanternists say the dead cannot knock at all. You are an Examiner, and you know what knocks: blood in the ears, a pipe in the wall, the heart against the ribs when it has something to say.\n\nFor forty-four years something in you has been knocking on the underside of your life, politely, three times, asking to come up. You have been sitting on the ice with your full weight so that it can’t. You could stand. You could open. It is only a door, and it is only you on the other side.'
    },
    clean: {
      name: 'One Clean Inquest',
      time: 90,
      during: { TENDERNESS: -1 },
      after: { LEDGER: 1, GRAVITAS: 1, TENDERNESS: -1 },
      problem: 'The Superintendent wants one clean inquest. Clean: no laughter, no snow, no Examiner found sitting in a courtyard in his shirtsleeves. Clean like a blade. Clean like a floor after something has been mopped off it. Can a man be made clean by being made correct?',
      solution: 'Yes. It turns out he can. You take everything that is not the case and put it in a drawer, and lock the drawer, and put the key in another drawer. What remains is procedure — and procedure is beautiful in its way, like frost on a window: intricate, symmetrical, and cold enough to keep.\n\nYou will write the cleanest Last Line the Office has ever seen. You will feel almost nothing while writing it. That is the price, and you have decided, for now, that it is fair.'
    },
    candle: {
      name: 'Candle Ice',
      time: 60,
      during: {},
      after: { SCRUTINY: 1, BAROMETER: 1 },
      problem: 'In spring old ice rots from within. It turns to long vertical needles, each standing apart from its neighbours like candles in a church rack. Drill it and it measures thick. Stand on it and it measures nothing. Aino called it sugar. What else in this city is sixty centimeters thick and made of sugar?',
      solution: 'You. The answer is you. For twenty-nine years they have drilled you from the top — commendations, a silver pin, four thousand one hundred and six correct forms — and every time they have found sixty centimeters of good clear Examiner. Nobody drilled deeper, because you never let them.\n\nUnderneath, you have gone to candles. Every part of you stands separately, each needle lit and alone and touching nothing. It is very beautiful, candle ice. It chimes when the wind moves over it. It will not hold the weight of a single person you love.\n\nKnowing this does not fix it. But you will never again mistake a thickness for a strength — in ice, or in anyone.'
    },
    closer: {
      name: 'The Boy Who Was Closer',
      time: 120,
      during: { KEEL: -1 },
      after: { KEEL: 2 },
      moBonus: 1,
      problem: 'Of two boys in the black water, the Warden reached the nearer one. That is all it was: an arm’s length. You have spent forty-four years trying to be worth an arm’s length. What is the exchange rate?',
      solution: 'There isn’t one. There is no table in the Mutual’s basement that converts a brother into a career, however long, however correct. You were not chosen; you were reached. The difference is everything. Chosen things must justify the choice. Reached things only have to go on living — which is harder, and plainer, and which you notice now, with some surprise, you have been doing all along.\n\nFour thousand one hundred and six Last Lines. None of them was a payment. You can let them be what they were: work. Some of it good.'
    },
    price: {
      name: 'The Price of a Man',
      time: 90,
      during: {},
      after: { LEDGER: 1, OBJECTION: 1 },
      problem: 'Perrin Moth says every man has a number, and that the number is a mercy: it doesn’t love you, so it can’t be disappointed in you. Three thousand nine hundred crowns for a Warden. Eleven thousand four hundred for an Examiner, after a discount. Is it monstrous, or is it only arithmetic?',
      solution: 'It is arithmetic — and arithmetic is the only language in which the Great Mutual can be persuaded of anything. Very well: speak it. A floor that carries eleven hundred souls at an average valuation of four thousand crowns is a four-million-crown floor. If the Mutual will not save the Glass for love, it will save it for four million.\n\nYou find this neither monstrous nor beautiful. You find it useful, which is worse, and better, and which is what the Glass needs from you tonight.'
    },
    saw: {
      name: 'Solidarity of the Saw',
      time: 90,
      during: {},
      after: { SINEW: 1, TENDERNESS: 1 },
      problem: 'Three hundred men cut ice in the Basin once. Forty cut it now. Brannock Kell says the Mutual prices a man and the Works replaces him, and the only thing left that can’t be priced or replaced is the man on the other end of your saw. Is that true, or is it only a song?',
      solution: 'It is a song, and it is true, and those are not opposites. A work song is the truth set to a rhythm so that men can pull together without having to agree about anything else.\n\nTwo men on a cross-cut saw: one pulls, then the other. Neither pushes, ever — push and the blade binds. You have spent your whole life pushing. Tonight, when it matters, try pulling. Let someone pull back.'
    },
    lantern: {
      name: 'The Lantern Doctrine',
      time: 90,
      during: {},
      after: { KEEL: 1, UNDERTOW: 1 },
      problem: 'Each soul a flame, carried across the dark water to the Far Shore. The drowned have their lanterns put out and must be relit by prayer; the suicides put out their own and go dark forever. Deaconess Hesper says she believes it. She also says she isn’t sure. Can you believe a thing and not be sure of it?',
      solution: 'You can. That is what belief is: a lamp carried because the dark is real. The ones who are sure don’t need a lamp; they have a map. You have never had a map. You have had a small light and a long way to go and a great deal of water on every side. Perhaps that is enough to call a faith. Perhaps it is enough to call a life.\n\nThe dead are owed a correct form, yes. The living are owed a light to read it by.'
    },
    waltz: {
      name: 'Waltz on a Grave',
      time: 60,
      during: { STARCH: -1 },
      after: { DECORUM: 2, STARCH: -1 },
      problem: 'Six hundred people will dance tonight on a floor with a dead man under it. You find this obscene. You also find, horribly, that your feet know the steps. One-two-three. When did you last dance? Why does the thought make your eyes sting?',
      solution: 'Clara, of course. The Lamplighters’ Ball, twenty-two years ago. You were terrible. She said you danced like a man filing a report, and you laughed so hard you had to sit down on the stairs.\n\nYou have always believed that dancing over the dead is a desecration. You understand now that it is the opposite. It is the only thing the living have ever known how to do about it — one-two-three, the floor ringing under your feet like a promise, the dark water keeping time underneath. The dead do not want you to stop dancing. They want you to dance well.'
    },
    fifth: {
      name: 'The Fifth Line',
      time: 150,
      during: {},
      after: { OBJECTION: 1 },
      problem: 'Misadventure. Self-inflicted. Unlawful killing. Open. Four categories to hold every death in Aubade, like four drawers in a morgue. What do you do with a death that will not fit a drawer? Cut it until it fits? Or build a fifth?',
      solution: 'The categories were written by men who wanted to know who pays. They are good categories for that. They are the finest instrument ever built for answering who pays.\n\nBut the dead ask another question, and it is not who pays. It is: what was it for? No drawer holds that. So you will write it on the outside of the cabinet, in your own hand, and let them try to file it. It may cost you the Bench. You find — and this surprises you — that you would rather lose the Bench than lie to a drowned man about what he died for.'
    }
  };

  C.THOUGHTS.magistrate = {
    name: 'The Magistrate',
    time: 75,
    during: { HACKLES: -1 },
    after: { SCRUTINY: 1, KEEL: 1 },
    problem: 'A pike that has sat in judgment beneath an old man\u2019s fishing hole for eleven winters, taking his hooks, his lures, his spectacles, and never once being moved. Tomasz says the whole art is to become less interesting than the water. Is that what you have been doing, all these years?',
    solution: 'You have been sitting above the ice for forty-four years with a line down, very still, shoulders rounded against the wind, waiting for something to bite. You told yourself it was patience. It was a way of not having to pull anything up.\n\nThe thing under the ice is not hungry. It never was. It is you who are hungry. Reel in. Look at the bare hook in the lamplight. Say, there you are. Then decide, like an old man on a stool, what is actually worth waiting for.'
  };
  C.THOUGHTS.kitchen = {
    name: 'A Kitchen at Dusk',
    time: 90,
    during: { STARCH: -1 },
    after: { TENDERNESS: 1, UNDERTOW: 1 },
    moBonus: 1,
    problem: 'Your mother began a sentence at the kitchen table a week after the Narrows, and never finished it. You have finished it for her every night since, always the same way. What if it had another ending?',
    solution: 'It should have been dark earlier. It should have been a colder winter. It should have been me at the window sooner. Everyone who was on the ice that night has been finishing the sentence with their own name.\n\nThe Warden thought it was his arm\u2019s length. Your mother thought it was her window. Aino thinks it is her grip. You think it is your dare. It was the ice. It was grey, and posted, and it would have gone under a cat.\n\nNobody is heavy enough to break the ice alone. That is the whole terrible mercy of it.'
  };

  C.THOUGHT_SLOTS = 3;

  C.DIFFICULTY = function (d) {
    if (d <= 6) return 'Trivial';
    if (d <= 8) return 'Easy';
    if (d <= 10) return 'Medium';
    if (d <= 12) return 'Challenging';
    if (d === 13) return 'Formidable';
    if (d === 14) return 'Legendary';
    if (d === 15) return 'Heroic';
    return 'Impossible';
  };
})();
