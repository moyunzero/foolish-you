import { Pressable, Text, View } from 'react-native';

import { colors } from '../../constants/design';
import { getGameRules } from '../../lib/copy/gameRules';
import { useI18n } from '../../lib/i18n';
import type { GameType } from '../../lib/puzzles/types';
import BottomSheetShell from '../ui/BottomSheetShell';
import OutlinePillButton from '../ui/OutlinePillButton';

type FirstTypeIntroSheetProps = {
  visible: boolean;
  gameType: GameType;
  onDismiss: () => void;
};

/**
 * First-deal rules/ops intro — skippable; no solution hints or board fill (D-16..D-18, D-24).
 */
export default function FirstTypeIntroSheet({
  visible,
  gameType,
  onDismiss,
}: FirstTypeIntroSheetProps) {
  const { locale, strings } = useI18n();
  const introUi = strings.ui.firstIntro;
  const content = getGameRules(locale)[gameType];

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onDismiss}
      dismissA11y={strings.ui.sheet.dismissFirstIntroA11y}
    >
      <View className="px-5 pb-2">
        <Text
          className="text-center text-ink"
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 18,
            fontWeight: '700',
            letterSpacing: -0.3,
          }}
        >
          {introUi.title(content.title)}
        </Text>
        <Text
          className="mt-3 text-center text-body"
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            lineHeight: 21,
          }}
        >
          {content.intro}
        </Text>

        <View className="mt-4 gap-2.5">
          {content.bullets.map((line) => (
            <View key={line} className="flex-row gap-2.5">
              <Text
                className="text-accent-sunset"
                style={{
                  fontFamily: 'SpaceMono_400Regular',
                  fontSize: 13,
                  lineHeight: 20,
                }}
              >
                ·
              </Text>
              <Text
                className="flex-1 text-body"
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  lineHeight: 21,
                }}
              >
                {line}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-6 border-t border-hairline pt-4" style={{ gap: 12 }}>
          <OutlinePillButton
            label={introUi.skip}
            variant="primary"
            onPress={onDismiss}
            className="w-full"
            accessibilityLabel={introUi.skipA11y}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={introUi.gotItA11y}
            onPress={onDismiss}
            className="min-h-[44px] items-center justify-center px-4"
          >
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                lineHeight: 24,
                color: colors.muted,
              }}
            >
              {introUi.gotIt}
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheetShell>
  );
}
