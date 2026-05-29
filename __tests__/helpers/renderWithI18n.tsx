import { render, type RenderOptions } from '@testing-library/react-native';
import React, { type ReactElement, type ReactNode } from 'react';

import { I18nTestProvider } from '../../lib/i18n';
import type { Locale } from '../../lib/i18n/types';

type RenderWithI18nOptions = Omit<RenderOptions, 'wrapper'> & {
  locale?: Locale;
  wrapper?: ({ children }: { children: ReactNode }) => ReactElement;
};

/**
 * RTL helper: wraps tree with a fixed locale (default zh).
 * Compose with ScreenProviders in Plan 02 screen tests.
 */
export function renderWithI18n(
  ui: ReactElement,
  { locale = 'zh', wrapper, ...options }: RenderWithI18nOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    const inner = wrapper ? React.createElement(wrapper, { children }) : children;
    return <I18nTestProvider locale={locale}>{inner}</I18nTestProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
