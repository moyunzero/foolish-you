import React, { type ReactNode } from 'react';

import { DailyGameProvider } from '../../contexts/DailyGameContext';
import { DevToolsUiProvider } from '../../contexts/DevToolsUiContext';
import { I18nTestProvider } from '../../lib/i18n/I18nContext';
import type { Locale } from '../../lib/i18n/types';

/** Minimal provider tree for screen RTL tests (matches app/_layout minus fonts/router). */
export function ScreenProviders({
  children,
  locale = 'zh',
}: {
  children: ReactNode;
  locale?: Locale;
}) {
  return (
    <I18nTestProvider locale={locale}>
      <DevToolsUiProvider>
        <DailyGameProvider>{children}</DailyGameProvider>
      </DevToolsUiProvider>
    </I18nTestProvider>
  );
}
