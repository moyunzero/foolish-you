import { getLocales } from 'expo-localization';

import type { Locale } from './types';

/** Language-first: zh* → zh, everything else → en. */
export function resolveLocaleFromLanguageCode(
  code: string | null | undefined,
): Locale {
  if (code != null && code.toLowerCase().startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}

/** Device locale from expo-localization; falls back to en. */
export function getDeviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  return resolveLocaleFromLanguageCode(code);
}
