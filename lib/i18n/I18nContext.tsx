import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getAppDisplayName } from './format';
import { getDeviceLocale } from './resolveLocale';
import { getStringsForLocale } from './strings';
import type { AppDisplayName, Locale, Strings } from './types';

export type I18nContextValue = {
  locale: Locale;
  /** Resolved device locale (ignores dev override). */
  deviceLocale: Locale;
  /** `null` = follow device; set only in __DEV__ via settings placeholder. */
  localeOverride: Locale | null;
  strings: Strings;
  appDisplayName: AppDisplayName;
  /** __DEV__ only: override device locale until cleared or app restart. */
  setLocaleOverride: (locale: Locale | null) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [deviceLocale] = useState<Locale>(() => getDeviceLocale());
  const [localeOverride, setLocaleOverrideState] = useState<Locale | null>(null);

  const setLocaleOverride = useCallback((next: Locale | null) => {
    if (!__DEV__) return;
    setLocaleOverrideState(next);
  }, []);

  const locale = localeOverride ?? deviceLocale;

  const value = useMemo<I18nContextValue>(() => {
    const strings = getStringsForLocale(locale);
    return {
      locale,
      deviceLocale,
      localeOverride,
      strings,
      appDisplayName: getAppDisplayName(locale),
      setLocaleOverride,
    };
  }, [deviceLocale, locale, localeOverride, setLocaleOverride]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (ctx == null) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

/** RTL/unit helper: fixed locale without expo-localization. */
export function I18nTestProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      deviceLocale: locale,
      localeOverride: null,
      strings: getStringsForLocale(locale),
      appDisplayName: getAppDisplayName(locale),
      setLocaleOverride: () => {},
    }),
    [locale],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}
