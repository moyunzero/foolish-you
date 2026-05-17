import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../../constants/design';

const SIZE = 88;

/** 认怂 SVG：圆眼 + 下撇嘴（和通关墨镜脸区分） */
export default function FoolFaceBadge() {
  return (
    <View
      accessibilityLabel="傻了成就图标"
      style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
        <Circle
          cx={40}
          cy={40}
          r={38}
          fill="rgba(255, 122, 23, 0.14)"
          stroke={colors.accentSunset}
          strokeWidth={1.5}
        />

        <Circle cx={28} cy={36} r={5} fill={colors.ink} />
        <Circle cx={52} cy={36} r={5} fill={colors.ink} />

        {/* 张嘴傻：控制点在上方 → 嘴角下垂 */}
        <Path
          d="M 24 54 Q 40 44 56 54"
          stroke={colors.ink}
          strokeWidth={2.8}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}
