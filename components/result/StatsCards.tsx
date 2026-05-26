import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors } from '../../constants/design';
import type { StatsCardsData } from '../../lib/stats/computeStatsCards';

type StatsCardsProps = {
  data: StatsCardsData;
};

function StatsMiniCard({
  label,
  value,
  subline,
  index,
}: StatsCardsData['cards'][number] & { index: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(720 + index * 70)
        .duration(420)
        .springify()
        .damping(18)}
      style={{
        flexGrow: 1,
        flexBasis: '30%',
        minWidth: 96,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.hairline,
        backgroundColor: colors.canvasCard,
      }}
    >
      <Text
        className="text-[10px] uppercase tracking-widest text-muted"
        style={{ fontFamily: 'SpaceMono_400Regular' }}
      >
        {label}
      </Text>
      <Text
        className="mt-2 text-lg text-ink"
        style={{
          fontFamily: 'Inter_400Regular',
          fontWeight: '700',
          letterSpacing: -0.3,
        }}
      >
        {value}
      </Text>
      <Text
        className="mt-2 text-xs leading-4 text-muted"
        style={{ fontFamily: 'Inter_400Regular' }}
        numberOfLines={2}
      >
        {subline}
      </Text>
    </Animated.View>
  );
}

export default function StatsCards({ data }: StatsCardsProps) {
  return (
    <View className="flex-row flex-wrap gap-2" style={{ marginTop: 28 }}>
      {data.cards.map((card, index) => (
        <StatsMiniCard key={card.label} {...card} index={index} />
      ))}
    </View>
  );
}
