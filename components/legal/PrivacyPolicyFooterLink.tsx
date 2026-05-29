import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { DEV_TOOLS_ENABLED } from '../../constants/dev';
import { colors } from '../../constants/design';
import { useDevToolsUi } from '../../contexts/DevToolsUiContext';
import { useI18n } from '../../lib/i18n';

type PrivacyPolicyFooterLinkProps = {
  className?: string;
};

/** 结果页等底部的「隐私政策」入口 */
export default function PrivacyPolicyFooterLink({
  className,
}: PrivacyPolicyFooterLinkProps) {
  const router = useRouter();
  const { toggleBar } = useDevToolsUi();
  const { strings } = useI18n();
  const legal = strings.ui.legal;

  return (
    <Pressable
      onPress={() => router.push('/privacy')}
      onLongPress={DEV_TOOLS_ENABLED ? toggleBar : undefined}
      delayLongPress={500}
      accessibilityRole="link"
      accessibilityLabel={legal.privacyA11y}
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
        {legal.privacyLink}
      </Text>
    </Pressable>
  );
}
