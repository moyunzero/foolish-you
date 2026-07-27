import {
  slitherlinkParamsForBand,
  slitherlinkParamsForDate,
} from '../../../../lib/puzzles/difficulty/slitherlinkBand';
import { getSlitherlinkBuiltinPuzzle } from '../../../../lib/puzzles/slitherlink/builtinPuzzle';
import { generateSlitherlinkPuzzle } from '../../../../lib/puzzles/slitherlink/generator';

describe('slitherlinkBand params', () => {
  it('locks easy band 0 endpoints (D-08)', () => {
    const easy = slitherlinkParamsForBand(0);
    expect(easy.minClues).toBe(28);
    expect(easy.inside.min).toBe(34);
    expect(easy.inside.max).toBe(46);
  });

  it('locks hard band 6 endpoints (D-07)', () => {
    const hard = slitherlinkParamsForBand(6);
    expect(hard.minClues).toBe(12);
    expect(hard.inside.min).toBe(10);
    expect(hard.inside.max).toBe(24);
  });

  it('yields seven distinct minClues across bands 0..6', () => {
    const clues = [0, 1, 2, 3, 4, 5, 6].map(
      (band) => slitherlinkParamsForBand(band).minClues,
    );
    expect(new Set(clues).size).toBe(7);
  });

  it('maps Mon/Sun dateKeys to band 0 / band 6', () => {
    expect(slitherlinkParamsForDate('2026-06-01')).toEqual(
      slitherlinkParamsForBand(0),
    );
    expect(slitherlinkParamsForDate('2026-06-07')).toEqual(
      slitherlinkParamsForBand(6),
    );
  });

  it('distinguishes Mon vs Sun params (D-05)', () => {
    const mon = slitherlinkParamsForDate('2026-06-01');
    const sun = slitherlinkParamsForDate('2026-06-07');
    expect(mon.minClues).not.toBe(sun.minClues);
    expect(
      mon.inside.min !== sun.inside.min || mon.inside.max !== sun.inside.max,
    ).toBe(true);
  });
});

describe('slitherlink dateKey generation', () => {
  it('is deterministic for the same seed + Sunday dateKey', () => {
    const first = generateSlitherlinkPuzzle(77_001, '2026-06-07');
    const second = generateSlitherlinkPuzzle(77_001, '2026-06-07');
    expect(second.puzzleHash).toBe(first.puzzleHash);
  });

  it('keeps Sunday builtin rate under 5% over a fixed corpus (D-10)', () => {
    const builtinHash = getSlitherlinkBuiltinPuzzle().puzzleHash;
    expect(builtinHash).toBe('sl-f43e34c7');

    const corpusSize = 30;
    const sundayKeys = [
      '2026-06-07',
      '2026-06-14',
      '2026-06-21',
      '2026-06-28',
      '2026-07-05',
      '2026-07-12',
    ];
    let builtinCount = 0;
    for (let i = 0; i < corpusSize; i += 1) {
      const key = sundayKeys[i % sundayKeys.length]!;
      const seed = 50_000 + i * 97;
      const puzzle = generateSlitherlinkPuzzle(seed, key);
      if (puzzle.puzzleHash === builtinHash) builtinCount += 1;
    }

    expect(builtinCount / corpusSize).toBeLessThan(0.05);
  });

  it('finishes a small Sunday corpus under a generous timing budget (D-12)', () => {
    const started = Date.now();
    const sample = 8;
    for (let i = 0; i < sample; i += 1) {
      generateSlitherlinkPuzzle(60_000 + i * 131, '2026-06-07');
    }
    const elapsed = Date.now() - started;
    // Fail only on extreme regression — CI-friendly 60s for 8 generates
    expect(elapsed).toBeLessThan(60_000);
  });
});
