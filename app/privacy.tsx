import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import PrivacyPolicyBody from '../components/legal/PrivacyPolicyBody';
import OutlinePillButton from '../components/ui/OutlinePillButton';
import { PRIVACY_POLICY_URL } from '../constants/legal';
import { colors } from '../constants/design';
import { useDevBottomInset } from '../contexts/DevToolsUiContext';
import { useI18n } from '../lib/i18n';

const HORIZONTAL_PADDING = 24;

export default function PrivacyScreen() {
  const router = useRouter();
  const { strings } = useI18n();
  const privacyUi = strings.ui.privacy;
  const insets = useSafeAreaInsets();
  const bottomPadding = useDevBottomInset(insets.bottom + 16);

  async function openPublicPolicy() {
    const canOpen = await Linking.canOpenURL(PRIVACY_POLICY_URL);
    if (!canOpen) {
      Alert.alert(
        privacyUi.cannotOpenLinkTitle,
        privacyUi.cannotOpenLinkMessage,
      );
      return;
    }
    await Linking.openURL(PRIVACY_POLICY_URL);
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingTop: 8,
          paddingBottom: bottomPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <PrivacyPolicyBody />

        <View className="mt-8 gap-3">
          <OutlinePillButton
            label={privacyUi.openInBrowser}
            variant="primary"
            onPress={() => void openPublicPolicy()}
          />
          <Pressable
            onPress={() => void openPublicPolicy()}
            accessibilityRole="link"
            accessibilityLabel={privacyUi.publicUrlA11y}
            className="min-h-[44px] items-center justify-center"
          >
            <Text
              className="text-center text-xs text-muted"
              style={{
                fontFamily: 'SpaceMono_400Regular',
                color: colors.muted,
              }}
            >
              {PRIVACY_POLICY_URL}
            </Text>
          </Pressable>
          <OutlinePillButton
            label={strings.ui.common.back}
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
