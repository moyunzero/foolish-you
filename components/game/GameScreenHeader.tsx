import { Text, View } from 'react-native';

import { useI18n } from '../../lib/i18n';
import { formatTodayMeta } from '../../lib/i18n/format';
import { GAME_HEADER_META_STYLE } from './gameHeaderMetaStyle';
import GameHostIntro from './GameHostIntro';
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
  /** Seeded host roast under type title (LAYOUT-02). */
  hostIntroLine?: string | null;
  showHostIntro?: boolean;
};

/** 游戏页顶栏：单行元信息、题型标题、主持人旁白、连签副行 */
export default function GameScreenHeader({
  dateKey,
  streakLine,
  streakHighlight,
  elapsed,
  typeLabel,
  gameType,
  showRules,
  streakSubline,
  hostIntroLine,
  showHostIntro = false,
}: GameScreenHeaderProps) {
  const { locale, strings } = useI18n();
  const dateMeta = formatTodayMeta(dateKey, locale);
  const compactGap = showHostIntro;

  return (
    <View className={compactGap ? 'gap-1' : 'gap-2'}>
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

      {showHostIntro && hostIntroLine != null && hostIntroLine !== '' ? (
        <GameHostIntro line={hostIntroLine} />
      ) : null}

      <GameStreakSubline line={streakSubline} />
    </View>
  );
}
