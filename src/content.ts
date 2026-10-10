import { MORE } from './content_more';

export type Speaker = 'gma' | 'gpa';
export type Teacher = 'both' | Speaker;
export type Word = { id: string; te: string; tl: string; en: string; e: string };
export type Unit = { id: string; name: string; icon: string; free: boolean; kind?: 'letters' | 'sentences'; words: Word[] };

// Compact row format: [telugu, transliteration, english, emoji]
type Row = [string, string, string, string];
const unit = (id: string, name: string, icon: string, rows: Row[], free = false, kind?: Unit['kind']): Unit => ({
  id, name, icon, free, kind, words: rows.map(([te, tl, en, e], i) => ({ id: `${id}-${i + 1}`, te, tl, en, e })),
});

export const UNITS: Unit[] = [
  unit('greet', 'Hello and goodbye', '🙏', [
    ['నమస్కారం', 'namaskaaram', 'Hello', '🙏'],
    ['బాగున్నావా?', 'baagunnaavaa?', 'How are you?', '🤗'],
    ['నేను బాగున్నాను', 'nenu baagunnaanu', 'I am fine', '😊'],
    ['ధన్యవాదాలు', 'dhanyavaadaalu', 'Thank you', '💛'],
    ['శుభోదయం', 'shubhodayam', 'Good morning', '🌅'],
    ['శుభరాత్రి', 'shubharaatri', 'Good night', '🌙'],
    ['అవును', 'avunu', 'Yes', '👍'],
    ['వద్దు', 'vaddu', "No, I don't want", '🙅'],
  ], true),
  unit('family', 'My family', '👨‍👩‍👧', [
    ['అమ్మ', 'amma', 'Mother', '👩'],
    ['నాన్న', 'naanna', 'Father', '👨'],
    ['అమ్మమ్మ', 'ammamma', "Grandma (mom's mom)", '👵'],
    ['నానమ్మ', 'naanamma', "Grandma (dad's mom)", '👵'],
    ['తాతయ్య', 'taatayya', 'Grandpa', '👴'],
    ['అక్క', 'akka', 'Elder sister', '👧'],
    ['అన్నయ్య', 'annayya', 'Elder brother', '👦'],
    ['చెల్లి', 'chelli', 'Younger sister', '👶'],
    ['తమ్ముడు', 'tammudu', 'Younger brother', '🧒'],
    ['మామయ్య', 'maamayya', "Uncle (mom's brother)", '🧔'],
  ], true),
  unit('vowels', 'Letters: vowels', '🔤', [
    ['అ', 'a', 'as in అమ్మ, mother', '👩'],
    ['ఆ', 'aa', 'as in ఆవు, cow', '🐄'],
    ['ఇ', 'i', 'as in ఇల్లు, house', '🏠'],
    ['ఈ', 'ee', 'as in ఈగ, fly', '🦟'],
    ['ఉ', 'u', 'as in ఉల్లిపాయ, onion', '🧅'],
    ['ఊ', 'oo', 'as in ఊయల, swing', '🎠'],
    ['ఎ', 'e', 'as in ఎలుక, mouse', '🐭'],
    ['ఏ', 'ae', 'as in ఏనుగు, elephant', '🐘'],
    ['ఐ', 'ai', 'as in ఐదు, five', '5️⃣'],
    ['ఒ', 'o', 'as in ఒంటె, camel', '🐪'],
    ['ఓ', 'oa', 'as in ఓడ, ship', '🚢'],
    ['ఔ', 'au', 'as in ఔషధం, medicine', '💊'],
  ], true, 'letters'),
  unit('food', 'Food at home', '🍚', [
    ['అన్నం', 'annam', 'Rice', '🍚'],
    ['పప్పు', 'pappu', 'Dal', '🥣'],
    ['పెరుగు', 'perugu', 'Curd', '🥛'],
    ['చపాతీ', 'chapaatee', 'Chapati', '🥙'],
    ['దోసె', 'dose', 'Dosa', '🥞'],
    ['ఇడ్లీ', 'idlee', 'Idli', '🍘'],
    ['పాలు', 'paalu', 'Milk', '🥛'],
    ['నీళ్ళు', 'neellu', 'Water', '💧'],
    ['ఉప్పు', 'uppu', 'Salt', '🧂'],
    ['స్వీటు', 'sweetu', 'Sweet', '🍬'],
  ]),
  unit('fruits', 'Fruits', '🥭', [
    ['మామిడిపండు', 'maamidipandu', 'Mango', '🥭'],
    ['అరటిపండు', 'aratipandu', 'Banana', '🍌'],
    ['ఆపిల్', 'aapil', 'Apple', '🍎'],
    ['ద్రాక్ష', 'draaksha', 'Grapes', '🍇'],
    ['పుచ్చకాయ', 'puchchakaaya', 'Watermelon', '🍉'],
    ['కొబ్బరికాయ', 'kobbarikaaya', 'Coconut', '🥥'],
    ['నిమ్మకాయ', 'nimmakaaya', 'Lemon', '🍋'],
    ['జామపండు', 'jaamapandu', 'Guava', '🍐'],
  ]),
  unit('animals', 'Animals', '🐘', [
    ['పిల్లి', 'pilli', 'Cat', '🐱'],
    ['కుక్క', 'kukka', 'Dog', '🐶'],
    ['ఆవు', 'aavu', 'Cow', '🐄'],
    ['ఏనుగు', 'aenugu', 'Elephant', '🐘'],
    ['చిలుక', 'chiluka', 'Parrot', '🦜'],
    ['కోతి', 'kothi', 'Monkey', '🐒'],
    ['పులి', 'puli', 'Tiger', '🐯'],
    ['కోడి', 'kodi', 'Hen', '🐔'],
    ['చేప', 'chepa', 'Fish', '🐟'],
    ['గుర్రం', 'gurram', 'Horse', '🐴'],
  ]),
  unit('numbers', 'Counting to ten', '🔢', [
    ['ఒకటి', 'okati', 'One', '1️⃣'],
    ['రెండు', 'rendu', 'Two', '2️⃣'],
    ['మూడు', 'moodu', 'Three', '3️⃣'],
    ['నాలుగు', 'naalugu', 'Four', '4️⃣'],
    ['ఐదు', 'aidu', 'Five', '5️⃣'],
    ['ఆరు', 'aaru', 'Six', '6️⃣'],
    ['ఏడు', 'aedu', 'Seven', '7️⃣'],
    ['ఎనిమిది', 'enimidi', 'Eight', '8️⃣'],
    ['తొమ్మిది', 'tommidi', 'Nine', '9️⃣'],
    ['పది', 'padi', 'Ten', '🔟'],
  ]),
  unit('colours', 'Colours', '🎨', [
    ['ఎరుపు', 'erupu', 'Red', '🔴'],
    ['పచ్చ', 'pachcha', 'Green', '🟢'],
    ['పసుపు', 'pasupu', 'Yellow', '🟡'],
    ['నీలం', 'neelam', 'Blue', '🔵'],
    ['తెలుపు', 'telupu', 'White', '⚪'],
    ['నలుపు', 'nalupu', 'Black', '⚫'],
    ['గులాబీ రంగు', 'gulaabee rangu', 'Pink', '💗'],
    ['నారింజ రంగు', 'naarinja rangu', 'Orange', '🟠'],
  ]),
  unit('body', 'My body', '🖐️', [
    ['తల', 'tala', 'Head', '🧑'],
    ['కళ్ళు', 'kallu', 'Eyes', '👀'],
    ['ముక్కు', 'mukku', 'Nose', '👃'],
    ['నోరు', 'noru', 'Mouth', '👄'],
    ['చెవులు', 'chevulu', 'Ears', '👂'],
    ['చెయ్యి', 'cheyyi', 'Hand', '✋'],
    ['కాలు', 'kaalu', 'Leg', '🦵'],
    ['జుట్టు', 'juttu', 'Hair', '💇'],
    ['పళ్ళు', 'pallu', 'Teeth', '🦷'],
    ['కడుపు', 'kadupu', 'Tummy', '🤗'],
  ]),
  unit('house', 'In the house', '🏠', [
    ['ఇల్లు', 'illu', 'House', '🏠'],
    ['తలుపు', 'talupu', 'Door', '🚪'],
    ['కుర్చీ', 'kurchee', 'Chair', '🪑'],
    ['మంచం', 'mancham', 'Bed', '🛏️'],
    ['పుస్తకం', 'pustakam', 'Book', '📖'],
    ['గడియారం', 'gadiyaaram', 'Clock', '🕰️'],
    ['దీపం', 'deepam', 'Lamp', '🪔'],
    ['బొమ్మ', 'bomma', 'Toy', '🧸'],
    ['కిటికీ', 'kitikee', 'Window', '🖼️'],
    ['గిన్నె', 'ginne', 'Bowl', '🥣'],
  ]),
  unit('consonants', 'Letters: first sounds', '✍️', [
    ['క', 'ka', 'as in కుక్క, dog', '🐶'],
    ['గ', 'ga', 'as in గుడి, temple', '🛕'],
    ['చ', 'cha', 'as in చిలుక, parrot', '🦜'],
    ['జ', 'ja', 'as in జామపండు, guava', '🍐'],
    ['ట', 'ta', 'as in టమాటా, tomato', '🍅'],
    ['త', 'tha', 'as in తల, head', '🧑'],
    ['ద', 'da', 'as in దీపం, lamp', '🪔'],
    ['న', 'na', 'as in నది, river', '🏞️'],
    ['ప', 'pa', 'as in పువ్వు, flower', '🌸'],
    ['మ', 'ma', 'as in మామిడిపండు, mango', '🥭'],
    ['వ', 'va', 'as in వాన, rain', '🌧️'],
    ['స', 'sa', 'as in సూర్యుడు, sun', '☀️'],
  ], false, 'letters'),
  unit('feelings', 'How I feel', '😊', [
    ['సంతోషం', 'santosham', 'Happy', '😄'],
    ['బాధ', 'baadha', 'Sad', '😢'],
    ['కోపం', 'kopam', 'Angry', '😠'],
    ['భయం', 'bhayam', 'Scared', '😨'],
    ['ఆకలి', 'aakali', 'Hungry', '🤤'],
    ['దాహం', 'daaham', 'Thirsty', '🥤'],
    ['నిద్ర', 'nidra', 'Sleepy', '😪'],
    ['ప్రేమ', 'prema', 'Love', '❤️'],
  ]),
  unit('actions', 'Doing words', '🏃', [
    ['తిను', 'tinu', 'Eat', '🍽️'],
    ['తాగు', 'taagu', 'Drink', '🥤'],
    ['పడుకో', 'paduko', 'Sleep', '😴'],
    ['ఆడుకో', 'aaduko', 'Play', '⚽'],
    ['చదువు', 'chaduvu', 'Read, study', '📚'],
    ['రా', 'raa', 'Come', '👋'],
    ['వెళ్ళు', 'vellu', 'Go', '🚶'],
    ['కూర్చో', 'koorcho', 'Sit', '🧘'],
    ['చూడు', 'choodu', 'Look', '👀'],
    ['పాడు', 'paadu', 'Sing', '🎤'],
  ]),
  unit('call', 'Phone call with grandma', '📞', [
    ['మీరు ఎలా ఉన్నారు?', 'meeru elaa unnaaru?', 'How are you? (to elders)', '📞'],
    ['నువ్వు అన్నం తిన్నావా?', 'nuvvu annam tinnaavaa?', 'Did you eat?', '🍽️'],
    ['నేను అన్నం తిన్నాను', 'nenu annam tinnaanu', 'I ate my food', '🍚'],
    ['ఇవాళ బడికి వెళ్ళాను', 'ivaala badiki vellaanu', 'I went to school today', '🏫'],
    ['నువ్వు గుర్తొస్తున్నావు', 'nuvvu gurtostunnaavu', 'I miss you', '🥺'],
    ['నాకు నువ్వంటే ఇష్టం', 'naaku nuvvante ishtam', 'I love you', '💕'],
    ['ఎప్పుడు వస్తావు?', 'eppudu vastaavu?', 'When will you come?', '✈️'],
    ['మళ్ళీ మాట్లాడదాం', 'malli maatlaadadaam', "Let's talk again", '👋'],
  ], false, 'sentences'),
  unit('veg', 'Vegetables', '🍅', [
    ['టమాటా', 'tamaataa', 'Tomato', '🍅'],
    ['బంగాళదుంప', 'bangaaladumpa', 'Potato', '🥔'],
    ['ఉల్లిపాయ', 'ullipaaya', 'Onion', '🧅'],
    ['క్యారెట్', 'kyaaret', 'Carrot', '🥕'],
    ['వంకాయ', 'vankaaya', 'Brinjal', '🍆'],
    ['మిరపకాయ', 'mirapakaaya', 'Chilli', '🌶️'],
    ['దోసకాయ', 'dosakaaya', 'Cucumber', '🥒'],
    ['బెండకాయ', 'bendakaaya', 'Okra', '🌿'],
  ]),
  unit('nature', 'Outside', '🌳', [
    ['సూర్యుడు', 'sooryudu', 'Sun', '☀️'],
    ['చంద్రుడు', 'chandrudu', 'Moon', '🌙'],
    ['నక్షత్రం', 'nakshatram', 'Star', '⭐'],
    ['వాన', 'vaana', 'Rain', '🌧️'],
    ['చెట్టు', 'chettu', 'Tree', '🌳'],
    ['పువ్వు', 'puvvu', 'Flower', '🌸'],
    ['నది', 'nadi', 'River', '🏞️'],
    ['ఆకాశం', 'aakaasham', 'Sky', '☁️'],
    ['గాలి', 'gaali', 'Wind', '🌬️'],
    ['సముద్రం', 'samudram', 'Sea', '🌊'],
  ]),
  unit('clothes', 'Clothes', '👕', [
    ['చొక్కా', 'chokkaa', 'Shirt', '👕'],
    ['లంగా', 'langaa', 'Long skirt', '👗'],
    ['చీర', 'cheera', 'Saree', '🥻'],
    ['చెప్పులు', 'cheppulu', 'Slippers', '👡'],
    ['టోపీ', 'topee', 'Cap', '🧢'],
    ['కళ్ళద్దాలు', 'kalladdaalu', 'Glasses', '👓'],
  ]),
  unit('places', 'Going places', '🚆', [
    ['బడి', 'badi', 'School', '🏫'],
    ['గుడి', 'gudi', 'Temple', '🛕'],
    ['ఆసుపత్రి', 'aasupatri', 'Hospital', '🏥'],
    ['దుకాణం', 'dukaanam', 'Shop', '🏪'],
    ['ఊరు', 'ooru', 'Hometown, village', '🏡'],
    ['పొలం', 'polam', 'Farm field', '🌾'],
    ['బస్సు', 'bassu', 'Bus', '🚌'],
    ['రైలు', 'railu', 'Train', '🚆'],
    ['విమానం', 'vimaanam', 'Aeroplane', '✈️'],
  ]),
  unit('festivals', 'Festivals', '🪔', [
    ['పండుగ', 'panduga', 'Festival', '🎉'],
    ['సంక్రాంతి', 'sankraanti', 'Sankranti', '🌾'],
    ['ఉగాది', 'ugaadi', 'Ugadi, Telugu new year', '🌿'],
    ['దీపావళి', 'deepaavali', 'Diwali', '🪔'],
    ['ముగ్గు', 'muggu', 'Rangoli', '✨'],
    ['గాలిపటం', 'gaalipatam', 'Kite', '🪁'],
    ['టపాకాయలు', 'tapaakaayalu', 'Firecrackers', '🎆'],
    ['కొత్త బట్టలు', 'kotta battalu', 'New clothes', '👘'],
  ]),
  unit('questions', 'Question words', '❓', [
    ['ఏమిటి?', 'aemiti?', 'What?', '❓'],
    ['ఎక్కడ?', 'ekkada?', 'Where?', '📍'],
    ['ఎప్పుడు?', 'eppudu?', 'When?', '⏰'],
    ['ఎవరు?', 'evaru?', 'Who?', '🧑'],
    ['ఎందుకు?', 'enduku?', 'Why?', '🤔'],
    ['ఎలా?', 'elaa?', 'How?', '🛠️'],
    ['ఎంత?', 'enta?', 'How much?', '💰'],
    ['ఏది?', 'aedi?', 'Which one?', '👉'],
  ]),
  unit('time', 'Days and times', '📅', [
    ['ఇవాళ', 'ivaala', 'Today', '📅'],
    ['రేపు', 'repu', 'Tomorrow', '➡️'],
    ['నిన్న', 'ninna', 'Yesterday', '⬅️'],
    ['ఉదయం', 'udayam', 'Morning', '🌅'],
    ['మధ్యాహ్నం', 'madhyaahnam', 'Afternoon', '🌞'],
    ['సాయంత్రం', 'saayantram', 'Evening', '🌇'],
    ['రాత్రి', 'raatri', 'Night', '🌃'],
    ['ఇప్పుడు', 'ippudu', 'Now', '⏱️'],
  ]),
  unit('home-talk', 'Talking at home', '💬', [
    ['నాకు నీళ్ళు కావాలి', 'naaku neellu kaavaali', 'I want water', '💧'],
    ['నాకు ఆకలిగా ఉంది', 'naaku aakaligaa undi', 'I am hungry', '🤤'],
    ['నాకు సహాయం చెయ్యి', 'naaku sahaayam cheyyi', 'Help me', '🙋'],
    ['ఇది ఏమిటి?', 'idi aemiti?', 'What is this?', '❓'],
    ['నేను ఆడుకుంటాను', 'nenu aadukuntaanu', 'I will play', '⚽'],
    ['నాకు నిద్ర వస్తోంది', 'naaku nidra vastondi', 'I am sleepy', '😪'],
    ['ఇక్కడికి రా', 'ikkadiki raa', 'Come here', '👋'],
    ['చాలా బాగుంది', 'chaalaa baagundi', 'Very nice', '🌟'],
  ], false, 'sentences'),
  ...MORE.map((m) => unit(m.id, m.name, m.icon, m.rows, false, m.kind)),
];

export const ALL_WORDS: Word[] = UNITS.flatMap((u) => u.words);
const UNIT_OF: Record<string, Unit> = {};
for (const u of UNITS) for (const w of u.words) UNIT_OF[w.id] = u;
export const unitOf = (w: Word): Unit => UNIT_OF[w.id];
export const isLetter = (w: Word) => unitOf(w).kind === 'letters';
export const isSentence = (w: Word) => unitOf(w).kind === 'sentences';
export const kindOf = (w: Word): 'letters' | 'sentences' | 'words' => unitOf(w).kind || 'words';

/** The first whole Telugu letter of a word (a consonant with its vowel sign, or a conjunct like ప్ర). */
export const firstAkshara = (te: string): string => {
  const mark = (c: string) => (c >= '\u0C01' && c <= '\u0C03') || (c >= '\u0C3E' && c <= '\u0C56');
  let i = 1;
  while (i < te.length) {
    if (mark(te[i])) { i += 1; continue; }
    if (te[i - 1] === '\u0C4D' && te[i] >= '\u0C15' && te[i] <= '\u0C39') { i += 1; continue; }
    break;
  }
  return te.slice(0, i);
};
export const LESSON_SIZE = 6;
export const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

/** Which grandparent voices a word. In "both" mode they take turns: Ammamma first, then Tatayya. */
export const speakerFor = (w: Word, teacher: Teacher): Speaker => {
  if (teacher !== 'both') return teacher;
  const n = Number(w.id.slice(w.id.lastIndexOf('-') + 1)) || 1;
  return n % 2 === 1 ? 'gma' : 'gpa';
};
