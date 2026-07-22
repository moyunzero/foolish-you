import { Text } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { GAME_HEADER_META_STYLE } from './gameHeaderMetaStyle';

type GameHostIntroProps = {
  line: string;
};

/** Seeded host opening line under type title; fades out on board interact (D-03). */
export default function GameHostIntro({ line }: GameHostIntroProps) {
  return (
    <Animated.View exiting={FadeOut.duration(280)}>
      <Text
        testID="game-host-intro"
        className="text-muted"
        numberOfLines={2}
        style={GAME_HEADER_META_STYLE}
      >
        {line}
      </Text>
    </Animated.View>
  );
}
