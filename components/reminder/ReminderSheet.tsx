import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import BottomSheetShell from '../ui/BottomSheetShell';
import OutlinePillButton from '../ui/OutlinePillButton';
import { colors } from '../../constants/design';
import { useI18n } from '../../lib/i18n';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
} from '../../lib/notifications/reminderScheduler';
import { runReminderSyncWithState } from '../../lib/notifications/runReminderSync';
import {
  loadReminderState,
  saveReminderState,
} from '../../lib/storage/reminderStorage';
import type { ReminderState } from '../../lib/reminder/types';
import { suggestedReminderTime } from '../../lib/reminder/suggestedReminderTime';
import type { DailyStatus } from '../../lib/puzzles/types';

type ReminderSheetProps = {
  visible: boolean;
  onClose: () => void;
  dateKey: string | null;
  seed: number | null;
  todayStatus: DailyStatus | 'loading';
  onReminderChange?: (state: ReminderState) => void;
};

function toPickerDate(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** Toggle + time only — no Release Settings (D-14). */
export default function ReminderSheet({
  visible,
  onClose,
  dateKey,
  seed,
  todayStatus,
  onReminderChange,
}: ReminderSheetProps) {
  const { strings, locale } = useI18n();
  const sheetUi = strings.ui.reminder.sheet;
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setLoading(true);

    void (async () => {
      const state = await loadReminderState();
      if (cancelled) return;
      const suggested = suggestedReminderTime(state.firstOpenHour);
      setEnabled(state.enabled);
      setHour(state.hour ?? suggested.hour);
      setMinute(state.minute ?? suggested.minute);
      setPermissionDenied(state.permissionDenied);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  const persistAndSync = useCallback(
    async (next: ReminderState) => {
      setSaving(true);
      await saveReminderState(next);
      onReminderChange?.(next);
      if (dateKey != null) {
        await runReminderSyncWithState({
          todayKey: dateKey,
          todayStatus,
          seed,
          locale,
          localHour: new Date().getHours(),
          enabled: next.enabled,
          hour: next.hour,
          minute: next.minute,
        });
      }
      setSaving(false);
    },
    [dateKey, todayStatus, seed, locale, onReminderChange],
  );

  const handleToggle = useCallback(
    async (nextEnabled: boolean) => {
      if (!nextEnabled) {
        const next: ReminderState = {
          ...(await loadReminderState()),
          enabled: false,
        };
        setEnabled(false);
        await persistAndSync(next);
        return;
      }

      const current = await loadReminderState();
      const status = current.permissionDenied
        ? await requestNotificationPermission()
        : await getNotificationPermissionStatus().then(async (s) =>
            s === 'granted' ? 'granted' : requestNotificationPermission(),
          );

      if (status !== 'granted') {
        setEnabled(false);
        setPermissionDenied(true);
        const denied: ReminderState = {
          ...current,
          enabled: false,
          permissionDenied: true,
        };
        await saveReminderState(denied);
        onReminderChange?.(denied);
        return;
      }

      setPermissionDenied(false);
      setEnabled(true);
      const next: ReminderState = {
        ...current,
        enabled: true,
        permissionDenied: false,
        hour,
        minute,
      };
      await persistAndSync(next);
    },
    [hour, minute, persistAndSync, onReminderChange],
  );

  const handleTimeChange = useCallback(
    (_event: DateTimePickerEvent, selected?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }
      if (selected == null) return;
      const h = selected.getHours();
      const m = selected.getMinutes();
      setHour(h);
      setMinute(m);
      void (async () => {
        const current = await loadReminderState();
        const next: ReminderState = { ...current, hour: h, minute: m };
        await persistAndSync(next);
      })();
    },
    [persistAndSync],
  );

  const handleClose = useCallback(async () => {
    const current = await loadReminderState();
    await persistAndSync({ ...current, enabled, hour, minute });
    onClose();
  }, [enabled, hour, minute, onClose, persistAndSync]);

  const timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <BottomSheetShell
      visible={visible}
      onClose={() => void handleClose()}
      dismissA11y={strings.ui.sheet.dismissReminderA11y}
    >
      <View className="px-5 pb-2">
        <Text
          className="text-xl font-bold text-ink"
          style={{ fontFamily: 'Inter_700Bold' }}
        >
          {sheetUi.title}
        </Text>

        {loading ? (
          <View className="min-h-[120px] items-center justify-center">
            <ActivityIndicator color={colors.muted} />
          </View>
        ) : (
          <>
            <View className="mt-4 min-h-[44px] flex-row items-center justify-between">
              <Text
                className="text-sm text-body"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {sheetUi.toggleLabel}
              </Text>
              <Switch
                value={enabled}
                disabled={saving}
                onValueChange={(v) => void handleToggle(v)}
                accessibilityRole="switch"
                accessibilityLabel={sheetUi.toggleA11y}
                accessibilityState={{ checked: enabled }}
                trackColor={{ false: colors.hairline, true: colors.accentSunset }}
                thumbColor={colors.ink}
              />
            </View>

            <Pressable
              onPress={() => setShowPicker(true)}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel={sheetUi.timeA11y(hour, minute)}
              className="mt-3 min-h-[44px] flex-row items-center justify-between rounded-lg border border-hairline px-3"
            >
              <Text
                className="text-sm text-body"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {sheetUi.timeLabel}
              </Text>
              <Text
                className="text-sm text-ink"
                style={{ fontFamily: 'SpaceMono_400Regular' }}
              >
                {timeLabel}
              </Text>
            </Pressable>

            {permissionDenied ? (
              <Text
                className="mt-3 text-xs text-muted"
                style={{ fontFamily: 'Inter_400Regular', color: colors.muted }}
              >
                {strings.ui.reminder.errorPermissionDenied}
              </Text>
            ) : (
              <Text
                className="mt-3 text-xs text-muted"
                style={{ fontFamily: 'Inter_400Regular', color: colors.muted }}
              >
                {sheetUi.privacyHint}
              </Text>
            )}

            {(showPicker || Platform.OS === 'ios') && !loading ? (
              <DateTimePicker
                value={toPickerDate(hour, minute)}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            ) : null}
          </>
        )}

        <View className="mt-4 border-t border-hairline pt-3">
          <OutlinePillButton
            label={strings.ui.common.gotIt}
            variant="primary"
            onPress={() => void handleClose()}
            disabled={loading || saving}
            className="w-full"
          />
        </View>
      </View>
    </BottomSheetShell>
  );
}
