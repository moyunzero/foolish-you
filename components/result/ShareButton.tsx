import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Share } from 'react-native';

import { APP_STORE_URL } from '../../constants/config';
import { pickShareSuccessToast } from '../../lib/copy/shareToasts';
import { useI18n } from '../../lib/i18n';
import OutlinePillButton from '../ui/OutlinePillButton';

type ShareButtonState = 'idle' | 'sharing' | 'success' | 'error';

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
    state === 'sharing'
      ? shareUi.sharing
      : state === 'success'
        ? shareUi.shared
        : state === 'error'
          ? shareUi.shareFailed
          : shareUi.shareReport;

  const accessibilityLabel =
    state === 'sharing'
      ? shareUi.sharing
      : state === 'success'
        ? shareUi.sharedA11y
        : state === 'error'
          ? shareUi.failedA11y
          : shareUi.shareReportA11y;

  const handlePress = useCallback(async () => {
    if (state === 'sharing') return;

    setState('sharing');
    try {
      const message = `${shareText}\n${APP_STORE_URL}`;
      const result = await Share.share({ message });
      if (result.action === Share.dismissedAction) {
        setState('idle');
        return;
      }
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
      disabled={state === 'sharing'}
      onPress={() => {
        void handlePress();
      }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={shareUi.hint}
      accessibilityState={{ busy: state === 'sharing' }}
      className="w-full"
    />
  );
}
