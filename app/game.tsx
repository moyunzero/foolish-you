import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import BinaryGameSection from '../components/game/BinaryGameSection';
import GameSaveErrorBanner from '../components/game/GameSaveErrorBanner';
import GameScreenFooter from '../components/game/GameScreenFooter';
import GameScreenHeader from '../components/game/GameScreenHeader';
import NonogramGameSection from '../components/game/NonogramGameSection';
import SudokuGameSection from '../components/game/SudokuGameSection';
import OutlinePillButton from '../components/ui/OutlinePillButton';
import { useDailyGame } from '../contexts/DailyGameContext';
import { useDevBottomInset } from '../contexts/DevToolsUiContext';
import { useElapsedTimer } from '../hooks/useElapsedTimer';
import { useGameBoardSession } from '../hooks/useGameBoardSession';
import { useGameScreenActions } from '../hooks/useGameScreenActions';
import { useI18n } from '../lib/i18n';

const HORIZONTAL_PADDING = 24;

export default function GameScreen() {
  const { strings } = useI18n();
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
    streakSaveError,
    streakLine,
    streakHighlight,
    updatePlayState,
    markCompleted,
    markAbandoned,
    refresh,
    retrySave,
    retryStreakSave,
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

  const showPlayChrome = session.showBoardChrome;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View style={{ paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 12 }}>
        <GameScreenHeader
          dateKey={dateKey}
          streakLine={streakLine}
          streakHighlight={streakHighlight}
          elapsed={elapsed}
          typeLabel={session.typeLabel}
          gameType={gameType}
          showRules={showPlayChrome}
        />
      </View>

      {saveError ? (
        <GameSaveErrorBanner
          message={strings.ui.alerts.saveFailedMessage}
          retryLabel={strings.ui.common.retrySave}
          onRetry={() => void retrySave()}
        />
      ) : null}

      {streakSaveError ? (
        <GameSaveErrorBanner
          message={strings.ui.alerts.streakSaveFailedMessage}
          retryLabel={strings.ui.common.retryStreak}
          onRetry={() => void retryStreakSave()}
        />
      ) : null}

      {session.showReload ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text className="text-center text-base text-body">
            {strings.ui.game.loadFailed}
          </Text>
          <OutlinePillButton
            label={strings.ui.common.reload}
            variant="primary"
            onPress={() => void refresh()}
          />
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            scrollEnabled={showPlayChrome}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: HORIZONTAL_PADDING,
              paddingTop: 12,
              paddingBottom: 8,
              justifyContent: 'center',
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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

            {session.isNonogram && session.nonogramPuzzle != null ? (
              <NonogramGameSection
                puzzle={session.nonogramPuzzle}
                playState={session.nonogramPlay}
                maxWidth={gridMaxWidth}
                board={session.nonogramBoard}
              />
            ) : null}
          </ScrollView>

          {showPlayChrome ? (
            <View
              style={{
                paddingHorizontal: HORIZONTAL_PADDING,
                paddingBottom: bottomInset,
              }}
            >
              <GameScreenFooter
                statusHint={session.statusHint}
                canComplete={session.canComplete}
                onComplete={() => void handleComplete()}
                onAbandon={confirmAbandon}
              />
            </View>
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
}
