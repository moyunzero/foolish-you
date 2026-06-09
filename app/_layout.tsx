import '../global.css';
import '../lib/notifications/setup';

import {
  Inter_400Regular,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import {
  SpaceMono_400Regular,
  useFonts as useSpaceMonoFonts,
} from '@expo-google-fonts/space-mono';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DevToolsPanel from '../components/dev/DevToolsPanel';
import { colors } from '../constants/design';
import { DEV_TOOLS_ENABLED } from '../constants/dev';
import { DailyGameProvider } from '../contexts/DailyGameContext';
import { DevToolsUiProvider } from '../contexts/DevToolsUiContext';
import { I18nProvider } from '../lib/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded] = useInterFonts({ Inter_400Regular });
  const [monoLoaded] = useSpaceMonoFonts({ SpaceMono_400Regular });
  const fontsReady = interLoaded && monoLoaded;

  useEffect(() => {
    if (fontsReady) {
      void SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return <View className="flex-1 bg-canvas" style={{ backgroundColor: colors.canvas }} />;
  }

  return (
    <GestureHandlerRootView className="flex-1 bg-canvas">
      <SafeAreaProvider>
        <I18nProvider>
          <DailyGameProvider>
            <DevToolsUiProvider>
              <View className="flex-1">
                <StatusBar style="light" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.canvas },
                    animation: 'fade',
                  }}
                />
                {DEV_TOOLS_ENABLED ? <DevToolsPanel /> : null}
              </View>
            </DevToolsUiProvider>
          </DailyGameProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
