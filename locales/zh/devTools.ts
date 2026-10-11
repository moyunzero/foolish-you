/**
 * DEV panel copy (Maestro + hand QA).
 * DevToolsPanel always loads locale `zh` so flows keep stable Chinese labels
 * even when product UI is previewed in English.
 */
export const devTools = {
  title: 'DEV 调试',
  collapse: '收起 ▼',
  expand: '展开 ▲',
  hide: '隐藏',
  hideA11y: '隐藏调试条，便于截图',
  regenerating: '正在生成今日题目…',
  streakPlaceholder: 'streak: —',
  settings: '设置占位',
  previewEnglish: '预览·English',
  fakeSunday: '假日期·周日',
  fakeNextDay: '假日期·次日',
  fakeNextDayA11y: '假日期次日，不换题，仅用于续局手测',
  openCalendar: '打开月历',
  openCalendarA11y: '打开月历，DEV 续局验收',
  clearFakeDate: '假日期·清除',
  naturalRandom: '自然随机',
  reopenToday: '重开今日',
  promptReview: '弹出评分',
  resetCompletions: '重置通关记录',
  resetRating: '重置评分',
  injectBadBoard: '注入坏盘面',
  clearRecoveryLog: '清恢复日志',
  growthSection: '温和成长 QA（注入 history → 通关注入 → 结果页 / 月历）',
  fillBoard: '填满盘面',
  fillBoardA11y: '填满盘面，仅填盘不完成',
  oneTapClear: '一键通关',
  streakSection: '连签 / 护盾 QA（注入后自动 hydrate → 跳转 game）',
  /** Separator between scenario label and hint in DEV help lines. */
  hintSep: '：',
  recoveryLogTitle: (n: number) => `恢复日志（最近 ${n} 条）`,
  helpFooter:
    '点「数独/二进制/数绘/数回」会清今日存档并按选定题型重建；「自然随机」走日期算法并尽量换题型。「重开今日」保持当前题型、换一道新题（清空进度）。也可改 constants/dev.ts 里 DEV_FORCE_GAME_TYPE。「弹出评分」直接调系统对话框；「重置通关记录」清本周统计；「重置评分」清评分门控。「注入坏盘面」写入 completed+空盘，重启后走恢复逻辑；展开时显示恢复日志。「打开月历」供续局中验收 in_progress。截图时点「隐藏」；长按页脚「隐私政策」可再唤出。',
  growth: {
    'growth-silent': {
      label: '近况·平常',
      hint: '仅昨日通关；今日 win 后结果页无成长行',
    },
    'growth-hot': {
      label: '近况·火热',
      hint: '近 7 天含今日 ≥6 次通关 → 火热口吻',
    },
    'growth-steady': {
      label: '近况·稳定',
      hint: '近 7 天含今日 4–5 次 → 稳定口吻',
    },
    'growth-comeback': {
      label: '近况·召回',
      hint: '上次通关 ≥3 天前 → 好久不见',
    },
    'growth-calendar': {
      label: '月历·比上月多',
      hint: '上月 2 天 + 本月若干天；Sheet 应追加正向 delta',
    },
    'growth-smoother': {
      label: '彩蛋·同类更顺',
      hint: '同玩法三周同星期几较慢历史；今日通关更快 → smoother 行',
    },
  },
  streak: {
    clear: {
      label: '清空连签',
      hint: '删除 streak 存储；hydrate 后等同新装',
    },
    'gap2-recall': {
      label: '漏签召回',
      hint: '上次入账 = 前天，无护盾；刷新后应见 recall banner',
    },
    'gap2-freeze-ready': {
      label: '待耗护盾',
      hint: '上次入账 = 前天，护盾×1；刷新后自动消耗并显示 freeze 一行',
    },
    'gap2-yesterday-real': {
      label: '昨日真通',
      hint: '前天入账 + 昨日 real 通关；刷新后 repair，不耗护盾',
    },
    'freeze-consumed-ui': {
      label: '护盾已垫',
      hint: '已消耗态：仅 freeze 一行，无 recall banner',
    },
    'shields-full': {
      label: '护盾×2',
      hint: '结果页第三卡 subline 应含 护盾×2',
    },
    'weekly-grant-pending': {
      label: '跨周+1',
      hint: '上周已发过；刷新后 freezeCount +1（上限 2）',
    },
  },
} as const;
