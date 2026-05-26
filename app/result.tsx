import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import ShareButton from '../components/result/ShareButton';
import StatsCards from '../components/result/StatsCards';
import FoolFaceBadge from '../components/result/FoolFaceBadge';
import NonogramRevealCard from '../components/result/NonogramRevealCard';
import ResultOutcomeBody from '../components/result/ResultOutcomeBody';
import ResultStatCard from '../components/result/ResultStatCard';
import WinFaceBadge from '../components/result/WinFaceBadge';
import GameSaveErrorBanner from '../components/game/GameSaveErrorBanner';
import PrivacyPolicyFooterLink from '../components/legal/PrivacyPolicyFooterLink';
import OutlinePillButton from '../components/ui/OutlinePillButton';
import { colors } from '../constants/design';
import { useDailyGame } from '../contexts/DailyGameContext';
import { useDevBottomInset } from '../contexts/DevToolsUiContext';
import {
  getResultFooterHint,
  pickResultCopy,
} from '../lib/copy/resultMessages';
import { STREAK_SAVE_ERROR_MESSAGE } from '../lib/daily/saveFailureAlert';
import { exitApplication } from '../lib/platform/exitApp';
import { RATING_PROMPT_DELAY_MS } from '../lib/rating/constants';
import { maybePromptAppReview } from '../lib/rating/maybePromptAppReview';
import { computeStatsCards, type StatsCardsData } from '../lib/stats/computeStatsCards';
import { buildShareCard } from '../lib/share/buildShareCard';
import { isNonogramPuzzle } from '../lib/puzzles/types';

const HORIZONTAL_PADDING = 24;
const FOOTER_HINT = getResultFooterHint();

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { status, snapshot, dateKey, seed, streakLine, streakHighlight, streakSaveError, retryStreakSave, gameType, puzzle, playState, displayStreak } =
    useDailyGame();

  const isSuccess = status === 'completed';
  const isFail = status === 'abandoned';

  const copy = useMemo(() => {
    if (!isSuccess && !isFail) return null;
    const startedAt = snapshot?.startedAt ?? Date.now();
    const finishedAt = snapshot?.finishedAt ?? Date.now();
    const key = dateKey ?? snapshot?.dateKey ?? '';
    return pickResultCopy(
      isSuccess ? 'completed' : 'abandoned',
      finishedAt - startedAt,
      key,
      seed ?? snapshot?.seed,
    );
  }, [isSuccess, isFail, snapshot?.startedAt, snapshot?.finishedAt, snapshot?.dateKey, snapshot?.seed, dateKey, seed]);

  const shareText = useMemo(() => {
    if (copy == null || snapshot == null || puzzle == null || playState == null || gameType == null || dateKey == null) {
      return null;
    }
    const startedAt = snapshot.startedAt ?? Date.now();
    const finishedAt = snapshot.finishedAt ?? Date.now();
    const outcome = status === 'completed' ? 'completed' : 'abandoned';
    if (outcome !== 'completed' && outcome !== 'abandoned') return null;

    return buildShareCard({
      gameType,
      dateKey,
      elapsedMs: finishedAt - startedAt,
      status: outcome,
      playState,
      puzzle,
      seed: seed ?? snapshot.seed,
      streakDays: outcome === 'completed' ? Math.max(1, displayStreak) : undefined,
    });
  }, [copy, snapshot, puzzle, playState, gameType, dateKey, seed, status, displayStreak]);

  const bottomPadding = useDevBottomInset(insets.bottom + 16);
  const ratingPromptAttemptedRef = useRef(false);
  const [statsCards, setStatsCards] = useState<StatsCardsData | null>(null);

  useEffect(() => {
    if (copy == null || snapshot == null || dateKey == null) {
      setStatsCards(null);
      return;
    }

    const startedAt = snapshot.startedAt ?? Date.now();
    const finishedAt = snapshot.finishedAt ?? Date.now();
    let cancelled = false;

    void computeStatsCards({
      elapsedMs: finishedAt - startedAt,
      today: dateKey,
      seed: seed ?? snapshot.seed,
    }).then((data) => {
      if (!cancelled) setStatsCards(data);
    });

    return () => {
      cancelled = true;
    };
  }, [copy, snapshot, dateKey, seed]);

  useEffect(() => {
    if (!isSuccess || dateKey == null || ratingPromptAttemptedRef.current) {
      return;
    }
    ratingPromptAttemptedRef.current = true;

    const timer = setTimeout(() => {
      void maybePromptAppReview({
        outcome: 'completed',
        streak: displayStreak,
        dateKey,
      });
    }, RATING_PROMPT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isSuccess, dateKey, displayStreak]);

  const nonogramPuzzle =
    isSuccess &&
    snapshot?.puzzle != null &&
    isNonogramPuzzle(snapshot.puzzle)
      ? snapshot.puzzle
      : null;

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

        {isSuccess ? (
          <Text
            className={streakHighlight ? 'text-accent-sunset' : 'text-muted'}
            style={{
              fontFamily: 'SpaceMono_400Regular',
              fontSize: 12,
              lineHeight: 16,
              marginTop: 4,
            }}
          >
            {streakLine}
          </Text>
        ) : null}

        {streakSaveError ? (
          <GameSaveErrorBanner
            message={STREAK_SAVE_ERROR_MESSAGE}
            retryLabel="重试连签"
            horizontalPadding={0}
            onRetry={() => void retryStreakSave()}
          />
        ) : null}

        <View className="mt-6 flex-1">
          {copy.mode === 'completed' ? (
            <>
              {nonogramPuzzle != null ? (
                <View className="mb-8">
                  <NonogramRevealCard puzzle={nonogramPuzzle} />
                </View>
              ) : null}
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
            </>
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

        {statsCards != null ? <StatsCards data={statsCards} /> : null}

        <Animated.View entering={FadeIn.delay(900).duration(450)} style={{ marginTop: 32 }}>
          {shareText != null ? (
            <ShareButton
              shareText={shareText}
              dateKey={dateKey}
              seed={seed ?? snapshot?.seed}
            />
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(1000).duration(500)} style={{ marginTop: 12 }}>
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
          <PrivacyPolicyFooterLink className="mt-1" />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
