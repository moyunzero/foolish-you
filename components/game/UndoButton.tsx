import { Pressable, Text } from 'react-native';

import { useI18n } from '../../lib/i18n';

type UndoButtonProps = {
  canUndo: boolean;
  onUndo: () => void;
};

/** Footer undo control — disabled when stack empty; no empty-stack toast (D-03). */
export default function UndoButton({ canUndo, onUndo }: UndoButtonProps) {
  const { strings } = useI18n();
  const label = strings.ui.game.undo;
  const a11y = strings.ui.game.undoA11y;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled: !canUndo }}
      disabled={!canUndo}
      onPress={onUndo}
      className={[
        'min-h-[44px] items-center justify-center rounded-full border border-hairline px-6 py-3',
        canUndo ? 'active:opacity-85' : 'opacity-50',
      ].join(' ')}
    >
      <Text
        className="text-base font-normal text-ink"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
