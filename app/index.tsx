import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '../constants/design';
import { useDailyGame } from '../contexts/DailyGameContext';

export default function IndexScreen() {
  const { status, refresh } = useDailyGame();

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-6">
        <Text
          className="text-[32px] leading-9 text-ink"
          style={{ fontFamily: 'Inter_400Regular', letterSpacing: -0.6 }}
        >
          傻了么
        </Text>
        <Text
          className="mt-3 text-sm uppercase tracking-[1.4px] text-muted"
          style={{ fontFamily: 'SpaceMono_400Regular' }}
        >
          今日一题
        </Text>
        <ActivityIndicator
          className="mt-8"
          color={colors.ink}
          size="large"
        />
        <Text className="mt-4 text-base text-muted">正在翻出今天的傻题…</Text>
      </View>
    );
  }

  if (status === 'playing') {
    return <Redirect href="/game" />;
  }

  if (status === 'completed' || status === 'abandoned') {
    return <Redirect href="/result" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-canvas px-6">
      <Text className="text-center text-base text-muted">
        状态异常，正在重新加载今日题目…
      </Text>
      <ActivityIndicator className="mt-6" color={colors.ink} size="small" />
      <Text
        className="mt-6 text-sm text-accent-sunset"
        onPress={() => void refresh()}
      >
        点此重试
      </Text>
    </View>
  );
}
