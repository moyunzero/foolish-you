import { Pressable, Text, View } from 'react-native';

import { colors } from '../../constants/design';
import { feelConfirm } from '../../lib/feel/haptics';
import { useI18n } from '../../lib/i18n';
import BottomSheetShell from '../ui/BottomSheetShell';
import OutlinePillButton from '../ui/OutlinePillButton';


type AbandonConfirmSheetProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  body: string;
};

/** Host-voiced abandon confirm — primary keeps playing; secondary bails (D-12..D-15). */
export default function AbandonConfirmSheet({
  visible,
  onClose,
  onConfirm,
  body,
}: AbandonConfirmSheetProps) {
  const { strings } = useI18n();
  const sheetUi = strings.ui.abandonSheet;

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      dismissA11y={strings.ui.sheet.dismissAbandonA11y}
    >
      <View className="px-5 pb-2">
        <Text
          className="text-center text-base leading-7 text-body"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {body}
        </Text>

        <View className="mt-6 border-t border-hairline pt-4" style={{ gap: 12 }}>
          <OutlinePillButton
            label={sheetUi.keepGoing}
            variant="primary"
            onPress={onClose}
            className="w-full"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={sheetUi.bail}
            onPress={() => {
              feelConfirm();
              onConfirm();
            }}
            className="min-h-[44px] items-center justify-center px-4"
          >
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                lineHeight: 24,
                color: colors.sudokuError,
              }}
            >
              {sheetUi.bail}
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheetShell>
  );
}
