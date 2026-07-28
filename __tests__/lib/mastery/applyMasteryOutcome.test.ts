import { applyMasteryOutcome } from '../../../lib/mastery/applyMasteryOutcome';
import { MASTERY_BASELINES_MS } from '../../../lib/mastery/baselines';
import { DEFAULT_MASTERY_STATE, defaultGameTypeMastery } from '../../../lib/mastery/defaults';
import type { MasteryState } from '../../../lib/mastery/types';

const NOW = 1_700_000_000_000;

function cloneDefault(): MasteryState {
  return {
    byType: {
      sudoku: { ...defaultGameTypeMastery() },
      binary: { ...defaultGameTypeMastery() },
      nonogram: { ...defaultGameTypeMastery() },
      slitherlink: { ...defaultGameTypeMastery() },
    },
  };
}

describe('applyMasteryOutcome', () => {
  it('DEFAULT has all four types at easy with stabilityDays 2', () => {
    expect(DEFAULT_MASTERY_STATE.byType.sudoku.tier).toBe('easy');
    expect(DEFAULT_MASTERY_STATE.byType.binary.stabilityDays).toBe(2);
    expect(DEFAULT_MASTERY_STATE.byType.nonogram.lastPracticedAtMs).toBeNull();
    expect(DEFAULT_MASTERY_STATE.byType.slitherlink.lastOutcome).toBeNull();
    expect(Object.keys(DEFAULT_MASTERY_STATE.byType).sort()).toEqual([
      'binary',
      'nonogram',
      'slitherlink',
      'sudoku',
    ]);
  });

  it('is pure and injectable via nowMs; updates only the given gameType', () => {
    const before = cloneDefault();
    const baseline = MASTERY_BASELINES_MS.sudoku.easy;
    const next = applyMasteryOutcome(before, {
      gameType: 'sudoku',
      outcome: 'completed',
      elapsedMs: baseline * 0.5, // easy grade
      nowMs: NOW,
    });

    expect(next.byType.sudoku.lastPracticedAtMs).toBe(NOW);
    expect(next.byType.sudoku.lastOutcome).toBe('completed');
    expect(next.byType.sudoku.stabilityDays).toBeGreaterThan(
      before.byType.sudoku.stabilityDays,
    );
    expect(next.byType.binary).toEqual(before.byType.binary);
    expect(before.byType.sudoku.lastPracticedAtMs).toBeNull(); // pure: no mutate input
  });

  it('grades: abandon→again shrinks S; fast complete raises S more than slow', () => {
    const baseline = MASTERY_BASELINES_MS.binary.easy;
    const abandoned = applyMasteryOutcome(cloneDefault(), {
      gameType: 'binary',
      outcome: 'abandoned',
      elapsedMs: 1000,
      nowMs: NOW,
    });
    expect(abandoned.byType.binary.stabilityDays).toBeLessThan(2);
    expect(abandoned.byType.binary.lastOutcome).toBe('abandoned');

    const fast = applyMasteryOutcome(cloneDefault(), {
      gameType: 'binary',
      outcome: 'completed',
      elapsedMs: baseline * 0.5,
      nowMs: NOW,
    });
    const slow = applyMasteryOutcome(cloneDefault(), {
      gameType: 'binary',
      outcome: 'completed',
      elapsedMs: baseline * 2,
      nowMs: NOW,
    });
    expect(fast.byType.binary.stabilityDays).toBeGreaterThan(
      slow.byType.binary.stabilityDays,
    );
  });

  it('anti-thrash: single up grade does not raise tier; two consecutive do', () => {
    const baseline = MASTERY_BASELINES_MS.sudoku.easy;
    const once = applyMasteryOutcome(cloneDefault(), {
      gameType: 'sudoku',
      outcome: 'completed',
      elapsedMs: baseline * 0.5,
      nowMs: NOW,
    });
    expect(once.byType.sudoku.tier).toBe('easy');
    expect(once.byType.sudoku.consecutiveUp).toBe(1);

    const twice = applyMasteryOutcome(once, {
      gameType: 'sudoku',
      outcome: 'completed',
      elapsedMs: baseline * 0.5,
      nowMs: NOW + 86_400_000,
    });
    expect(twice.byType.sudoku.tier).toBe('medium');
    expect(twice.byType.sudoku.consecutiveUp).toBe(0);
  });

  it('anti-thrash: single abandon does not drop tier; two consecutive again/hard do', () => {
    const start: MasteryState = {
      byType: {
        ...cloneDefault().byType,
        nonogram: {
          ...defaultGameTypeMastery(),
          tier: 'medium',
          stabilityDays: 4,
        },
      },
    };

    const once = applyMasteryOutcome(start, {
      gameType: 'nonogram',
      outcome: 'abandoned',
      elapsedMs: 5000,
      nowMs: NOW,
    });
    expect(once.byType.nonogram.tier).toBe('medium');
    expect(once.byType.nonogram.consecutiveDown).toBe(1);

    const twice = applyMasteryOutcome(once, {
      gameType: 'nonogram',
      outcome: 'abandoned',
      elapsedMs: 5000,
      nowMs: NOW + 86_400_000,
    });
    expect(twice.byType.nonogram.tier).toBe('easy');
    expect(twice.byType.nonogram.consecutiveDown).toBe(0);
  });
});
