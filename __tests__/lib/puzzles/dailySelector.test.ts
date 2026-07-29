import { AVOID_HASH_MAX_ATTEMPTS } from '../../../constants/config';
import { selectDailyGame } from '../../../lib/puzzles/dailySelector';
import * as nonogramForTier from '../../../lib/puzzles/nonogram/generateForTier';
import { deriveSeed } from '../../../lib/puzzles/rng';
import * as sudokuForTier from '../../../lib/puzzles/sudoku/generateForTier';
import * as sudokuGenerator from '../../../lib/puzzles/sudoku/generator';
import { countGivens } from '../../../lib/puzzles/sudoku/grid';
import {
  isBinaryPuzzle,
  isNonogramPuzzle,
  isSlitherlinkPuzzle,
  isSudokuPuzzle,
} from '../../../lib/puzzles/types';
import type { GameType, NonogramPuzzle } from '../../../lib/puzzles/types';

/** Fixed clock so R-soften in resolveTargetTier stays deterministic. */
const FIXED_NOW_MS = Date.parse('2026-06-15T12:00:00.000Z');

/** Pre-v2.1 gameType golden vectors (seed chain unchanged; puzzleHash may differ). */
const WEEKDAY_GAME_TYPE_GOLDEN: ReadonlyArray<{ dateKey: string; gameType: GameType }> = [
  { dateKey: '2026-06-01', gameType: 'nonogram' },
  { dateKey: '2026-06-02', gameType: 'slitherlink' },
  { dateKey: '2026-06-03', gameType: 'slitherlink' },
  { dateKey: '2026-06-04', gameType: 'slitherlink' },
  { dateKey: '2026-06-05', gameType: 'binary' },
  { dateKey: '2026-06-06', gameType: 'sudoku' },
  { dateKey: '2026-06-07', gameType: 'nonogram' },
];

describe('selectDailyGame', () => {
  it('returns stable gameType for the same dateKey', () => {
    const first = selectDailyGame({ dateKey: '2026-05-16' });
    const second = selectDailyGame({ dateKey: '2026-05-16' });
    expect(second.gameType).toBe(first.gameType);
    expect(second.seed).toBe(first.seed);
    if (first.gameType === 'sudoku') {
      expect(isSudokuPuzzle(second.puzzle)).toBe(true);
      expect(second.puzzleHash).toBe(first.puzzleHash);
    }
  });

  it('avoids repeating previous gameType (DAILY-05)', () => {
    const dateKey = '2026-05-17';
    const seed = deriveSeed(dateKey);
    const result = selectDailyGame({
      dateKey,
      seed,
      previous: { gameType: 'sudoku', puzzleHash: 'stub-v1' },
    });
    expect(result.gameType).not.toBe('sudoku');
  });

  it('returns real sudoku puzzle when type is sudoku', () => {
    let result = selectDailyGame({ dateKey: '2026-01-01' });
    for (let i = 0; i < 30 && result.gameType !== 'sudoku'; i += 1) {
      result = selectDailyGame({ dateKey: `2026-01-${String(i + 2).padStart(2, '0')}` });
    }
    if (result.gameType === 'sudoku' && isSudokuPuzzle(result.puzzle)) {
      expect(result.puzzleHash).not.toBe('stub-v1');
      expect(result.puzzle.puzzleHash).toBe(result.puzzleHash);
    }
  });

  it('honors forceGameType when provided', () => {
    const result = selectDailyGame({
      dateKey: '2026-05-16',
      forceGameType: 'sudoku',
    });
    expect(result.gameType).toBe('sudoku');
    expect(isSudokuPuzzle(result.puzzle)).toBe(true);
  });

  it('returns real binary puzzle when type is binary', () => {
    let result = selectDailyGame({ dateKey: '2026-06-01' });
    for (let i = 0; i < 30 && result.gameType !== 'binary'; i += 1) {
      result = selectDailyGame({ dateKey: `2026-06-${String(i + 2).padStart(2, '0')}` });
    }
    if (result.gameType === 'binary' && isBinaryPuzzle(result.puzzle)) {
      expect(result.puzzleHash).not.toBe('binary-stub-v1');
      expect(result.puzzle.puzzleHash).toBe(result.puzzleHash);
      expect(result.puzzleHash).toMatch(/^bin-/);
    }
  });

  it('returns real nonogram puzzle when type is nonogram', () => {
    const result = selectDailyGame({
      dateKey: '2026-05-16',
      forceGameType: 'nonogram',
    });
    expect(result.gameType).toBe('nonogram');
    expect(isNonogramPuzzle(result.puzzle)).toBe(true);
    expect(result.puzzleHash).toMatch(/^nono-/);
  });

  it('returns real slitherlink puzzle when forceGameType is slitherlink', () => {
    const first = selectDailyGame({
      dateKey: '2026-05-20',
      forceGameType: 'slitherlink',
    });
    const second = selectDailyGame({
      dateKey: '2026-05-20',
      forceGameType: 'slitherlink',
    });
    expect(first.gameType).toBe('slitherlink');
    expect(isSlitherlinkPuzzle(first.puzzle)).toBe(true);
    expect(first.puzzleHash).toMatch(/^sl-/);
    expect(first.puzzleHash).not.toBe('sl-f43e34c7');
    expect(second.puzzleHash).toBe(first.puzzleHash);
  });

  it('picks a different slitherlink hash when previous hash is passed without gameType', () => {
    const first = selectDailyGame({
      dateKey: '2026-05-20',
      forceGameType: 'slitherlink',
    });
    const second = selectDailyGame({
      dateKey: '2026-05-20',
      forceGameType: 'slitherlink',
      previous: { puzzleHash: first.puzzleHash },
    });
    expect(second.gameType).toBe('slitherlink');
    expect(second.puzzleHash).not.toBe(first.puzzleHash);
  });

  it('keeps pre-v2.1 gameType golden vectors for a Mon–Sun week', () => {
    for (const { dateKey, gameType } of WEEKDAY_GAME_TYPE_GOLDEN) {
      expect(selectDailyGame({ dateKey }).gameType).toBe(gameType);
    }
  });

  it('gives Monday sudoku more givens than Sunday sudoku', () => {
    const mon = selectDailyGame({
      dateKey: '2026-06-01',
      forceGameType: 'sudoku',
    });
    const sun = selectDailyGame({
      dateKey: '2026-06-07',
      forceGameType: 'sudoku',
    });
    expect(isSudokuPuzzle(mon.puzzle)).toBe(true);
    expect(isSudokuPuzzle(sun.puzzle)).toBe(true);
    if (isSudokuPuzzle(mon.puzzle) && isSudokuPuzzle(sun.puzzle)) {
      expect(countGivens(mon.puzzle.givens)).toBeGreaterThan(
        countGivens(sun.puzzle.givens),
      );
    }
  });

  it('can pick slitherlink from the four-type pool', () => {
    let found = false;
    for (let day = 1; day <= 60; day += 1) {
      const result = selectDailyGame({
        dateKey: `2026-07-${String(day).padStart(2, '0')}`,
      });
      if (result.gameType === 'slitherlink') {
        found = true;
        expect(isSlitherlinkPuzzle(result.puzzle)).toBe(true);
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('skips avoidByType hashes within the retry budget (DIV-02)', () => {
    const first = selectDailyGame({
      dateKey: '2026-05-16',
      forceGameType: 'nonogram',
      nowMs: FIXED_NOW_MS,
    });
    const second = selectDailyGame({
      dateKey: '2026-05-16',
      forceGameType: 'nonogram',
      avoidByType: { nonogram: [first.puzzleHash] },
      nowMs: FIXED_NOW_MS,
    });
    expect(second.gameType).toBe('nonogram');
    expect(second.puzzleHash).not.toBe(first.puzzleHash);
  });

  it('on avoid exhaustion still returns a forTier puzzle (D-06)', () => {
    const blocked = 'nono-avoid-blocked';
    const stubPuzzle: NonogramPuzzle = {
      kind: 'nonogram',
      rows: 8,
      cols: 8,
      rowClues: [[1], [1], [1], [1], [1], [1], [1], [1]],
      colClues: [[1], [1], [1], [1], [1], [1], [1], [1]],
      solution: Array.from({ length: 8 }, () => Array(8).fill(0)),
      pictureTitle: 'stub',
      puzzleHash: blocked,
    };
    const forTier = jest
      .spyOn(nonogramForTier, 'generateNonogramPuzzleForTier')
      .mockImplementation((seed, targetTier) => ({
        puzzle: { ...stubPuzzle, pictureTitle: String(seed) },
        ratedTier: targetTier,
        peakTechnique: 'simple_few',
        softened: false,
      }));

    const result = selectDailyGame({
      dateKey: '2026-05-16',
      forceGameType: 'nonogram',
      avoidByType: { nonogram: [blocked] },
      nowMs: FIXED_NOW_MS,
    });

    expect(result.gameType).toBe('nonogram');
    expect(result.puzzleHash).toBe(blocked);
    expect(forTier).toHaveBeenCalledTimes(AVOID_HASH_MAX_ATTEMPTS + 1);
    forTier.mockRestore();
  });

  it('uses generate*ForTier instead of legacy weekday generate on adaptive path', () => {
    const forTier = jest.spyOn(sudokuForTier, 'generateSudokuPuzzleForTier');
    const legacy = jest.spyOn(sudokuGenerator, 'generateSudokuPuzzle');

    const result = selectDailyGame({
      dateKey: '2026-06-01',
      forceGameType: 'sudoku',
      nowMs: FIXED_NOW_MS,
    });

    expect(result.gameType).toBe('sudoku');
    expect(forTier).toHaveBeenCalled();
    expect(forTier.mock.calls[0]?.length).toBe(2);
    expect(legacy).not.toHaveBeenCalled();
    forTier.mockRestore();
    legacy.mockRestore();
  });
});
