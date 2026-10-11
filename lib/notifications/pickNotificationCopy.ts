import { pickFromPool } from '../copy/poolUtils';
import type { Locale } from '../i18n/types';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import { getStringsForLocale } from '../i18n/strings';

export function pickNotificationCopy(
  dateKey: string,
  seed: number | null | undefined,
  locale: Locale,
  options?: { carrying?: boolean },
): { title: string; body: string } {
  const n = getStringsForLocale(locale).notifications;
  const carrying = options?.carrying === true;
  const bodies = carrying ? n.routineBodiesCarry : n.routineBodies;
  const title = carrying ? n.routineTitleCarry : n.routineTitle;
  const baseSeed = seed ?? deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'routine-push'));
  return {
    title,
    body: pickFromPool(rng, bodies),
  };
}
