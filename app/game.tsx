import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import AbandonConfirmSheet from '../components/game/AbandonConfirmSheet';
import BinaryGameSection from '../components/game/BinaryGameSection';
import GameSaveErrorBanner from '../components/game/GameSaveErrorBanner';
import GameScreenFooter from '../components/game/GameScreenFooter';
import GameScreenHeader from '../components/game/GameScreenHeader';
import NonogramGameSection from '../components/game/NonogramGameSection';
import SlitherlinkGameSection from '../components/game/SlitherlinkGameSection';
import SudokuGameSection from '../components/game/SudokuGameSection';
import SudokuNumpad from '../components/grid/SudokuNumpad';
import FirstTypeIntroSheet from '../components/onboarding/FirstTypeIntroSheet';
import EveningMissRiskBanner from '../components/reminder/EveningMissRiskBanner';
import ReminderSheet from '../components/reminder/ReminderSheet';
import OutlinePillButton from '../components/ui/OutlinePillButton';
import { useDailyGame } from '../contexts/DailyGameContext';
import { useDevBottomInset } from '../contexts/DevToolsUiContext';
import { useElapsedTimer } from '../hooks/useElapsedTimer';
import { useGameBoardSession } from '../hooks/useGameBoardSession';
import { useGameScreenActions } from '../hooks/useGameScreenActions';
import { pickAbandonConfirmBody } from '../lib/copy/abandonConfirm';
import { resolveGameStreakSubline } from '../lib/copy/sundaySpecial';
import type { SignatureMoment } from '../lib/feel/signatureTokens';
import { useI18n } from '../lib/i18n';
import { shouldShowEveningReminderBanner } from '../lib/reminder/eveningBanner';
import {
  loadFirstIntroState,
  markFirstIntroSeen,
} from '../lib/storage/firstIntroStorage';
import {
  loadReminderState,
  markEveningBannerDismissed,
} from '../lib/storage/reminderStorage';

const HORIZONTAL_PADDING = 24;
/** Header + footer + padding reserved above the board when sizing Sudoku. */
const GAME_SCREEN_CHROME_BUDGET = 300;
const SUDOKU_BOARD_FLOOR = 240;

export default function GameScreen() {
  const { strings, locale } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
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
    freezeConsumedToday,
    freezeConsumedLine,
    missedYesterdayLine,
    updatePlayState,
    updateSudokuNotes,
    markCompleted,
    markAbandoned,
    refresh,
    retrySave,
    retryStreakSave,
  } = useDailyGame();

  const elapsed = useElapsedTimer(snapshot?.startedAt);
  const gridMaxWidth = screenWidth - HORIZONTAL_PADDING * 2;
  const bottomInset = useDevBottomInset(insets.bottom + 8);
  /** Height left for the board after chrome; short viewports may need scroll. */
  const sudokuHeightBudget =
    screenHeight - bottomInset - GAME_SCREEN_CHROME_BUDGET;
  const sudokuFitsWithoutScroll = sudokuHeightBudget >= SUDOKU_BOARD_FLOOR;
  /** Sudoku Host Desk: prefer one viewport; scroll only when floor won't fit. */
  const sudokuBoardMax = Math.min(
    gridMaxWidth,
    Math.max(SUDOKU_BOARD_FLOOR, sudokuHeightBudget),
  );
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [localHour, setLocalHour] = useState(() => new Date().getHours());
  const [eveningBannerDismissedForDateKey, setEveningBannerDismissedForDateKey] =
    useState<string | null>(null);
  const [firstIntroVisible, setFirstIntroVisible] = useState(false);
  /** Ephemeral DIFF-03 signature — never persisted (Feel D-22). */
  const [signature, setSignature] = useState<SignatureMoment>('idle');

  const session = useGameBoardSession({
    gameType,
    puzzle,
    playState,
    status,
    updatePlayState,
    sudokuNotes: snapshot?.sudokuNotes,
    updateSudokuNotes,
  });

  const onWinSignature = useCallback(() => {
    setSignature('win');
  }, []);

  const onAbandonSignature = useCallback(() => {
    setSignature('abandon');
  }, []);

  const {
    handleComplete,
    confirmAbandon,
    abandonSheetVisible,
    cancelAbandon,
    performAbandon,
  } = useGameScreenActions({
    canComplete: session.canComplete,
    markCompleted,
    markAbandoned,
    onWinSignature,
    onAbandonSignature,
  });

  const abandonConfirmBody = useMemo(() => {
    if (dateKey == null) return '';
    return pickAbandonConfirmBody({
      dateKey,
      seed: snapshot?.seed,
      locale,
    });
  }, [dateKey, snapshot?.seed, locale]);

  useEffect(() => {
    if (status === 'completed' || status === 'abandoned') {
      router.replace('/result');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => {
      setLocalHour(new Date().getHours());
    }, 60_000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing' || gameType == null) {
      setFirstIntroVisible(false);
      return;
    }
    let cancelled = false;
    void loadFirstIntroState()
      .then((state) => {
        if (cancelled) return;
        setFirstIntroVisible(!state.seenByType[gameType]);
      })
      .catch(() => {
        // Leave firstIntroVisible false on load failure.
      });
    return () => {
      cancelled = true;
    };
  }, [status, gameType]);

  useEffect(() => {
    void loadReminderState().then((state) => {
      setReminderEnabled(state.enabled);
      setEveningBannerDismissedForDateKey(
        state.eveningBannerDismissedForDateKey,
      );
    });
  }, [reminderOpen]);

  const dismissFirstIntro = () => {
    setFirstIntroVisible(false);
    if (gameType != null) {
      void markFirstIntroSeen(gameType);
    }
  };

  const showPlayChrome = session.showBoardChrome;
  const sudokuPad =
    session.isSudoku && showPlayChrome
      ? {
          onDigit: session.sudokuBoard.handleDigit,
          onClear: session.sudokuBoard.handleClear,
          disabled: session.sudokuBoard.numpadDisabled,
          dimmedDigits: session.sudokuBoard.dimmedDigits,
          notesMode: session.sudokuBoard.notesMode,
          onToggleNotesMode: session.sudokuBoard.toggleNotesMode,
        }
      : null;
  const streakSubline = resolveGameStreakSubline({
    showPlayChrome,
    freezeConsumedToday,
    freezeConsumedLine,
    missedYesterdayLine,
    dateKey,
    sundayGameSubline: strings.copy.sundaySpecial.gameSubline,
  });

  const showEveningBanner = useMemo(() => {
    if (dateKey == null) return false;
    return shouldShowEveningReminderBanner({
      todayKey: dateKey,
      status,
      localHour,
      freezeConsumedToday,
      showMissedYesterday: missedYesterdayLine != null,
      eveningBannerDismissedForDateKey,
    });
  }, [
    dateKey,
    status,
    localHour,
    freezeConsumedToday,
    missedYesterdayLine,
    eveningBannerDismissedForDateKey,
  ]);

  const handleDismissEveningBanner = () => {
    if (dateKey == null) return;
    setEveningBannerDismissedForDateKey(dateKey);
    void markEveningBannerDismissed(dateKey).then((state) => {
      setEveningBannerDismissedForDateKey(
        state.eveningBannerDismissedForDateKey,
      );
    });
  };

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
          streakSubline={streakSubline}
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

      {showEveningBanner ? (
        <EveningMissRiskBanner
          reminderEnabled={reminderEnabled}
          horizontalPadding={HORIZONTAL_PADDING}
          onOpenReminder={() => setReminderOpen(true)}
          onDismiss={handleDismissEveningBanner}
        />
      ) : null}

      <ReminderSheet
        visible={reminderOpen}
        onClose={() => setReminderOpen(false)}
        dateKey={dateKey}
        seed={snapshot?.seed ?? null}
        todayStatus={status}
        onReminderChange={(state) => setReminderEnabled(state.enabled)}
      />

      <AbandonConfirmSheet
        visible={abandonSheetVisible}
        onClose={cancelAbandon}
        onConfirm={performAbandon}
        body={abandonConfirmBody}
      />

      {gameType != null ? (
        <FirstTypeIntroSheet
          visible={firstIntroVisible && showPlayChrome}
          gameType={gameType}
          onDismiss={dismissFirstIntro}
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
          {/*
            D-12 ScrollView ↔ Binary/Nonogram Gesture.Pan:
            grids use failOffsetY-first (activeOffsetX ±12 / failOffsetY ±16).
            Fallback if device QA fails: Gesture.Native() wrap + blocksExternalGesture.
          */}
          <ScrollView
            className="flex-1"
            scrollEnabled={
              showPlayChrome &&
              (!session.isSudoku || !sudokuFitsWithoutScroll)
            }
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
                maxWidth={sudokuBoardMax}
                board={session.sudokuBoard}
                signature={signature}
              />
            ) : null}

            {session.isBinary && session.binaryGivens != null ? (
              <BinaryGameSection
                givens={session.binaryGivens}
                playState={session.binaryPlay}
                maxWidth={gridMaxWidth}
                board={session.binaryBoard}
                signature={signature}
              />
            ) : null}

            {session.isNonogram && session.nonogramPuzzle != null ? (
              <NonogramGameSection
                puzzle={session.nonogramPuzzle}
                playState={session.nonogramPlay}
                maxWidth={gridMaxWidth}
                board={session.nonogramBoard}
                signature={signature}
              />
            ) : null}

            {session.isSlitherlink && session.slitherlinkPuzzle != null ? (
              <SlitherlinkGameSection
                puzzle={session.slitherlinkPuzzle}
                playState={session.slitherlinkPlay}
                maxWidth={gridMaxWidth}
                board={session.slitherlinkBoard}
                signature={signature}
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
                canUndo={session.canUndo}
                onUndo={session.undo}
                onComplete={() => void handleComplete()}
                onAbandon={confirmAbandon}
                modeLabel={
                  session.isSudoku
                    ? session.sudokuBoard.notesMode
                      ? strings.ui.grid.notesMode
                      : strings.ui.game.sessionModeValue
                    : strings.ui.game.sessionModeBoard
                }
                accent={Boolean(sudokuPad?.notesMode)}
                extraTools={
                  sudokuPad != null ? (
                    <SudokuNumpad toolsOnly {...sudokuPad} />
                  ) : null
                }
                instrument={
                  sudokuPad != null ? (
                    <SudokuNumpad digitsOnly {...sudokuPad} />
                  ) : null
                }
              />
            </View>
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
}
