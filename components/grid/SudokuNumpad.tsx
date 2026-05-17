import { Pressable, Text, View } from 'react-native';

import { colors } from '../../constants/design';

type SudokuNumpadProps = {
  onDigit: (digit: number) => void;
  onClear: () => void;
  disabled: boolean;
  /** 选中格所在行/列/宫内已出现的数字，按键置灰 */
  dimmedDigits?: Set<number>;
};

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function DigitKey({
  label,
  digit,
  onPress,
  padDisabled,
  filled,
}: {
  label: string;
  digit?: number;
  onPress: () => void;
  padDisabled: boolean;
  filled?: boolean;
}) {
  const keyDisabled = padDisabled;
  const dimmed = filled === true;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        label === '清除'
          ? '清除当前格'
          : dimmed
            ? `数字 ${label} 在本行、列或宫内已有`
            : `填入 ${label}`
      }
      disabled={keyDisabled}
      onPress={onPress}
      style={{
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.hairline,
        opacity: dimmed ? 0.28 : keyDisabled ? 0.45 : 1,
      }}
    >
      <Text
        style={{
          fontFamily: 'SpaceMono_400Regular',
          fontSize: 16,
          color: dimmed ? colors.muted : colors.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function SudokuNumpad({
  onDigit,
  onClear,
  disabled,
  dimmedDigits,
}: SudokuNumpadProps) {
  const rows = [
    DIGITS.slice(0, 3),
    DIGITS.slice(3, 6),
    DIGITS.slice(6, 9),
  ] as const;

  return (
    <View className="gap-2" pointerEvents={disabled ? 'none' : 'auto'}>
      {rows.map((row, rowIndex) => (
        <View key={`pad-row-${rowIndex}`} className="flex-row gap-2">
          {row.map((digit) => (
            <DigitKey
              key={digit}
              digit={digit}
              label={String(digit)}
              padDisabled={disabled}
              filled={dimmedDigits?.has(digit)}
              onPress={() => onDigit(digit)}
            />
          ))}
        </View>
      ))}
      <View className="flex-row">
        <DigitKey
          label="清除"
          padDisabled={disabled}
          onPress={onClear}
        />
      </View>
    </View>
  );
}
