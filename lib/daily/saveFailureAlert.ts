import { Alert } from 'react-native';

import type { Locale } from '../i18n/types';
import { getStringsForLocale } from '../i18n/strings';

/** Chinese defaults for legacy tests/imports */
export const SAVE_ERROR_MESSAGE =
  '进度没能写入本地，请稍后再试或点「重试保存」。';

export const STREAK_SAVE_ERROR_MESSAGE =
  '连签没能写入本地，请稍后再试或点「重试连签」。';

function buildAlertButtons(
  locale: Locale,
  onRetry?: () => void,
  retryLabel?: string,
) {
  const { common } = getStringsForLocale(locale).ui;
  return onRetry
    ? [
        { text: common.later, style: 'cancel' as const },
        {
          text: retryLabel ?? common.retrySave,
          onPress: onRetry,
        },
      ]
    : [{ text: common.gotIt, style: 'default' as const }];
}

export function notifyDailySaveFailed(
  onRetry?: () => void,
  locale: Locale = 'zh',
): void {
  const alerts = getStringsForLocale(locale).ui.alerts;
  Alert.alert(
    alerts.saveFailedTitle,
    alerts.saveFailedMessage,
    buildAlertButtons(locale, onRetry),
  );
}

export function notifyStreakSaveFailed(
  onRetry?: () => void,
  locale: Locale = 'zh',
): void {
  const alerts = getStringsForLocale(locale).ui.alerts;
  const retryLabel = getStringsForLocale(locale).ui.common.retryStreak;
  Alert.alert(
    alerts.streakSaveFailedTitle,
    alerts.streakSaveFailedMessage,
    buildAlertButtons(locale, onRetry, retryLabel),
  );
}
