import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { colors } from '../../constants/design';
import { formatDefeatHintCaption } from '../../lib/i18n/format';
import { useI18n } from '../../lib/i18n';

type VictoryStatProps = {
  variant: 'victory';
  elapsed: string;
};

type DefeatStatProps = {
  variant: 'defeat';
  percent: number;
  hint: string;
};

type ResultStatCardProps = VictoryStatProps | DefeatStatProps;

const statCardShellStyle = {
  marginTop: 40,
  paddingVertical: 16,
  paddingHorizontal: 18,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.hairline,
  backgroundColor: colors.canvasCard,
} as const;

function StatCardShell({ children }: { children: ReactNode }) {
  return <View style={statCardShellStyle}>{children}</View>;
}

export default function ResultStatCard(props: ResultStatCardProps) {
  const { strings, locale } = useI18n();
  const resultUi = strings.ui.result;

  if (props.variant === 'victory') {
    return (
      <StatCardShell>
        <Text
          style={{
            fontFamily: 'SpaceMono_400Regular',
            fontSize: 15,
            color: colors.ink,
          }}
        >
          {`${resultUi.elapsedPrefix}${props.elapsed}`}
        </Text>
      </StatCardShell>
    );
  }

  const clamped = Math.min(100, Math.max(0, props.percent));

  return (
    <StatCardShell>
      <Text
        accessible={false}
        style={{
          fontFamily: 'SpaceMono_400Regular',
          fontSize: 15,
          color: colors.ink,
        }}
      >
        {`${resultUi.foolIndexPrefix}${clamped}%`}
      </Text>

      <View
        accessibilityRole="progressbar"
        accessibilityLabel={`${resultUi.foolIndexPrefix}${clamped}%`}
        accessibilityValue={{ min: 0, max: 100, now: clamped }}
        style={{
          marginTop: 12,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.hairline,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${clamped}%`,
            height: '100%',
            borderRadius: 4,
            backgroundColor: colors.sudokuError,
          }}
        />
      </View>

      <Text
        style={{
          marginTop: 10,
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
          color: colors.muted,
        }}
      >
        {formatDefeatHintCaption(props.hint, locale)}
      </Text>
    </StatCardShell>
  );
}
