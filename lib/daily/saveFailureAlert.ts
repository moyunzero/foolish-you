import { Alert } from 'react-native';

export const SAVE_ERROR_MESSAGE =
  '进度没能写入本地，请稍后再试或点「重试保存」。';

const TITLE = '保存失败';

export function notifyDailySaveFailed(onRetry?: () => void): void {
  const buttons = onRetry
    ? [
        { text: '稍后', style: 'cancel' as const },
        { text: '重试保存', onPress: onRetry },
      ]
    : [{ text: '知道了', style: 'default' as const }];

  Alert.alert(TITLE, SAVE_ERROR_MESSAGE, buttons);
}
