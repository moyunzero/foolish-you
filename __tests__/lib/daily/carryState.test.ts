import {
  isCarrying,
  shouldKeepOnHydrate,
} from '../../../lib/daily/carryState';
import {
  FIXTURE_TODAY,
  FIXTURE_TOMORROW,
  FIXTURE_YESTERDAY,
} from '../../helpers/dailyGameFixtures';

describe('shouldKeepOnHydrate', () => {
  it('returns false for null record', () => {
    expect(shouldKeepOnHydrate(null, FIXTURE_TODAY)).toBe(false);
  });

  it('keeps playing when dateKey is yesterday (D-01)', () => {
    expect(
      shouldKeepOnHydrate(
        { status: 'playing', dateKey: FIXTURE_YESTERDAY },
        FIXTURE_TODAY,
      ),
    ).toBe(true);
  });

  it('keeps playing when dateKey is tomorrow / clock skew (D-02)', () => {
    expect(
      shouldKeepOnHydrate(
        { status: 'playing', dateKey: FIXTURE_TOMORROW },
        FIXTURE_TODAY,
      ),
    ).toBe(true);
  });

  it('keeps same-day completed', () => {
    expect(
      shouldKeepOnHydrate(
        { status: 'completed', dateKey: FIXTURE_TODAY },
        FIXTURE_TODAY,
      ),
    ).toBe(true);
  });

  it('does not keep completed when dateKey is yesterday (mint for v2.7-02)', () => {
    expect(
      shouldKeepOnHydrate(
        { status: 'completed', dateKey: FIXTURE_YESTERDAY },
        FIXTURE_TODAY,
      ),
    ).toBe(false);
  });

  it('does not keep abandoned when dateKey is stale', () => {
    expect(
      shouldKeepOnHydrate(
        { status: 'abandoned', dateKey: FIXTURE_YESTERDAY },
        FIXTURE_TODAY,
      ),
    ).toBe(false);
  });
});

describe('isCarrying', () => {
  it('is true for playing with opening dateKey before calendar today', () => {
    expect(isCarrying('playing', FIXTURE_YESTERDAY, FIXTURE_TODAY)).toBe(true);
  });

  it('is false for playing on same calendar day', () => {
    expect(isCarrying('playing', FIXTURE_TODAY, FIXTURE_TODAY)).toBe(false);
  });

  it('is false for loading / completed / abandoned', () => {
    expect(isCarrying('loading', FIXTURE_YESTERDAY, FIXTURE_TODAY)).toBe(false);
    expect(isCarrying('completed', FIXTURE_YESTERDAY, FIXTURE_TODAY)).toBe(
      false,
    );
    expect(isCarrying('abandoned', FIXTURE_YESTERDAY, FIXTURE_TODAY)).toBe(
      false,
    );
  });

  it('is false when openingDateKey is null', () => {
    expect(isCarrying('playing', null, FIXTURE_TODAY)).toBe(false);
  });
});
