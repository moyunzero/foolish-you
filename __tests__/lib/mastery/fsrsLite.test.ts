import {
  nextStability,
  retrievability,
  S_MAX,
  S_MIN,
} from '../../../lib/mastery/fsrsLite';

describe('fsrsLite', () => {
  it('retrievability matches FSRS v4 form with S floor', () => {
    // R(t,S) = (1 + t/(9*S))^(-1); S floored at S_MIN
    expect(retrievability(0, 2)).toBeCloseTo(1, 10);
    expect(retrievability(9 * 2, 2)).toBeCloseTo(0.5, 10);
    // S below floor uses S_MIN
    const rTinyS = retrievability(9 * S_MIN, 0.1);
    expect(rTinyS).toBeCloseTo(0.5, 10);
  });

  it('nextStability applies locked multipliers and clamps', () => {
    const S = 2;
    const R = 1;
    expect(nextStability(S, R, 'again')).toBeCloseTo(
      Math.max(S_MIN, S * 0.5 * (0.5 + 0.5 * R)),
      10,
    );
    expect(nextStability(S, R, 'easy')).toBeCloseTo(S * 1.8 * (1 + 0.3 * (1 - R)), 10);
    expect(nextStability(S, R, 'good')).toBeCloseTo(S * 1.35 * (1 + 0.3 * (1 - R)), 10);
    expect(nextStability(S, R, 'hard')).toBeCloseTo(S * 1.05 * (1 + 0.3 * (1 - R)), 10);

    expect(nextStability(0.01, 0, 'again')).toBe(S_MIN);
    expect(nextStability(S_MAX, 0, 'easy')).toBe(S_MAX);
  });
});
