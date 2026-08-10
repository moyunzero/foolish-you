import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '../../constants/design';
import { useI18n } from '../../lib/i18n';
import OutlinePillButton from '../ui/OutlinePillButton';
import UndoButton from './UndoButton';

type GameScreenFooterProps = {
  statusHint: string | null;
  canComplete: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onComplete: () => void;
  onAbandon: () => void;
  /** Mono caption left of tools — e.g. 填数 / 笔记 / 棋盘 */
  modeLabel?: string | null;
  /** Notes-on accent for the session rail */
  accent?: boolean;
  /** Extra tools after undo (clear / notes for sudoku) */
  extraTools?: ReactNode;
  /** Instrument row (sudoku digit pad); omit for board-only games */
  instrument?: ReactNode;
};

/** Host Desk Path B — shared session chrome: tools → instrument → complete / bail */
export default function GameScreenFooter({
  statusHint,
  canComplete,
  canUndo,
  onUndo,
  onComplete,
  onAbandon,
  modeLabel = null,
  accent = false,
  extraTools = null,
  instrument = null,
}: GameScreenFooterProps) {
  const { strings } = useI18n();
  const ui = strings.ui;
  const bailLabel = ui.game.bailToday;

  return (
    <View
      className="rounded-2xl border px-2.5 pb-3 pt-2.5"
      style={{
        borderColor: accent
          ? 'rgba(255, 122, 23, 0.4)'
          : colors.hairlineStrong,
        backgroundColor: accent ? colors.canvasElevNotes : colors.canvasElev,
      }}
    >
      <View className="mb-2 flex-row items-center justify-between px-0.5">
        {modeLabel != null ? (
          <Text
            style={{
              fontFamily: 'SpaceMono_400Regular',
              fontSize: 10,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: accent ? colors.accentSunset : colors.muted,
            }}
          >
            {modeLabel}
          </Text>
        ) : (
          <View />
        )}
        <View className="flex-row items-center gap-1.5">
          <UndoButton canUndo={canUndo} onUndo={onUndo} />
          {extraTools}
        </View>
      </View>

      {instrument != null ? <View className="mb-2">{instrument}</View> : null}

      {statusHint != null ? (
        <Text
          className={canComplete ? 'mb-2 text-center text-accent-sunset' : 'mb-2 text-center text-body'}
          style={{
            fontFamily: 'SpaceMono_400Regular',
            fontSize: 11,
            lineHeight: 14,
          }}
        >
          {statusHint}
        </Text>
      ) : null}

      <View className="flex-row items-center gap-2">
        <View className="min-w-0 flex-1">
          <OutlinePillButton
            label={ui.game.completeToday}
            variant={canComplete ? 'primary' : 'outline'}
            disabled={!canComplete}
            onPress={onComplete}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={bailLabel}
          onPress={onAbandon}
          className="min-h-[44px] min-w-[44px] items-center justify-center px-2"
        >
          <Text
            className="text-muted"
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {bailLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
