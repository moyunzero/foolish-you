import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import type { Locale } from '../i18n/types';
import type { GameType } from '../puzzles/types';

export type GameRulesContent = {
  title: string;
  intro: string;
  bullets: readonly string[];
};

function rulesFor(locale: Locale) {
  return locale === 'zh' ? zhCopy.gameRules : enCopy.gameRules;
}

export function getGameRules(locale: Locale): Record<GameType, GameRulesContent> {
  return rulesFor(locale);
}

/** @deprecated Use getGameRules(locale) */
export const GAME_RULES: Record<GameType, GameRulesContent> = zhCopy.gameRules;
