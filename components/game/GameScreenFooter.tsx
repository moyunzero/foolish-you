import { Text, View } from 'react-native';

import { useI18n } from '../../lib/i18n';
import OutlinePillButton from '../ui/OutlinePillButton';

type GameScreenFooterProps = {
  statusHint: string | null;
  canComplete: boolean;
  onComplete: () => void;
  onAbandon: () => void;
};

/** 游戏页底栏：状态提示 + 完成/放弃（数独 / 二进制 / 数绘 / 数回共用） */
export default function GameScreenFooter({
  statusHint,
  canComplete,
  onComplete,
  onAbandon,
}: GameScreenFooterProps) {
  const { strings } = useI18n();
  const ui = strings.ui;

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

      <OutlinePillButton
        label={ui.game.completeToday}
        variant={canComplete ? 'primary' : 'outline'}
        disabled={!canComplete}
        onPress={onComplete}
      />

      <OutlinePillButton
        label={ui.game.giveUpToday}
        variant="outline"
        onPress={onAbandon}
        className="min-h-[40px] border-transparent py-2 opacity-80"
      />
    </View>
  );
}
