// Writes tools/bedtime/stories.json from src/bedtime/stories.ts, for the narration job.
import { writeFileSync } from 'node:fs';
import { BED_STORIES } from '../../src/bedtime/stories.ts';
const out = BED_STORIES.map((s) => ({ id: s.id, lines: s.lines.map((l) => ({ te: l.te, p: l.p ?? 0 })) }));
writeFileSync(new URL('./stories.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(out.map((s) => `${s.id}: ${s.lines.length} lines`).join('\n'));
