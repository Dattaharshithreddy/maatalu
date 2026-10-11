import type { Chapter, Gesture, Line, Place, PropPlace, Scene, Who } from './types';

/*
 * 12 chapters x 9 scenes. Each scene is a short conversation the child listens to, then says their own lines.
 * Telugu is everyday spoken Telugu; have a native teacher review before release.
 * Transliteration style matches the word units: long vowels doubled, ఏ at the start of a word = ae.
 */

const L = (who: Who, te: string, tl: string, en: string, g?: Gesture): Line => ({ who, te, tl, en, g });

const KID_S = 1.0;
const ADULT_S = 0.88;
const spread: Record<number, number[]> = {
  1: [600], 2: [400, 800], 3: [290, 600, 910], 4: [210, 465, 735, 990], 5: [160, 375, 600, 825, 1040],
};

/**
 * Cast spec: names separated by spaces. "@name" stands on the video-call screen.
 * Modes: stage (everyone standing), call (child left, family on screen), bed (child in bed on the right),
 * table (everyone behind a table drawn in front of them).
 */
function layout(spec: string, mode: 'stage' | 'call' | 'bed' | 'table'): Place[] {
  const names = spec.split(/\s+/).filter(Boolean);
  const onScreen = names.filter((n) => n.startsWith('@')).map((n) => n.slice(1) as Who);
  const stage = names.filter((n) => !n.startsWith('@')) as Who[];
  const sc = (w: Who) => (w === 'kid' ? KID_S : ADULT_S);
  const out: Place[] = [];
  if (mode === 'call') {
    const xs = stage.length === 1 ? [300] : [170, 420];
    stage.forEach((w, i) => out.push({ who: w, x: xs[i] ?? 300, y: 860, s: sc(w) }));
    if (onScreen.length === 1) out.push({ who: onScreen[0], x: 850, y: 735, s: 0.8, screen: true });
    else onScreen.forEach((w, i) => out.push({ who: w, x: i === 0 ? 730 : 970, y: 640, s: 0.62, screen: true }));
    return out;
  }
  if (mode === 'bed') {
    const others = stage.filter((w) => w !== 'kid');
    const xs = others.length === 1 ? [400] : [260, 500];
    others.forEach((w, i) => out.push({ who: w, x: xs[i], y: 880, s: sc(w) }));
    if (stage.includes('kid')) out.push({ who: 'kid', x: 900, y: 705, s: KID_S });
    return out;
  }
  const xs = spread[stage.length] ?? spread[5];
  stage.forEach((w, i) => {
    const y = mode === 'table' ? (w === 'kid' ? 845 : 960) : 880;
    out.push({ who: w, x: xs[i], y, s: sc(w) });
  });
  return out;
}

let n = 0;
function S(title: string, te: string, bg: string, cast: string, lines: Line[], props: PropPlace[] = [],
  mode?: 'stage' | 'call' | 'bed' | 'table'): Scene {
  n += 1;
  const m = mode ?? (bg === 'call' ? 'call' : props.some((p) => p[0] === 'table_cloth' || p[0] === 'table') ? 'table' : 'stage');
  if (m === 'bed') props = [...props, ['bed_blanket_front', 900, 610, 1, true]];
  return { id: `s${n}`, title, te, bg, cast: layout(cast, m), props, lines };
}

const TABLE: PropPlace = ['table_cloth', 600, 700, 1, true];

export const CHAPTERS: Chapter[] = [
  {
    id: 'calls', title: 'Calling Ammamma', te: 'అమ్మమ్మకి ఫోన్', icon: '📱', free: true, scenes: [
      S('Hello Ammamma', 'హలో అమ్మమ్మా', 'call', 'kid @ammamma', [
        L('ammamma', 'హలో {dear}! ఎలా ఉన్నావు?', 'halo {dear}! elaa unnaavu?', 'Hello dear! How are you?', 'wave'),
        L('kid', 'బాగున్నాను, అమ్మమ్మా! నువ్వు ఎలా ఉన్నావు?', 'baagunnaanu, ammammaa! nuvvu elaa unnaavu?', "I'm fine, Ammamma! How are you?", 'wave'),
        L('ammamma', 'నేనూ బాగున్నాను. నిన్ను చూస్తే చాలా సంతోషం!', 'nenoo baagunnaanu. ninnu chooste chaalaa santosham!', "I'm fine too. I'm so happy to see you!"),
      ]),
      S('Did you eat?', 'అన్నం తిన్నావా?', 'call', 'kid @ammamma', [
        L('ammamma', 'అన్నం తిన్నావా, {dear}?', 'annam tinnaavaa, {dear}?', 'Did you eat, dear?'),
        L('kid', 'తిన్నాను! పప్పు అన్నం తిన్నాను.', 'tinnaanu! pappu annam tinnaanu.', 'I ate! I had dal and rice.', 'nod'),
        L('ammamma', 'మంచిది! బాగా తిను.', 'manchidi! baagaa tinu.', 'Good! Eat well.', 'nod'),
      ]),
      S('How was school?', 'బడి ఎలా ఉంది?', 'call', 'kid @tatayya', [
        L('tatayya', 'బడి ఎలా ఉంది?', 'badi elaa undi?', 'How was school?', 'wave'),
        L('kid', 'చాలా బాగుంది, తాతయ్యా!', 'chaalaa baagundi, taatayyaa!', 'It was really good, Tatayya!', 'cheer'),
        L('tatayya', 'ఈరోజు ఏం నేర్చుకున్నావు?', 'eeroju aem nerchukunnaavu?', 'What did you learn today?'),
        L('kid', 'బొమ్మలు గీయడం నేర్చుకున్నాను.', 'bommalu geeyadam nerchukunnaanu.', 'I learned to draw pictures.'),
      ]),
      S('Look at my drawing', 'నా బొమ్మ చూడు', 'call', 'kid @ammamma', [
        L('kid', 'అమ్మమ్మా, చూడు! నా బొమ్మ.', 'ammammaa, choodu! naa bomma.', 'Ammamma, look! My drawing.', 'point'),
        L('ammamma', 'ఎంత అందంగా ఉంది!', 'enta andangaa undi!', 'How beautiful it is!', 'clap'),
        L('kid', 'ఇది మన ఇల్లు.', 'idi mana illu.', 'This is our house.', 'point'),
      ], [['book', 300, 640, 0.7, true]]),
      S('Hot and cold', 'ఎండ, చలి', 'call', 'kid @tatayya', [
        L('tatayya', 'అక్కడ వాతావరణం ఎలా ఉంది?', 'akkada vaataavaranam elaa undi?', 'How is the weather there?'),
        L('kid', 'ఇక్కడ చాలా చలిగా ఉంది!', 'ikkada chaalaa chaligaa undi!', "It's very cold here!"),
        L('tatayya', 'ఇక్కడ ఎండగా ఉంది.', 'ikkada endagaa undi.', "Here it's sunny.", 'point'),
      ]),
      S('I miss you', 'మీరు గుర్తొస్తున్నారు', 'call', 'kid @ammamma @tatayya', [
        L('kid', 'నాకు మీరు గుర్తొస్తున్నారు.', 'naaku meeru gurtostunnaaru.', 'I miss you.'),
        L('ammamma', 'మాకూ నువ్వు గుర్తొస్తున్నావు, {dear}.', 'maakoo nuvvu gurtostunnaavu, {dear}.', 'We miss you too, dear.', 'nod'),
        L('tatayya', 'త్వరలో ఇక్కడికి రా!', 'tvaralo ikkadiki raa!', 'Come here soon!', 'wave'),
      ]),
      S('Sing a song', 'పాట పాడు', 'call', 'kid @ammamma', [
        L('ammamma', 'ఒక పాట పాడుతావా?', 'oka paata paadutaavaa?', 'Will you sing a song?'),
        L('kid', 'సరే! లా లా లా...', 'sare! laa laa laa...', 'Okay! La la la...', 'cheer'),
        L('ammamma', 'భలే పాడావు!', 'bhale paadaavu!', 'You sang wonderfully!', 'clap'),
      ]),
      S('Good night', 'శుభరాత్రి', 'call', 'kid @ammamma', [
        L('ammamma', 'ఇంక పడుకో, {dear}.', 'inka paduko, {dear}.', 'Go to sleep now, dear.'),
        L('kid', 'సరే అమ్మమ్మా. శుభరాత్రి!', 'sare ammammaa. shubharaatri!', 'Okay Ammamma. Good night!', 'wave'),
        L('ammamma', 'శుభరాత్రి! మంచి కలలు కను.', 'shubharaatri! manchi kalalu kanu.', 'Good night! Have sweet dreams.', 'wave'),
      ]),
      S('Counting with Tatayya', 'తాతయ్యతో లెక్కలు', 'call', 'kid @tatayya', [
        L('tatayya', 'ఒకటి, రెండు, మూడు... చెప్పు!', 'okati, rendu, moodu... cheppu!', 'One, two, three... say it!'),
        L('kid', 'నాలుగు, ఐదు, ఆరు!', 'naalugu, aidu, aaru!', 'Four, five, six!', 'cheer'),
        L('tatayya', 'శభాష్!', 'shabaash!', 'Well done!', 'clap'),
      ]),
    ],
  },
  {
    id: 'day', title: 'My day', te: 'నా రోజు', icon: '☀️', free: true, scenes: [
      S('Wake up!', 'లే, తెల్లారింది!', 'bedroom', 'kid amma', [
        L('amma', 'లే {dear}, తెల్లారింది!', 'le {dear}, tellaarindi!', "Get up dear, it's morning!", 'wave'),
        L('kid', 'ఇంకా నిద్ర వస్తోంది...', 'inkaa nidra vastondi...', "I'm still sleepy..."),
        L('amma', 'సూర్యుడు వచ్చాడు, చూడు!', 'sooryudu vachchaadu, choodu!', 'The sun is up, look!', 'point'),
      ], [], 'bed'),
      S('Brush and bathe', 'పళ్ళు, స్నానం', 'bedroom', 'kid amma', [
        L('amma', 'పళ్ళు తోముకో.', 'pallu tomuko.', 'Brush your teeth.'),
        L('kid', 'తోముకున్నాను!', 'tomukunnaanu!', 'I brushed them!', 'cheer'),
        L('amma', 'ఇప్పుడు స్నానం చెయ్యి.', 'ippudu snaanam cheyyi.', 'Now take a bath.', 'point'),
      ]),
      S('Breakfast', 'టిఫిన్', 'dining', 'kid nanna', [
        L('nanna', 'టిఫిన్ రెడీ! దోసె తింటావా?', 'tiphin redee! dose tintaavaa?', 'Breakfast is ready! Will you eat dosa?'),
        L('kid', 'అవును! నాకు రెండు దోసెలు కావాలి.', 'avunu! naaku rendu doselu kaavaali.', 'Yes! I want two dosas.', 'nod'),
        L('nanna', 'ఇదిగో, తీసుకో.', 'idigo, teesuko.', 'Here, take it.'),
      ], [TABLE, ['plate', 420, 668, 1, true], ['plate', 780, 668, 1, true]]),
      S('Where is my bag?', 'నా సంచీ ఎక్కడ?', 'living', 'kid amma', [
        L('amma', 'బడికి వెళ్ళే సమయం అయ్యింది.', 'badiki velle samayam ayyindi.', "It's time to go to school."),
        L('kid', 'నా సంచీ ఎక్కడ?', 'naa sanchee ekkada?', 'Where is my bag?'),
        L('amma', 'అదిగో, సోఫా దగ్గర.', 'adigo, sophaa daggara.', 'There, near the sofa.', 'point'),
      ], [['school_bag', 1060, 700, 0.9]]),
      S('After school', 'బడి తర్వాత', 'school', 'kid amma', [
        L('amma', 'బడిలో ఏం చేశావు?', 'badilo aem chesaavu?', 'What did you do at school?'),
        L('kid', 'నా స్నేహితులతో ఆడుకున్నాను.', 'naa snehitulato aadukunnaanu.', 'I played with my friends.', 'cheer'),
        L('amma', 'బాగుంది!', 'baagundi!', "That's nice!", 'nod'),
      ]),
      S('Catch the ball', 'బంతి పట్టుకో', 'park', 'nanna kid', [
        L('nanna', 'బంతి పట్టుకో!', 'banti pattuko!', 'Catch the ball!', 'point'),
        L('kid', 'పట్టుకున్నా!', 'pattukunnaa!', 'I caught it!', 'cheer'),
        L('nanna', 'ఇప్పుడు నువ్వు విసురు.', 'ippudu nuvvu visuru.', 'Now you throw.'),
      ], [['ball', 600, 560, 1]]),
      S('Helping Amma', 'అమ్మకి సాయం', 'kitchen', 'kid amma', [
        L('amma', 'నాకు సాయం చేస్తావా?', 'naaku saayam chestaavaa?', 'Will you help me?'),
        L('kid', 'చేస్తాను! ఏం చెయ్యాలి?', 'chestaanu! aem cheyyaali?', 'I will! What should I do?', 'nod'),
        L('amma', 'ఈ గిన్నెలు బల్ల మీద పెట్టు.', 'ee ginnelu balla meeda pettu.', 'Put these bowls on the table.', 'point'),
      ], [['bowl', 900, 560, 1], ['bowl', 1000, 560, 1]]),
      S('Dinner time', 'భోజనం', 'dining', 'kid amma nanna', [
        L('nanna', 'అందరూ రండి, భోజనం చేద్దాం.', 'andaroo randi, bhojanam cheddaam.', "Come everyone, let's eat.", 'wave'),
        L('kid', 'నాకు ఆకలిగా ఉంది!', 'naaku aakaligaa undi!', "I'm hungry!"),
        L('amma', 'ముందు చేతులు కడుక్కో.', 'mundu chetulu kadukko.', 'Wash your hands first.', 'point'),
      ], [TABLE, ['plate', 330, 668, 1, true], ['plate', 600, 668, 1, true], ['jug', 860, 664, 1, true]]),
      S('Bedtime story', 'కథ చెప్పు', 'bedroom_night', 'kid amma', [
        L('kid', 'అమ్మా, కథ చెప్పు!', 'ammaa, katha cheppu!', 'Amma, tell me a story!'),
        L('amma', 'సరే, విను. అనగనగా ఒక రాజు...', 'sare, vinu. anaganagaa oka raaju...', 'Okay, listen. Once upon a time there was a king...'),
        L('kid', 'తర్వాత ఏమైంది?', 'tarvaata aemaindi?', 'What happened next?'),
      ], [['book', 420, 640, 0.8, true]], 'bed'),
    ],
  },
  {
    id: 'food', title: 'Food we love', te: 'మన భోజనం', icon: '🍚', free: false, scenes: [
      S('Soft idlis', 'మెత్తని ఇడ్లీ', 'dining', 'kid amma', [
        L('amma', 'ఇడ్లీ, చట్నీ రెడీ.', 'idlee, chatnee redee.', 'Idli and chutney are ready.'),
        L('kid', 'ఇడ్లీ చాలా మెత్తగా ఉంది!', 'idlee chaalaa mettagaa undi!', 'The idli is so soft!'),
        L('amma', 'ఇంకోటి తిను.', 'inkoti tinu.', 'Have one more.', 'nod'),
      ], [TABLE, ['plate', 400, 668, 1, true], ['bowl', 760, 672, 1, true]]),
      S('Water, please', 'నీళ్ళు కావాలి', 'dining', 'kid nanna', [
        L('kid', 'నాకు నీళ్ళు కావాలి.', 'naaku neellu kaavaali.', 'I want water.'),
        L('nanna', 'ఇదిగో, తీసుకో.', 'idigo, teesuko.', 'Here, take it.'),
        L('kid', 'ధన్యవాదాలు, నాన్నా!', 'dhanyavaadaalu, naannaa!', 'Thank you, Nanna!', 'namaste'),
      ], [TABLE, ['glass', 520, 664, 1, true], ['jug', 760, 664, 1, true]]),
      S('Sweet mangoes', 'తియ్యని మామిడి', 'courtyard', 'kid tatayya', [
        L('kid', 'నాకు మామిడి పండు కావాలి!', 'naaku maamidi pandu kaavaali!', 'I want a mango!'),
        L('tatayya', 'ఇదిగో, బాగా పండింది.', 'idigo, baagaa pandindi.', "Here, it's nicely ripe."),
        L('kid', 'చాలా తియ్యగా ఉంది!', 'chaalaa tiyyagaa undi!', "It's very sweet!", 'cheer'),
      ], [['mango_basket', 800, 860, 0.9]]),
      S("Ammamma's pulihora", 'అమ్మమ్మ పులిహోర', 'india_kitchen', 'kid ammamma', [
        L('ammamma', 'ఈరోజు పులిహోర చేశాను.', 'eeroju pulihora chesaanu.', 'Today I made pulihora.'),
        L('kid', 'వాసన చాలా బాగుంది!', 'vaasana chaalaa baagundi!', 'It smells so good!'),
        L('ammamma', 'రా, తిందాం.', 'raa, tindaam.', "Come, let's eat.", 'wave'),
      ], [['bowl', 600, 860, 1.2]]),
      S('Banana leaf meal', 'అరిటాకు భోజనం', 'india_kitchen', 'kid ammamma', [
        L('ammamma', 'ఇంకొంచెం తిను, {dear}.', 'inkonchem tinu, {dear}.', 'Eat a little more, dear.'),
        L('kid', 'చాలా రుచిగా ఉంది!', 'chaalaa ruchigaa undi!', "It's very tasty!"),
        L('ammamma', 'కడుపు నిండిందా?', 'kadupu nindindaa?', 'Is your tummy full?'),
        L('kid', 'నిండింది!', 'nindindi!', "It's full!", 'nod'),
      ], [['low_table', 600, 900, 1.3, true], ['leaf_meal', 470, 820, 1, true], ['leaf_meal', 750, 820, 1, true]], 'table'),
      S('Curd rice', 'పెరుగన్నం', 'dining', 'kid amma', [
        L('amma', 'చివర్లో పెరుగన్నం తిను.', 'chivarlo perugannam tinu.', 'Eat curd rice at the end.'),
        L('kid', 'పెరుగన్నం నాకు ఇష్టం.', 'perugannam naaku ishtam.', 'I like curd rice.', 'nod'),
        L('amma', 'భలే!', 'bhale!', 'Great!', 'clap'),
      ], [TABLE, ['bowl', 420, 672, 1, true], ['plate', 760, 668, 1, true]]),
      S('A laddu for you', 'నీకోసం లడ్డూ', 'house', 'kid tatayya', [
        L('tatayya', 'ఈ లడ్డూ నీకోసం.', 'ee laddoo neekosam.', 'This laddu is for you.'),
        L('kid', 'నాకు లడ్డూ అంటే చాలా ఇష్టం!', 'naaku laddoo ante chaalaa ishtam!', 'I love laddus!', 'cheer'),
        L('tatayya', 'ఒక్కటే, సరేనా?', 'okkate, sarenaa?', 'Just one, okay?', 'point'),
      ], [['laddus', 600, 900, 1, true]]),
      S('At the market', 'సంతలో', 'market', 'kid ammamma', [
        L('kid', 'అది ఏమిటి?', 'adi aemiti?', 'What is that?', 'point'),
        L('ammamma', 'అది కొబ్బరికాయ.', 'adi kobbarikaaya.', 'That is a coconut.'),
        L('kid', 'అది ఎంత?', 'adi enta?', 'How much is that?'),
        L('ammamma', 'ఇరవై రూపాయలు.', 'iravai roopaayalu.', 'Twenty rupees.'),
      ], [['stall', 600, 780, 0.9]]),
      S('Making chapatis', 'చపాతీలు', 'kitchen', 'kid amma', [
        L('amma', 'చపాతీ పిండి కలుపుదాం.', 'chapaatee pindi kalupudaam.', "Let's mix the chapati dough."),
        L('kid', 'నేను గుండ్రంగా ఒత్తుతాను!', 'nenu gundrangaa ottutaanu!', "I'll roll it round!", 'cheer'),
        L('amma', 'భలే, బాగా చేశావు!', 'bhale, baagaa chesaavu!', 'Great, you did it well!', 'clap'),
      ], [['plate', 950, 560, 1]]),
    ],
  },
  {
    id: 'trip', title: 'Trip to India', te: 'ఊరికి ప్రయాణం', icon: '✈️', free: false, scenes: [
      S("We're going to India", 'భారతదేశం వెళ్తున్నాం', 'living', 'kid nanna', [
        L('nanna', 'మనం భారతదేశం వెళ్తున్నాం!', 'manam bhaaratadesam veltunnaam!', "We're going to India!", 'cheer'),
        L('kid', 'భలే! అమ్మమ్మని చూస్తాను!', 'bhale! ammammani choostaanu!', "Yay! I'll see Ammamma!", 'cheer'),
        L('nanna', 'నీ బట్టలు సర్దుకో.', 'nee battalu sarduko.', 'Pack your clothes.', 'point'),
      ], [['suitcase', 1000, 860, 1]]),
      S('Big airplane', 'పెద్ద విమానం', 'airport', 'kid amma', [
        L('kid', 'విమానం ఎంత పెద్దగా ఉంది!', 'vimaanam enta peddagaa undi!', 'How big the plane is!', 'point'),
        L('amma', 'మనం ఆకాశంలో ఎగురుతాం.', 'manam aakaasamlo egurutaam.', "We'll fly in the sky."),
        L('kid', 'మేఘాల పైకి!', 'meghaala paiki!', 'Above the clouds!', 'cheer'),
      ], [['suitcase', 860, 860, 0.9]]),
      S('Welcome home', 'వచ్చేశావా!', 'airport', 'kid ammamma tatayya', [
        L('kid', 'తాతయ్యా! అమ్మమ్మా!', 'taatayyaa! ammammaa!', 'Tatayya! Ammamma!', 'cheer'),
        L('tatayya', 'రా, {dear}, రా!', 'raa, {dear}, raa!', 'Come, dear, come!', 'cheer'),
        L('ammamma', 'ఎంత పెద్దయ్యావు!', 'enta peddayyaavu!', "How big you've grown!", 'clap'),
      ], [['suitcase', 130, 860, 0.8]]),
      S('Auto ride', 'ఆటోలో', 'market', 'kid nanna', [
        L('kid', 'ఇది ఏ బండి?', 'idi ae bandi?', 'What vehicle is this?', 'point'),
        L('nanna', 'దీన్ని ఆటో అంటారు.', 'deenni aato antaaru.', "It's called an auto."),
        L('kid', 'బుర్ బుర్ బుర్!', 'bur bur bur!', 'Vroom vroom!', 'cheer'),
      ], [['auto', 600, 820, 1]]),
      S('Train journey', 'రైలు ప్రయాణం', 'train', 'kid tatayya', [
        L('tatayya', 'రైలు కూత వినబడుతోందా?', 'railu koota vinabadutondaa?', 'Can you hear the train whistle?'),
        L('kid', 'కూ... చుక్ చుక్!', 'koo... chuk chuk!', 'Choo... chug chug!', 'cheer'),
        L('tatayya', 'కిటికీ బయట చూడు, పొలాలు!', 'kitikee bayata choodu, polaalu!', 'Look out the window, fields!', 'point'),
      ]),
      S('Our village home', 'మన ఊరి ఇల్లు', 'house', 'kid ammamma', [
        L('ammamma', 'ఇదే మన ఇల్లు. లోపలికి రా.', 'ide mana illu. lopaliki raa.', 'This is our home. Come inside.', 'wave'),
        L('kid', 'ఇల్లు చాలా బాగుంది!', 'illu chaalaa baagundi!', 'The house is lovely!'),
      ], [['muggu', 600, 800, 0.9]]),
      S('Lakshmi the cow', 'మన ఆవు', 'farm', 'kid tatayya', [
        L('tatayya', 'ఇది మన ఆవు, లక్ష్మి.', 'idi mana aavu, lakshmi.', 'This is our cow, Lakshmi.', 'point'),
        L('kid', 'ఆవు పాలు ఇస్తుందా?', 'aavu paalu istundaa?', 'Does the cow give milk?'),
        L('tatayya', 'అవును, రోజూ ఇస్తుంది.', 'avunu, rojoo istundi.', 'Yes, every day.', 'nod'),
      ], [['cow', 720, 860, 1]]),
      S('Running hen', 'కోడి', 'courtyard', 'kid ammamma', [
        L('kid', 'కోడి ఎక్కడికి పరిగెడుతోంది?', 'kodi ekkadiki parigedutondi?', 'Where is the hen running?', 'point'),
        L('ammamma', 'గింజలు తినడానికి!', 'ginjalu tinadaaniki!', 'To eat grains!'),
      ], [['hen', 820, 860, 1], ['hen', 1000, 820, 0.8]]),
      S('See you again', 'మళ్ళీ వస్తాను', 'airport', 'kid ammamma tatayya', [
        L('kid', 'మళ్ళీ వస్తాను, అమ్మమ్మా.', 'mallee vastaanu, ammammaa.', "I'll come again, Ammamma.", 'wave'),
        L('ammamma', 'జాగ్రత్తగా వెళ్ళు, {dear}.', 'jaagrattagaa vellu, {dear}.', 'Go safely, dear.', 'wave'),
        L('tatayya', 'రోజూ ఫోన్ చెయ్యి!', 'rojoo phon cheyyi!', 'Call every day!', 'wave'),
      ]),
    ],
  },
  {
    id: 'sankranti', title: 'Sankranti', te: 'సంక్రాంతి', icon: '🪁', free: false, scenes: [
      S('Drawing a muggu', 'ముగ్గు వేద్దాం', 'house_morning', 'kid ammamma', [
        L('ammamma', 'సంక్రాంతి వచ్చింది! ముగ్గు వేద్దాం.', 'sankraanti vachchindi! muggu veddaam.', "Sankranti is here! Let's draw a muggu.", 'cheer'),
        L('kid', 'నేను రంగులు వేస్తాను.', 'nenu rangulu vestaanu.', "I'll fill the colours.", 'nod'),
      ], [['muggu_big', 600, 820, 1], ['rangoli_colors', 600, 890, 0.9, true]]),
      S('Flying kites', 'గాలిపటాలు', 'terrace', 'kid tatayya', [
        L('tatayya', 'గాలిపటం ఎగరేద్దామా?', 'gaalipatam egareddaamaa?', 'Shall we fly a kite?'),
        L('kid', 'గాలిపటం ఎగురుతోంది!', 'gaalipatam egurutondi!', 'The kite is flying!', 'point'),
        L('tatayya', 'ఇంకా పైకి!', 'inkaa paiki!', 'Higher!', 'cheer'),
      ], [['kite', 820, 160, 1], ['kite2', 260, 120, 1], ['kite3', 1050, 260, 1]]),
      S('Sweet pongal', 'చక్కెర పొంగలి', 'house_morning', 'kid ammamma', [
        L('ammamma', 'పొంగలి పొంగుతోంది!', 'pongali pongutondi!', 'The pongal is boiling over!', 'point'),
        L('kid', 'చక్కెర పొంగలి నాకు ఇష్టం.', 'chakkera pongali naaku ishtam.', 'I love sweet pongal.', 'cheer'),
      ], [['pongal_pot', 600, 860, 1.1]]),
      S('New clothes', 'కొత్త బట్టలు', 'living', 'kid amma', [
        L('amma', 'నీకు కొత్త బట్టలు!', 'neeku kotta battalu!', 'New clothes for you!'),
        L('kid', 'చాలా అందంగా ఉన్నాయి!', 'chaalaa andangaa unnaayi!', "They're so pretty!", 'cheer'),
        L('amma', 'వేసుకుని చూపించు.', 'vesukuni choopinchu.', 'Put them on and show me.'),
      ], [['gift', 1000, 860, 1]]),
      S('The festive bull', 'గంగిరెద్దు', 'house', 'kid tatayya', [
        L('tatayya', 'చూడు, గంగిరెద్దు వచ్చింది!', 'choodu, gangireddu vachchindi!', 'Look, the decorated bull is here!', 'point'),
        L('kid', 'అది తల ఊపుతోంది!', 'adi tala ooputondi!', "It's nodding its head!", 'cheer'),
      ], [['cow', 760, 860, 1], ['garland', 880, 760, 0.8]]),
      S('Kanuma', 'కనుమ', 'farm', 'kid tatayya', [
        L('tatayya', 'ఈరోజు కనుమ. ఆవులకి పూజ చేస్తాం.', 'eeroju kanuma. aavulaki pooja chestaam.', 'Today is Kanuma. We honour the cows.'),
        L('kid', 'ఆవుకి పూలదండ వేస్తాను.', 'aavuki pooladanda vestaanu.', "I'll put a garland on the cow."),
      ], [['cow', 760, 860, 1], ['garland', 880, 760, 0.8]]),
      S('Making ariselu', 'అరిసెలు', 'india_kitchen', 'kid ammamma', [
        L('ammamma', 'అరిసెలు చేస్తున్నాను.', 'ariselu chestunnaanu.', "I'm making ariselu."),
        L('kid', 'నాకు ఒకటి ఇవ్వు!', 'naaku okati ivvu!', 'Give me one!'),
        L('ammamma', 'వేడిగా ఉంది, జాగ్రత్త!', 'vedigaa undi, jaagratta!', "It's hot, careful!", 'point'),
      ], [['laddus', 600, 880, 1, true]]),
      S('Whose kite is higher?', 'ఎవరిది పైన?', 'terrace', 'kid nanna', [
        L('nanna', 'నా గాలిపటం నీదానికంటే పైన ఉంది!', 'naa gaalipatam needaanikante paina undi!', 'My kite is higher than yours!', 'point'),
        L('kid', 'చూడు, నాది ఇంకా పైకి వెళ్ళింది!', 'choodu, naadi inkaa paiki vellindi!', 'Look, mine went even higher!', 'cheer'),
      ], [['kite', 900, 120, 1], ['kite2', 300, 200, 1]]),
      S('Happy Sankranti', 'సంక్రాంతి శుభాకాంక్షలు', 'house_morning', 'tatayya kid ammamma', [
        L('ammamma', 'సంక్రాంతి శుభాకాంక్షలు!', 'sankraanti shubhaakaankshalu!', 'Happy Sankranti!', 'wave'),
        L('kid', 'మీకు కూడా!', 'meeku koodaa!', 'To you too!', 'namaste'),
        L('tatayya', 'అందరూ సంతోషంగా ఉండండి.', 'andaroo santoshangaa undandi.', 'May everyone be happy.', 'nod'),
      ], [['muggu', 600, 880, 1, true]]),
    ],
  },
  {
    id: 'ugadi', title: 'Ugadi and Sri Rama Navami', te: 'ఉగాది, శ్రీరామనవమి', icon: '🥭', free: false, scenes: [
      S('Mango leaf garland', 'మామిడి తోరణం', 'house_morning', 'kid tatayya', [
        L('tatayya', 'గుమ్మానికి మామిడి తోరణం కడదాం.', 'gummaaniki maamidi toranam kadadaam.', "Let's tie mango leaves on the door.", 'point'),
        L('kid', 'నేను ఆకులు ఇస్తాను.', 'nenu aakulu istaanu.', "I'll hand you the leaves.", 'nod'),
      ]),
      S('Ugadi pachadi', 'ఉగాది పచ్చడి', 'house', 'kid ammamma', [
        L('ammamma', 'ఉగాది పచ్చడి తిను.', 'ugaadi pachchadi tinu.', 'Eat the Ugadi pachadi.'),
        L('kid', 'తీపి, పులుపు, చేదు!', 'teepi, pulupu, chedu!', 'Sweet, sour, bitter!'),
        L('ammamma', 'జీవితంలో అన్ని రుచులు ఉంటాయి.', 'jeevitamlo anni ruchulu untaayi.', 'Life has all the tastes.', 'nod'),
      ], [['pachadi', 600, 880, 1.2, true]]),
      S('Festival bath', 'తలస్నానం', 'house_morning', 'kid amma', [
        L('amma', 'ఈరోజు తలస్నానం చెయ్యాలి.', 'eeroju talasnaanam cheyyaali.', 'Today you must have a head bath.'),
        L('kid', 'నీళ్ళు వెచ్చగా ఉన్నాయి!', 'neellu vechchagaa unnaayi!', 'The water is warm!', 'cheer'),
      ]),
      S('The new year', 'కొత్త సంవత్సరం', 'temple', 'kid tatayya', [
        L('tatayya', 'కొత్త సంవత్సరం ఎలా ఉంటుందో విందాం.', 'kotta samvatsaram elaa untundo vindaam.', "Let's hear how the new year will be."),
        L('kid', 'ఈ సంవత్సరం మంచిగా ఉంటుంది!', 'ee samvatsaram manchigaa untundi!', 'This year will be good!', 'cheer'),
      ]),
      S('Happy Ugadi', 'ఉగాది శుభాకాంక్షలు', 'house', 'amma kid nanna', [
        L('amma', 'ఉగాది శుభాకాంక్షలు!', 'ugaadi shubhaakaankshalu!', 'Happy Ugadi!', 'wave'),
        L('kid', 'మీకు కూడా, అమ్మా!', 'meeku koodaa, ammaa!', 'To you too, Amma!', 'namaste'),
        L('nanna', 'కొత్త సంవత్సరం బాగుండాలి.', 'kotta samvatsaram baagundaali.', 'May the new year be good.', 'nod'),
      ]),
      S('Cool panakam', 'పానకం', 'house', 'kid ammamma', [
        L('ammamma', 'ఈరోజు శ్రీరామనవమి. పానకం తాగు.', 'eeroju shreeraamanavami. paanakam taagu.', 'Today is Sri Rama Navami. Drink panakam.'),
        L('kid', 'పానకం చల్లగా, తియ్యగా ఉంది!', 'paanakam challagaa, tiyyagaa undi!', 'Panakam is cool and sweet!', 'cheer'),
      ], [['glass', 600, 890, 1.2, true]]),
      S('At the temple', 'గుడిలో', 'temple', 'kid tatayya', [
        L('tatayya', 'గుడికి వెళ్దాం.', 'gudiki veldaam.', "Let's go to the temple.", 'point'),
        L('kid', 'గుడి చాలా పెద్దగా ఉంది!', 'gudi chaalaa peddagaa undi!', 'The temple is very big!'),
        L('tatayya', 'చెప్పులు ఇక్కడ విడిచిపెట్టు.', 'cheppulu ikkada vidichipettu.', 'Leave your sandals here.', 'point'),
      ]),
      S('Ring the bell', 'గంట కొట్టు', 'temple', 'kid ammamma', [
        L('kid', 'గంట కొట్టనా?', 'ganta kottanaa?', 'Shall I ring the bell?'),
        L('ammamma', 'సరే, మెల్లగా కొట్టు.', 'sare, mellagaa kottu.', 'Okay, ring it gently.', 'nod'),
        L('kid', 'గణ గణ!', 'gana gana!', 'Ding dong!', 'cheer'),
      ]),
      S('Prasadam', 'ప్రసాదం', 'temple', 'kid ammamma', [
        L('ammamma', 'ఇదిగో ప్రసాదం.', 'idigo prasaadam.', 'Here is the prasadam.'),
        L('kid', 'రెండు చేతులతో తీసుకుంటాను.', 'rendu chetulato teesukuntaanu.', "I'll take it with both hands.", 'namaste'),
      ], [['laddus', 600, 890, 0.9, true]]),
    ],
  },
  {
    id: 'vinayaka', title: 'Vinayaka Chavithi', te: 'వినాయక చవితి', icon: '🐘', free: false, scenes: [
      S('Vinayaka comes home', 'వినాయకుడు వచ్చాడు', 'house', 'kid nanna', [
        L('nanna', 'వినాయకుడు ఇంటికి వచ్చాడు!', 'vinaayakudu intiki vachchaadu!', 'Vinayaka has come home!', 'cheer'),
        L('kid', 'ఆయన చెవులు ఎంత పెద్దవి!', 'aayana chevulu enta peddavi!', 'How big his ears are!', 'point'),
      ], [['ganesha', 600, 860, 1]]),
      S('Flowers for puja', 'పూల అలంకరణ', 'puja', 'kid amma', [
        L('amma', 'పూలతో అలంకరిద్దాం.', 'poolato alankariddaam.', "Let's decorate with flowers."),
        L('kid', 'నేను పసుపు పూలు పెడతాను.', 'nenu pasupu poolu pedataanu.', "I'll put yellow flowers.", 'nod'),
      ], [['flowers', 600, 880, 1.2, true]]),
      S('Twenty-one leaves', 'పత్రి', 'puja', 'kid tatayya', [
        L('tatayya', 'ఇరవై ఒక్క రకాల ఆకులతో పూజ చేస్తాం.', 'iravai okka rakaala aakulato pooja chestaam.', 'We do puja with twenty-one kinds of leaves.'),
        L('kid', 'ఇన్ని ఆకులా!', 'inni aakulaa!', 'So many leaves!', 'cheer'),
      ]),
      S('Undrallu', 'ఉండ్రాళ్ళు', 'india_kitchen', 'kid ammamma', [
        L('ammamma', 'వినాయకుడికి ఉండ్రాళ్ళు ఇష్టం.', 'vinaayakudiki undraallu ishtam.', 'Vinayaka loves undrallu.'),
        L('kid', 'నాకు కూడా ఇష్టం!', 'naaku koodaa ishtam!', 'I like them too!', 'cheer'),
      ], [['laddus', 600, 880, 1, true]]),
      S('Puja time', 'పూజ', 'puja', 'tatayya kid ammamma', [
        L('tatayya', 'అందరూ చేతులు జోడించండి.', 'andaroo chetulu jodinchandi.', 'Everyone, join your hands.', 'namaste'),
        L('kid', 'జై గణేశా!', 'jai ganeshaa!', 'Hail Ganesha!', 'namaste'),
      ]),
      S("Don't look at the moon", 'చంద్రుడిని చూడకు', 'night_sky', 'kid ammamma', [
        L('ammamma', 'ఈరోజు చంద్రుడిని చూడకూడదు.', 'eeroju chandrudini choodakoodadu.', "Today we shouldn't look at the moon."),
        L('kid', 'ఎందుకు, అమ్మమ్మా?', 'enduku, ammammaa?', 'Why, Ammamma?'),
        L('ammamma', 'దానికి ఒక కథ ఉంది. చెప్తాను.', 'daaniki oka katha undi. cheptaanu.', "There's a story for that. I'll tell you.", 'nod'),
      ]),
      S('A tiny mouse', 'చిన్న ఎలుక', 'house', 'kid tatayya', [
        L('kid', 'వినాయకుడి వాహనం ఏమిటి?', 'vinaayakudi vaahanam aemiti?', "What is Vinayaka's vehicle?"),
        L('tatayya', 'ఎలుక!', 'eluka!', 'A mouse!', 'point'),
        L('kid', 'అంత చిన్న ఎలుక మీదా!', 'anta chinna eluka meedaa!', 'On such a small mouse!', 'cheer'),
      ], [['ganesha', 600, 860, 0.9]]),
      S('Clay Ganesha', 'మట్టి వినాయకుడు', 'courtyard', 'kid amma', [
        L('amma', 'మట్టితో వినాయకుడిని చేద్దాం.', 'mattito vinaayakudini cheddaam.', "Let's make Vinayaka with clay."),
        L('kid', 'నేను తొండం చేస్తాను!', 'nenu tondam chestaanu!', "I'll make the trunk!", 'cheer'),
      ], [['ganesha', 800, 880, 0.55]]),
      S('Come again next year', 'మళ్ళీ రా', 'river', 'nanna kid amma', [
        L('nanna', 'ఇప్పుడు నిమజ్జనం.', 'ippudu nimajjanam.', "Now it's the immersion."),
        L('kid', 'మళ్ళీ వచ్చే సంవత్సరం రా, గణపయ్యా!', 'mallee vachche samvatsaram raa, ganapayyaa!', 'Come again next year, Ganapayya!', 'wave'),
      ]),
    ],
  },
  {
    id: 'dasara', title: 'Dasara and Bathukamma', te: 'దసరా, బతుకమ్మ', icon: '🌼', free: false, scenes: [
      S('Stacking Bathukamma', 'బతుకమ్మ పేర్చుదాం', 'garden', 'kid amma', [
        L('amma', 'బతుకమ్మ పేర్చుదాం.', 'batukamma perchudaam.', "Let's stack the Bathukamma."),
        L('kid', 'ఎన్ని రంగుల పూలు!', 'enni rangula poolu!', 'So many coloured flowers!', 'cheer'),
      ], [['bathukamma', 600, 880, 1]]),
      S('Clapping round', 'చప్పట్లు', 'house_dusk', 'kid ammamma', [
        L('ammamma', 'బతుకమ్మ చుట్టూ తిరుగుతూ పాడదాం.', 'batukamma chuttoo tirugutoo paadadaam.', "Let's sing going round the Bathukamma."),
        L('kid', 'నేను చప్పట్లు కొడతాను!', 'nenu chappatlu kodataanu!', "I'll clap!", 'clap'),
      ], [['bathukamma', 600, 880, 0.9]]),
      S('Doll display', 'బొమ్మల కొలువు', 'living', 'kid ammamma', [
        L('ammamma', 'బొమ్మల కొలువు చూడు.', 'bommala koluvu choodu.', 'Look at the doll display.', 'point'),
        L('kid', 'ఎన్ని బొమ్మలు!', 'enni bommalu!', 'So many dolls!', 'cheer'),
        L('ammamma', 'నీకు ఏ బొమ్మ ఇష్టం?', 'neeku ae bomma ishtam?', 'Which doll do you like?'),
      ], [['kolu', 1000, 640, 0.7]]),
      S('Books for puja', 'పుస్తకాల పూజ', 'puja', 'kid tatayya', [
        L('tatayya', 'ఈరోజు పుస్తకాలకు పూజ.', 'eeroju pustakaalaku pooja.', 'Today we worship books.'),
        L('kid', 'నా పుస్తకాలు కూడా పెడతాను.', 'naa pustakaalu koodaa pedataanu.', "I'll put my books too.", 'nod'),
      ], [['books', 560, 890, 1, true]]),
      S('Washing the cycle', 'సైకిల్ కడుగుదాం', 'house', 'kid nanna', [
        L('nanna', 'ఆయుధ పూజకి బండిని కడుగుదాం.', 'aayudha poojaki bandini kadugudaam.', "Let's wash the vehicle for Ayudha puja."),
        L('kid', 'నేను సైకిల్ కడుగుతాను!', 'nenu saikil kadugutaanu!', "I'll wash my cycle!", 'cheer'),
      ], [['bicycle', 620, 880, 1, true]]),
      S('Jammi leaves', 'జమ్మి ఆకులు', 'temple', 'kid tatayya', [
        L('tatayya', 'దసరా రోజు జమ్మి ఆకులు పంచుతాం.', 'dasaraa roju jammi aakulu panchutaam.', 'On Dasara we share jammi leaves.'),
        L('kid', 'ఇవి బంగారం లాంటివి!', 'ivi bangaaram laantivi!', 'These are like gold!', 'cheer'),
      ]),
      S('Happy Dasara', 'దసరా శుభాకాంక్షలు', 'house', 'kid tatayya', [
        L('kid', 'దసరా శుభాకాంక్షలు, తాతయ్యా!', 'dasaraa shubhaakaankshalu, taatayyaa!', 'Happy Dasara, Tatayya!', 'namaste'),
        L('tatayya', 'నీకు కూడా, {dear}!', 'neeku koodaa, {dear}!', 'To you too, dear!', 'wave'),
      ]),
      S('At the fair', 'జాతరలో', 'market', 'kid nanna', [
        L('nanna', 'జాతరకి వెళ్దాం!', 'jaataraki veldaam!', "Let's go to the fair!", 'cheer'),
        L('kid', 'నాకు బుడగ కావాలి!', 'naaku budaga kaavaali!', 'I want a balloon!', 'point'),
      ], [['balloons', 1000, 640, 1]]),
      S('Blessings', 'ఆశీర్వాదం', 'house', 'kid ammamma', [
        L('kid', 'ఆశీర్వదించు, అమ్మమ్మా.', 'aasheervadinchu, ammammaa.', 'Bless me, Ammamma.', 'namaste'),
        L('ammamma', 'బాగా చదువుకో, {dear}.', 'baagaa chaduvuko, {dear}.', 'Study well, dear.', 'nod'),
      ]),
    ],
  },
  {
    id: 'deepavali', title: 'Deepavali', te: 'దీపావళి', icon: '🪔', free: false, scenes: [
      S('Cleaning up', 'ఇల్లు శుభ్రం', 'living', 'kid amma', [
        L('amma', 'దీపావళికి ఇల్లు శుభ్రం చేద్దాం.', 'deepaavaliki illu shubhram cheddaam.', "Let's clean the house for Deepavali."),
        L('kid', 'నేను నా బొమ్మలు సర్దుతాను.', 'nenu naa bommalu sardutaanu.', "I'll tidy my toys.", 'nod'),
      ], [['ball', 1000, 860, 1]]),
      S('Lamps in the rangoli', 'ముగ్గులో దీపాలు', 'house_dusk', 'kid amma', [
        L('kid', 'ముగ్గులో దీపాలు పెడదాం.', 'muggulo deepaalu pedadaam.', "Let's put lamps in the rangoli.", 'point'),
        L('amma', 'చాలా బాగుంది!', 'chaalaa baagundi!', "That's lovely!", 'clap'),
      ], [['muggu', 600, 800, 1], ['diya', 520, 812, 0.7], ['diya', 680, 812, 0.7]]),
      S('Lighting the lamps', 'దీపాలు వెలిగిద్దాం', 'house_dusk', 'amma kid nanna', [
        L('amma', 'దీపాలు వెలిగిద్దాం!', 'deepaalu veligiddaam!', "Let's light the lamps!"),
        L('kid', 'ఎంత అందంగా ఉంది!', 'enta andangaa undi!', 'How beautiful it is!', 'cheer'),
      ], [['diya_row', 600, 625, 1]]),
      S('Sparklers', 'కాకరపువ్వొత్తులు', 'house_dusk', 'kid nanna', [
        L('nanna', 'కాకరపువ్వొత్తి జాగ్రత్తగా పట్టుకో.', 'kaakarapuvvotti jaagrattagaa pattuko.', 'Hold the sparkler carefully.', 'point'),
        L('kid', 'మెరుస్తోంది!', 'merustondi!', "It's sparkling!", 'cheer'),
      ], [['firecracker', 700, 760, 1, true]]),
      S('Fireworks', 'బాణసంచా', 'night_sky', 'kid tatayya ammamma', [
        L('kid', 'ఆకాశంలో చూడు, రంగులు!', 'aakaasamlo choodu, rangulu!', 'Look in the sky, colours!', 'point'),
        L('tatayya', 'చెవులు మూసుకో, శబ్దం వస్తుంది.', 'chevulu moosuko, sabdam vastundi.', "Cover your ears, it'll be loud."),
      ], [['firework', 600, 220, 1]]),
      S('Sweets for neighbours', 'స్వీట్లు పంచుదాం', 'house_dusk', 'kid ammamma', [
        L('ammamma', 'పక్కింటి వాళ్ళకి స్వీట్లు ఇద్దాం.', 'pakkinti vaallaki sweetlu iddaam.', "Let's give sweets to the neighbours."),
        L('kid', 'నేను ఇస్తాను!', 'nenu istaanu!', "I'll give them!", 'cheer'),
      ], [['sweets_box', 600, 890, 1, true]]),
      S('Lakshmi puja', 'లక్ష్మీ పూజ', 'puja', 'kid amma', [
        L('amma', 'లక్ష్మీ పూజ చేద్దాం.', 'lakshmee pooja cheddaam.', "Let's do Lakshmi puja.", 'namaste'),
        L('kid', 'దీపం నేను పెడతాను.', 'deepam nenu pedataanu.', "I'll place the lamp."),
      ], [['diya', 600, 880, 1.2, true]]),
      S('Brave Satyabhama', 'సత్యభామ కథ', 'house_dusk', 'kid ammamma', [
        L('ammamma', 'నరకాసురుడిని సత్యభామ ఓడించింది.', 'narakaasurudini satyabhaama odinchindi.', 'Satyabhama defeated Narakasura.'),
        L('kid', 'సత్యభామ చాలా ధైర్యవంతురాలు!', 'satyabhaama chaalaa dhairyavanturaalu!', 'Satyabhama was very brave!', 'cheer'),
      ]),
      S('Deepavali call', 'దీపావళి ఫోన్', 'call', 'kid @ammamma @tatayya', [
        L('kid', 'దీపావళి శుభాకాంక్షలు!', 'deepaavali shubhaakaankshalu!', 'Happy Deepavali!', 'wave'),
        L('ammamma', 'నీకు కూడా! నీ దీపాలు చూపించు.', 'neeku koodaa! nee deepaalu choopinchu.', 'To you too! Show me your lamps.'),
        L('tatayya', 'భలే అందంగా ఉన్నాయి!', 'bhale andangaa unnaayi!', 'They look so beautiful!', 'clap'),
      ], [['diya', 360, 640, 1, true]]),
    ],
  },
  {
    id: 'celebrations', title: 'Birthdays and celebrations', te: 'పుట్టినరోజులు, వేడుకలు', icon: '🎂', free: false, scenes: [
      S('Birthday morning', 'పుట్టినరోజు ఉదయం', 'bedroom', 'kid amma nanna', [
        L('amma', 'పుట్టినరోజు శుభాకాంక్షలు, {dear}!', 'puttinaroju shubhaakaankshalu, {dear}!', 'Happy birthday, dear!', 'cheer'),
        L('kid', 'ఈరోజు నా పుట్టినరోజు!', 'eeroju naa puttinaroju!', "Today's my birthday!", 'cheer'),
        L('nanna', 'ఇంకో సంవత్సరం పెద్దయ్యావు!', 'inko samvatsaram peddayyaavu!', "You're one year bigger!", 'clap'),
      ], [], 'bed'),
      S('Blessings first', 'ఆశీర్వాదం', 'house', 'tatayya kid ammamma', [
        L('kid', 'అమ్మమ్మా, తాతయ్యా, ఆశీర్వదించండి.', 'ammammaa, taatayyaa, aasheervadinchandi.', 'Ammamma, Tatayya, please bless me.', 'namaste'),
        L('tatayya', 'నిండు నూరేళ్ళు చల్లగా ఉండు.', 'nindu noorellu challagaa undu.', 'Live a full hundred happy years.', 'nod'),
      ]),
      S('Blow the candles', 'కొవ్వొత్తులు ఊదు', 'party', 'amma kid nanna', [
        L('nanna', 'కొవ్వొత్తులు ఊదు!', 'kovvottulu oodu!', 'Blow the candles!', 'point'),
        L('kid', 'ఫూ...!', 'phoo...!', 'Phoo...!'),
        L('amma', 'భలే!', 'bhale!', 'Yay!', 'clap'),
      ], [TABLE, ['cake', 600, 690, 0.9, true]]),
      S('A present', 'బహుమతి', 'party', 'kid amma', [
        L('amma', 'ఇది నీకు బహుమతి.', 'idi neeku bahumati.', 'This is a gift for you.'),
        L('kid', 'ఏముంది లోపల?', 'aemundi lopala?', "What's inside?"),
        L('kid', 'ఒక బొమ్మ! ధన్యవాదాలు!', 'oka bomma! dhanyavaadaalu!', 'A toy! Thank you!', 'cheer'),
      ], [['gift', 600, 880, 1, true]]),
      S('Birthday payasam', 'పాయసం', 'india_kitchen', 'kid ammamma', [
        L('ammamma', 'పుట్టినరోజుకి పాయసం చేశాను.', 'puttinarojuki paayasam chesaanu.', 'I made payasam for your birthday.'),
        L('kid', 'పాయసం చాలా తియ్యగా ఉంది!', 'paayasam chaalaa tiyyagaa undi!', 'The payasam is very sweet!', 'cheer'),
      ], [['payasam', 600, 880, 1.2, true]]),
      S("The baby's name", 'పాపకి పేరు', 'living', 'kid ammamma', [
        L('ammamma', 'ఈరోజు చిన్న పాపకి పేరు పెడతారు.', 'eeroju chinna paapaki peru pedataaru.', 'Today the little baby gets her name.'),
        L('kid', 'పాప పేరు ఏమిటి?', 'paapa peru aemiti?', "What's the baby's name?"),
        L('ammamma', 'విను, ఇప్పుడు చెప్తారు.', 'vinu, ippudu cheptaaru.', "Listen, they'll say it now.", 'nod'),
      ], [['cradle', 1000, 820, 0.9]]),
      S('First letter', 'అక్షరాభ్యాసం', 'puja', 'kid tatayya', [
        L('tatayya', 'బియ్యంలో అ రాయి.', 'biyyamlo a raayi.', 'Write అ in the rice.', 'point'),
        L('kid', 'అ!', 'a!', 'అ!', 'cheer'),
        L('tatayya', 'శభాష్! నువ్వు బాగా చదువుకుంటావు.', 'shabaash! nuvvu baagaa chaduvukuntaavu.', 'Well done! You will study well.', 'clap'),
      ], [['rice_plate_turmeric', 600, 890, 1.1, true]]),
      S("Uncle's wedding", 'మామయ్య పెళ్ళి', 'mandapam', 'kid amma', [
        L('amma', 'మామయ్య పెళ్ళి!', 'maamayya pelli!', "Uncle's wedding!", 'cheer'),
        L('kid', 'మండపం ఎంత అందంగా ఉంది!', 'mandapam enta andangaa undi!', 'How beautiful the mandapam is!', 'point'),
        L('amma', 'అక్షింతలు వెయ్యి.', 'akshintalu veyyi.', 'Shower the blessed rice.', 'cheer'),
      ]),
      S('Housewarming', 'గృహప్రవేశం', 'house', 'nanna kid ammamma', [
        L('nanna', 'ఈరోజు గృహప్రవేశం.', 'eeroju gruhapravesam.', 'Today is the housewarming.'),
        L('kid', 'పాలు పొంగుతున్నాయి!', 'paalu pongutunnaayi!', 'The milk is boiling over!', 'point'),
        L('ammamma', 'అది శుభం!', 'adi shubham!', "That's auspicious!", 'clap'),
      ], [['kalasham', 600, 880, 1, true]]),
    ],
  },
  {
    id: 'nature', title: 'Rain, sun and stars', te: 'వాన, ఎండ, నక్షత్రాలు', icon: '🌧️', free: false, scenes: [
      S("It's raining!", 'వాన పడుతోంది', 'rain', 'kid amma', [
        L('kid', 'వాన పడుతోంది!', 'vaana padutondi!', "It's raining!", 'cheer'),
        L('amma', 'గొడుగు తీసుకో.', 'godugu teesuko.', 'Take the umbrella.', 'point'),
      ], [['umbrella', 860, 860, 0.9]]),
      S('Paper boats', 'కాగితం పడవ', 'rain', 'kid nanna', [
        L('nanna', 'కాగితం పడవ చేద్దాం.', 'kaagitam padava cheddaam.', "Let's make a paper boat."),
        L('kid', 'నా పడవ నీళ్ళలో వెళ్తోంది!', 'naa padava neellalo veltondi!', 'My boat is going on the water!', 'point'),
      ], [['paper_boat', 600, 800, 1]]),
      S('Hot summer', 'ఎండాకాలం', 'house', 'kid tatayya', [
        L('tatayya', 'ఎండాకాలం, ఎండ చాలా ఉంది.', 'endaakaalam, enda chaalaa undi.', "It's summer, it's very sunny."),
        L('kid', 'నాకు చల్లని మజ్జిగ కావాలి.', 'naaku challani majjiga kaavaali.', 'I want cool buttermilk.'),
        L('tatayya', 'ఇదిగో, తాగు.', 'idigo, taagu.', 'Here, drink.', 'nod'),
      ], [['glass', 600, 890, 1.2, true]]),
      S('Counting stars', 'నక్షత్రాలు', 'night_sky', 'kid tatayya', [
        L('kid', 'ఆకాశంలో ఎన్ని నక్షత్రాలు!', 'aakaasamlo enni nakshatraalu!', 'So many stars in the sky!', 'point'),
        L('tatayya', 'లెక్కపెట్టగలవా?', 'lekkapettagalavaa?', 'Can you count them?'),
        L('kid', 'ఒకటి, రెండు, మూడు...', 'okati, rendu, moodu...', 'One, two, three...', 'point'),
      ]),
      S('The smiling moon', 'చందమామ', 'night_sky', 'kid ammamma', [
        L('ammamma', 'చూడు, చందమామ!', 'choodu, chandamaama!', 'Look, the moon!', 'point'),
        L('kid', 'చందమామ నవ్వుతోంది!', 'chandamaama navvutondi!', 'The moon is smiling!', 'cheer'),
      ]),
      S('Godavari river', 'గోదావరి', 'river', 'kid tatayya', [
        L('tatayya', 'ఇది గోదావరి నది.', 'idi godaavari nadi.', 'This is the Godavari river.', 'point'),
        L('kid', 'నీళ్ళు చాలా ఉన్నాయి!', 'neellu chaalaa unnaayi!', "There's so much water!"),
        L('tatayya', 'పడవలో వెళ్దాం!', 'padavalo veldaam!', "Let's go in a boat!", 'cheer'),
      ]),
      S('At the beach', 'సముద్రం', 'beach', 'kid nanna', [
        L('kid', 'అలలు వస్తున్నాయి!', 'alalu vastunnaayi!', 'The waves are coming!', 'point'),
        L('nanna', 'ఇసుక గూడు కడదాం.', 'isuka goodu kadadaam.', "Let's build a sand house."),
      ], [['sandcastle', 600, 880, 1, true]]),
      S('On the swing', 'ఊయల', 'garden', 'kid ammamma', [
        L('ammamma', 'ఊయల ఊగుదామా?', 'ooyala oogudaamaa?', 'Shall we swing?'),
        L('kid', 'ఇంకా పైకి, అమ్మమ్మా!', 'inkaa paiki, ammammaa!', 'Higher, Ammamma!', 'cheer'),
      ]),
      S('Planting a tree', 'మొక్క నాటుదాం', 'garden', 'kid tatayya', [
        L('tatayya', 'ఈ మొక్క నాటుదాం.', 'ee mokka naatudaam.', "Let's plant this sapling.", 'point'),
        L('kid', 'రోజూ నీళ్ళు పోస్తాను.', 'rojoo neellu postaanu.', "I'll water it every day.", 'nod'),
      ], [['plant', 600, 890, 1, true]]),
    ],
  },
  {
    id: 'play', title: 'Games and stories', te: 'ఆటలు, కథలు', icon: '🪀', free: false, scenes: [
      S('Hide and seek', 'దాగుడుమూతలు', 'courtyard', 'kid amma', [
        L('kid', 'దాగుడుమూతలు ఆడదాం!', 'daagudumootalu aadadaam!', "Let's play hide and seek!", 'cheer'),
        L('amma', 'నువ్వు దాక్కో, నేను లెక్కపెడతాను.', 'nuvvu daakko, nenu lekkapedataanu.', "You hide, I'll count."),
      ]),
      S('Spinning top', 'బొంగరం', 'courtyard', 'kid tatayya', [
        L('tatayya', 'బొంగరం ఎలా తిప్పాలో చూడు.', 'bongaram elaa tippaalo choodu.', 'Watch how to spin the top.', 'point'),
        L('kid', 'అది గిరగిరా తిరుగుతోంది!', 'adi giragiraa tirugutondi!', "It's spinning round and round!", 'cheer'),
      ], [['top', 600, 880, 1, true]]),
      S('Carrom', 'క్యారమ్', 'living', 'kid nanna', [
        L('nanna', 'క్యారమ్ ఆడదామా?', 'kyaaram aadadaamaa?', 'Shall we play carrom?'),
        L('kid', 'నేను ఎర్ర కాయిన్ వేస్తాను!', 'nenu erra kaayin vestaanu!', "I'll pocket the red coin!", 'point'),
      ], [['carrom', 600, 900, 1.1, true]]),
      S('Riding a cycle', 'సైకిల్', 'park', 'kid nanna', [
        L('kid', 'నాన్నా, నన్ను పట్టుకో!', 'naannaa, nannu pattuko!', 'Nanna, hold me!'),
        L('nanna', 'భయపడకు, నేను ఉన్నాను.', 'bhayapadaku, nenu unnaanu.', "Don't be scared, I'm here.", 'nod'),
      ], [['bicycle', 600, 890, 1, true]]),
      S('Monkey and crocodile', 'కోతి, మొసలి', 'river', 'kid ammamma', [
        L('ammamma', 'కోతి, మొసలి కథ చెప్పనా?', 'koti, mosali katha cheppanaa?', 'Shall I tell the monkey and crocodile story?'),
        L('kid', 'చెప్పు, చెప్పు!', 'cheppu, cheppu!', 'Tell it, tell it!', 'cheer'),
        L('ammamma', 'కోతి తెలివిగా తప్పించుకుంది.', 'koti telivigaa tappinchukundi.', 'The clever monkey escaped.', 'nod'),
      ]),
      S('The thirsty crow', 'దాహం వేసిన కాకి', 'garden', 'kid tatayya', [
        L('tatayya', 'దాహం వేసిన కాకి కుండలో రాళ్ళు వేసింది.', 'daaham vesina kaaki kundalo raallu vesindi.', 'The thirsty crow dropped pebbles in the pot.'),
        L('kid', 'నీళ్ళు పైకి వచ్చాయి!', 'neellu paiki vachchaayi!', 'The water came up!', 'cheer'),
        L('tatayya', 'తెలివితో ఏదైనా చెయ్యొచ్చు.', 'telivito aedainaa cheyyochchu.', 'With cleverness you can do anything.', 'nod'),
      ]),
      S('A riddle', 'పొడుపు కథ', 'living', 'kid ammamma', [
        L('ammamma', 'తోక ఉంది, కాళ్ళు లేవు, నీళ్ళలో ఉంటుంది. ఏమిటి?', 'toka undi, kaallu levu, neellalo untundi. aemiti?', 'It has a tail, no legs, and lives in water. What is it?'),
        L('kid', 'చేప!', 'chepa!', 'A fish!', 'cheer'),
        L('ammamma', 'సరిగ్గా చెప్పావు!', 'sariggaa cheppaavu!', 'You got it right!', 'clap'),
      ]),
      S('Drawing our family', 'కుటుంబం బొమ్మ', 'living', 'kid amma', [
        L('kid', 'మన కుటుంబం బొమ్మ గీశాను.', 'mana kutumbam bomma geesaanu.', 'I drew our family.', 'point'),
        L('amma', 'ఇందులో అమ్మమ్మ ఎక్కడ?', 'indulo ammamma ekkada?', "Where's Ammamma in this?"),
        L('kid', 'ఇదిగో, కళ్ళజోడుతో!', 'idigo, kallajoduto!', 'Here, with glasses!', 'point'),
      ], [['book', 600, 900, 0.9, true]]),
      S('Telling the truth', 'నిజం చెప్పడం', 'kitchen', 'kid nanna', [
        L('kid', 'క్షమించు నాన్నా, గ్లాసు పగిలిపోయింది.', 'kshaminchu naannaa, glaasu pagilipoyindi.', 'Sorry Nanna, the glass broke.'),
        L('nanna', 'పర్వాలేదు. నిజం చెప్పావు, అది మంచిది.', 'parvaaledu. nijam cheppaavu, adi manchidi.', "It's okay. You told the truth, that's good.", 'nod'),
      ]),
    ],
  },
];

export const ALL_SCENES: Scene[] = CHAPTERS.flatMap((c) => c.scenes);
export const sceneChapter = (id: string) => CHAPTERS.find((c) => c.scenes.some((s) => s.id === id));

/** Fills in the child-specific words. */
export function personalise(text: string, kid: 'boy' | 'girl', field: 'te' | 'tl' | 'en') {
  const dear = field === 'te' ? (kid === 'girl' ? 'తల్లీ' : 'నాన్నా') : field === 'tl' ? (kid === 'girl' ? 'tallee' : 'naannaa') : 'dear';
  return text.split('{dear}').join(dear);
}
