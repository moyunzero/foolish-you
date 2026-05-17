import { Text, View } from 'react-native';

type GameToolbarProps = {
  elapsed: string;
};

/** 游戏页顶部：本局用时 */
export default function GameToolbar({ elapsed }: GameToolbarProps) {
  return (
    <View className="mt-4 flex-row items-center">
      <View
        className="flex-row items-center rounded-full border border-hairline px-3 py-1.5"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
      >
        <Text
          className="text-muted"
          style={{ fontFamily: 'SpaceMono_400Regular', fontSize: 11 }}
        >
          用时
        </Text>
        <Text
          className="ml-2 text-ink"
          style={{ fontFamily: 'SpaceMono_400Regular', fontSize: 14 }}
        >
          {elapsed}
        </Text>
      </View>
    </View>
  );
}
