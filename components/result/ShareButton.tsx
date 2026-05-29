import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { pickShareSuccessToast } from '../../lib/copy/shareToasts';
import { useI18n } from '../../lib/i18n';
import OutlinePillButton from '../ui/OutlinePillButton';

type ShareButtonState = 'idle' | 'copying' | 'success' | 'error';

type ShareButtonProps = {
  shareText: string;
  dateKey?: string | null;
  seed?: number | null;
};

export default function ShareButton({
  shareText,
  dateKey,
  seed,
}: ShareButtonProps) {
  const { locale, strings } = useI18n();
  const shareUi = strings.ui.share;
  const [state, setState] = useState<ShareButtonState>('idle');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current != null) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  const scheduleIdle = useCallback(() => {
    clearResetTimer();
    resetTimerRef.current = setTimeout(() => {
      setState('idle');
    }, 2000);
  }, [clearResetTimer]);

  const label =
    state === 'copying'
      ? shareUi.copying
      : state === 'success'
        ? shareUi.copied
        : state === 'error'
          ? shareUi.copyFailed
          : shareUi.copyReport;

  const accessibilityLabel =
    state === 'success'
      ? shareUi.copiedA11y
      : state === 'error'
        ? shareUi.failedA11y
        : shareUi.copyReportA11y;

  const handlePress = useCallback(async () => {
    if (state === 'copying') return;

    setState('copying');
    try {
      await Clipboard.setStringAsync(shareText);
      setState('success');
      const toast = pickShareSuccessToast(
        seed,
        dateKey ?? undefined,
        locale,
      );
      void AccessibilityInfo.announceForAccessibility(toast);
      scheduleIdle();
    } catch {
      setState('error');
      scheduleIdle();
    }
  }, [state, shareText, seed, dateKey, scheduleIdle, locale]);

  return (
    <OutlinePillButton
      label={label}
      variant="outline"
      disabled={state === 'copying'}
      onPress={() => {
        void handlePress();
      }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={shareUi.hint}
      accessibilityState={{ busy: state === 'copying' }}
      className="w-full"
    />
  );
}
