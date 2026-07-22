import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import EveningMissRiskBanner from '../components/reminder/EveningMissRiskBanner';
import ReminderSheet from '../components/reminder/ReminderSheet';
import OutlinePillButton from '../components/ui/OutlinePillButton';
import { useDailyGame } from '../contexts/DailyGameContext';
import { useDevBottomInset } from '../contexts/DevToolsUiContext';
import { useElapsedTimer } from '../hooks/useElapsedTimer';
import { useGameBoardSession } from '../hooks/useGameBoardSession';
import { useGameScreenActions } from '../hooks/useGameScreenActions';
import { pickAbandonConfirmBody } from '../lib/copy/abandonConfirm';
import { pickHostIntroLine } from '../lib/copy/hostIntro';
import { resolveGameStreakSubline } from '../lib/copy/sundaySpecial';
import { hasPlayProgress } from '../lib/daily/hasPlayProgress';
import { useI18n } from '../lib/i18n';
import { shouldShowEveningReminderBanner } from '../lib/reminder/eveningBanner';
import { loadReminderState } from '../lib/storage/reminderStorage';

const HORIZONTAL_PADDING = 24;

export default function GameScreen() {
  const { strings, locale } = useI18n();
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
    freezeConsumedToday,
    freezeConsumedLine,
    missedYesterdayLine,
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
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [localHour, setLocalHour] = useState(() => new Date().getHours());
  const hasProgress =
    gameType != null && hasPlayProgress(gameType, playState);
  const [hostIntroDismissed, setHostIntroDismissed] = useState(hasProgress);

  const session = useGameBoardSession({
    gameType,
    puzzle,
    playState,
    status,
    updatePlayState,
  });

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
    void loadReminderState().then((state) => setReminderEnabled(state.enabled));
  }, [reminderOpen]);

  const showPlayChrome = session.showBoardChrome;
  const streakSubline = resolveGameStreakSubline({
    showPlayChrome,
    freezeConsumedToday,
    freezeConsumedLine,
    missedYesterdayLine,
    dateKey,
    sundayGameSubline: strings.copy.sundaySpecial.gameSubline,
  });

  useEffect(() => {
    if (hasProgress) setHostIntroDismissed(true);
  }, [hasProgress]);

  const hostIntroLine = useMemo(() => {
    if (dateKey == null) return null;
    return pickHostIntroLine({
      dateKey,
      seed: snapshot?.seed,
      locale,
    });
  }, [dateKey, snapshot?.seed, locale]);

  const showHostIntro =
    showPlayChrome && !hostIntroDismissed && !hasProgress;

  const onBoardInteract = () => setHostIntroDismissed(true);

  const showEveningBanner = useMemo(() => {
    if (dateKey == null) return false;
    return shouldShowEveningReminderBanner({
      todayKey: dateKey,
      status,
      localHour,
      freezeConsumedToday,
      showMissedYesterday: missedYesterdayLine != null,
    });
  }, [dateKey, status, localHour, freezeConsumedToday, missedYesterdayLine]);

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
          hostIntroLine={hostIntroLine}
          showHostIntro={showHostIntro}
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
                onBoardInteract={onBoardInteract}
              />
            ) : null}

            {session.isBinary && session.binaryGivens != null ? (
              <BinaryGameSection
                givens={session.binaryGivens}
                playState={session.binaryPlay}
                maxWidth={gridMaxWidth}
                board={session.binaryBoard}
                onBoardInteract={onBoardInteract}
              />
            ) : null}

            {session.isNonogram && session.nonogramPuzzle != null ? (
              <NonogramGameSection
                puzzle={session.nonogramPuzzle}
                playState={session.nonogramPlay}
                maxWidth={gridMaxWidth}
                board={session.nonogramBoard}
                onBoardInteract={onBoardInteract}
              />
            ) : null}

            {session.isSlitherlink && session.slitherlinkPuzzle != null ? (
              <SlitherlinkGameSection
                puzzle={session.slitherlinkPuzzle}
                playState={session.slitherlinkPlay}
                maxWidth={gridMaxWidth}
                board={session.slitherlinkBoard}
                onBoardInteract={onBoardInteract}
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
