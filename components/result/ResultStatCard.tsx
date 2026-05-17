import { Text, View } from 'react-native';

import { colors } from '../../constants/design';

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

export default function ResultStatCard(props: ResultStatCardProps) {
  if (props.variant === 'victory') {
    return (
      <View
        style={{
          marginTop: 40,
          paddingVertical: 16,
          paddingHorizontal: 18,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.hairline,
          backgroundColor: colors.canvasCard,
        }}
      >
        <Text
          style={{
            fontFamily: 'SpaceMono_400Regular',
            fontSize: 15,
            color: colors.ink,
          }}
        >
          {`用时：${props.elapsed}`}
        </Text>
      </View>
    );
  }

  const clamped = Math.min(100, Math.max(0, props.percent));

  return (
    <View
      style={{
        marginTop: 40,
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.hairline,
        backgroundColor: colors.canvasCard,
      }}
    >
      <Text
        style={{
          fontFamily: 'SpaceMono_400Regular',
          fontSize: 15,
          color: colors.ink,
        }}
      >
        {`傻了指数：${clamped}%`}
      </Text>

      <View
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
        {`（${props.hint}）`}
      </Text>
    </View>
  );
}
