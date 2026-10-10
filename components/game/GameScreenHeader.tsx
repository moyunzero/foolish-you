import { Text, View } from 'react-native';

import { colors } from '../../constants/design';
import { useI18n } from '../../lib/i18n';
import { formatTodayMeta } from '../../lib/i18n/format';
import { GAME_HEADER_META_STYLE } from './gameHeaderMetaStyle';
import GameRulesButton from './GameRulesButton';
import GameStreakSubline from './GameStreakSubline';
import type { GameType } from '../../lib/puzzles/types';

type GameScreenHeaderProps = {
  dateKey: string | null;
  streakLine: string;
  streakHighlight: boolean;
  elapsed: string;
  typeLabel: string;
  gameType: GameType | null;
  showRules: boolean;
  /** Shield consumed or missed-yesterday recall; mutually exclusive at call site. */
  streakSubline?: string | null;
  /** Cross-day unfinished board — Option A carry chip (v2.7-01). */
  isCarrying?: boolean;
};

/** 游戏页顶栏：单行元信息、题型标题、续局 chip、连签副行 */
export default function GameScreenHeader({
  dateKey,
  streakLine,
  streakHighlight,
  elapsed,
  typeLabel,
  gameType,
  showRules,
  streakSubline,
  isCarrying = false,
}: GameScreenHeaderProps) {
  const { locale, strings } = useI18n();
  const dateMeta = formatTodayMeta(dateKey, locale);

  return (
    <View className="gap-2">
      <View className="flex-row items-start justify-between gap-3">
        <Text
          className="min-w-0 flex-1 text-muted"
          style={GAME_HEADER_META_STYLE}
          numberOfLines={2}
        >
          {dateMeta}
          {' · '}
          <Text
            className={streakHighlight ? 'text-accent-sunset' : 'text-muted'}
            style={GAME_HEADER_META_STYLE}
          >
            {streakLine}
          </Text>
        </Text>
        <View
          className="shrink-0 flex-row items-center rounded-full border border-hairline px-2.5 py-1"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
        >
          <Text className="text-muted" style={GAME_HEADER_META_STYLE}>
            {strings.ui.common.timer}
          </Text>
          <Text
            className="ml-1.5 text-ink"
            style={{ fontFamily: 'SpaceMono_400Regular', fontSize: 13 }}
          >
            {elapsed}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2.5">
        <Text
          className="flex-1 text-ink"
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 24,
            lineHeight: 29,
            fontWeight: '700',
            letterSpacing: -0.6,
          }}
        >
          {typeLabel}
        </Text>
        {showRules && gameType != null ? (
          <GameRulesButton gameType={gameType} />
        ) : null}
      </View>

      {isCarrying && dateKey != null ? (
        <View
          accessibilityRole="text"
          accessibilityLabel={strings.ui.game.carryChipA11y(dateKey)}
          style={{
            alignSelf: 'flex-start',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: 'rgba(255, 122, 23, 0.45)',
            backgroundColor: 'rgba(255, 122, 23, 0.12)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            minHeight: 24,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceMono_400Regular',
              fontSize: 11,
              lineHeight: 14,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: colors.accentSunset,
            }}
          >
            {strings.ui.game.carryChip}
          </Text>
        </View>
      ) : null}

      <GameStreakSubline line={streakSubline} />
    </View>
  );
}
