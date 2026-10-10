import type { UnitSpec } from './more/types';
import { PACK_A } from './more/packA';
import { PACK_B } from './more/packB';
import { PACK_C } from './more/packC';
import { PACK_D } from './more/packD';

/**
 * Extra units, appended after the original path. Words and sentences are interleaved so a child
 * alternates between vocabulary themes and things to say.
 */
const pools = [PACK_A, PACK_B, PACK_C, PACK_D];
const take = [3, 3, 3, 2];   // units taken from each pack per round
const out: UnitSpec[] = [];
const pos = [0, 0, 0, 0];
for (let left = true; left; ) {
  left = false;
  pools.forEach((pool, k) => {
    for (let i = 0; i < take[k] && pos[k] < pool.length; i++) { out.push(pool[pos[k]++]); }
    if (pos[k] < pool.length) left = true;
  });
}
export const MORE: UnitSpec[] = out;
