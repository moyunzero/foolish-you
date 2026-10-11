jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { getStringsForLocale } from '../../../lib/i18n/strings';
import { pickNotificationCopy } from '../../../lib/notifications/pickNotificationCopy';

const DATE_KEY = '2026-06-07';
const SEED = 42;

/** Call with optional carrying flag before the API is typed for it. */
function pick(
  dateKey: string,
  seed: number,
  locale: 'en' | 'zh',
  options?: { carrying?: boolean },
): { title: string; body: string } {
  return (
    pickNotificationCopy as (
      d: string,
      s: number,
      l: 'en' | 'zh',
      o?: { carrying?: boolean },
    ) => { title: string; body: string }
  )(dateKey, seed, locale, options);
}

describe('pickNotificationCopy', () => {
  it('uses carry title and bodies when carrying is true', () => {
    const en = getStringsForLocale('en').notifications as unknown as {
      routineTitleCarry: string;
      routineBodiesCarry: readonly string[];
      routineBodies: readonly string[];
    };
    const { title, body } = pick(DATE_KEY, SEED, 'en', { carrying: true });

    expect(title).toBe('Still open');
    expect(title).toBe(en.routineTitleCarry);
    expect(en.routineBodiesCarry).toContain(body);
    expect(en.routineBodies).not.toContain(body);
  });

  it('uses today pool when carrying is false or omitted', () => {
    const en = getStringsForLocale('en').notifications;
    const withFalse = pick(DATE_KEY, SEED, 'en', { carrying: false });
    const omitted = pick(DATE_KEY, SEED, 'en');

    expect(withFalse.title).toBe("Today's puzzle");
    expect(omitted.title).toBe("Today's puzzle");
    expect(en.routineBodies).toContain(withFalse.body);
    expect(en.routineBodies).toContain(omitted.body);
  });
});
