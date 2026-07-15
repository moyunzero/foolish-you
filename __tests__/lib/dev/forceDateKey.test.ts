import { getLocalDateKey } from '../../../lib/date/localDay';
import {
  DEV_QA_SUNDAY_DATE_KEY,
  getDevForceDateKey,
  setDevForceDateKey,
} from '../../../lib/dev/forceDateKey';

describe('dev forceDateKey', () => {
  afterEach(() => {
    setDevForceDateKey(null);
  });

  it('overrides getLocalDateKey() with no args when set', () => {
    setDevForceDateKey(DEV_QA_SUNDAY_DATE_KEY);
    expect(getDevForceDateKey()).toBe(DEV_QA_SUNDAY_DATE_KEY);
    expect(getLocalDateKey()).toBe(DEV_QA_SUNDAY_DATE_KEY);
  });

  it('does not override getLocalDateKey(explicitDate)', () => {
    setDevForceDateKey(DEV_QA_SUNDAY_DATE_KEY);
    expect(getLocalDateKey(new Date(2026, 6, 15))).toBe('2026-07-15');
  });

  it('clears back to device calendar for no-arg calls', () => {
    setDevForceDateKey(DEV_QA_SUNDAY_DATE_KEY);
    setDevForceDateKey(null);
    expect(getDevForceDateKey()).toBeNull();
    // Real device day is whatever the host is — just not the forced Sunday unless host is that Sunday.
    const key = getLocalDateKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
