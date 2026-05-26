import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { pickShareSuccessToast } from '../../lib/copy/shareToasts';
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
      ? '拷贝中…'
      : state === 'success'
        ? '已复制'
        : state === 'error'
          ? '拷贝失败，再试一次'
          : '拷贝战报';

  const accessibilityLabel =
    state === 'success'
      ? '战报已复制到剪贴板'
      : state === 'error'
        ? '战报复制失败'
        : '拷贝今日战报';

  const handlePress = useCallback(async () => {
    if (state === 'copying') return;

    setState('copying');
    try {
      await Clipboard.setStringAsync(shareText);
      setState('success');
      const toast = pickShareSuccessToast(seed, dateKey ?? undefined);
      void AccessibilityInfo.announceForAccessibility(toast);
      scheduleIdle();
    } catch {
      setState('error');
      scheduleIdle();
    }
  }, [state, shareText, seed, dateKey, scheduleIdle]);

  return (
    <OutlinePillButton
      label={label}
      variant="outline"
      disabled={state === 'copying'}
      onPress={() => {
        void handlePress();
      }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="战报不含答案，可粘贴到聊天应用"
      accessibilityState={{ busy: state === 'copying' }}
      className="w-full"
    />
  );
}
