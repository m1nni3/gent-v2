import { describe, it, expect } from 'vitest';
import { _score as score } from './command-palette.js';

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
