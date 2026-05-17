import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { DEV_TOOLS_ENABLED } from '../../constants/dev';
import { colors } from '../../constants/design';
import { useDevToolsUi } from '../../contexts/DevToolsUiContext';

type PrivacyPolicyFooterLinkProps = {
  className?: string;
};

/** 结果页等底部的「隐私政策」入口 */
export default function PrivacyPolicyFooterLink({
  className,
}: PrivacyPolicyFooterLinkProps) {
  const router = useRouter();
  const { toggleBar } = useDevToolsUi();

  return (
    <Pressable
      onPress={() => router.push('/privacy')}
      onLongPress={DEV_TOOLS_ENABLED ? toggleBar : undefined}
      delayLongPress={500}
      accessibilityRole="link"
      accessibilityLabel="查看隐私政策"
      className={['min-h-[44px] items-center justify-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Text
        className="text-xs text-muted underline"
        style={{
          fontFamily: 'Inter_400Regular',
          color: colors.muted,
          textDecorationLine: 'underline',
        }}
      >
        隐私政策
      </Text>
    </Pressable>
  );
}
