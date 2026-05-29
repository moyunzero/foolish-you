import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '../constants/design';
import { useDailyGame } from '../contexts/DailyGameContext';
import { useI18n } from '../lib/i18n';

export default function IndexScreen() {
  const { strings } = useI18n();
  const { status, refresh } = useDailyGame();

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-6">
        <Text
          className="text-[32px] leading-9 text-ink"
          style={{ fontFamily: 'Inter_400Regular', letterSpacing: -0.6 }}
        >
          {strings.app.name}
        </Text>
        <Text
          className="mt-3 text-sm uppercase tracking-[1.4px] text-muted"
          style={{ fontFamily: 'SpaceMono_400Regular' }}
        >
          {strings.app.tagline}
        </Text>
        <ActivityIndicator
          className="mt-8"
          color={colors.ink}
          size="large"
        />
        <Text className="mt-4 text-base text-muted">{strings.ui.index.loadingPuzzle}</Text>
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
        {strings.ui.index.errorReloading}
      </Text>
      <ActivityIndicator className="mt-6" color={colors.ink} size="small" />
      <Text
        className="mt-6 text-sm text-accent-sunset"
        onPress={() => void refresh()}
      >
        {strings.ui.common.retryTap}
      </Text>
    </View>
  );
}
