import React, { type ReactNode } from 'react';

import { DailyGameProvider } from '../../contexts/DailyGameContext';
import { DevToolsUiProvider } from '../../contexts/DevToolsUiContext';

/** Minimal provider tree for screen RTL tests (matches app/_layout minus fonts/router). */
export function ScreenProviders({ children }: { children: ReactNode }) {
  return (
    <DevToolsUiProvider>
      <DailyGameProvider>{children}</DailyGameProvider>
    </DevToolsUiProvider>
  );
}
