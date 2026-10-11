jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { getStringsForLocale } from '../../../lib/i18n/strings';
import { pickNotificationCopy } from '../../../lib/notifications/pickNotificationCopy';

const DATE_KEY = '2026-06-07';
const SEED = 42;

describe('pickNotificationCopy', () => {
  it('uses carry title and bodies when carrying is true', () => {
    const en = getStringsForLocale('en').notifications;
    const { title, body } = pickNotificationCopy(DATE_KEY, SEED, 'en', {
      carrying: true,
    });

    expect(title).toBe('Still open');
    expect(title).toBe(en.routineTitleCarry);
    expect(en.routineBodiesCarry).toContain(body);
    expect(en.routineBodies).not.toContain(body);
  });

  it('uses today pool when carrying is false or omitted', () => {
    const en = getStringsForLocale('en').notifications;
    const withFalse = pickNotificationCopy(DATE_KEY, SEED, 'en', {
      carrying: false,
    });
    const omitted = pickNotificationCopy(DATE_KEY, SEED, 'en');

    expect(withFalse.title).toBe("Today's puzzle");
    expect(omitted.title).toBe("Today's puzzle");
    expect(en.routineBodies).toContain(withFalse.body);
    expect(en.routineBodies).toContain(omitted.body);
  });
});
