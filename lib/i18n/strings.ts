import { strings as enStrings } from '../../locales/en';
import { strings as zhStrings } from '../../locales/zh';
import type { Locale, Strings } from './types';

export function getStringsForLocale(locale: Locale): Strings {
  return locale === 'zh' ? zhStrings : enStrings;
}
