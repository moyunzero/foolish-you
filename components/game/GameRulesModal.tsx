import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { colors } from '../../constants/design';
import type { GameRulesContent } from '../../lib/copy/gameRules';
import { useI18n } from '../../lib/i18n';

type GameRulesModalProps = {
  visible: boolean;
  content: GameRulesContent;
  onClose: () => void;
};

export default function GameRulesModal({
  visible,
  content,
  onClose,
}: GameRulesModalProps) {
  const { strings } = useI18n();
  const rulesUi = strings.ui.rules;
  const common = strings.ui.common;
  const { height: windowHeight } = useWindowDimensions();
  const maxScrollHeight = Math.min(windowHeight * 0.5, 360);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-center px-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={rulesUi.closeA11y}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="overflow-hidden rounded-lg border border-hairline bg-canvas-card"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.45,
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          <View className="border-b border-hairline px-5 py-4">
            <Text
              className="text-ink"
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 20,
                fontWeight: '700',
                letterSpacing: -0.4,
              }}
            >
              {content.title}
            </Text>
          </View>

          <ScrollView
            style={{ maxHeight: maxScrollHeight }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              className="text-body"
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              {content.intro}
            </Text>

            <View className="mt-4 gap-3">
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
          </ScrollView>

          <View className="border-t border-hairline px-5 py-3">
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={common.gotIt}
              className="min-h-[44px] items-center justify-center rounded-full active:opacity-85"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="text-on-primary"
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {common.gotIt}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
