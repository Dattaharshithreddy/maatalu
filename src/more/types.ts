// One content pack = a list of unit specs. Row = [telugu, transliteration, english, emoji].
export type Row = [string, string, string, string];
export type UnitSpec = { id: string; name: string; icon: string; kind?: 'letters' | 'sentences'; rows: Row[] };
