import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../constants/design';

type BottomSheetShellProps = {
  visible: boolean;
  onClose: () => void;
  dismissA11y: string;
  children: ReactNode;
};

/** Bottom sheet shell — slide-up modal with scrim (fork of GameRulesModal tokens). */
export default function BottomSheetShell({
  visible,
  onClose,
  dismissA11y,
  children,
}: BottomSheetShellProps) {
  const insets = useSafeAreaInsets();

  // Mount Modal only while open — multiple idle Modal hosts on one screen race on iOS Fabric
  // ("already presenting RCTFabricModalHostViewController").
  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={dismissA11y}
          className="absolute inset-0"
          onPress={onClose}
        />
        <View
          testID="bottom-sheet-panel"
          className="overflow-hidden rounded-t-xl border border-hairline bg-canvas-card"
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
            maxHeight: '88%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <View className="items-center py-3" accessibilityElementsHidden importantForAccessibility="no">
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.hairline,
              }}
            />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
