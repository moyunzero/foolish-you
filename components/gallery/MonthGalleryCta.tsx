import * as Sharing from 'expo-sharing';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Share, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { colors } from '../../constants/design';
import {
  buildMonthGallery,
  monthHasGalleryRecords,
} from '../../lib/gallery/buildMonthGallery';
import { resolveGalleryCell } from '../../lib/gallery/resolveGalleryCell';
import { useI18n } from '../../lib/i18n';
import type { CompletionEntry } from '../../lib/storage/completionHistoryStorage';
import OutlinePillButton from '../ui/OutlinePillButton';
import MonthGalleryComposer from './MonthGalleryComposer';

type GalleryCtaState = 'idle' | 'generating' | 'error';

type MonthGalleryCtaProps = {
  monthKey: string;
  monthTitle: string;
  todayKey: string;
  entries: CompletionEntry[];
};

function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export default function MonthGalleryCta({
  monthKey,
  monthTitle,
  todayKey,
  entries,
}: MonthGalleryCtaProps) {
  const { locale, strings } = useI18n();
  const galleryUi = strings.ui.gallery;
  const [state, setState] = useState<GalleryCtaState>('idle');
  const composerRef = useRef<View>(null);
  const [composerCells, setComposerCells] = useState<
    ReturnType<typeof resolveGalleryCell>[]
  >([]);

  const enabled = useMemo(
    () => monthHasGalleryRecords(monthKey, entries),
    [monthKey, entries],
  );

  const label =
    state === 'generating'
      ? galleryUi.generating
      : state === 'error'
        ? galleryUi.retry
        : galleryUi.generateCta;

  const handlePress = useCallback(async () => {
    if (!enabled || state === 'generating') return;

    setState('generating');
    try {
      const days = buildMonthGallery({ monthKey, todayKey, entries });
      const cells = days.map((day) =>
        resolveGalleryCell({ dateKey: day.dateKey, outcome: day.outcome }),
      );
      setComposerCells(cells);
      await waitForLayout();
      await waitForLayout();

      const uri = await captureRef(composerRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: galleryUi.shareDialogTitle,
        });
      } else {
        await Share.share({ url: uri });
      }
      setComposerCells([]);
      setState('idle');
    } catch {
      setComposerCells([]);
      setState('error');
    }
  }, [enabled, state, monthKey, todayKey, entries, galleryUi.shareDialogTitle]);

  return (
    <>
      <View className="border-t border-hairline px-5 py-3">
        {state === 'error' ? (
          <Text
            className="mb-2 text-center text-sm text-body"
            style={{ fontFamily: 'Inter_400Regular', lineHeight: 20 }}
          >
            {galleryUi.errorExport}
          </Text>
        ) : null}
        <OutlinePillButton
          label={label}
          variant="primary"
          disabled={!enabled || state === 'generating'}
          onPress={() => {
            void handlePress();
          }}
          accessibilityLabel={galleryUi.generateA11y}
          accessibilityState={{ busy: state === 'generating', disabled: !enabled }}
          className="w-full"
        />
        {state === 'generating' ? (
          <ActivityIndicator
            className="mt-2"
            color={colors.muted}
            accessibilityLabel={galleryUi.generating}
          />
        ) : null}
      </View>

      {composerCells.length > 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -10_000,
            left: 0,
            opacity: 0,
          }}
        >
          <MonthGalleryComposer
            ref={composerRef}
            monthTitle={monthTitle}
            locale={locale}
            cells={composerCells}
          />
        </View>
      ) : null}
    </>
  );
}
