import { formatElapsedClock } from '../../../lib/time/formatElapsedClock';

describe('formatElapsedClock', () => {
  it('formats mm:ss and clamps negative input', () => {
    expect(formatElapsedClock(222_000)).toBe('03:42');
    expect(formatElapsedClock(-1_000)).toBe('00:00');
  });
});
