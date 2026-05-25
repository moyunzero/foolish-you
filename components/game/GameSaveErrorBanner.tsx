import { Text, View } from 'react-native';

import OutlinePillButton from '../ui/OutlinePillButton';

type GameSaveErrorBannerProps = {
  message: string;
  retryLabel: string;
  onRetry: () => void;
  horizontalPadding?: number;
};

/** Inline save failure banner shared by game and result screens. */
export default function GameSaveErrorBanner({
  message,
  retryLabel,
  onRetry,
  horizontalPadding = 24,
}: GameSaveErrorBannerProps) {
  return (
    <View
      className="gap-2 pt-3"
      style={{ paddingHorizontal: horizontalPadding }}
    >
      <Text className="text-center text-sm text-body">{message}</Text>
      <OutlinePillButton label={retryLabel} onPress={onRetry} />
    </View>
  );
}
