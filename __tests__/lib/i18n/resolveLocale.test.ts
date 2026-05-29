import type { Locale as ExpoLocale } from 'expo-localization';

import {
  getDeviceLocale,
  resolveLocaleFromLanguageCode,
} from '../../../lib/i18n/resolveLocale';

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en-US' }]),
}));

import { getLocales } from 'expo-localization';

const mockedGetLocales = getLocales as jest.MockedFunction<typeof getLocales>;

describe('resolveLocaleFromLanguageCode', () => {
  it.each([
    ['zh', 'zh'],
    ['zh-Hans', 'zh'],
    ['zh-Hant', 'zh'],
    ['en', 'en'],
    ['en-US', 'en'],
    ['fr', 'en'],
  ] as const)('maps %s → %s', (code, expected) => {
    expect(resolveLocaleFromLanguageCode(code)).toBe(expected);
  });

  it('falls back to en for null/undefined', () => {
    expect(resolveLocaleFromLanguageCode(null)).toBe('en');
    expect(resolveLocaleFromLanguageCode(undefined)).toBe('en');
  });
});

describe('getDeviceLocale', () => {
  it('uses first locale languageCode', () => {
    mockedGetLocales.mockReturnValueOnce([
      { languageCode: 'zh-CN' } as ExpoLocale,
    ]);
    expect(getDeviceLocale()).toBe('zh');
  });

  it('falls back to en when no locales', () => {
    mockedGetLocales.mockReturnValueOnce([]);
    expect(getDeviceLocale()).toBe('en');
  });
});
