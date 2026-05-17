import { Text, View } from 'react-native';

import { colors } from '../../constants/design';
import {
  privacyPolicyMeta,
  privacyPolicySections,
} from '../../lib/copy/privacyPolicy';

export default function PrivacyPolicyBody() {
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
          {privacyPolicyMeta.title}
        </Text>
        <Text
          className="mt-2 text-sm text-muted"
          style={{ fontFamily: 'Inter_400Regular', lineHeight: 20 }}
        >
          {`${privacyPolicyMeta.appName} · ${privacyPolicyMeta.developer}`}
        </Text>
        <Text
          className="mt-1 text-xs text-muted"
          style={{ fontFamily: 'SpaceMono_400Regular' }}
        >
          {`最后更新：${privacyPolicyMeta.lastUpdated}`}
        </Text>
      </View>

      {privacyPolicySections.map((section) => (
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
