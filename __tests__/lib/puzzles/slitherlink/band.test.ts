import {
  slitherlinkParamsForBand,
  slitherlinkParamsForDate,
} from '../../../../lib/puzzles/difficulty/slitherlinkBand';
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
});

describe('slitherlink dateKey generation', () => {
  it('is deterministic for the same seed + Sunday dateKey', () => {
    const first = generateSlitherlinkPuzzle(77_001, '2026-06-07');
    const second = generateSlitherlinkPuzzle(77_001, '2026-06-07');
    expect(second.puzzleHash).toBe(first.puzzleHash);
  });
});
