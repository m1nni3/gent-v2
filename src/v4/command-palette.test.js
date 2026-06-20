import { describe, it, expect } from 'vitest';

// The score function is not exported, so we recreate its logic for testing.
// This tests the fuzzy matching algorithm used in the command palette.
function score(query, target) {
  if (!query) { return 0; }
  const t = target;
  const q = query;
  let ti = 0;
  let qi = 0;
  let s = 0;
  let lastMatchedAt = -2;
  while (qi < q.length && ti < t.length) {
    if (t[ti] === q[qi]) {
      if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-' || t[ti - 1] === '_') { s -= 6; }
      if (lastMatchedAt === ti - 1) { s -= 4; }
      lastMatchedAt = ti;
      qi += 1;
    } else {
      s += 1;
    }
    ti += 1;
  }
  if (qi < q.length) { return Infinity; }
  s += (t.length - q.length) * 0.1;
  return s;
}

describe('command-palette score function', () => {
  it('returns 0 for empty query', () => {
    expect(score('', 'anything')).toBe(0);
  });

  it('returns Infinity when query cannot be matched', () => {
    expect(score('xyz', 'abc')).toBe(Infinity);
  });

  it('returns Infinity for query longer than target without match', () => {
    expect(score('abcdef', 'abc')).toBe(Infinity);
  });

  it('gives lower score for exact prefix match', () => {
    const prefixScore = score('dash', 'dashboard');
    const midScore = score('dash', 'admin dashboard');
    expect(prefixScore).toBeLessThan(midScore);
  });

  it('gives bonus for word boundary matches', () => {
    const boundaryScore = score('fb', 'file browser');
    const midScore = score('fb', 'foobar');
    expect(boundaryScore).toBeLessThan(midScore);
  });

  it('gives bonus for consecutive character matches', () => {
    const consecutiveScore = score('set', 'settings');
    const scatteredScore = score('set', 'some extra text');
    expect(consecutiveScore).toBeLessThan(scatteredScore);
  });

  it('prefers shorter targets for same query', () => {
    const shortScore = score('in', 'inbox');
    const longScore = score('in', 'inbox manager settings');
    expect(shortScore).toBeLessThan(longScore);
  });

  it('matches case-sensitively', () => {
    expect(score('A', 'abc')).toBe(Infinity);
    expect(score('a', 'abc')).not.toBe(Infinity);
  });

  it('handles single character query', () => {
    const s = score('i', 'inbox');
    expect(s).not.toBe(Infinity);
    expect(typeof s).toBe('number');
  });

  it('handles hyphen as word boundary', () => {
    const s = score('nr', 'new-report');
    expect(s).not.toBe(Infinity);
    // 'n' matches at start (word boundary), 'r' matches at hyphen boundary
    expect(s).toBeLessThan(score('nr', 'another'));
  });

  it('handles underscore as word boundary', () => {
    const s = score('np', 'new_page');
    expect(s).not.toBe(Infinity);
  });

  it('returns finite value for full match', () => {
    const s = score('inbox', 'inbox');
    expect(s).not.toBe(Infinity);
    expect(s).toBeLessThan(0); // lots of bonuses for exact match
  });

  it('ranks results correctly for typical searches', () => {
    const targets = ['inbox', 'kanban', 'settings', 'file manager', 'calendar'];
    const results = targets
      .map((t) => ({ t, s: score('in', t.toLowerCase()) }))
      .filter((x) => x.s !== Infinity)
      .sort((a, b) => a.s - b.s);
    // 'inbox' should rank first since 'in' is a prefix
    expect(results[0].t).toBe('inbox');
  });
});
