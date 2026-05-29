import type { GameType } from '../puzzles/types';
import type { Locale } from './types';
import { getStringsForLocale } from './strings';

export function getGameTypeLabel(gameType: GameType, locale: Locale): string {
  return getStringsForLocale(locale).ui.gameTypes[gameType];
}
