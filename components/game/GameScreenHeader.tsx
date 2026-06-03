import { Text, View } from 'react-native';

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
};

/** 游戏页顶栏：日期、连签、用时、题型标题（四种每日题型共用） */
export default function GameScreenHeader({
  dateKey,
  streakLine,
  streakHighlight,
  elapsed,
  typeLabel,
  gameType,
  showRules,
  streakSubline,
}: GameScreenHeaderProps) {
  const { locale, strings } = useI18n();

  return (
    <View className="gap-2">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-muted" style={GAME_HEADER_META_STYLE}>
            {formatTodayMeta(dateKey, locale)}
          </Text>
          <Text
            className={streakHighlight ? 'text-accent-sunset' : 'text-muted'}
            style={{ ...GAME_HEADER_META_STYLE, marginTop: 2 }}
          >
            {streakLine}
          </Text>
        </View>
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
            fontSize: 28,
            lineHeight: 34,
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

      <GameStreakSubline line={streakSubline} />
    </View>
  );
}
