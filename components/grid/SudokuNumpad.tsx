import { Pressable, Text, View } from 'react-native';

import { colors } from '../../constants/design';
import SessionToolIcon, {
  ClearGlyph,
  PencilGlyph,
} from '../game/SessionToolIcon';
import { useI18n } from '../../lib/i18n';
import type { Strings } from '../../lib/i18n/types';

type SudokuNumpadProps = {
  onDigit: (digit: number) => void;
  onClear: () => void;
  disabled: boolean;
  /** 选中格所在行/列/宫内已出现的数字，按键置灰 */
  dimmedDigits?: Set<number>;
  notesMode: boolean;
  onToggleNotesMode: () => void;
  /** When true, only render clear + notes icons (for footer tool cluster) */
  toolsOnly?: boolean;
  /** When true, only render digit row (for footer instrument) */
  digitsOnly?: boolean;
};

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/** Dimmed digits stay tappable — a11y label must match actionable behavior. */
function digitA11yLabel(grid: Strings['ui']['grid'], label: string): string {
  return grid.fillDigit(Number(label));
}

function DigitKey({
  label,
  onPress,
  padDisabled,
  filled,
  grid,
  notesMode,
}: {
  label: string;
  onPress: () => void;
  padDisabled: boolean;
  filled?: boolean;
  grid: Strings['ui']['grid'];
  notesMode: boolean;
}) {
  const dimmed = filled === true;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={digitA11yLabel(grid, label)}
      disabled={padDisabled}
      onPress={onPress}
      style={{
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: notesMode
          ? 'rgba(255, 122, 23, 0.28)'
          : colors.hairline,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        opacity: dimmed ? 0.28 : padDisabled ? 0.45 : 1,
      }}
    >
      <Text
        style={{
          fontFamily: 'SpaceMono_400Regular',
          fontSize: 16,
          color: dimmed
            ? colors.muted
            : notesMode
              ? colors.accentSunsetSoft
              : colors.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SudokuToolCluster({
  onClear,
  disabled,
  notesMode,
  onToggleNotesMode,
  grid,
}: {
  onClear: () => void;
  disabled: boolean;
  notesMode: boolean;
  onToggleNotesMode: () => void;
  grid: Strings['ui']['grid'];
}) {
  return (
    <>
      <SessionToolIcon
        accessibilityLabel={grid.clearCell}
        disabled={disabled}
        onPress={onClear}
      >
        <ClearGlyph />
      </SessionToolIcon>
      <SessionToolIcon
        accessibilityLabel={grid.notesModeA11y}
        selected={notesMode}
        onPress={onToggleNotesMode}
      >
        <PencilGlyph color={notesMode ? colors.accentSunset : colors.ink} />
      </SessionToolIcon>
    </>
  );
}

function SudokuDigitRow({
  onDigit,
  disabled,
  dimmedDigits,
  notesMode,
  grid,
}: {
  onDigit: (digit: number) => void;
  disabled: boolean;
  dimmedDigits?: Set<number>;
  notesMode: boolean;
  grid: Strings['ui']['grid'];
}) {
  return (
    <View
      className="flex-row gap-1"
      pointerEvents={disabled ? 'none' : 'auto'}
    >
      {DIGITS.map((digit) => (
        <DigitKey
          key={digit}
          label={String(digit)}
          padDisabled={disabled}
          filled={dimmedDigits?.has(digit)}
          grid={grid}
          notesMode={notesMode}
          onPress={() => onDigit(digit)}
        />
      ))}
    </View>
  );
}

/** Host Desk Path B — single-row 1–9 + clear/notes icons (split via toolsOnly / digitsOnly). */
export default function SudokuNumpad({
  onDigit,
  onClear,
  disabled,
  dimmedDigits,
  notesMode,
  onToggleNotesMode,
  toolsOnly = false,
  digitsOnly = false,
}: SudokuNumpadProps) {
  const { strings } = useI18n();
  const grid = strings.ui.grid;

  if (toolsOnly) {
    return (
      <SudokuToolCluster
        onClear={onClear}
        disabled={disabled}
        notesMode={notesMode}
        onToggleNotesMode={onToggleNotesMode}
        grid={grid}
      />
    );
  }

  if (digitsOnly) {
    return (
      <SudokuDigitRow
        onDigit={onDigit}
        disabled={disabled}
        dimmedDigits={dimmedDigits}
        notesMode={notesMode}
        grid={grid}
      />
    );
  }

  return (
    <View className="gap-2">
      <View className="flex-row justify-end gap-1.5">
        <SudokuToolCluster
          onClear={onClear}
          disabled={disabled}
          notesMode={notesMode}
          onToggleNotesMode={onToggleNotesMode}
          grid={grid}
        />
      </View>
      <SudokuDigitRow
        onDigit={onDigit}
        disabled={disabled}
        dimmedDigits={dimmedDigits}
        notesMode={notesMode}
        grid={grid}
      />
    </View>
  );
}
