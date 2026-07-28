import { defaultGameTypeMastery } from '../../../lib/mastery/defaults';
import { resolveTargetTier } from '../../../lib/mastery/resolveTargetTier';
import type { MasteryState } from '../../../lib/mastery/types';

const MON = '2026-06-01'; // band 0 → nudge -1
const WED = '2026-06-03'; // band 2 → nudge 0
const FRI = '2026-06-05'; // band 4 → nudge +1
const SUN = '2026-06-07'; // band 6 → nudge +1

function stateWith(
  partial: Partial<ReturnType<typeof defaultGameTypeMastery>>,
): MasteryState {
  return {
    byType: {
      sudoku: { ...defaultGameTypeMastery(), ...partial },
      binary: defaultGameTypeMastery(),
      nonogram: defaultGameTypeMastery(),
      slitherlink: defaultGameTypeMastery(),
    },
  };
}

describe('resolveTargetTier', () => {
  it('weekday nudge: Mon -1, midweek 0, Fri–Sun +1 relative to personal', () => {
    const mastery = stateWith({ tier: 'medium' });
    expect(
      resolveTargetTier({ gameType: 'sudoku', dateKey: MON, mastery }),
    ).toBe('easy');
    expect(
      resolveTargetTier({ gameType: 'sudoku', dateKey: WED, mastery }),
    ).toBe('medium');
    expect(
      resolveTargetTier({ gameType: 'sudoku', dateKey: FRI, mastery }),
    ).toBe('hard');
    expect(
      resolveTargetTier({ gameType: 'sudoku', dateKey: SUN, mastery }),
    ).toBe('hard');
  });

  it('clamps final tier to 0..3', () => {
    const easy = stateWith({ tier: 'easy' });
    expect(
      resolveTargetTier({ gameType: 'sudoku', dateKey: MON, mastery: easy }),
    ).toBe('easy');

    const expert = stateWith({ tier: 'expert' });
    expect(
      resolveTargetTier({ gameType: 'sudoku', dateKey: SUN, mastery: expert }),
    ).toBe('expert');
  });

  it('softens personal by one when R(now) < 0.5 before weekday nudge', () => {
    // With S=2, R=0.5 when t = 9*S = 18 days; use 30 days → R < 0.5
    const nowMs = 1_800_000_000_000;
    const lastPracticedAtMs = nowMs - 30 * 86_400_000;
    const mastery = stateWith({
      tier: 'hard',
      stabilityDays: 2,
      lastPracticedAtMs,
    });

    // personal hard(2) → soften to medium(1); Wed nudge 0 → medium
    expect(
      resolveTargetTier({
        gameType: 'sudoku',
        dateKey: WED,
        mastery,
        nowMs,
      }),
    ).toBe('medium');

    // personal hard → soft medium; Mon nudge -1 → easy
    expect(
      resolveTargetTier({
        gameType: 'sudoku',
        dateKey: MON,
        mastery,
        nowMs,
      }),
    ).toBe('easy');
  });

  it('does not soften when never practiced (null lastPracticedAtMs)', () => {
    const mastery = stateWith({ tier: 'hard', lastPracticedAtMs: null });
    expect(
      resolveTargetTier({
        gameType: 'sudoku',
        dateKey: WED,
        mastery,
        nowMs: 1_800_000_000_000,
      }),
    ).toBe('hard');
  });
});
