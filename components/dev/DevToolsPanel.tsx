import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEV_TOOLS_ENABLED } from '../../constants/dev';
import { useDailyGame } from '../../contexts/DailyGameContext';
import { useDevToolsUi } from '../../contexts/DevToolsUiContext';
import type { GameType } from '../../lib/puzzles/types';
import { isSudokuPuzzle } from '../../lib/puzzles/types';

function DevButton({
  label,
  onPress,
  active,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
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
  const {
    status,
    dateKey,
    gameType,
    snapshot,
    devRegenerateToday,
  } = useDailyGame();
  const { barVisible, hideBar } = useDevToolsUi();

  if (!DEV_TOOLS_ENABLED || !barVisible) return null;

  const puzzleHash = snapshot?.puzzleHash ?? '—';
  const sudokuHash =
    snapshot?.puzzle != null && isSudokuPuzzle(snapshot.puzzle)
      ? snapshot.puzzle.puzzleHash
      : null;

  const regenerate = async (force: GameType | null) => {
    await devRegenerateToday(force);
    router.replace('/game');
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 z-50 border-t border-hairline bg-canvas-soft/95 px-3 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      pointerEvents="box-none"
    >
      <View className="mb-2 flex-row items-center justify-between gap-2">
        <Pressable
          onPress={() => setExpanded((v) => !v)}
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

          <View className="flex-row flex-wrap gap-2">
            <DevButton label="数独" active={gameType === 'sudoku'} onPress={() => void regenerate('sudoku')} />
            <DevButton label="二进制" active={gameType === 'binary'} onPress={() => void regenerate('binary')} />
            <DevButton label="自然随机" onPress={() => void regenerate(null)} />
            <DevButton label="重开今日" onPress={() => void regenerate(undefined)} />
          </View>

          <Text className="text-[10px] leading-4 text-muted">
            点「数独/二进制」会清今日存档并按选定题型重建；「自然随机」走日期算法。也可改 constants/dev.ts 里 DEV_FORCE_GAME_TYPE。截图时点「隐藏」；长按页脚「隐私政策」可再唤出。
          </Text>
        </View>
      ) : null}
    </View>
  );
}
