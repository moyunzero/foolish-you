import { Text } from 'react-native';

import { GAME_HEADER_META_STYLE } from './gameHeaderMetaStyle';

type GameStreakSublineProps = {
  line: string | null | undefined;
};

/** Freeze consumed or missed-yesterday recall copy under the game title. */
export default function GameStreakSubline({ line }: GameStreakSublineProps) {
  if (line == null || line === '') {
    return null;
  }

  return (
    <Text className="text-muted" numberOfLines={2} style={GAME_HEADER_META_STYLE}>
      {line}
    </Text>
  );
}
