import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '../constants/design';
import { useDailyGame } from '../contexts/DailyGameContext';

export default function IndexScreen() {
  const { status } = useDailyGame();

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

  return null;
}
