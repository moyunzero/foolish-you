import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../constants/design';

type SessionToolIconProps = {
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Host Desk Path B — icon tool (≥44pt hit) in the session chrome. */
export default function SessionToolIcon({
  accessibilityLabel,
  onPress,
  disabled = false,
  selected = false,
  children,
  style,
}: SessionToolIconProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          width: 44,
          height: 44,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: selected ? colors.accentSunset : colors.hairline,
          backgroundColor: selected
            ? 'rgba(255, 122, 23, 0.12)'
            : 'rgba(0, 0, 0, 0.25)',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function UndoGlyph({ color = colors.ink }: { color?: string }) {
  return (
    <Svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="M9 14 4 9l5-5"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 9h11a4 4 0 1 1 0 8h-4"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ClearGlyph({ color = colors.ink }: { color?: string }) {
  return (
    <Svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="M4 7h16"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M10 7V5h4v2"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 7l1 12h6l1-12"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PencilGlyph({ color = colors.ink }: { color?: string }) {
  return (
    <Svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="m12 19 7-7 2 2-7 7H9v-3z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m15 5-9 9v3h3l9-9z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
