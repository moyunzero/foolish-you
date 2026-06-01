import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { getGameRules } from '../../lib/copy/gameRules';
import { useI18n } from '../../lib/i18n';
import type { GameType } from '../../lib/puzzles/types';
import GameRulesModal from './GameRulesModal';

type GameRulesButtonProps = {
  gameType: GameType;
};

export default function GameRulesButton({ gameType }: GameRulesButtonProps) {
  const { locale, strings } = useI18n();
  const [visible, setVisible] = useState(false);
  const content = getGameRules(locale)[gameType];

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={strings.ui.rules.viewRulesA11y(content.title)}
        hitSlop={8}
        className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-hairline active:opacity-80"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <Text
          accessible={false}
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
