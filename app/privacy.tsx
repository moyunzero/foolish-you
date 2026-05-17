import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import PrivacyPolicyBody from '../components/legal/PrivacyPolicyBody';
import OutlinePillButton from '../components/ui/OutlinePillButton';
import { PRIVACY_POLICY_URL } from '../constants/legal';
import { colors } from '../constants/design';
import { useDevBottomInset } from '../contexts/DevToolsUiContext';

const HORIZONTAL_PADDING = 24;

async function openPublicPolicy() {
  const canOpen = await Linking.canOpenURL(PRIVACY_POLICY_URL);
  if (!canOpen) {
    Alert.alert('无法打开链接', '请稍后重试，或在浏览器中访问公开隐私政策页面。');
    return;
  }
  await Linking.openURL(PRIVACY_POLICY_URL);
}

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPadding = useDevBottomInset(insets.bottom + 16);

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
            label="在浏览器中打开公开版"
            variant="primary"
            onPress={() => void openPublicPolicy()}
          />
          <Pressable
            onPress={() => void openPublicPolicy()}
            accessibilityRole="link"
            accessibilityLabel="公开隐私政策网址"
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
          <OutlinePillButton label="返回" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
