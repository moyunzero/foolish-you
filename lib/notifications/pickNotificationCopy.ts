import { pickFromPool } from '../copy/poolUtils';
import type { Locale } from '../i18n/types';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import { getStringsForLocale } from '../i18n/strings';

export function pickNotificationCopy(
  dateKey: string,
  seed: number | null | undefined,
  locale: Locale,
): { title: string; body: string } {
  const strings = getStringsForLocale(locale);
  const baseSeed = seed ?? deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'routine-push'));
  const body = pickFromPool(rng, strings.notifications.routineBodies);
  return {
    title: strings.notifications.routineTitle,
    body,
  };
}
