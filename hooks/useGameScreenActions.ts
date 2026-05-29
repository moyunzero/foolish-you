import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useI18n } from '../lib/i18n';

type UseGameScreenActionsParams = {
  canComplete: boolean;
  markCompleted: () => Promise<void>;
  markAbandoned: () => Promise<void>;
};

export function useGameScreenActions({
  canComplete,
  markCompleted,
  markAbandoned,
}: UseGameScreenActionsParams) {
  const router = useRouter();
  const { strings } = useI18n();
  const alerts = strings.ui.alerts;

  const handleComplete = useCallback(async () => {
    if (!canComplete) return;
    await markCompleted();
    router.replace('/result');
  }, [canComplete, markCompleted, router]);

  const handleAbandon = useCallback(async () => {
    await markAbandoned();
    router.replace('/result');
  }, [markAbandoned, router]);

  const confirmAbandon = useCallback(() => {
    Alert.alert(alerts.abandonTitle, alerts.abandonMessage, [
      { text: alerts.continuePlay, style: 'cancel' },
      {
        text: alerts.giveUp,
        style: 'destructive',
        onPress: () => void handleAbandon(),
      },
    ]);
  }, [handleAbandon, alerts]);

  return { handleComplete, confirmAbandon };
}
