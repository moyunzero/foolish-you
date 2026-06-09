import { useMemo } from 'react';
import { Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors } from '../../constants/design';
import { pickFromPool } from '../../lib/copy/poolUtils';
import { useI18n } from '../../lib/i18n';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../../lib/puzzles/rng';
import { markSoftAskDismissed } from '../../lib/storage/reminderStorage';
import OutlinePillButton from '../ui/OutlinePillButton';

type ReminderSoftAskCardProps = {
  dateKey: string;
  seed: number | null | undefined;
  onOpenReminder: () => void;
};

/** Inline soft ask below StatsCards (D-04). */
export default function ReminderSoftAskCard({
  dateKey,
  seed,
  onOpenReminder,
}: ReminderSoftAskCardProps) {
  const { strings } = useI18n();
  const reminderUi = strings.ui.reminder.softAsk;

  const body = useMemo(() => {
    const baseSeed = seed ?? deriveSeed(dateKey);
    const rng = mulberry32(deriveSubSeed(baseSeed, 'reminder-soft-ask'));
    return pickFromPool(rng, reminderUi.bodies);
  }, [dateKey, seed, reminderUi.bodies]);

  const handleOpenReminder = () => {
    void markSoftAskDismissed();
    onOpenReminder();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(850).duration(420).springify().damping(18)}
      style={{
        marginTop: 24,
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
      <OutlinePillButton
        label={reminderUi.cta}
        onPress={handleOpenReminder}
        accessibilityLabel={reminderUi.ctaA11y}
        className="w-full"
      />
    </Animated.View>
  );
}
