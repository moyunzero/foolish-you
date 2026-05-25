import { Text, View } from 'react-native';

import OutlinePillButton from '../ui/OutlinePillButton';

type GameScreenFooterProps = {
  statusHint: string | null;
  canComplete: boolean;
  onComplete: () => void;
  onAbandon: () => void;
};

/** 游戏页底栏：状态提示 + 完成/放弃（数独 / 二进制 / 数绘共用） */
export default function GameScreenFooter({
  statusHint,
  canComplete,
  onComplete,
  onAbandon,
}: GameScreenFooterProps) {
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
        label="完成今日"
        variant={canComplete ? 'primary' : 'outline'}
        disabled={!canComplete}
        onPress={onComplete}
      />

      <OutlinePillButton
        label="放弃今日挑战"
        variant="outline"
        onPress={onAbandon}
        className="min-h-[40px] border-transparent py-2 opacity-80"
      />
    </View>
  );
}
