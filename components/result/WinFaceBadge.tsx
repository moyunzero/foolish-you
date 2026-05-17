import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '../../constants/design';

const SIZE = 88;

/** 通关 SVG：墨镜 + 上扬笑弧（聪明、清醒，和认怂傻脸区分） */
export default function WinFaceBadge() {
  return (
    <View
      accessibilityLabel="通关成就图标，聪明脸"
      style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
        <Circle
          cx={40}
          cy={40}
          r={38}
          fill="rgba(255, 122, 23, 0.16)"
          stroke={colors.accentSunset}
          strokeWidth={1.5}
        />

        {/* 左镜片 */}
        <Rect x={13} y={27} width={24} height={15} rx={7.5} fill={colors.ink} />
        <Rect
          x={13}
          y={27}
          width={24}
          height={15}
          rx={7.5}
          fill="none"
          stroke={colors.accentSunset}
          strokeWidth={2}
        />
        <Rect x={27} y={30} width={6} height={3} rx={1.5} fill={colors.accentSunset} />

        {/* 鼻梁 */}
        <Rect
          x={37}
          y={33}
          width={6}
          height={2.5}
          rx={1.25}
          fill={colors.accentSunset}
        />

        {/* 右镜片 */}
        <Rect x={43} y={27} width={24} height={15} rx={7.5} fill={colors.ink} />
        <Rect
          x={43}
          y={27}
          width={24}
          height={15}
          rx={7.5}
          fill="none"
          stroke={colors.accentSunset}
          strokeWidth={2}
        />
        <Rect x={47} y={30} width={6} height={3} rx={1.5} fill={colors.accentSunset} />

        {/* 上扬笑弧：控制点在下方 → 嘴角上扬 */}
        <Path
          d="M 23 52 Q 40 64 57 52"
          stroke={colors.ink}
          strokeWidth={2.8}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}
