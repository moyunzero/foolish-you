import { deriveSeed, hashStringToSeed, mulberry32 } from '../../../lib/puzzles/rng';

describe('rng', () => {
  it('mulberry32 is deterministic for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('deriveSeed is stable per dateKey', () => {
    expect(deriveSeed('2026-05-16')).toBe(deriveSeed('2026-05-16'));
    expect(deriveSeed('2026-05-16')).not.toBe(deriveSeed('2026-05-17'));
  });

  it('hashStringToSeed returns unsigned 32-bit', () => {
    const seed = hashStringToSeed('test');
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(0xffffffff);
  });
});
