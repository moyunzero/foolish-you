import { Pressable, Text, View } from 'react-native';

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
};

/** 游戏页底栏：Undo + 状态提示 + 完成主按钮 / 认怂文字链 */
export default function GameScreenFooter({
  statusHint,
  canComplete,
  canUndo,
  onUndo,
  onComplete,
  onAbandon,
}: GameScreenFooterProps) {
  const { strings } = useI18n();
  const ui = strings.ui;
  const bailLabel = ui.game.bailToday;

  return (
    <View className="gap-3 border-t border-hairline pt-4">
      {statusHint != null ? (
        <Text
          className={canComplete ? 'text-accent-sunset' : 'text-body'}
          style={{
            fontFamily: 'SpaceMono_400Regular',
            fontSize: 12,
            lineHeight: 16,
            textAlign: 'center',
          }}
        >
          {statusHint}
        </Text>
      ) : null}

      <UndoButton canUndo={canUndo} onUndo={onUndo} />

      <OutlinePillButton
        label={ui.game.completeToday}
        variant={canComplete ? 'primary' : 'outline'}
        disabled={!canComplete}
        onPress={onComplete}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={bailLabel}
        onPress={onAbandon}
        className="min-h-[44px] items-center justify-center px-4"
      >
        <Text
          className="text-muted"
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            lineHeight: 24,
          }}
        >
          {bailLabel}
        </Text>
      </Pressable>
    </View>
  );
}
