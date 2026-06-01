import { selectDailyGame } from '../../../lib/puzzles/dailySelector';
import { deriveSeed } from '../../../lib/puzzles/rng';
import {
  isBinaryPuzzle,
  isNonogramPuzzle,
  isSlitherlinkPuzzle,
  isSudokuPuzzle,
} from '../../../lib/puzzles/types';

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
    expect(first.puzzleHash).not.toBe('sl-172b96f3');
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
});
