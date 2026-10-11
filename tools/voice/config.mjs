// Which Sarvam Bulbul v3 speaker voices each character. Change a speaker or pace here and re-run the
// "Generate story voices" workflow: only that character's lines are re-recorded.
// To choose by ear, listen to tools/voice/samples/<speaker>.mp3 (one sample per speaker, made on the first run).
export const LANGUAGE = 'te-IN';
export const MODEL = 'bulbul:v3';

export const VOICES = {
  ammamma: { speaker: 'kavitha', pace: 0.9 },
  tatayya: { speaker: 'ratan', pace: 0.88 },
  amma: { speaker: 'roopa', pace: 1.0 },
  nanna: { speaker: 'anand', pace: 1.0 },
  boy: { speaker: 'aayan', pace: 1.05 },
  girl: { speaker: 'suhani', pace: 1.05 },
};

// Every Bulbul v3 speaker, for the sample files.
export const ALL_SPEAKERS = [
  'shubh', 'aditya', 'ritu', 'priya', 'neha', 'rahul', 'pooja', 'rohan', 'simran', 'kavya', 'amit', 'dev', 'ishita',
  'shreya', 'ratan', 'varun', 'manan', 'sumit', 'roopa', 'kabir', 'aayan', 'ashutosh', 'advait', 'anand', 'tanya',
  'tarun', 'sunny', 'mani', 'gokul', 'vijay', 'shruti', 'suhani', 'mohit', 'kavitha', 'rehan', 'soham', 'rupali',
];
export const SAMPLE_TEXT = 'నమస్కారం! అన్నం తిన్నావా? రా, మనం కలిసి ఆడుకుందాం.';
