import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEV_TOOLS_ENABLED } from '../../constants/dev';
import { colors } from '../../constants/design';
import { useDailyGame } from '../../contexts/DailyGameContext';
import { useDevToolsUi } from '../../contexts/DevToolsUiContext';
import type { GameType } from '../../lib/puzzles/types';
import { isSudokuPuzzle } from '../../lib/puzzles/types';
import { requestAppStoreReview } from '../../lib/rating/requestReview';
import { devInjectCompletedEmptyPlayState } from '../../lib/dev/snapshotDevInject';
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

function DevButton({
  label,
  onPress,
  active,
  disabled,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
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
  const [recoveryLog, setRecoveryLog] = useState<RecoveryLogEntry[]>([]);
  const [streakSummary, setStreakSummary] = useState('streak: —');
  const {
    status,
    dateKey,
    gameType,
    snapshot,
    devRegenerateToday,
    devApplyStreakScenario,
    refresh,
  } = useDailyGame();
  const { barVisible, hideBar } = useDevToolsUi();

  const refreshRecoveryLog = useCallback(async () => {
    setRecoveryLog(await loadRecoveryLog());
  }, []);

  const refreshStreakSummary = useCallback(async () => {
    setStreakSummary(formatStreakDevSummary(await loadStreakState()));
  }, []);

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
    if (regenerating) return;
    setRegenerating(true);
    try {
      await devRegenerateToday(force);
      router.replace('/game');
    } catch (error) {
      if (__DEV__) {
        console.error('[DevTools] devRegenerateToday failed', error);
      }
    } finally {
      setRegenerating(false);
    }
  };

  const onToggleExpanded = () => {
    setExpanded((v) => {
      const next = !v;
      if (next) {
        void refreshRecoveryLog();
        void refreshStreakSummary();
      }
      return next;
    });
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
          className="min-h-[32px] flex-1 flex-row items-center justify-between"
        >
          <Text
            className="text-xs uppercase tracking-widest text-accent-sunset"
            style={{ fontFamily: 'SpaceMono_400Regular' }}
          >
            DEV 调试
          </Text>
          <Text className="text-xs text-muted">{expanded ? '收起 ▼' : '展开 ▲'}</Text>
        </Pressable>
        <Pressable
          onPress={hideBar}
          accessibilityRole="button"
          accessibilityLabel="隐藏调试条，便于截图"
          className="rounded-full border border-hairline px-2.5 py-1.5"
        >
          <Text className="text-[10px] text-muted" style={{ fontFamily: 'SpaceMono_400Regular' }}>
            隐藏
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
                正在生成今日题目…
              </Text>
            </View>
          ) : null}

          <View className="flex-row flex-wrap gap-2">
            <DevButton
              label="设置占位"
              onPress={() => {
                router.push('/settings');
              }}
            />
            <DevButton
              label="数独"
              active={gameType === 'sudoku'}
              disabled={regenerating}
              onPress={() => void regenerate('sudoku')}
            />
            <DevButton
              label="二进制"
              active={gameType === 'binary'}
              disabled={regenerating}
              onPress={() => void regenerate('binary')}
            />
            <DevButton
              label="数绘"
              active={gameType === 'nonogram'}
              disabled={regenerating}
              onPress={() => void regenerate('nonogram')}
            />
            <DevButton
              label="数回"
              active={gameType === 'slitherlink'}
              disabled={regenerating}
              onPress={() => void regenerate('slitherlink')}
            />
            <DevButton
              label="自然随机"
              disabled={regenerating}
              onPress={() => void regenerate(null)}
            />
            <DevButton label="重开今日" disabled={regenerating} onPress={() => void regenerate()} />
            <DevButton
              label="弹出评分"
              onPress={() => {
                void requestAppStoreReview();
              }}
            />
            <DevButton
              label="重置通关记录"
              onPress={() => {
                void clearCompletionHistory();
              }}
            />
            <DevButton
              label="重置评分"
              onPress={() => {
                void clearRatingState();
              }}
            />
            <DevButton
              label="注入坏盘面"
              onPress={() => {
                void devInjectCompletedEmptyPlayState().then(() => refresh());
              }}
            />
            <DevButton
              label="清恢复日志"
              onPress={() => {
                void clearRecoveryLog().then(() => refreshRecoveryLog());
              }}
            />
          </View>

          <Text className="text-[10px] text-accent-sunset" style={{ fontFamily: 'SpaceMono_400Regular' }}>
            连签 / 护盾 QA（注入后自动 hydrate → 跳转 game）
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {STREAK_DEV_SCENARIOS.map((scenario) => (
              <DevButton
                key={scenario.id}
                label={scenario.label}
                onPress={() => {
                  void applyStreakScenario(scenario.id);
                }}
              />
            ))}
          </View>
          <Text className="text-[10px] leading-4 text-muted">
            {STREAK_DEV_SCENARIOS.map((s) => `${s.label}：${s.hint}`).join(' · ')}
          </Text>

          {recoveryLog.length > 0 ? (
            <View className="gap-1">
              <Text className="text-[10px] text-muted" style={{ fontFamily: 'SpaceMono_400Regular' }}>
                恢复日志（最近 {recoveryLog.length} 条）
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
            点「数独/二进制/数绘/数回」会清今日存档并按选定题型重建；「自然随机」走日期算法并尽量换题型。「重开今日」保持当前题型、换一道新题（清空进度）。也可改 constants/dev.ts 里 DEV_FORCE_GAME_TYPE。「弹出评分」直接调系统对话框；「重置通关记录」清本周统计；「重置评分」清评分门控。「注入坏盘面」写入 completed+空盘，重启后走恢复逻辑；展开时显示恢复日志。截图时点「隐藏」；长按页脚「隐私政策」可再唤出。
          </Text>
        </View>
      ) : null}
    </View>
  );
}
