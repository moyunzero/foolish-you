import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import FoolFaceBadge from '../components/result/FoolFaceBadge';
import ResultOutcomeBody from '../components/result/ResultOutcomeBody';
import ResultStatCard from '../components/result/ResultStatCard';
import WinFaceBadge from '../components/result/WinFaceBadge';
import OutlinePillButton from '../components/ui/OutlinePillButton';
import { DEV_TOOLS_ENABLED } from '../constants/dev';
import { colors } from '../constants/design';
import { useDailyGame } from '../contexts/DailyGameContext';
import {
  getResultFooterHint,
  pickResultCopy,
} from '../lib/copy/resultMessages';
import { exitApplication } from '../lib/platform/exitApp';

const DEV_BAR_HEIGHT = 36;
const HORIZONTAL_PADDING = 24;
const FOOTER_HINT = getResultFooterHint();

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { status, snapshot, dateKey } = useDailyGame();

  const isSuccess = status === 'completed';
  const isFail = status === 'abandoned';

  const copy = useMemo(() => {
    if (!isSuccess && !isFail) return null;
    const startedAt = snapshot?.startedAt ?? Date.now();
    const finishedAt = snapshot?.finishedAt ?? Date.now();
    return pickResultCopy(isSuccess ? 'completed' : 'abandoned', finishedAt - startedAt);
  }, [isSuccess, isFail, snapshot?.startedAt, snapshot?.finishedAt]);

  const bottomPadding =
    insets.bottom + (DEV_TOOLS_ENABLED ? DEV_BAR_HEIGHT : 0) + 16;

  if (copy == null) {
    return (
      <SafeAreaView className="flex-1 bg-canvas">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-muted">今日状态加载中…</Text>
          <View className="mt-8 w-full">
            <OutlinePillButton label="返回" onPress={() => router.replace('/')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingTop: 16,
          paddingBottom: bottomPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-[11px] text-muted"
          style={{ fontFamily: 'SpaceMono_400Regular' }}
        >
          {`今日 · ${dateKey ?? '—'}`}
        </Text>

        <View className="mt-6 flex-1">
          {copy.mode === 'completed' ? (
            <ResultOutcomeBody
              badge={<WinFaceBadge />}
              statusLabel="通关"
              statusTone="victory"
              headline={copy.headline}
              punchline={copy.punchline}
              sublines={copy.sublines}
              statCard={
                <ResultStatCard
                  variant="victory"
                  elapsed={copy.elapsedDisplay}
                />
              }
            />
          ) : (
            <ResultOutcomeBody
              badge={<FoolFaceBadge />}
              statusLabel="认怂"
              statusTone="defeat"
              headline={copy.headline}
              punchline={copy.punchline}
              sublines={copy.sublines}
              statCard={
                <ResultStatCard
                  variant="defeat"
                  percent={copy.foolIndexPercent}
                  hint={copy.foolIndexHint}
                />
              }
              extraStats={copy.statsLine}
            />
          )}
        </View>

        <Animated.View entering={FadeIn.delay(1000).duration(500)} style={{ marginTop: 48 }}>
          <OutlinePillButton
            label={copy.cta}
            variant="primary"
            onPress={exitApplication}
          />
          <Text
            className="mt-4 text-center text-xs text-muted"
            style={{ fontFamily: 'Inter_400Regular', color: colors.muted }}
          >
            {FOOTER_HINT}
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
