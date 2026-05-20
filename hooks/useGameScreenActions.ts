import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

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
    Alert.alert(
      '放弃今日挑战？',
      '今天的进度会保存为「认怂」，明天再来也行。',
      [
        { text: '继续玩', style: 'cancel' },
        {
          text: '放弃',
          style: 'destructive',
          onPress: () => void handleAbandon(),
        },
      ],
    );
  }, [handleAbandon]);

  return { handleComplete, confirmAbandon };
}
