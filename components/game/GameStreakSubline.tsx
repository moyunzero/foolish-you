import { Text } from 'react-native';

import { GAME_HEADER_META_STYLE } from './gameHeaderMetaStyle';

type GameStreakSublineProps = {
  line: string | null | undefined;
};

/** Optional streak / Sunday Special subline under the game title (single slot). */
export default function GameStreakSubline({ line }: GameStreakSublineProps) {
  if (line == null || line === '') {
    return null;
  }

  return (
    <Text
      testID="game-streak-subline"
      className="text-muted"
      numberOfLines={2}
      style={GAME_HEADER_META_STYLE}
    >
      {line}
    </Text>
  );
}
