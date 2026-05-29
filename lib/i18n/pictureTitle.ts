import { NONOGRAM_PATTERNS } from '../puzzles/nonogram/patterns';
import { patterns as enPatterns } from '../../locales/en/patterns';
import { patterns as zhPatterns } from '../../locales/zh/patterns';
import type { Locale } from './types';

const zhTitleToId = new Map(
  NONOGRAM_PATTERNS.map((p) => [p.title, p.id] as const),
);

/** Resolve stored picture title (id or legacy Chinese title) for display. */
export function resolvePictureTitle(stored: string, locale: Locale): string {
  const id = zhPatterns[stored as keyof typeof zhPatterns] != null
    ? stored
    : zhTitleToId.get(stored);

  if (id != null) {
    const map = locale === 'zh' ? zhPatterns : enPatterns;
    return map[id as keyof typeof map] ?? stored;
  }

  return stored;
}
