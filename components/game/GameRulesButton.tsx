import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { GAME_RULES } from '../../lib/copy/gameRules';
import type { GameType } from '../../lib/puzzles/types';
import GameRulesModal from './GameRulesModal';

type GameRulesButtonProps = {
  gameType: GameType;
};

export default function GameRulesButton({ gameType }: GameRulesButtonProps) {
  const [visible, setVisible] = useState(false);
  const content = GAME_RULES[gameType];

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`查看${content.title}`}
        hitSlop={8}
        className="items-center justify-center rounded-full border border-hairline active:opacity-80"
        style={{
          width: 28,
          height: 28,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <Text
          className="text-muted"
          style={{
            fontFamily: 'SpaceMono_400Regular',
            fontSize: 14,
            lineHeight: 16,
          }}
        >
          ?
        </Text>
      </Pressable>

      <GameRulesModal
        visible={visible}
        content={content}
        onClose={() => setVisible(false)}
      />
    </>
  );
}
