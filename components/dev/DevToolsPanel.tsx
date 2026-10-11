import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MonthCalendarSheet from '../calendar/MonthCalendarSheet';
import { DEV_TOOLS_ENABLED } from '../../constants/dev';
import { colors } from '../../constants/design';
import { useDailyGame } from '../../contexts/DailyGameContext';
import { useDevToolsUi } from '../../contexts/DevToolsUiContext';
import { addDaysToDateKey } from '../../lib/date/dateKeyMath';
import { getLocalDateKey } from '../../lib/date/localDay';
import { useI18n } from '../../lib/i18n';
import { getGameTypeLabel } from '../../lib/i18n/gameLabels';
import { getStringsForLocale } from '../../lib/i18n/strings';
import type { GameType } from '../../lib/puzzles/types';
import { isSudokuPuzzle } from '../../lib/puzzles/types';
import { requestAppStoreReview } from '../../lib/rating/requestReview';
import {
  devInjectCompletedEmptyPlayState,
  solvePlayStateForSnapshot,
} from '../../lib/dev/snapshotDevInject';
import {
  DEV_QA_SUNDAY_DATE_KEY,
  getDevForceDateKey,
  setDevForceDateKey,
} from '../../lib/dev/forceDateKey';
import {
  applyGrowthDevScenario,
  GROWTH_DEV_SCENARIOS,
  type GrowthDevScenarioId,
} from '../../lib/dev/growthDevScenarios';
import {
  formatStreakDevSummary,
  STREAK_DEV_SCENARIOS,
  STREAK_GAME_BANNER_SCENARIOS,
  type StreakDevScenarioId,
} from '../../lib/dev/streakDevScenarios';
import { clearCompletionHistory } from '../../lib/storage/completionHistoryStorage';
import { clearRatingState } from '../../lib/storage/ratingStorage';
import { clearRecoveryLog, loadRecoveryLog, type RecoveryLogEntry } from '../../lib/storage/recoveryLog';
import { loadStreakState } from '../../lib/storage/streakStorage';

/** Maestro taps Chinese DEV labels even when product locale is English. */
const DEV_LOCALE = 'zh' as const;

function DevButton({
  label,
  onPress,
  active,
  disabled,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled === true }}
      className={[
        'rounded-full border px-3 py-2',
        active ? 'border-accent-sunset bg-accent-sunset/20' : 'border-hairline',
      ].join(' ')}
    >
      <Text className="text-xs text-ink" style={{ fontFamily: 'SpaceMono_400Regular' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function DevToolsPanel() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  /** Tracks in-flight regenerate for async waiters (Maestro fake-next-day). */
  const regeneratingRef = useRef(false);
  /** Prevents concurrent fake-next-day (Maestro retry while first refresh in flight). */
  const advanceInFlightRef = useRef(false);
  const [recoveryLog, setRecoveryLog] = useState<RecoveryLogEntry[]>([]);
  const [streakSummary, setStreakSummary] = useState(
    () => getStringsForLocale(DEV_LOCALE).ui.devTools.streakPlaceholder,
  );
  const [forceDateActive, setForceDateActive] = useState(
    () => getDevForceDateKey() != null,
  );

  const setRegeneratingGate = (next: boolean) => {
    regeneratingRef.current = next;
    setRegenerating(next);
  };
  /** DEV-only sheet so Maestro can open calendar while still playing (carry QA). */
  const [calendarOpen, setCalendarOpen] = useState(false);
  const {
    status,
    dateKey,
    gameType,
    snapshot,
    seed,
    updatePlayState,
    markCompleted,
    devRegenerateToday,
    devApplyStreakScenario,
    refresh,
  } = useDailyGame();
  /** Fresh after await — do not trust advanceFakeDateNextDay closure across regen wait. */
  const dateKeyRef = useRef(dateKey);
  const statusRef = useRef(status);
  dateKeyRef.current = dateKey;
  statusRef.current = status;
  const { barVisible, hideBar } = useDevToolsUi();
  const { setLocaleOverride } = useI18n();
  const d = getStringsForLocale(DEV_LOCALE).ui.devTools;
  const gameTypeLabel = (type: GameType) => getGameTypeLabel(type, DEV_LOCALE);

  const refreshRecoveryLog = useCallback(async () => {
    setRecoveryLog(await loadRecoveryLog());
  }, []);

  const refreshStreakSummary = useCallback(async () => {
    setStreakSummary(formatStreakDevSummary(await loadStreakState()));
  }, []);

  const applyGrowthScenario = async (scenario: GrowthDevScenarioId) => {
    if (status === 'completed' || status === 'abandoned') {
      await devRegenerateToday('sudoku');
    }
    await applyGrowthDevScenario(scenario);
    await refresh();
    router.replace('/game');
  };

  /** Fill board only — no markCompleted (sudoku Maestro taps product 完成今日). */
  const fillBoardOnly = () => {
    if (snapshot == null || status !== 'playing') return;
    const solved = solvePlayStateForSnapshot(snapshot);
    if (solved == null) return;
    updatePlayState(solved);
  };

  const injectTodayCompleted = async () => {
    // Scheme A: do not refresh after storage inject — wall≠opening remints (CARRY-02).
    // Solve into Context then markCompleted (same path as real 完成今日).
    if (snapshot == null || status !== 'playing') return;
    const solved = solvePlayStateForSnapshot(snapshot);
    if (solved == null) return;
    updatePlayState(solved);
    await markCompleted();
    router.replace('/result');
  };

  const applyStreakScenario = async (scenario: StreakDevScenarioId) => {
    if (
      STREAK_GAME_BANNER_SCENARIOS.has(scenario) &&
      (status === 'completed' || status === 'abandoned')
    ) {
      await devRegenerateToday();
    }
    await devApplyStreakScenario(scenario);
    await refreshStreakSummary();
    router.replace('/game');
  };

  if (!DEV_TOOLS_ENABLED || !barVisible) return null;

  const puzzleHash = snapshot?.puzzleHash ?? '—';
  const sudokuHash =
    snapshot?.puzzle != null && isSudokuPuzzle(snapshot.puzzle)
      ? snapshot.puzzle.puzzleHash
      : null;

  const regenerate = async (force?: GameType | null) => {
    if (regeneratingRef.current) return;
    setRegeneratingGate(true);
    try {
      await devRegenerateToday(force);
      router.replace('/game');
    } catch (error) {
      if (__DEV__) {
        console.error('[DevTools] devRegenerateToday failed', error);
      }
    } finally {
      setRegeneratingGate(false);
    }
  };

  /** Maestro / Sunday Special QA: pin dateKey to a known Sunday then rebuild today. */
  const applyFakeSunday = async () => {
    if (regeneratingRef.current) return;
    setRegeneratingGate(true);
    try {
      setDevForceDateKey(DEV_QA_SUNDAY_DATE_KEY);
      setForceDateActive(true);
      await devRegenerateToday();
      router.replace('/game');
    } catch (error) {
      if (__DEV__) {
        console.error('[DevTools] applyFakeSunday failed', error);
      }
    } finally {
      setRegeneratingGate(false);
    }
  };

  const clearFakeDate = async () => {
    if (regeneratingRef.current) return;
    setRegeneratingGate(true);
    try {
      setDevForceDateKey(null);
      setForceDateActive(false);
      await devRegenerateToday();
      router.replace('/game');
    } catch (error) {
      if (__DEV__) {
        console.error('[DevTools] clearFakeDate failed', error);
      }
    } finally {
      setRegeneratingGate(false);
    }
  };

  /**
   * Carry QA (v2.7-01 / CARRY-02 D-07): advance calendar today by +1 without minting.
   * Only setDevForceDateKey + hydrate refresh — never regenerate.
   * Boundaries:
   * - Wait out regenerate (Maestro tap on disabled control is a silent no-op).
   * - Single-flight + idempotent vs device wall (`getLocalDateKey(new Date())` —
   *   no-arg getLocalDateKey honors force and would +2 on retry).
   * - Read dateKey/status from refs after await (stale closure across wait).
   */
  const advanceFakeDateNextDay = async () => {
    if (advanceInFlightRef.current) return;
    advanceInFlightRef.current = true;
    try {
      const waitStarted = Date.now();
      while (regeneratingRef.current && Date.now() - waitStarted < 180_000) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (regeneratingRef.current) {
        if (__DEV__) {
          console.warn(
            '[DevTools] advanceFakeDateNextDay: regenerate still busy',
          );
        }
        return;
      }

      // Explicit Date bypasses force — true device calendar day.
      const deviceWall = getLocalDateKey(new Date());
      const target = addDaysToDateKey(deviceWall, 1);
      const opening = dateKeyRef.current;
      const alreadyAdvanced =
        getDevForceDateKey() === target ||
        (opening != null && opening !== '' && opening < deviceWall) ||
        (opening != null && opening !== '' && opening >= target);

      if (alreadyAdvanced) {
        if (statusRef.current === 'playing') {
          router.replace('/game');
        }
        return;
      }

      setRegeneratingGate(true);
      try {
        setDevForceDateKey(target);
        setForceDateActive(true);
        await refresh();
        await refreshStreakSummary();
        if (statusRef.current === 'playing') {
          router.replace('/game');
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[DevTools] advanceFakeDateNextDay failed', error);
        }
      } finally {
        setRegeneratingGate(false);
      }
    } finally {
      advanceInFlightRef.current = false;
    }
  };

  const onToggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      // Resync after Fast Refresh / Maestro so "清除" stays enabled when force is live.
      setForceDateActive(getDevForceDateKey() != null);
      void refreshRecoveryLog();
      void refreshStreakSummary();
    }
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 z-50 border-t border-hairline bg-canvas-soft/95 px-3 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      pointerEvents="box-none"
    >
      <View className="mb-2 flex-row items-center justify-between gap-2">
        <Pressable
          onPress={onToggleExpanded}
          accessibilityRole="button"
          accessibilityLabel={d.title}
          className="min-h-[32px] flex-1 flex-row items-center justify-between"
        >
          <Text
            className="text-xs uppercase tracking-widest text-accent-sunset"
            style={{ fontFamily: 'SpaceMono_400Regular' }}
          >
            {d.title}
          </Text>
          <Text className="text-xs text-muted">
            {expanded ? d.collapse : d.expand}
          </Text>
        </Pressable>
        <Pressable
          onPress={hideBar}
          accessibilityRole="button"
          accessibilityLabel={d.hideA11y}
          className="rounded-full border border-hairline px-2.5 py-1.5"
        >
          <Text className="text-[10px] text-muted" style={{ fontFamily: 'SpaceMono_400Regular' }}>
            {d.hide}
          </Text>
        </Pressable>
      </View>

      {expanded ? (
        <View className="gap-2">
          <Text className="text-xs text-muted" style={{ fontFamily: 'SpaceMono_400Regular' }}>
            {`date ${dateKey ?? '—'} · type ${gameType ?? '—'} · status ${status}`}
          </Text>
          <Text className="text-xs text-muted" style={{ fontFamily: 'SpaceMono_400Regular' }}>
            {`hash ${puzzleHash}${sudokuHash != null ? ` · sudo ${sudokuHash}` : ''}`}
          </Text>

          <Text className="text-xs text-muted" style={{ fontFamily: 'SpaceMono_400Regular' }}>
            {streakSummary}
          </Text>

          {regenerating ? (
            <View className="flex-row items-center gap-2 py-1">
              <ActivityIndicator size="small" color={colors.accentSunset} />
              <Text className="text-xs text-muted" style={{ fontFamily: 'SpaceMono_400Regular' }}>
                {d.regenerating}
              </Text>
            </View>
          ) : null}

          <View className="flex-row flex-wrap gap-2">
            <DevButton
              label={d.settings}
              onPress={() => {
                router.push('/settings');
              }}
            />
            <DevButton
              label={d.previewEnglish}
              onPress={() => {
                setLocaleOverride('en');
              }}
            />
            <DevButton
              label={d.fakeSunday}
              active={getDevForceDateKey() === DEV_QA_SUNDAY_DATE_KEY}
              disabled={regenerating}
              onPress={() => void applyFakeSunday()}
            />
            <DevButton
              label={d.fakeNextDay}
              active={
                forceDateActive &&
                getDevForceDateKey() !== DEV_QA_SUNDAY_DATE_KEY
              }
              disabled={regenerating}
              onPress={() => void advanceFakeDateNextDay()}
              accessibilityLabel={d.fakeNextDayA11y}
            />
            <DevButton
              label={d.openCalendar}
              disabled={dateKey == null}
              onPress={() => setCalendarOpen(true)}
              accessibilityLabel={d.openCalendarA11y}
            />
            <DevButton
              label={d.clearFakeDate}
              disabled={regenerating || !forceDateActive}
              onPress={() => void clearFakeDate()}
            />
            <DevButton
              label={gameTypeLabel('sudoku')}
              active={gameType === 'sudoku'}
              disabled={regenerating}
              onPress={() => void regenerate('sudoku')}
            />
            <DevButton
              label={gameTypeLabel('binary')}
              active={gameType === 'binary'}
              disabled={regenerating}
              onPress={() => void regenerate('binary')}
            />
            <DevButton
              label={gameTypeLabel('nonogram')}
              active={gameType === 'nonogram'}
              disabled={regenerating}
              onPress={() => void regenerate('nonogram')}
            />
            <DevButton
              label={gameTypeLabel('slitherlink')}
              active={gameType === 'slitherlink'}
              disabled={regenerating}
              onPress={() => void regenerate('slitherlink')}
            />
            <DevButton
              label={d.naturalRandom}
              disabled={regenerating}
              onPress={() => void regenerate(null)}
            />
            <DevButton
              label={d.reopenToday}
              disabled={regenerating}
              onPress={() => void regenerate()}
            />
            <DevButton
              label={d.promptReview}
              onPress={() => {
                void requestAppStoreReview();
              }}
            />
            <DevButton
              label={d.resetCompletions}
              onPress={() => {
                void clearCompletionHistory();
              }}
            />
            <DevButton
              label={d.resetRating}
              onPress={() => {
                void clearRatingState();
              }}
            />
            <DevButton
              label={d.injectBadBoard}
              onPress={() => {
                void devInjectCompletedEmptyPlayState().then(() => refresh());
              }}
            />
            <DevButton
              label={d.clearRecoveryLog}
              onPress={() => {
                void clearRecoveryLog().then(() => refreshRecoveryLog());
              }}
            />
          </View>

          <Text className="text-[10px] text-accent-sunset" style={{ fontFamily: 'SpaceMono_400Regular' }}>
            {d.growthSection}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {GROWTH_DEV_SCENARIOS.map((scenario) => (
              <DevButton
                key={scenario.id}
                label={d.growth[scenario.id].label}
                onPress={() => {
                  void applyGrowthScenario(scenario.id);
                }}
              />
            ))}
            <DevButton
              label={d.fillBoard}
              onPress={fillBoardOnly}
              accessibilityLabel={d.fillBoardA11y}
            />
            <DevButton
              label={d.oneTapClear}
              onPress={() => {
                void injectTodayCompleted();
              }}
            />
          </View>
          <Text className="text-[10px] leading-4 text-muted">
            {GROWTH_DEV_SCENARIOS.map(
              (s) =>
                `${d.growth[s.id].label}${d.hintSep}${d.growth[s.id].hint}`,
            ).join(' · ')}
          </Text>

          <Text className="text-[10px] text-accent-sunset" style={{ fontFamily: 'SpaceMono_400Regular' }}>
            {d.streakSection}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {STREAK_DEV_SCENARIOS.map((scenario) => (
              <DevButton
                key={scenario.id}
                label={d.streak[scenario.id].label}
                onPress={() => {
                  void applyStreakScenario(scenario.id);
                }}
              />
            ))}
          </View>
          <Text className="text-[10px] leading-4 text-muted">
            {STREAK_DEV_SCENARIOS.map(
              (s) =>
                `${d.streak[s.id].label}${d.hintSep}${d.streak[s.id].hint}`,
            ).join(' · ')}
          </Text>

          {recoveryLog.length > 0 ? (
            <View className="gap-1">
              <Text className="text-[10px] text-muted" style={{ fontFamily: 'SpaceMono_400Regular' }}>
                {d.recoveryLogTitle(recoveryLog.length)}
              </Text>
              {recoveryLog.slice(-3).map((entry) => (
                <Text
                  key={`${entry.at}-${entry.kind}`}
                  className="text-[10px] leading-4 text-muted"
                  style={{ fontFamily: 'SpaceMono_400Regular' }}
                >
                  {`${new Date(entry.at).toISOString().slice(11, 19)} · ${entry.kind}${entry.dateKey ? ` · ${entry.dateKey}` : ''}${entry.detail ? ` · ${entry.detail}` : ''}`}
                </Text>
              ))}
            </View>
          ) : null}

          <Text className="text-[10px] leading-4 text-muted">
            {d.helpFooter}
          </Text>
        </View>
      ) : null}

      <MonthCalendarSheet
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        dateKey={dateKey}
        seed={seed ?? snapshot?.seed}
        todaySnapshotStatus={
          status === 'completed' || status === 'abandoned' || status === 'playing'
            ? status
            : undefined
        }
      />
    </View>
  );
}
