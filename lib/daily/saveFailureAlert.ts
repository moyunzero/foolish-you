import { Alert } from 'react-native';

export const SAVE_ERROR_MESSAGE =
  '进度没能写入本地，请稍后再试或点「重试保存」。';

export const STREAK_SAVE_ERROR_MESSAGE =
  '连签没能写入本地，请稍后再试或点「重试连签」。';

const TITLE = '保存失败';
const STREAK_TITLE = '连签保存失败';

function buildAlertButtons(onRetry?: () => void, retryLabel = '重试保存') {
  return onRetry
    ? [
        { text: '稍后', style: 'cancel' as const },
        { text: retryLabel, onPress: onRetry },
      ]
    : [{ text: '知道了', style: 'default' as const }];
}

export function notifyDailySaveFailed(onRetry?: () => void): void {
  Alert.alert(TITLE, SAVE_ERROR_MESSAGE, buildAlertButtons(onRetry));
}

export function notifyStreakSaveFailed(onRetry?: () => void): void {
  Alert.alert(
    STREAK_TITLE,
    STREAK_SAVE_ERROR_MESSAGE,
    buildAlertButtons(onRetry, '重试连签'),
  );
}
