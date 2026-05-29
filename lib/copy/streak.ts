import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import type { Locale } from '../i18n/types';
import type { StreakDisplay } from '../streak/types';

function streakFor(locale: Locale) {
  return locale === 'zh' ? zhCopy.streak : enCopy.streak;
}

export function formatStreakLine(
  display: StreakDisplay,
  locale: Locale = 'zh',
): string {
  const s = streakFor(locale);
  const { displayStreak, checkedInToday, streakBroken } = display;

  if (streakBroken) {
    return s.broken;
  }

  if (displayStreak === 0) {
    return s.zero;
  }

  if (checkedInToday) {
    return s.checkedIn(displayStreak);
  }

  return s.pending(displayStreak);
}
