import { computeElapsedMs } from '../../../lib/time/computeElapsedMs';

describe('computeElapsedMs', () => {
  it('returns 0 when startedAt is undefined', () => {
    expect(computeElapsedMs(undefined, 1_000)).toBe(0);
  });

  it('returns 0 when system clock moved before startedAt', () => {
    expect(computeElapsedMs(5_000, 4_000)).toBe(0);
  });

  it('returns positive delta when now is after startedAt', () => {
    expect(computeElapsedMs(1_000, 61_000)).toBe(60_000);
  });
});
