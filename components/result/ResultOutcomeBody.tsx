import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';

import { colors } from '../../constants/design';
import { getLocalDateKey } from '../../lib/date/localDay';
import { useI18n } from '../../lib/i18n';

const PUNCHLINE_STYLE = {
  fontFamily: 'Inter_400Regular' as const,
  fontSize: 26,
  lineHeight: 34,
  fontWeight: '700' as const,
  textAlign: 'center' as const,
};

type ResultOutcomeBodyProps = {
  badge: ReactNode;
  statusLabel: string;
  statusTone: 'victory' | 'defeat';
  headline: string;
  punchline: string;
  sublines: string[];
  /** Opening snapshot dateKey — carry terminal uses recordPrefixCarry (D-17). */
  openingDateKey?: string | null;
};

export default function ResultOutcomeBody({
  badge,
  statusLabel,
  statusTone,
  headline,
  punchline,
  sublines,
  openingDateKey,
}: ResultOutcomeBodyProps) {
  const { strings } = useI18n();
  const statusColor =
    statusTone === 'victory' ? colors.accentSunset : colors.sudokuError;
  const visibleSublines = sublines.slice(0, 1);
  const wallTodayKey = getLocalDateKey();
  const recordPrefix =
    openingDateKey != null &&
    openingDateKey !== '' &&
    openingDateKey < wallTodayKey
      ? strings.ui.result.recordPrefixCarry
      : strings.ui.result.recordPrefix;

  return (
    <View className="items-center">
      <Animated.View entering={ZoomIn.duration(520).springify()}>
        {badge}
      </Animated.View>

      <Animated.View entering={FadeIn.delay(180).duration(400)}>
        <Text
          className="mt-5 text-[13px]"
          style={{
            fontFamily: 'SpaceMono_400Regular',
            color: statusColor,
          }}
        >
          {`${recordPrefix} ${statusLabel}`}
        </Text>
        <Text
          className="mt-1 text-center text-[12px] text-muted"
          style={{ fontFamily: 'SpaceMono_400Regular' }}
        >
          {headline}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(280).duration(450).springify()}>
        <Text
          testID="result-punchline"
          className="mt-8 text-center text-ink"
          style={PUNCHLINE_STYLE}
        >
          {punchline}
        </Text>
      </Animated.View>

      <View className="mt-6 w-full" style={{ gap: 28 }}>
        {visibleSublines.map((line) => (
          <Animated.View
            key={line}
            entering={FadeInDown.delay(420).duration(400).springify()}
          >
            <Text
              className="text-center text-base leading-7 text-body"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {line}
            </Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
