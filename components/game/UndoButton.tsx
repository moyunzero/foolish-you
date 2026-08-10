import { useI18n } from '../../lib/i18n';
import SessionToolIcon, { UndoGlyph } from './SessionToolIcon';

type UndoButtonProps = {
  canUndo: boolean;
  onUndo: () => void;
};

/** Session-chrome undo icon — disabled when stack empty; no empty-stack toast (D-03). */
export default function UndoButton({ canUndo, onUndo }: UndoButtonProps) {
  const { strings } = useI18n();

  return (
    <SessionToolIcon
      accessibilityLabel={strings.ui.game.undoA11y}
      disabled={!canUndo}
      onPress={onUndo}
    >
      <UndoGlyph />
    </SessionToolIcon>
  );
}
