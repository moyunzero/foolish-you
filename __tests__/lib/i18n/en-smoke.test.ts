jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { pickResultCopy } from '../../../lib/copy/resultMessages';
import { formatStreakLine } from '../../../lib/copy/streak';
import { formatFreezeShieldSuffix, pickFreezeConsumedLine } from '../../../lib/copy/freeze';
import { pickMissedYesterdayLine } from '../../../lib/copy/missedYesterday';
import { generateSudokuPuzzle } from '../../../lib/puzzles/sudoku/generator';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../lib/puzzles/sudoku/grid';
import { buildShareCard } from '../../../lib/share/buildShareCard';

const DATE_KEY = '2026-05-25';
const SEED = 42_424_242;

describe('English locale smoke', () => {
  it('formatStreakLine uses English copy', () => {
    expect(
      formatStreakLine(
        {
          displayStreak: 3,
          checkedInToday: true,
          streakBroken: false,
        },
        'en',
      ),
    ).toContain('3 days');
    expect(
      formatStreakLine(
        {
          displayStreak: 3,
          checkedInToday: true,
          streakBroken: false,
        },
        'en',
      ),
    ).not.toMatch(/[\u4e00-\u9fff]/);
  });

  it('pickResultCopy completed returns English without CJK', () => {
    const copy = pickResultCopy('completed', 125_000, DATE_KEY, SEED, 'en');
    const cjk = /[\u4e00-\u9fff]/;

    expect(copy.mode).toBe('completed');
    expect(copy.headline).not.toMatch(cjk);
    expect(copy.punchline).not.toMatch(cjk);
    expect(copy.cta).not.toMatch(cjk);
  });

  it('buildShareCard includes Brainfool branding', () => {
    const puzzle = generateSudokuPuzzle(SEED);
    const card = buildShareCard(
      {
        gameType: 'sudoku',
        dateKey: DATE_KEY,
        elapsedMs: 138_000,
        status: 'completed',
        playState: createEmptySudokuGrid(),
        puzzle,
        seed: SEED,
        streakDays: 2,
      },
      'en',
    );

    expect(card).toContain('Brainfool');
    expect(card).not.toContain('傻了么');
  });

  it('freeze copy is English without CJK', () => {
    const cjk = /[\u4e00-\u9fff]/;
    expect(pickFreezeConsumedLine(DATE_KEY, SEED, 'en')).not.toMatch(cjk);
    expect(formatFreezeShieldSuffix(2, 'en')).toContain('Shield');
    expect(pickMissedYesterdayLine({
      todayKey: DATE_KEY,
      seed: SEED,
      locale: 'en',
      freezeConsumedToday: false,
    })).not.toMatch(cjk);
  });
});
