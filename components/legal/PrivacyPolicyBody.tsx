import { Text, View } from 'react-native';

import {
  DEVELOPER_ENTITY,
  PRIVACY_POLICY_LAST_UPDATED,
} from '../../constants/legal';
import { colors } from '../../constants/design';
import { useI18n } from '../../lib/i18n';

export default function PrivacyPolicyBody() {
  const { strings } = useI18n();
  return (
    <View className="gap-6">
      <View>
        <Text
          className="text-ink"
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 28,
            fontWeight: '700',
            letterSpacing: -0.6,
          }}
        >
          {strings.privacy.title}
        </Text>
        <Text
          className="mt-2 text-sm text-muted"
          style={{ fontFamily: 'Inter_400Regular', lineHeight: 20 }}
        >
          {`${strings.app.name} · ${DEVELOPER_ENTITY}`}
        </Text>
        <Text
          className="mt-1 text-xs text-muted"
          style={{ fontFamily: 'SpaceMono_400Regular' }}
        >
          {strings.ui.legal.lastUpdated(PRIVACY_POLICY_LAST_UPDATED)}
        </Text>
      </View>

      {strings.privacy.sections.map((section) => (
        <View key={section.title}>
          <Text
            className="text-ink"
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 17,
              fontWeight: '600',
              letterSpacing: -0.2,
            }}
          >
            {section.title}
          </Text>
          <View className="mt-2 gap-3">
            {section.paragraphs.map((paragraph) => (
              <Text
                key={paragraph}
                className="text-body"
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 15,
                  lineHeight: 23,
                  color: colors.body,
                }}
              >
                {paragraph}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
