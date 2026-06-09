import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  ANDROID_REMINDER_CHANNEL_ID,
  DAILY_ROUTINE_NOTIFICATION_ID,
} from './setup';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings?.granted) return 'granted';
  if (settings?.status === 'denied') return 'denied';
  return 'undetermined';
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  const settings = await Notifications.requestPermissionsAsync();
  if (settings?.granted) return 'granted';
  if (settings?.status === 'denied') return 'denied';
  return 'undetermined';
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_ROUTINE_NOTIFICATION_ID);
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  title: string,
  body: string,
): Promise<string | null> {
  await cancelDailyReminder();

  const trigger: Notifications.DailyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
    channelId: Platform.OS === 'android' ? ANDROID_REMINDER_CHANNEL_ID : undefined,
  };

  return Notifications.scheduleNotificationAsync({
    identifier: DAILY_ROUTINE_NOTIFICATION_ID,
    content: {
      title,
      body,
      sound: true,
    },
    trigger,
  });
}
