import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import BinaryGameSection from '../components/game/BinaryGameSection';
import GameRulesButton from '../components/game/GameRulesButton';
import GameToolbar from '../components/game/GameToolbar';
import SudokuGameSection from '../components/game/SudokuGameSection';
import PrivacyPolicyFooterLink from '../components/legal/PrivacyPolicyFooterLink';
import OutlinePillButton from '../components/ui/OutlinePillButton';
import { useDailyGame } from '../contexts/DailyGameContext';
import { useDevBottomInset } from '../contexts/DevToolsUiContext';
import { useElapsedTimer } from '../hooks/useElapsedTimer';
import { useGameBoardSession } from '../hooks/useGameBoardSession';
import { useGameScreenActions } from '../hooks/useGameScreenActions';
import { SAVE_ERROR_MESSAGE } from '../lib/daily/saveFailureAlert';

const HORIZONTAL_PADDING = 24;

export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const {
    dateKey,
    gameType,
    puzzle,
    playState,
    status,
    snapshot,
    saveError,
    updatePlayState,
    markCompleted,
    markAbandoned,
    refresh,
    retrySave,
  } = useDailyGame();

  const elapsed = useElapsedTimer(snapshot?.startedAt);
  const gridMaxWidth = screenWidth - HORIZONTAL_PADDING * 2;
  const bottomInset = useDevBottomInset(insets.bottom + 8);

  const session = useGameBoardSession({
    gameType,
    puzzle,
    playState,
    status,
    updatePlayState,
  });

  const { handleComplete, confirmAbandon } = useGameScreenActions({
    canComplete: session.canComplete,
    markCompleted,
    markAbandoned,
  });

  useEffect(() => {
    if (status === 'completed' || status === 'abandoned') {
      router.replace('/result');
    }
  }, [status, router]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingTop: 12,
          paddingBottom: bottomInset,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text
              className="text-[11px] text-muted"
              style={{ fontFamily: 'SpaceMono_400Regular' }}
            >
              {`今日 · ${dateKey ?? '—'}`}
            </Text>
            <View className="mt-1 flex-row items-center gap-2.5">
              <Text
                className="text-ink"
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 34,
                  lineHeight: 40,
                  fontWeight: '700',
                  letterSpacing: -0.8,
                  textShadowColor: 'rgba(0,0,0,0.45)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 6,
                }}
              >
                {session.typeLabel}
              </Text>
              {session.showBoardChrome && gameType != null ? (
                <GameRulesButton gameType={gameType} />
              ) : null}
            </View>
          </View>
          <View
            className="rounded-full border border-hairline px-2.5 py-1"
            style={{ backgroundColor: 'rgba(255, 122, 23, 0.12)' }}
          >
            <Text
              className="text-[10px] text-accent-sunset"
              style={{ fontFamily: 'SpaceMono_400Regular' }}
            >
              今日题型
            </Text>
          </View>
        </View>

        {session.showBoardChrome ? <GameToolbar elapsed={elapsed} /> : null}

        {saveError ? (
          <View className="mt-3 gap-2">
            <Text className="text-center text-sm text-muted">
              {SAVE_ERROR_MESSAGE}
            </Text>
            <OutlinePillButton
              label="重试保存"
              onPress={() => void retrySave()}
            />
          </View>
        ) : null}

        {session.showReload ? (
          <View className="mt-8 items-center gap-3 px-2">
            <Text className="text-center text-base text-muted">
              今日题目加载失败，可能是本地数据损坏。
            </Text>
            <OutlinePillButton
              label="重新加载"
              variant="primary"
              onPress={() => void refresh()}
            />
          </View>
        ) : null}

        {session.isSudoku && session.sudokuGivens != null ? (
          <SudokuGameSection
            givens={session.sudokuGivens}
            playState={session.sudokuPlay}
            maxWidth={gridMaxWidth}
            board={session.sudokuBoard}
          />
        ) : null}

        {session.isBinary && session.binaryGivens != null ? (
          <BinaryGameSection
            givens={session.binaryGivens}
            playState={session.binaryPlay}
            maxWidth={gridMaxWidth}
            board={session.binaryBoard}
          />
        ) : null}

        {session.statusHint != null ? (
          <Text className="mt-3 text-center text-sm text-muted">
            {session.statusHint}
          </Text>
        ) : null}

        <View className="mt-6 gap-3">
          {session.showBoardChrome ? (
            <OutlinePillButton
              label="完成今日"
              variant="primary"
              disabled={!session.canComplete}
              onPress={() => void handleComplete()}
            />
          ) : null}
          <OutlinePillButton
            label="放弃今日挑战"
            onPress={confirmAbandon}
          />
          <PrivacyPolicyFooterLink className="mt-1" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
