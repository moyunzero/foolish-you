import { Redirect, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import OutlinePillButton from '../components/ui/OutlinePillButton';
import { colors } from '../constants/design';
import { useDevBottomInset } from '../contexts/DevToolsUiContext';
import { useI18n } from '../lib/i18n';
import type { Locale } from '../lib/i18n/types';

const HORIZONTAL_PADDING = 24;

type PreviewMode = 'system' | Locale;

function LocaleSegment({
  label,
  active,
  onPress,
  a11yLabel,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  a11yLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ selected: active }}
      className={[
        'min-h-[44px] flex-1 items-center justify-center rounded-full border px-3 py-2',
        active ? 'border-accent-sunset bg-accent-sunset/20' : 'border-hairline',
      ].join(' ')}
    >
      <Text
        className="text-sm text-ink"
        style={{ fontFamily: 'Inter_400Regular', fontWeight: active ? '600' : '400' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPadding = useDevBottomInset(insets.bottom + 16);
  const { strings, deviceLocale, localeOverride, setLocaleOverride } = useI18n();

  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  const settingsUi = strings.ui.settings;

  const previewMode: PreviewMode =
    localeOverride === null ? 'system' : localeOverride;

  const deviceLabel =
    deviceLocale === 'zh' ? settingsUi.segments.zh : settingsUi.segments.en;

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
        <Text
          className="text-ink"
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 28,
            fontWeight: '700',
            letterSpacing: -0.6,
          }}
        >
          {settingsUi.title}
        </Text>
        <Text
          className="mt-2 text-body"
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 15,
            lineHeight: 23,
            color: colors.body,
          }}
        >
          {settingsUi.subtitle}
        </Text>
        <Text
          className="mt-3 text-xs text-muted"
          style={{ fontFamily: 'SpaceMono_400Regular', lineHeight: 18 }}
        >
          {settingsUi.deviceLabel(deviceLabel)}
        </Text>
        <Text
          className="mt-2 text-xs text-muted"
          style={{ fontFamily: 'Inter_400Regular', lineHeight: 18 }}
        >
          {settingsUi.previewNote}
        </Text>

        <View className="mt-6 flex-row gap-2">
          <LocaleSegment
            label={settingsUi.segments.system}
            active={previewMode === 'system'}
            a11yLabel={settingsUi.segmentA11y(settingsUi.segments.system)}
            onPress={() => setLocaleOverride(null)}
          />
          <LocaleSegment
            label={settingsUi.segments.zh}
            active={previewMode === 'zh'}
            a11yLabel={settingsUi.segmentA11y(settingsUi.segments.zh)}
            onPress={() => setLocaleOverride('zh')}
          />
          <LocaleSegment
            label={settingsUi.segments.en}
            active={previewMode === 'en'}
            a11yLabel={settingsUi.segmentA11y(settingsUi.segments.en)}
            onPress={() => setLocaleOverride('en')}
          />
        </View>

        <View className="mt-10">
          <OutlinePillButton
            label={strings.ui.common.back}
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
