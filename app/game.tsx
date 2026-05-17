import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  useWindowDimensions,
  Vibration,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import PrivacyPolicyFooterLink from '../components/legal/PrivacyPolicyFooterLink';
import GameRulesButton from '../components/game/GameRulesButton';
import GameToolbar from '../components/game/GameToolbar';
import BinaryGrid from '../components/grid/BinaryGrid';
import SudokuGrid from '../components/grid/SudokuGrid';
import SudokuNumpad from '../components/grid/SudokuNumpad';
import HairlineCard from '../components/ui/HairlineCard';
import OutlinePillButton from '../components/ui/OutlinePillButton';
import { useDailyGame } from '../contexts/DailyGameContext';
import { useDevBottomInset } from '../contexts/DevToolsUiContext';
import { useElapsedTimer } from '../hooks/useElapsedTimer';
import {
  BINARY_EMPTY,
  cloneGrid as cloneBinaryGrid,
  createEmptyGrid as createEmptyBinaryGrid,
  type CellCoord as BinaryCellCoord,
} from '../lib/puzzles/binary/grid';
import {
  getConflictCells as getBinaryConflictCells,
  isCompleteAndValid as isBinaryComplete,
} from '../lib/puzzles/binary/validate';
import type { CellCoord } from '../lib/puzzles/sudoku/grid';
import { cloneGrid, createEmptyGrid } from '../lib/puzzles/sudoku/grid';
import { getDigitsUsedInUnit } from '../lib/puzzles/sudoku/display';
import {
  getConflictCells,
  isCompleteAndValid,
} from '../lib/puzzles/sudoku/validate';
import { isBinaryPuzzle, isSudokuPuzzle } from '../lib/puzzles/types';

const GAME_LABEL: Record<string, string> = {
  sudoku: '数独',
  binary: '二进制',
};

const HORIZONTAL_PADDING = 24;

function isSudokuEditable(givens: number[][], row: number, col: number): boolean {
  return givens[row][col] === 0;
}

function isBinaryEditable(givens: number[][], row: number, col: number): boolean {
  return givens[row][col] === BINARY_EMPTY;
}

function cycleBinaryValue(value: number): number {
  if (value === BINARY_EMPTY) return 1;
  if (value === 1) return 2;
  return BINARY_EMPTY;
}

function binaryCellValue(
  givens: number[][],
  play: number[][],
  row: number,
  col: number,
): number {
  if (givens[row][col] !== BINARY_EMPTY) return givens[row][col];
  return play[row][col];
}

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
    updatePlayState,
    markCompleted,
    markAbandoned,
  } = useDailyGame();

  const elapsed = useElapsedTimer(snapshot?.startedAt);

  const [selectedSudoku, setSelectedSudoku] = useState<CellCoord | null>(null);
  const [selectedBinary, setSelectedBinary] = useState<BinaryCellCoord | null>(
    null,
  );

  const isSudoku =
    gameType === 'sudoku' && puzzle != null && isSudokuPuzzle(puzzle);
  const isBinary =
    gameType === 'binary' && puzzle != null && isBinaryPuzzle(puzzle);

  const sudokuGivens = isSudoku ? puzzle.givens : null;
  const binaryGivens = isBinary ? puzzle.givens : null;

  const sudokuPlay =
    isSudoku && playState != null ? playState : createEmptyGrid();
  const binaryPlay =
    isBinary && playState != null ? playState : createEmptyBinaryGrid();

  const gridMaxWidth = screenWidth - HORIZONTAL_PADDING * 2;
  const bottomInset = useDevBottomInset(insets.bottom + 8);

  useEffect(() => {
    if (status === 'completed' || status === 'abandoned') {
      router.replace('/result');
    }
  }, [status, router]);

  const sudokuConflicts = useMemo(() => {
    if (sudokuGivens == null) return [];
    return getConflictCells(sudokuPlay, sudokuGivens);
  }, [sudokuPlay, sudokuGivens]);

  const binaryConflicts = useMemo(() => {
    if (binaryGivens == null) return [];
    return getBinaryConflictCells(binaryPlay, binaryGivens);
  }, [binaryPlay, binaryGivens]);

  const canCompleteSudoku = useMemo(() => {
    if (sudokuGivens == null) return false;
    return isCompleteAndValid(sudokuPlay, sudokuGivens);
  }, [sudokuPlay, sudokuGivens]);

  const canCompleteBinary = useMemo(() => {
    if (binaryGivens == null) return false;
    return isBinaryComplete(binaryPlay, binaryGivens);
  }, [binaryPlay, binaryGivens]);

  const canComplete = isSudoku ? canCompleteSudoku : canCompleteBinary;

  const dimmedDigits = useMemo(() => {
    if (sudokuGivens == null || selectedSudoku == null) return new Set<number>();
    return getDigitsUsedInUnit(sudokuGivens, sudokuPlay, selectedSudoku);
  }, [sudokuGivens, sudokuPlay, selectedSudoku]);

  const numpadDisabled =
    selectedSudoku == null ||
    sudokuGivens == null ||
    !isSudokuEditable(sudokuGivens, selectedSudoku.row, selectedSudoku.col);

  const typeLabel = gameType != null ? GAME_LABEL[gameType] ?? gameType : '…';

  const statusHint = useMemo(() => {
    if (isSudoku) {
      if (canCompleteSudoku) return '全部填对啦，可以收工';
      if (sudokuConflicts.length > 0) return '有冲突，检查一下标红的格子';
      if (numpadDisabled) return '先点一个空格，再选数字';
      return null;
    }
    if (isBinary) {
      if (canCompleteBinary) return '规则都满足了，可以收工';
      if (binaryConflicts.length > 0) return '有违规，检查一下标红的格子';
      return '点格子在 0 和 1 之间切换';
    }
    return null;
  }, [
    isSudoku,
    isBinary,
    canCompleteSudoku,
    canCompleteBinary,
    sudokuConflicts.length,
    binaryConflicts.length,
    numpadDisabled,
  ]);

  const handleSudokuSelect = useCallback((row: number, col: number) => {
    setSelectedSudoku({ row, col });
  }, []);

  const handleSudokuDigit = useCallback(
    (digit: number) => {
      if (selectedSudoku == null || sudokuGivens == null) return;
      if (!isSudokuEditable(sudokuGivens, selectedSudoku.row, selectedSudoku.col)) {
        return;
      }

      const next = cloneGrid(sudokuPlay);
      next[selectedSudoku.row][selectedSudoku.col] = digit;
      updatePlayState(next);

      const conflicts = getConflictCells(next, sudokuGivens);
      const cellConflict = conflicts.some(
        (c) => c.row === selectedSudoku.row && c.col === selectedSudoku.col,
      );
      if (cellConflict) Vibration.vibrate(12);
    },
    [selectedSudoku, sudokuGivens, sudokuPlay, updatePlayState],
  );

  const handleSudokuClear = useCallback(() => {
    if (selectedSudoku == null || sudokuGivens == null) return;
    if (!isSudokuEditable(sudokuGivens, selectedSudoku.row, selectedSudoku.col)) {
      return;
    }

    const next = cloneGrid(sudokuPlay);
    next[selectedSudoku.row][selectedSudoku.col] = 0;
    updatePlayState(next);
  }, [selectedSudoku, sudokuGivens, sudokuPlay, updatePlayState]);

  const handleBinaryPress = useCallback(
    (row: number, col: number) => {
      if (binaryGivens == null) return;

      setSelectedBinary({ row, col });

      if (!isBinaryEditable(binaryGivens, row, col)) return;

      const current = binaryCellValue(binaryGivens, binaryPlay, row, col);
      const next = cloneBinaryGrid(binaryPlay);
      next[row][col] = cycleBinaryValue(current);
      updatePlayState(next);

      const conflicts = getBinaryConflictCells(next, binaryGivens);
      const cellConflict = conflicts.some((c) => c.row === row && c.col === col);
      if (cellConflict) Vibration.vibrate(12);
    },
    [binaryGivens, binaryPlay, updatePlayState],
  );

  const handleComplete = async () => {
    if (!canComplete) return;
    await markCompleted();
    router.replace('/result');
  };

  const confirmAbandon = () => {
    Alert.alert(
      '放弃今日挑战？',
      '今天的进度会保存为「认怂」，明天再来也行。',
      [
        { text: '继续玩', style: 'cancel' },
        {
          text: '放弃',
          style: 'destructive',
          onPress: () => void handleAbandon(),
        },
      ],
    );
  };

  const handleAbandon = async () => {
    await markAbandoned();
    router.replace('/result');
  };

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
                {typeLabel}
              </Text>
              {(isSudoku || isBinary) && gameType != null ? (
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

        {(isSudoku || isBinary) && <GameToolbar elapsed={elapsed} />}

        {isSudoku && sudokuGivens != null ? (
          <View className="mt-3 flex-1">
            <View className="items-center">
              <HairlineCard
                className="w-full p-3"
                style={{ maxWidth: gridMaxWidth, alignSelf: 'center' }}
              >
                <SudokuGrid
                  givens={sudokuGivens}
                  playState={sudokuPlay}
                  selected={selectedSudoku}
                  conflictCells={sudokuConflicts}
                  onSelectCell={handleSudokuSelect}
                />
              </HairlineCard>
            </View>

            <View className="mt-5">
              <SudokuNumpad
                onDigit={handleSudokuDigit}
                onClear={handleSudokuClear}
                disabled={numpadDisabled}
                dimmedDigits={dimmedDigits}
              />
            </View>
          </View>
        ) : null}

        {isBinary && binaryGivens != null ? (
          <View className="mt-3 flex-1">
            <View className="items-center">
              <HairlineCard
                className="w-full p-3"
                style={{ maxWidth: gridMaxWidth, alignSelf: 'center' }}
              >
                <BinaryGrid
                  givens={binaryGivens}
                  playState={binaryPlay}
                  selected={selectedBinary}
                  conflictCells={binaryConflicts}
                  onPressCell={handleBinaryPress}
                />
              </HairlineCard>
            </View>
          </View>
        ) : null}

        {statusHint != null ? (
          <Text className="mt-3 text-center text-sm text-muted">{statusHint}</Text>
        ) : null}

        <View className="mt-6 gap-3">
          {(isSudoku || isBinary) && (
            <OutlinePillButton
              label="完成今日"
              variant="primary"
              disabled={!canComplete}
              onPress={() => void handleComplete()}
            />
          )}
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
