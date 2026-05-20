import { Redirect, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import OutlinePillButton from '../../components/ui/OutlinePillButton';
import { AUTH_ROUTES_ENABLED } from '../../constants/features';

export default function LoginScreen() {
  const router = useRouter();

  if (!AUTH_ROUTES_ENABLED) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-sm text-body">登录以后再说</Text>
        <Text className="mt-2 text-sm text-muted">账号同步将在后续版本开放</Text>
        <View className="mt-10 w-full">
          <OutlinePillButton
            label="返回今日"
            onPress={() => router.replace('/')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
