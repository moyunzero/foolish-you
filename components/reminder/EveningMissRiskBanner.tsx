import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors } from '../../constants/design';
import { useI18n } from '../../lib/i18n';
import OutlinePillButton from '../ui/OutlinePillButton';

type EveningMissRiskBannerProps = {
  reminderEnabled: boolean;
  horizontalPadding?: number;
  onOpenReminder: () => void;
  onDismiss: () => void;
};

/** D-path banner — 20:00+ playing, independent row below header (D-13). */
export default function EveningMissRiskBanner({
  reminderEnabled,
  horizontalPadding = 24,
  onOpenReminder,
  onDismiss,
}: EveningMissRiskBannerProps) {
  const { strings } = useI18n();
  const bannerUi = strings.ui.reminder.banner;
  const later = strings.ui.common.later;

  const body = reminderEnabled ? bannerUi.bodyHasPush : bannerUi.bodyNoPush;
  const cta = reminderEnabled ? bannerUi.ctaEdit : bannerUi.ctaEnable;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{ paddingHorizontal: horizontalPadding, paddingTop: 8 }}
    >
      <View
        style={{
          borderLeftWidth: 4,
          borderLeftColor: colors.accentSunset,
          borderWidth: 1,
          borderColor: colors.hairline,
          backgroundColor: colors.canvasCard,
          borderRadius: 12,
          padding: 16,
          gap: 12,
        }}
      >
        <Text
          className="text-sm text-body"
          style={{ fontFamily: 'Inter_400Regular', lineHeight: 22 }}
        >
          {body}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={bannerUi.dismissA11y}
            onPress={onDismiss}
            className="min-h-[44px] flex-1 items-center justify-center rounded-full border border-hairline px-4 py-3 active:opacity-85"
          >
            <Text className="text-base font-normal text-ink">{later}</Text>
          </Pressable>
          <OutlinePillButton
            label={cta}
            onPress={onOpenReminder}
            accessibilityLabel={cta}
            className="flex-1"
          />
        </View>
      </View>
    </Animated.View>
  );
}
