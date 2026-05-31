/** Chinese copy pools migrated from lib/copy (Plan 02). */

export const resultPools = {
  successHeadlines: ['傻了么？—— 今天答案：没有！'] as const,

  successPunchlines: [
    '就问还有谁？今天没傻！',
    '今天没傻，醒得很稳！',
    '脑子在线，完美收工！',
    '这题没把你带偏，厉害。',
  ] as const,

  successSublines: [
    '你今天赢了，明天它还想赢回去呢！',
    '这题可不简单，你居然拿下了，明天敢来更狠的吗？',
    '脑力 +1，明天继续别掉链子啊！',
    '厉害！今天成功避开了「傻」字，保持住！',
    '完美收工！明天可别第一步就翻车哦~',
    '明天接着虐，别给它翻盘机会。',
  ] as const,

  successCtas: ['明天再来战', '我明天还要赢', '明天见，傻瓜'] as const,

  failHeadlines: ['恭喜达成「傻了」成就'] as const,

  failPunchlines: [
    '傻得有性格！',
    '就这？脑子暂时短路了！',
    '今日智商：离线模式。',
    '认输，但不认命。',
  ] as const,

  failSublines: [
    '明天争取让它傻。',
    '投降输一半，明天直接干翻它！',
    '这题把你干沉默了？正常，明天回来报仇！',
    '没关系，很多人比你傻得更彻底。',
    '放弃了？行吧，明天它还在等着你呢。',
    '今天你输给了它，明天换它输给你？',
    '已记录本次耻辱，明天洗刷它。',
  ] as const,

  foolIndexHints: [
    '再努力点就满分了',
    '离「傻神」只差一步',
    '明天有机会刷满',
    '还有上升空间（往下）',
  ] as const,

  failCtas: [
    '明天报仇',
    '我明天一定要过',
    '明天再来，不服输',
    '明天见，我要赢',
  ] as const,

  /** `formatElapsedDuration` — seconds only */
  elapsedSecondsOnly: (seconds: number) => `${seconds} 秒`,

  /** `formatElapsedDuration` — minutes + seconds */
  elapsedMinutesSeconds: (minutes: number, seconds: number) =>
    `${minutes} 分 ${seconds} 秒`,

  /** Abandoned result stats line (`pickResultCopy`) */
  abandonedStatsLine: (elapsedClock: string, brainCells: number) =>
    `本次用时 ${elapsedClock} | 脑细胞阵亡 ${brainCells} 个`,
} as const;

export const gameRules = {
  sudoku: {
    title: '数独规则',
    intro:
      '在 9×9 格子中填入 1～9，使每一行、每一列、每一个 3×3 宫格都恰好出现 1～9 各一次。',
    bullets: [
      '灰色数字是题目给定的，不能修改',
      '先点空格，再用下方数字条填入；长按该格或点「清除」可擦掉',
      '同一行、列或宫格里重复的数字会标红',
      '全部填对且无冲突后，点「完成今日」',
    ],
  },
  binary: {
    title: '二进制谜题规则',
    intro: '在 8×8 格子中填入 0 和 1，满足以下全部条件。',
    bullets: [
      '每一行、每一列恰好有 4 个 0 和 4 个 1',
      '同一行或列不能出现连续三个相同数字（如 000、111）',
      '任意两行不能完全相同；任意两列也不能完全相同',
      '灰色数字是题目给定的；点格子在 空 → 0 → 1 之间切换，长按清空',
      '违反规则时相关格子会标红；全部合法填满后可「完成今日」',
    ],
  },
  nonogram: {
    title: '数绘规则',
    intro: '根据每行、每列的数字提示，涂满对应数量的格子，最终拼出一幅画。',
    bullets: [
      '数字表示该行/列里连续填色块的长度，顺序与格子顺序一致',
      '点格子在 空 → 填色 → 标记(×) 之间切换，长按清空',
      '× 仅作辅助标记，不参与完成判定',
      '过程中不会提示对错，填对全部该填的格子后可「完成今日」',
    ],
  },
} as const;

export const streak = {
  broken: '连签断了 · 通关一次重新开张',
  zero: '连签战绩 · 完成今日入账',
  checkedIn: (displayStreak: number) => `连续 ${displayStreak} 天 · 今天没傻过`,
  pending: (displayStreak: number) => `连续 ${displayStreak} 天 · 今日卷面待交`,
} as const;

export const freeze = {
  consumedLines: [
    '护盾生效：昨天缺席，连签还在，别得瑟。',
    '冻住一天，数字还在——明天别又鸽。',
    '系统替你圆场了，今天务必交卷。',
  ] as const,
  shieldSuffix: (count: number) => ` · 护盾×${count}`,
} as const;

export const missedYesterday = {
  softPool: [
    '昨天没交卷，今天把场子找回来。',
    '护盾已垫场，今天这局别划水。',
    '数字还在，面子得自己挣回来。',
  ] as const,
  recallPool: [
    '昨天鸽了，连签在倒计时看你。',
    '缺席一天，今天不来就真断了。',
    '断签边缘徘徊，现在打开还来得及。',
  ] as const,
} as const;

export const statsPools = {
  elapsedFast: [
    '飞快，键盘要冒烟了',
    '这速度，题目还没醒你就交了卷',
    '手速在线，明天别飘',
    '快得像开了倍速',
    '今日效率：离谱',
  ] as const,

  elapsedSlow: [
    '磨蹭得很有水平',
    '用时够泡一杯茶了',
    '慢工出细活？反正出活了',
    '这局主打一个沉浸式思考',
    '时间换智商，不亏',
  ] as const,

  elapsedMid: [
    '稳中带快，刚刚好',
    '正常发挥，别骄傲',
    '用时中规中矩',
    '不快不慢，像你的性格',
    '还行，明天还能更快',
  ] as const,

  fasterThanPrevious: (deltaSec: number) => `比上次快 ${deltaSec} 秒`,
  slowerThanPrevious: (deltaSec: number) => `比上次慢 ${deltaSec} 秒`,

  weeklyFull: [
    '全勤了，慢着点',
    '七天全勤，你是来上班的',
    '本周满分打卡',
    '卷王本周已上线',
    '七天都在，离谱',
  ] as const,

  weeklyLow: [
    '这周只来 1 次，是把这里当树洞？',
    '本周存在感偏低',
    '才开局，别急着躺',
    '1/7，还有很大进步空间',
    '本周摸鱼指数偏高',
  ] as const,

  weeklyRemaining: (remaining: number) => `还能再来 ${remaining} 天`,

  streakNoRecord: '连签纪录从零开始',

  streakRecord: [
    '正在刷新纪录',
    '连签新高，稳住',
    '纪录在脚下，别飘',
    '今天就是巅峰',
    '历史最长，恭喜',
  ] as const,

  streakChase: [
    (gap: number) => `距离破纪录 ${gap} 天`,
    (gap: number) => `还差 ${gap} 天就能超自己`,
    (gap: number) => `再坚持 ${gap} 天，纪录是你的`,
    (gap: number) => `当前势头不错，差 ${gap} 天`,
    (gap: number) => `纪录 ${gap} 天在前方`,
  ] as const,
} as const;

export const share = {
  nonogramTails: [
    '（今天画的是什么，自己玩了才知道）',
    '（图案保密，明天自己来拆）',
    '（别问像啥，问就是抽象派）',
    '（复制去群里，保证没人猜对）',
    '（答案不在战报里，在明天）',
  ] as const,

  abandonTails: [
    '明天还来挨打。',
    '认怂记录已存档，明天报仇。',
    '今日先撤，明日再战。',
  ] as const,

  successTails: [
    '今天脑子转得动，手没跟上。',
    '干净局，但用时暴露了真实水平。',
    '九宫格没难住你，时钟难住了你。',
    '这局能处，下次别磨叽。',
    '复制去群里，看有几个人能更快。',
  ] as const,

  cardCta: '#傻了么 · 每日一题',

  successToasts: [
    '战报已复制，去群里炫耀吧',
    '剪贴板到手，别怂，发出去',
    '复制成功，让朋友也傻一下',
    '战报已就位，粘贴开秀',
    '已复制，坐等朋友问这是啥',
    '拷贝完成，传播「傻」学',
  ] as const,

  errorToasts: [
    '复制失败，再点一次',
    '剪贴板罢工了，重试一下',
    '没拷上，手指再试',
    '系统不给面子，再来一遍',
    '复制翻车，点我重试',
  ] as const,
} as const;

export const resultFooter = {
  default: '明天 0 点后刷新，题型会变哦',
  ios: '明天 0 点后刷新，题型会变哦。iOS 上点按钮后请从屏幕底部上滑回主屏幕。',
} as const;
